# Phase 2 Detailed Plan - Read Variables from Debug Session

**Phase:** 2 of 5
**Goal:** Read a Python variable's data from an active debug session and serialize it to JSON
**Success Criteria:** While paused at a breakpoint, invoke the command, type a variable name, and see its numeric data printed to the Debug Console (or shown in an info message) as a JSON array
**Prerequisite:** Phase 1 complete (commit d8394e2)

---

## Overview

Phase 2 transforms the Hello World extension into one that can actually interact with a live Python debug session. We will:

1. Create a Python test script with sample data to debug against
2. Detect whether a debug session is active (and show an error if not)
3. Obtain the current stack frame ID from the paused debugger
4. Prompt the user for a variable name
5. Evaluate a Python expression via DAP to serialize the variable to JSON
6. Parse and display the resulting data

This phase does **not** render any charts — that's Phase 3. The output here is the raw JSON data, proving we can extract numeric arrays from the debugger.

---

## Technical Background

### Debug Adapter Protocol (DAP) Interaction

VS Code exposes the active debug session via `vscode.debug.activeDebugSession`. This object supports `customRequest(command, args)` which sends DAP requests to the debug adapter (debugpy).

**Key DAP requests we'll use:**

| DAP Request | Purpose | Response |
|-------------|---------|----------|
| `stackTrace` | Get stack frames for the stopped thread | `{ stackFrames: [{ id, name, source, line }] }` |
| `evaluate` | Evaluate a Python expression in a frame | `{ result: string, variablesReference: number }` |
| `threads` | Get the list of active threads | `{ threads: [{ id, name }] }` |

### Data Flow

```
User invokes command
       │
       ▼
Check: debug session active?  ──No──▶  Show error message
       │ Yes
       ▼
Prompt user for variable name
       │
       ▼
DAP: threads  ──▶  Get first thread ID
       │
       ▼
DAP: stackTrace  ──▶  Get top frame ID
       │
       ▼
DAP: evaluate  ──▶  Run: __import__('json').dumps(list(varName))
       │
       ▼
Parse JSON string from result
       │
       ▼
Display data (console.log + info message)
```

### Expression Strategy

To serialize Python data to JSON without importing anything at module level:

| Data Type | Expression | Notes |
|-----------|-----------|-------|
| Python list | `__import__('json').dumps(varName)` | Works for lists of numbers |
| numpy array | `__import__('json').dumps(varName.tolist())` | Converts ndarray to list first |
| Auto-detect | `__import__('json').dumps(varName.tolist() if hasattr(varName, 'tolist') else list(varName))` | Handles both cases |

For the POC, we'll use the auto-detect expression to handle both plain lists and numpy arrays transparently.

---

## Step-by-Step Implementation

### Step 1: Create Python Test Script
**Purpose:** Provide a deterministic test target for debugging

#### Create `poc/test-scripts/plot_test_basic.py`:
```python
import numpy as np

# Simple 1D data for testing
data_list = [1, 4, 9, 16, 25, 36, 49]
data_np = np.array([2.0, 3.1, 5.2, 4.8, 7.1, 6.5])
data_float_list = [1.1, 2.2, 3.3, 4.4, 5.5]
data_int_range = list(range(10))

# Edge cases
data_single = [42]
data_negative = [-3, -1, 0, 1, 3]

# Set breakpoint on the next line
print("done")  # <-- Breakpoint here
```

#### Create VS Code launch config for the test script

Add a Python debug launch configuration to `poc/extension/.vscode/launch.json` so we can easily debug the test script in the Extension Development Host.

#### Success Criteria:
- [ ] Test script created at `poc/test-scripts/plot_test_basic.py`
- [ ] Script runs without errors: `python poc/test-scripts/plot_test_basic.py`
- [ ] Launch config added for debugging the test script

---

### Step 2: Add Debug Session Detection
**Purpose:** Check if a debug session is active before trying to read variables

#### Changes to `src/extension.ts`:

Replace the hello world command handler with:

```typescript
'debugplot.plotVariable',
async () => {
    const session = vscode.debug.activeDebugSession;
    if (!session) {
        vscode.window.showWarningMessage(
            'DebugPlot: No active debug session. Start debugging first.'
        );
        return;
    }
    // Continue to next steps...
}
```

**Key points:**
- The command handler becomes `async` (DAP requests are asynchronous)
- `vscode.debug.activeDebugSession` returns `undefined` when no session is active
- Show a warning (not error) — it's a user guidance message, not a failure

#### Success Criteria:
- [ ] Command shows warning when invoked without debug session
- [ ] Command proceeds when debug session is active
- [ ] TypeScript compiles without errors

---

### Step 3: Get the Current Stack Frame ID
**Purpose:** DAP `evaluate` requires a `frameId` to know which scope to evaluate in

#### Implementation:

```typescript
// Get threads
const threadsResponse = await session.customRequest('threads');
const threadId = threadsResponse.threads[0].id;

// Get top stack frame
const stackResponse = await session.customRequest('stackTrace', {
    threadId: threadId,
    startFrame: 0,
    levels: 1
});

const frameId = stackResponse.stackFrames[0].id;
```

**Why this approach:**
- `threads` gives us the active thread IDs — debugpy typically has one main thread
- `stackTrace` with `levels: 1` efficiently gets just the topmost frame
- The topmost frame is where the breakpoint is paused, which has the local variables in scope

**Error handling:**
- If `threads` returns empty: show "No threads available — is the debugger paused?"
- If `stackTrace` returns empty: show "No stack frames — is the debugger paused at a breakpoint?"

#### Success Criteria:
- [ ] Successfully retrieves thread ID from paused debugger
- [ ] Successfully retrieves frame ID from stack trace
- [ ] Appropriate errors when debugger is running (not paused)

---

### Step 4: Prompt User for Variable Name
**Purpose:** Get the name of the variable to plot from the user

#### Implementation:

```typescript
const variableName = await vscode.window.showInputBox({
    prompt: 'Enter the variable name to plot',
    placeHolder: 'e.g., data_list, data_np',
    validateInput: (value) => {
        if (!value || !value.trim()) {
            return 'Variable name cannot be empty';
        }
        // Basic Python identifier validation
        if (!/^[a-zA-Z_][a-zA-Z0-9_.[\]]*$/.test(value.trim())) {
            return 'Invalid variable name';
        }
        return null;
    }
});

if (!variableName) {
    return; // User pressed Escape
}
```

**Design decisions:**
- Use `showInputBox` (simplest approach, per Phase 2 scope)
- Allow dot notation (e.g., `obj.data`) and indexing (e.g., `arr[0]`) for flexibility
- Phase 4 will add context menu which auto-fills the variable name
- Pressing Escape cancels gracefully

#### Success Criteria:
- [ ] Input box appears with helpful prompt
- [ ] Empty input is rejected with message
- [ ] Invalid Python identifiers are rejected
- [ ] Pressing Escape cancels without error
- [ ] Valid variable name is captured

---

### Step 5: Evaluate Expression via DAP
**Purpose:** Ask the Python debugger to serialize the variable data to JSON

#### Implementation:

```typescript
const expression = `__import__('json').dumps(`
    + `${variableName}.tolist() if hasattr(${variableName}, 'tolist') `
    + `else list(${variableName}))`;

try {
    const evalResponse = await session.customRequest('evaluate', {
        expression: expression,
        frameId: frameId,
        context: 'repl'
    });

    const rawResult: string = evalResponse.result;
    console.log('DebugPlot raw result:', rawResult);
    // rawResult will be a quoted JSON string, e.g., "'[1, 4, 9, 16, 25, 36, 49]'"
} catch (err: any) {
    vscode.window.showErrorMessage(
        `DebugPlot: Failed to evaluate '${variableName}': ${err.message}`
    );
    return;
}
```

**Important details about the DAP evaluate response:**
- `context: 'repl'` allows side-effect expressions (like `__import__`)
- The `result` field is a **string representation** of the Python value
- For a JSON string, debugpy returns it with surrounding quotes: `'[1, 2, 3]'`
- We need to strip these outer quotes before parsing (see Step 6)

#### Success Criteria:
- [ ] Expression evaluates successfully for a Python list
- [ ] Expression evaluates successfully for a numpy array
- [ ] Error message shown for non-existent variables
- [ ] Error message shown for non-iterable variables

---

### Step 6: Parse the Result
**Purpose:** Extract the numeric array from the DAP evaluate response

#### Implementation:

```typescript
// The result from debugpy comes as a Python repr string.
// For a JSON string, it will be like: "'[1, 4, 9, 16, 25, 36, 49]'"
// We need to strip the outer quotes that Python's repr adds.
let jsonString = rawResult;

// Strip surrounding single or double quotes added by Python repr
if ((jsonString.startsWith("'") && jsonString.endsWith("'"))
    || (jsonString.startsWith('"') && jsonString.endsWith('"'))) {
    jsonString = jsonString.slice(1, -1);
}

let data: number[];
try {
    data = JSON.parse(jsonString);
} catch (parseErr) {
    vscode.window.showErrorMessage(
        `DebugPlot: Could not parse data from '${variableName}'. `
        + `Expected a numeric list or array.`
    );
    console.error('DebugPlot parse error:', parseErr, 'Raw:', rawResult);
    return;
}

// Validate it's an array of numbers
if (!Array.isArray(data) || !data.every(v => typeof v === 'number')) {
    vscode.window.showErrorMessage(
        `DebugPlot: '${variableName}' is not a 1D numeric array.`
    );
    return;
}
```

**Output for this phase:** Show the data to confirm it works:

```typescript
console.log(`DebugPlot: Successfully read ${data.length} values from '${variableName}'`);
console.log('DebugPlot data:', JSON.stringify(data));

vscode.window.showInformationMessage(
    `DebugPlot: Read ${data.length} numeric values from '${variableName}'`
);
```

#### Success Criteria:
- [ ] JSON string correctly stripped of Python repr quotes
- [ ] Data parsed into a `number[]` array
- [ ] Non-numeric data is rejected with clear message
- [ ] Data length and summary displayed to user

---

### Step 7: Compile and Test
**Purpose:** Verify end-to-end flow

#### Build:
```bash
cd poc/extension
npm run compile
```

#### Test Procedure:
1. Open `poc/extension/` in VS Code
2. Press F5 to launch Extension Development Host
3. In the Dev Host, open `poc/test-scripts/plot_test_basic.py`
4. Set a breakpoint on the `print("done")` line
5. Start debugging the Python file (F5 or Run > Start Debugging)
6. When paused at breakpoint, open Command Palette (Ctrl+Shift+P)
7. Run "DebugPlot: Plot Variable"
8. Type `data_list` in the input box
9. Should see: "DebugPlot: Read 7 numeric values from 'data_list'"
10. Repeat with `data_np` — should see: "DebugPlot: Read 6 numeric values from 'data_np'"

#### Test Matrix:

| Variable | Type | Expected Result |
|----------|------|-----------------|
| `data_list` | Python list | 7 values: [1, 4, 9, 16, 25, 36, 49] |
| `data_np` | numpy array | 6 values: [2.0, 3.1, 5.2, 4.8, 7.1, 6.5] |
| `data_float_list` | Python list of floats | 5 values: [1.1, 2.2, 3.3, 4.4, 5.5] |
| `data_int_range` | Python list from range | 10 values: [0, 1, 2, ..., 9] |
| `data_single` | Single-element list | 1 value: [42] |
| `data_negative` | List with negatives | 5 values: [-3, -1, 0, 1, 3] |
| `nonexistent` | Undefined variable | Error message |
| (no debug session) | N/A | Warning: no active debug session |

#### Success Criteria:
- [ ] `data_list` returns correct 7 values
- [ ] `data_np` returns correct 6 values
- [ ] Other test variables work correctly
- [ ] Undefined variable shows error
- [ ] No debug session shows warning
- [ ] No TypeScript compilation errors

---

## Complete `extension.ts` Target State

After all steps, `src/extension.ts` should look approximately like this:

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('DebugPlot extension is now active');

    const disposable = vscode.commands.registerCommand(
        'debugplot.plotVariable',
        async () => {
            // 1. Check for active debug session
            const session = vscode.debug.activeDebugSession;
            if (!session) {
                vscode.window.showWarningMessage(
                    'DebugPlot: No active debug session. Start debugging first.'
                );
                return;
            }

            // 2. Prompt for variable name
            const variableName = await vscode.window.showInputBox({
                prompt: 'Enter the variable name to plot',
                placeHolder: 'e.g., data_list, data_np',
                validateInput: (value) => {
                    if (!value || !value.trim()) {
                        return 'Variable name cannot be empty';
                    }
                    if (!/^[a-zA-Z_][a-zA-Z0-9_.\[\]]*$/.test(value.trim())) {
                        return 'Invalid variable name';
                    }
                    return null;
                }
            });

            if (!variableName) {
                return; // User cancelled
            }

            try {
                // 3. Get the current frame ID
                const threadsResponse = await session.customRequest('threads');
                if (!threadsResponse.threads || threadsResponse.threads.length === 0) {
                    vscode.window.showWarningMessage(
                        'DebugPlot: No threads available. Is the debugger paused?'
                    );
                    return;
                }
                const threadId = threadsResponse.threads[0].id;

                const stackResponse = await session.customRequest('stackTrace', {
                    threadId: threadId,
                    startFrame: 0,
                    levels: 1
                });

                if (!stackResponse.stackFrames || stackResponse.stackFrames.length === 0) {
                    vscode.window.showWarningMessage(
                        'DebugPlot: No stack frames. Is the debugger paused at a breakpoint?'
                    );
                    return;
                }
                const frameId = stackResponse.stackFrames[0].id;

                // 4. Evaluate expression to serialize variable as JSON
                const expression =
                    `__import__('json').dumps(`
                    + `${variableName}.tolist() if hasattr(${variableName}, 'tolist') `
                    + `else list(${variableName}))`;

                const evalResponse = await session.customRequest('evaluate', {
                    expression: expression,
                    frameId: frameId,
                    context: 'repl'
                });

                // 5. Parse the result
                let jsonString: string = evalResponse.result;

                // Strip Python repr quotes
                if ((jsonString.startsWith("'") && jsonString.endsWith("'"))
                    || (jsonString.startsWith('"') && jsonString.endsWith('"'))) {
                    jsonString = jsonString.slice(1, -1);
                }

                const data: unknown = JSON.parse(jsonString);

                if (!Array.isArray(data) || !data.every(v => typeof v === 'number')) {
                    vscode.window.showErrorMessage(
                        `DebugPlot: '${variableName}' is not a 1D numeric array.`
                    );
                    return;
                }

                // 6. Success — display the data
                console.log(`DebugPlot: Read ${data.length} values from '${variableName}':`, data);
                vscode.window.showInformationMessage(
                    `DebugPlot: Read ${data.length} numeric values from '${variableName}'`
                );

            } catch (err: any) {
                vscode.window.showErrorMessage(
                    `DebugPlot: Error reading '${variableName}': ${err.message}`
                );
                console.error('DebugPlot error:', err);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
```

---

## Files Changed in Phase 2

| File | Action | Description |
|------|--------|-------------|
| `poc/test-scripts/plot_test_basic.py` | **Create** | Python test script with sample data |
| `poc/extension/src/extension.ts` | **Modify** | Replace hello world with DAP-based variable reader |
| `poc/extension/.vscode/launch.json` | **Modify** | Add Python debug launch config (if needed for Dev Host testing) |

**No new npm dependencies required** — the VS Code API (`vscode.debug.activeDebugSession`, `customRequest`) is built-in.

---

## Risks and Mitigations

### Risk 1: DAP `evaluate` Result Format
**Risk:** The exact format of `evalResponse.result` from debugpy may vary (extra quotes, escape characters, different wrapping).
**Mitigation:** Log the raw result extensively. Add robust quote-stripping. If format differs from expectation, adjust parsing in Step 6.
**Fallback:** Use `context: 'clipboard'` or `context: 'watch'` instead of `'repl'` if result format is problematic.

### Risk 2: Frame ID Unavailable When Not Paused
**Risk:** If the user invokes the command while the debugger is running (not paused), `stackTrace` may fail or return empty.
**Mitigation:** Check for empty `threads` and `stackFrames` arrays with user-friendly messages.

### Risk 3: `__import__` Blocked by Debugger
**Risk:** Some debugger configurations might restrict expression evaluation.
**Mitigation:** Use `context: 'repl'` which is the most permissive evaluation context in DAP. This is the same context used by the Debug Console, so any expression that works there should work for us.

### Risk 4: Large Arrays
**Risk:** Very large arrays could produce huge JSON strings that are slow to transfer.
**Mitigation:** Out of scope for POC. If encountered, a future enhancement could truncate or sample the data.

---

## Definition of Done

Phase 2 is complete when:

1. [ ] Python test script exists at `poc/test-scripts/plot_test_basic.py`
2. [ ] Extension detects active debug session (warns if none)
3. [ ] Extension prompts user for variable name via input box
4. [ ] Extension retrieves frame ID from paused debugger via DAP
5. [ ] Extension evaluates serialization expression via DAP `evaluate`
6. [ ] Extension parses JSON result into a `number[]` array
7. [ ] Extension displays count of read values in info message
8. [ ] Works for Python lists: `data_list` returns `[1, 4, 9, 16, 25, 36, 49]`
9. [ ] Works for numpy arrays: `data_np` returns `[2.0, 3.1, 5.2, 4.8, 7.1, 6.5]`
10. [ ] Undefined variables show clear error message
11. [ ] TypeScript compiles with no errors
12. [ ] Code committed to git

---

## Phase 2 → Phase 3 Transition

Once Phase 2 is complete, we will have a `number[]` array ready to visualize. Phase 3 will:
- Create a Webview Panel (`vscode.window.createWebviewPanel`)
- Bundle Chart.js into the webview HTML
- Post the `number[]` data from the extension to the webview via `postMessage`
- Render a line chart

The interface between Phase 2 and Phase 3 is simple: Phase 2 produces a `number[]`, Phase 3 consumes it.
