# Phase 4 Detailed Plan — Context Menu Integration

**Phase:** 4 of 5
**Status:** Planning
**Prerequisites:** Phase 3 Complete ✅
**Goal:** Enable right-click context menu for variables during debug sessions

---

## Overview

Phase 4 transforms the extension from requiring manual variable name entry to allowing **right-click on a variable in the Variables pane** during a debug session. This is the key user experience improvement that makes the extension feel native to VS Code's debugging workflow.

**What will change:**
- ✅ Add context menu contribution to `package.json`
- ✅ Add `onDebug` activation event to activate extension during debug sessions
- ✅ Modify command handler to accept optional variable context from menu click
- ✅ Fallback to input prompt if no context provided (for Command Palette use)

**What stays the same:**
- Debug session detection
- Stack frame retrieval
- Data evaluation and parsing
- Chart rendering in webview

---

## Architecture

### Current Flow (Phase 3)
```
User → Command Palette → "DebugPlot: Plot Variable"
  → Extension prompts for variable name (input box)
  → User types variable name manually
  → Extension evaluates and plots
```

### Target Flow (Phase 4)
```
User → Right-click variable in Variables pane → "Plot Variable"
  → Extension receives variable context (name, value, type)
  → Extension extracts variable name from context
  → Extension evaluates and plots (no prompt needed)

Alternative (Command Palette still works):
User → Command Palette → "DebugPlot: Plot Variable"
  → No context provided
  → Extension falls back to input prompt
  → User types variable name manually
  → Extension evaluates and plots
```

---

## Implementation Steps

### Step 1: Add Context Menu Contribution to package.json

**File:** `poc/extension/package.json`

**Action:** Add a `menus` contribution point for `debug/variables/context`

**Changes:**
```json
{
  "contributes": {
    "commands": [ /* existing */ ],
    "menus": {
      "debug/variables/context": [
        {
          "command": "debugplot.plotVariable",
          "when": "debugType == 'python'"
        }
      ]
    }
  }
}
```

**Explanation:**
- `debug/variables/context` is the menu location for right-click in Variables pane
- `when` clause restricts menu to Python debug sessions only
- `command` is the existing `debugplot.plotVariable` command
- When user right-clicks, VS Code will pass the variable context as a parameter

**Validation:**
- JSON syntax is valid
- Menu appears only during Python debugging
- Menu item shows "Plot Variable" label

---

### Step 2: Add Debug Activation Event

**File:** `poc/extension/package.json`

**Action:** Change `activationEvents` to activate on debug sessions

**Current:**
```json
"activationEvents": [
  "onCommand:debugplot.plotVariable"
]
```

**New:**
```json
"activationEvents": [
  "onDebug"
]
```

**Explanation:**
- `onDebug` activates the extension when any debug session starts
- This ensures the extension is loaded before the user right-clicks a variable
- Replaces the `onCommand` activation (command activation is redundant with menu)

**Alternative (more specific):**
```json
"activationEvents": [
  "onDebugInitialConfigurations",
  "onDebugResolve:python"
]
```
This is more conservative but may delay activation. We'll use `onDebug` for simplicity.

**Validation:**
- Extension activates when F5 is pressed to start debugging
- Extension console shows "DebugPlot extension is now active" at debug start
- Extension does NOT activate on VS Code startup (only when debugging)

---

### Step 3: Modify Command Handler to Accept Variable Context

**File:** `poc/extension/src/extension.ts`

**Action:** Update the `registerCommand` callback signature to accept an optional parameter

**Current signature:**
```typescript
vscode.commands.registerCommand('debugplot.plotVariable', async () => {
  // ...
})
```

**New signature:**
```typescript
vscode.commands.registerCommand('debugplot.plotVariable', async (context?: any) => {
  // ...
})
```

**What is `context`?**

When the command is invoked from the context menu, VS Code passes a `Variable` object:
```typescript
interface Variable {
  name: string;
  value: string;
  type?: string;
  variablesReference: number;
  evaluateName?: string;
}
```

The most important fields are:
- `name`: The variable name as it appears in the Variables pane
- `evaluateName`: The full expression to evaluate (e.g., `obj.data`, `arr[0]`)
- `variablesReference`: Internal VS Code reference ID (not needed for our use)

**When is `context` undefined?**
- When the command is invoked from the Command Palette
- When the command is invoked via keybinding
- In these cases, we fall back to the input prompt

**Implementation plan:**

1. **Extract variable name from context** (if provided):
   ```typescript
   let variableName: string | undefined;

   if (context && context.evaluateName) {
     // Context menu invocation - use the provided variable name
     variableName = context.evaluateName;
     console.log(`DebugPlot: Variable selected from context menu: '${variableName}'`);
   } else {
     // Command palette invocation - prompt for variable name
     variableName = await vscode.window.showInputBox({
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
   }
   ```

2. **Remove the duplicate variable name capture** that currently happens after frame retrieval

3. **Move the `try-catch` block** to wrap the entire flow including variable name extraction

**Full modified flow:**
```typescript
async (context?: any) => {
  // Step 1: Check for active debug session
  const session = vscode.debug.activeDebugSession;
  if (!session) {
    vscode.window.showWarningMessage(
      'DebugPlot: No active debug session. Start debugging first.'
    );
    return;
  }

  let variableName: string | undefined;

  try {
    // Step 2: Get variable name from context or prompt
    if (context && context.evaluateName) {
      variableName = context.evaluateName;
      console.log(`DebugPlot: Variable from context: '${variableName}'`);
    } else {
      variableName = await vscode.window.showInputBox({
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
    }

    // Step 3: Get the current frame ID
    // ... existing code ...

    // Step 4: Evaluate expression
    // ... existing code (unchanged) ...

    // Step 5: Parse and render
    // ... existing code (unchanged) ...

  } catch (err: any) {
    // ... existing error handling (unchanged) ...
  }
}
```

**Validation:**
- Context menu invocation does NOT show input prompt
- Command palette invocation DOES show input prompt
- Variable name is correctly extracted from context
- Existing validation logic still works for manual input

---

### Step 4: Compile and Test TypeScript

**Action:** Compile the TypeScript code to verify no syntax errors

**Command:**
```bash
cd /home/alfred/lw/w514-plot-in-vscode/poc/extension
npm run compile
```

**Expected result:**
- No compilation errors
- New `out/extension.js` file generated
- File size should be similar to Phase 3 (slightly larger with context handling)

**Common issues:**
- TypeScript strict mode may require explicit type for `context`
- Solution: Use `context?: any` or define a proper interface

---

### Step 5: Commit Changes

**Action:** Commit Phase 4 implementation with descriptive message

**Commands:**
```bash
cd /home/alfred/lw/w514-plot-in-vscode
git add poc/extension/package.json poc/extension/src/extension.ts
git commit -m "Implement Phase 4: Context Menu Integration

- Add debug/variables/context menu contribution
- Add onDebug activation event
- Accept optional variable context in command handler
- Fallback to input prompt when invoked from Command Palette
- Extract variable name from context.evaluateName

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Validation:**
- Commit includes both changed files
- Commit message clearly describes Phase 4 additions

---

## Testing Plan Overview

### Test 1: Context Menu Appears
- Start Python debug session
- Expand Variables pane
- Right-click on a variable
- Verify "Plot Variable" menu item appears

### Test 2: Context Menu Invocation (Python List)
- Right-click `data_list` in Variables pane
- Click "Plot Variable"
- Verify NO input prompt appears
- Verify chart renders immediately with correct data

### Test 3: Context Menu Invocation (Numpy Array)
- Right-click `data_np` in Variables pane
- Click "Plot Variable"
- Verify chart renders with numpy data

### Test 4: Command Palette Fallback
- Open Command Palette (Ctrl+Shift+P)
- Run "DebugPlot: Plot Variable"
- Verify input prompt DOES appear
- Enter variable name manually
- Verify chart renders

### Test 5: Non-Python Debug Session
- Start a Node.js debug session (or other language)
- Right-click a variable
- Verify "Plot Variable" menu item does NOT appear

### Test 6: Nested Variables
- Right-click a nested variable like `obj.data` (if available)
- Verify context menu works
- Verify `evaluateName` extracts the full path

**Detailed testing guide will be in:** `cc.010.phase-4-testing-guide.md`

---

## Success Criteria

Phase 4 is complete when:

- [ ] Context menu "Plot Variable" appears in Variables pane during Python debugging
- [ ] Right-clicking a variable and selecting "Plot Variable" plots it without prompting
- [ ] Command Palette invocation still works with manual input
- [ ] Extension activates automatically when debugging starts
- [ ] Context menu does NOT appear for non-Python debug sessions
- [ ] TypeScript compiles without errors
- [ ] All existing Phase 3 functionality still works
- [ ] Console logs show whether variable came from context or manual input

---

## Edge Cases & Considerations

### Variable Context Edge Cases

**Q:** What if the variable is a nested object like `my_dict['key']`?
- The `evaluateName` field should contain the full expression
- Our existing evaluation logic should handle it (we already support `.` and `[]` syntax)

**Q:** What if the variable is not plottable (e.g., a string or dict)?
- Our existing error handling in Phase 2/3 will catch this
- Error message will show: "No plottable data in 'varname' (cannot convert to array)"

**Q:** What if `evaluateName` is undefined but `name` is defined?
- Fallback to `context.name` if `context.evaluateName` is undefined
- Updated code:
  ```typescript
  if (context && (context.evaluateName || context.name)) {
    variableName = context.evaluateName || context.name;
  }
  ```

### Activation Event Trade-offs

**`onDebug`:**
- ✅ Pro: Simple, catches all debug sessions
- ✅ Pro: Extension ready before user needs it
- ❌ Con: Activates for all languages (but menu is Python-only)
- **Decision:** Use this for POC simplicity

**`onDebugResolve:python`:**
- ✅ Pro: More specific, only Python
- ❌ Con: More complex, may delay activation
- **Decision:** Reserve for future optimization

### Menu Label

**Current label:** "Plot Variable"
**Alternatives:**
- "Plot This Variable"
- "DebugPlot: Plot Variable"
- "📊 Plot Variable" (with emoji)

**Decision:** Keep "Plot Variable" (simple and clear)

If we want to add a category prefix:
```json
{
  "command": "debugplot.plotVariable",
  "group": "9_cutcopypaste"
}
```
This would place it in the standard copy/paste section. For now, we'll omit `group` to let it appear at the top.

---

## Files Changed Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `package.json` | Modified | Add `menus` and update `activationEvents` |
| `src/extension.ts` | Modified | Accept optional context parameter, extract variable name |

**No new files created.**

---

## Rollback Plan

If Phase 4 doesn't work:

1. **Revert `package.json` changes:**
   - Remove `menus` contribution
   - Restore `activationEvents: ["onCommand:debugplot.plotVariable"]`

2. **Revert `extension.ts` signature:**
   - Change `async (context?: any)` back to `async ()`
   - Remove context handling logic

3. **Recompile:**
   ```bash
   npm run compile
   ```

4. **Test that Phase 3 functionality is restored:**
   - Command Palette → Plot Variable → Manual input → Chart renders

---

## Dependencies & Prerequisites

**Required:**
- ✅ Phase 3 complete and tested
- ✅ Extension compiles without errors
- ✅ `plot_test_basic.py` test script available

**Optional:**
- VS Code Insider build (for testing latest debug APIs)
- Multiple debug configurations (Python, Node.js) to test `when` clause

**No new npm packages required.**

---

## Documentation Updates

After Phase 4 implementation:

1. **Create testing guide:** `cc.010.phase-4-testing-guide.md`
2. **Create accomplishment report:** `cc.011.accomplished-phase-4.md` (after testing)
3. **Update CLAUDE.md:**
   - Mark Phase 4 as complete
   - Update "Current Step"
   - Add Session 5 history
4. **Update HUMAN.md:**
   - Add Phase 4 completion notes
   - Update "How to Use" section with context menu instructions
5. **Update README.md:**
   - Add context menu usage to features list

---

## Next Phase Preview

**Phase 5 — Polish & Package:**
- Comprehensive error handling review
- Package extension with `vsce package`
- Create `.vsix` file for distribution
- Install and test in clean VS Code instance
- Final documentation and demo video (optional)

---

**End of Phase 4 Detailed Plan**
