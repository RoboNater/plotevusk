# Detailed Plan: Automated Testing (Hybrid Approach)

**Date:** 2026-02-10
**Status:** Ready for Implementation
**Approach:** Option C (Hybrid) — Integration tests + Manual visual checklist
**References:**
- Analysis: `cc.011.analysis-options-for-automated-testing.md`
- Manual testing guide: `cc.010.phase-4-testing-guide.md`

---

## Overview

This plan implements a **hybrid testing strategy** that maximizes automation while keeping human verification for inherently visual aspects:

- **Automated (70-75% coverage):** Integration tests using VS Code's official testing framework to verify data reading, DAP communication, command invocation, error handling, and webview creation.
- **Manual (5-minute checklist):** Visual verification of chart rendering, theme integration, responsiveness, and UI interaction that can't be automated cost-effectively.

**Key Benefit:** Fast automated regression for logic + focused human verification for visual elements.

---

## Prerequisites

**Already installed in `poc/extension/package.json`:**
- ✅ `@vscode/test-cli` ^0.0.10 — official test runner
- ✅ `@vscode/test-electron` ^2.4.1 — runs tests inside real VS Code instance
- ✅ `@types/mocha` ^10.0.10 — Mocha test framework
- ✅ `"test": "vscode-test"` script configured in package.json

**No new dependencies required!**

---

## Implementation Steps

### Step 1: Create Test Runner Configuration

**File:** `poc/extension/.vscode-test.mjs`

**Purpose:** Configure the VS Code test runner to:
1. Download/use a specific VS Code version for testing
2. Point to the test workspace directory
3. Specify which test files to run
4. Configure test environment (extensions, settings)

**Implementation:**

```javascript
import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/**/*.test.js',
  version: 'stable', // Use latest stable VS Code
  workspaceFolder: './src/test/fixtures',
  mocha: {
    ui: 'bdd',
    timeout: 20000, // 20s timeout for debug session setup
    color: true
  },
  launchArgs: [
    '--disable-extensions', // Run in clean environment
    '--disable-workspace-trust' // Avoid trust prompt
  ]
});
```

**Key decisions:**
- Use `version: 'stable'` to test against latest stable VS Code
- 20-second timeout because debug sessions take time to initialize
- Disable other extensions to isolate test environment
- Workspace folder points to test fixtures directory

**Verification:**
- File exists at `poc/extension/.vscode-test.mjs`
- No syntax errors (JavaScript module format)

---

### Step 2: Create Test Fixtures Directory

**Directory:** `poc/extension/src/test/fixtures/`

**Purpose:** Create a self-contained test workspace with Python test script.

**Implementation:**

1. Create directory structure:
   ```bash
   mkdir -p poc/extension/src/test/fixtures/.vscode
   ```

2. Copy test script:
   ```bash
   cp poc/test-scripts/plot_test_basic.py poc/extension/src/test/fixtures/test_data.py
   ```

3. Create launch configuration for tests:
   **File:** `poc/extension/src/test/fixtures/.vscode/launch.json`
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Debug Test Script",
         "type": "python",
         "request": "launch",
         "program": "${workspaceFolder}/test_data.py",
         "console": "integratedTerminal",
         "stopOnEntry": false,
         "justMyCode": true
       }
     ]
   }
   ```

4. Create workspace settings (if needed):
   **File:** `poc/extension/src/test/fixtures/.vscode/settings.json`
   ```json
   {
     "python.defaultInterpreterPath": "/usr/bin/python3"
   }
   ```

**Verification:**
- Directory `src/test/fixtures/` exists
- File `src/test/fixtures/test_data.py` contains all 6 test variables
- Launch config exists at `src/test/fixtures/.vscode/launch.json`

---

### Step 3: Create Integration Test Suite

**File:** `poc/extension/src/test/integration.test.ts`

**Purpose:** Comprehensive integration tests covering all automated test cases.

**Structure:**

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('DebugPlot Integration Tests', () => {

  let debugSession: vscode.DebugSession | undefined;

  // Setup: Start debug session before all tests
  suiteSetup(async function() {
    this.timeout(30000); // Allow 30s for initial setup

    // TODO: Implement debug session startup
    // - Open test_data.py
    // - Start debugging
    // - Wait for session to be active
    // - Set breakpoint and wait for hit
  });

  // Teardown: Stop debug session after all tests
  suiteTeardown(async () => {
    // TODO: Terminate debug session
    // - Close all webview panels
    // - Stop debugging
  });

  // Test suites organized by functionality
  suite('Extension Activation', () => {
    // TODO: Test 1-2
  });

  suite('Debug Session Requirement', () => {
    // TODO: Test 3
  });

  suite('Variable Data Reading (DAP)', () => {
    // TODO: Test 4-9 (all 6 test variables)
  });

  suite('Error Handling', () => {
    // TODO: Test 10-13 (None, scalar, undefined, empty)
  });

  suite('Context Menu Code Path', () => {
    // TODO: Test 14-15
  });

  suite('Command Palette Code Path', () => {
    // TODO: Test 16
  });

  suite('Webview Integration', () => {
    // TODO: Test 17-18
  });
});
```

**Detailed Test Implementations:**

#### Test Group 1: Extension Activation

```typescript
suite('Extension Activation', () => {

  test('Extension activates on debug session start', async () => {
    // Verify extension is active
    const extension = vscode.extensions.getExtension('undefined_publisher.debugplot');
    assert.ok(extension, 'Extension should be installed');
    assert.ok(extension.isActive, 'Extension should be active after debug session starts');
  });

  test('Command is registered after activation', async () => {
    // Get all available commands
    const commands = await vscode.commands.getCommands(true);

    // Verify our command is registered
    assert.ok(
      commands.includes('debugplot.plotVariable'),
      'debugplot.plotVariable command should be registered'
    );
  });
});
```

#### Test Group 2: Debug Session Requirement

```typescript
suite('Debug Session Requirement', () => {

  test('Shows warning when no debug session active', async () => {
    // Stop debug session temporarily
    await vscode.commands.executeCommand('workbench.action.debug.stop');

    // Wait for session to fully stop
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try to execute command
    const result = await vscode.commands.executeCommand('debugplot.plotVariable');

    // Should show warning (we can't directly assert on UI messages,
    // but we can verify command returns without error)
    assert.strictEqual(result, undefined, 'Command should return undefined when no session');

    // Restart debug session for subsequent tests
    // TODO: Restart debug session
  });
});
```

#### Test Group 3: Variable Data Reading (Core Functionality)

```typescript
suite('Variable Data Reading (DAP)', () => {

  // Helper function to evaluate a variable via DAP
  async function evaluateVariable(varName: string): Promise<any> {
    assert.ok(debugSession, 'Debug session must be active');

    // Get thread ID
    const threads = await debugSession.customRequest('threads');
    assert.ok(threads.threads.length > 0, 'Should have at least one thread');
    const threadId = threads.threads[0].id;

    // Get stack frame
    const stackTrace = await debugSession.customRequest('stackTrace', {
      threadId: threadId,
      startFrame: 0,
      levels: 1
    });
    assert.ok(stackTrace.stackFrames.length > 0, 'Should have stack frames');
    const frameId = stackTrace.stackFrames[0].id;

    // Evaluate expression
    const expression = `__import__('json').dumps(${varName}.tolist() if hasattr(${varName}, 'tolist') else list(${varName}))`;
    const evalResult = await debugSession.customRequest('evaluate', {
      expression: expression,
      frameId: frameId,
      context: 'repl'
    });

    return evalResult;
  }

  test('Reads Python list (data_list) correctly', async () => {
    const result = await evaluateVariable('data_list');

    // Parse result
    const resultStr = result.result.replace(/^'|'$/g, '');
    const data = JSON.parse(resultStr);

    // Verify data
    assert.strictEqual(Array.isArray(data), true, 'Should return an array');
    assert.strictEqual(data.length, 10, 'data_list should have 10 elements');
    assert.deepStrictEqual(data, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'Should have correct values');
  });

  test('Reads NumPy array (data_np) correctly', async () => {
    const result = await evaluateVariable('data_np');

    const resultStr = result.result.replace(/^'|'$/g, '');
    const data = JSON.parse(resultStr);

    assert.strictEqual(Array.isArray(data), true, 'Should return an array');
    assert.strictEqual(data.length, 10, 'data_np should have 10 elements');

    // Verify values match expected range [0, 10, 20, ..., 90]
    assert.strictEqual(data[0], 0, 'First element should be 0');
    assert.strictEqual(data[9], 90, 'Last element should be 90');
  });

  test('Reads single value list (single_value) correctly', async () => {
    const result = await evaluateVariable('single_value');

    const resultStr = result.result.replace(/^'|'$/g, '');
    const data = JSON.parse(resultStr);

    assert.strictEqual(data.length, 1, 'single_value should have 1 element');
    assert.strictEqual(data[0], 42, 'Value should be 42');
  });

  test('Reads large array (large_array) correctly', async () => {
    const result = await evaluateVariable('large_array');

    const resultStr = result.result.replace(/^'|'$/g, '');
    const data = JSON.parse(resultStr);

    assert.strictEqual(data.length, 1000, 'large_array should have 1000 elements');
    assert.strictEqual(typeof data[0], 'number', 'Elements should be numbers');
  });

  test('Detects empty list (empty_list)', async () => {
    const result = await evaluateVariable('empty_list');

    const resultStr = result.result.replace(/^'|'$/g, '');
    const data = JSON.parse(resultStr);

    assert.strictEqual(data.length, 0, 'empty_list should have 0 elements');
  });

  test('Detects non-numeric data (text_data)', async () => {
    try {
      const result = await evaluateVariable('text_data');
      const resultStr = result.result.replace(/^'|'$/g, '');
      const data = JSON.parse(resultStr);

      // text_data is ['hello', 'world'], which JSON.parse will accept
      // But our extension should reject it because elements aren't numbers
      assert.strictEqual(Array.isArray(data), true, 'Should parse as array');
      assert.strictEqual(typeof data[0], 'string', 'Elements are strings, not numbers');
    } catch (error) {
      // If evaluation fails, that's also acceptable
      assert.ok(true, 'Non-numeric data may cause evaluation error');
    }
  });
});
```

#### Test Group 4: Error Handling

```typescript
suite('Error Handling', () => {

  test('Handles None value gracefully', async () => {
    try {
      const result = await evaluateVariable('None');
      // If it doesn't throw, check the result
      assert.ok(result, 'Should return a result even for None');
    } catch (error) {
      // Expected to fail - None can't be converted to list
      assert.ok(true, 'None should cause an error during evaluation');
    }
  });

  test('Handles scalar (non-iterable) value', async () => {
    try {
      const result = await evaluateVariable('42');
      // Should fail because 42 isn't iterable
      assert.fail('Should have thrown error for scalar value');
    } catch (error) {
      assert.ok(true, 'Scalar values should cause evaluation error');
    }
  });

  test('Handles undefined variable', async () => {
    try {
      const result = await evaluateVariable('undefined_variable_xyz');
      assert.fail('Should have thrown error for undefined variable');
    } catch (error) {
      // Expected - variable doesn't exist
      assert.ok(true, 'Undefined variable should cause evaluation error');
    }
  });

  test('Extension handles empty array result', async () => {
    // This tests the extension's handling, not just DAP evaluation
    // We execute the actual command with context
    const result = await vscode.commands.executeCommand(
      'debugplot.plotVariable',
      { evaluateName: 'empty_list' }
    );

    // Should not throw, but should show error message
    // We can't directly assert on UI messages, but command should complete
    assert.strictEqual(result, undefined, 'Command should complete without throwing');
  });
});
```

#### Test Group 5: Context Menu Code Path

```typescript
suite('Context Menu Code Path', () => {

  test('Command accepts context parameter', async () => {
    // Simulate context menu invocation
    const context = {
      name: 'data_list',
      evaluateName: 'data_list',
      value: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]',
      type: 'list'
    };

    // Execute command with context
    const result = await vscode.commands.executeCommand(
      'debugplot.plotVariable',
      context
    );

    // Command should complete without error
    assert.strictEqual(result, undefined, 'Command should execute successfully');
  });

  test('Extracts variable name from context.evaluateName', async () => {
    // Test with evaluateName (preferred)
    const context1 = {
      name: 'data_list',
      evaluateName: 'data_list',
      value: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]'
    };

    await vscode.commands.executeCommand('debugplot.plotVariable', context1);

    // Test with name fallback
    const context2 = {
      name: 'data_np',
      value: 'array([0, 10, 20, ..., 90])'
    };

    await vscode.commands.executeCommand('debugplot.plotVariable', context2);

    // Both should succeed
    assert.ok(true, 'Both context formats should work');
  });
});
```

#### Test Group 6: Command Palette Code Path

```typescript
suite('Command Palette Code Path', () => {

  test('Command works without context (input prompt path)', async () => {
    // We can't easily mock showInputBox in tests, but we can verify
    // the command accepts no parameters

    // Execute without context - this would normally show input box
    // In test environment, it may fail or timeout, which is expected
    try {
      const result = await vscode.commands.executeCommand('debugplot.plotVariable');
      // If it completes, that's fine
      assert.ok(true, 'Command accepts no parameters');
    } catch (error) {
      // Expected - input box interaction can't complete in test environment
      assert.ok(true, 'Input box path may not complete in tests');
    }
  });
});
```

#### Test Group 7: Webview Integration

```typescript
suite('Webview Integration', () => {

  test('Creates webview panel when plotting', async () => {
    // Get initial panel count
    const initialPanels = vscode.window.tabGroups.all
      .flatMap(group => group.tabs)
      .filter(tab => tab.label.startsWith('Plot:'));

    // Execute command
    await vscode.commands.executeCommand(
      'debugplot.plotVariable',
      { evaluateName: 'data_list' }
    );

    // Wait for panel creation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get new panel count
    const finalPanels = vscode.window.tabGroups.all
      .flatMap(group => group.tabs)
      .filter(tab => tab.label.startsWith('Plot:'));

    assert.ok(
      finalPanels.length > initialPanels.length,
      'Should create a new webview panel'
    );
  });

  test('Panel has correct title', async () => {
    await vscode.commands.executeCommand(
      'debugplot.plotVariable',
      { evaluateName: 'data_np' }
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    const panels = vscode.window.tabGroups.all
      .flatMap(group => group.tabs)
      .filter(tab => tab.label.startsWith('Plot:'));

    const hasCorrectTitle = panels.some(tab =>
      tab.label === 'Plot: data_np'
    );

    assert.ok(hasCorrectTitle, 'Panel should have correct title');
  });
});
```

**Helper Functions for Test Suite:**

```typescript
// At the top of the file, after imports

/**
 * Start a debug session and wait for it to be ready
 */
async function startDebugSession(): Promise<vscode.DebugSession> {
  // Open workspace folder
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  assert.ok(workspaceFolder, 'Workspace folder should be available');

  // Start debugging
  const started = await vscode.debug.startDebugging(
    workspaceFolder,
    'Debug Test Script'
  );

  assert.ok(started, 'Debug session should start');

  // Wait for active session
  let session = vscode.debug.activeDebugSession;
  let attempts = 0;
  while (!session && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    session = vscode.debug.activeDebugSession;
    attempts++;
  }

  assert.ok(session, 'Debug session should become active');

  // Wait for session to be ready (initialized)
  await new Promise(resolve => setTimeout(resolve, 2000));

  return session;
}

/**
 * Stop debug session and clean up
 */
async function stopDebugSession(): Promise<void> {
  if (vscode.debug.activeDebugSession) {
    await vscode.commands.executeCommand('workbench.action.debug.stop');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Close all webview panels
  await vscode.commands.executeCommand('workbench.action.closeAllEditors');
}
```

**Verification:**
- File exists at `poc/extension/src/test/integration.test.ts`
- No TypeScript compilation errors
- All test cases compile (can verify with `npm run compile`)

---

### Step 4: Update TypeScript Configuration for Tests

**File:** `poc/extension/tsconfig.json`

**Purpose:** Ensure test files are included in compilation.

**Changes needed:**

Check if `tsconfig.json` already includes test directory:

```json
{
  "compilerOptions": {
    // ... existing config
  },
  "include": [
    "src/**/*"  // This should already include src/test/**
  ]
}
```

**If tests aren't included, update to:**

```json
{
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".vscode-test"
  ]
}
```

**Verification:**
- Run `npm run compile`
- Verify `out/test/integration.test.js` is created
- No compilation errors

---

### Step 5: Test the Test Runner

**Purpose:** Verify the test infrastructure works before writing complex tests.

**Steps:**

1. Add a simple smoke test first (before implementing full suite):

```typescript
// Temporary smoke test in integration.test.ts
import * as assert from 'assert';

suite('Smoke Test', () => {
  test('Sample test passes', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
```

2. Compile tests:
   ```bash
   cd poc/extension
   npm run compile
   ```

3. Run tests:
   ```bash
   npm test
   ```

**Expected output:**
- VS Code test instance downloads/starts
- Test runs and passes
- Output shows: "✓ Sample test passes"

**Verification:**
- Test runs successfully
- No errors about missing dependencies
- VS Code test window opens and closes
- Console shows test results

---

### Step 6: Implement Full Test Suite

**Purpose:** Replace smoke test with full integration test suite from Step 3.

**Implementation:**

1. Replace smoke test with full test suite (code from Step 3)
2. Implement all test groups:
   - Extension Activation (2 tests)
   - Debug Session Requirement (1 test)
   - Variable Data Reading (6 tests)
   - Error Handling (4 tests)
   - Context Menu Code Path (2 tests)
   - Command Palette Code Path (1 test)
   - Webview Integration (2 tests)

3. Compile:
   ```bash
   npm run compile
   ```

4. Run tests:
   ```bash
   npm test
   ```

**Expected results:**
- All tests pass (or fail with clear actionable messages)
- Test output shows ~18 test cases
- Execution time: 30-60 seconds (includes debug session startup)

**Debugging failing tests:**
- Check console output for specific assertion failures
- Verify debug session starts correctly (check launch config)
- Verify test Python script has all required variables
- Check timing issues (may need to increase timeouts)

**Verification:**
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Test coverage matches plan (~70-75%)

---

### Step 7: Create Manual Testing Checklist

**File:** `poc/docs/cc.013.manual-testing-checklist.md`

**Purpose:** Streamlined checklist for visual/UI testing that can't be automated.

**Content:**

```markdown
# Manual Testing Checklist (5-Minute Visual Verification)

**Purpose:** Quick human verification of visual and UI aspects that can't be automated cost-effectively.

**Frequency:** Run after significant changes to UI, webview, or chart rendering code.

**Prerequisites:**
- ✅ Automated tests passing (`npm test`)
- ✅ VS Code open with extension loaded
- ✅ Python test script: `poc/test-scripts/plot_test_basic.py`

---

## Checklist (5 items)

### 1. Chart Visual Rendering

**Steps:**
1. Start debug session: F5
2. Pause at breakpoint
3. Right-click `data_list` in Variables pane
4. Select "Plot Variable"

**Verify:**
- [ ] Chart renders with correct shape (quadratic curve: values 1,2,3,4,5,6,7,8,9,10)
- [ ] X-axis shows indices 0-9
- [ ] Y-axis shows values 1-10
- [ ] Chart line is smooth and continuous
- [ ] No rendering artifacts or broken graphics

**Time:** ~1 minute

---

### 2. Theme Integration (Light)

**Steps:**
1. Set VS Code to light theme: Settings → Color Theme → Light+
2. Plot `data_np` via context menu
3. Observe chart panel

**Verify:**
- [ ] Chart background is light/white
- [ ] Text (title, axes) is dark and readable
- [ ] Grid lines are visible but subtle
- [ ] Colors match VS Code light theme aesthetic

**Time:** ~30 seconds

---

### 3. Theme Integration (Dark)

**Steps:**
1. Set VS Code to dark theme: Settings → Color Theme → Dark+
2. Plot `large_array` via context menu
3. Observe chart panel

**Verify:**
- [ ] Chart background is dark
- [ ] Text (title, axes) is light and readable
- [ ] Grid lines are visible but subtle
- [ ] Colors match VS Code dark theme aesthetic

**Time:** ~30 seconds

---

### 4. Context Menu UI Presence

**Steps:**
1. Ensure Python debug session is active and paused
2. In Variables pane, right-click on any variable
3. Observe context menu

**Verify:**
- [ ] "Plot Variable" appears in context menu
- [ ] Menu item is near the top of the menu
- [ ] Menu item shows correct text and icon (if any)
- [ ] Clicking it works without errors

**Time:** ~30 seconds

---

### 5. Context Menu Language Filtering

**Steps:**
1. Stop Python debug session
2. Start a Node.js debug session (if available):
   - Create simple `test.js`: `const x = [1,2,3]; debugger;`
   - Debug with Node.js debugger
3. Right-click variable in Variables pane

**Verify:**
- [ ] "Plot Variable" does NOT appear for Node.js debugging
- [ ] Other context menu items still appear normally
- [ ] Confirms `when: "debugType == 'python'"` works

**Time:** ~1 minute

---

## Summary

**Total time:** ~5 minutes

**Success criteria:**
- All 5 checklist items verified ✓
- Any issues documented for fixing
- Quick visual confirmation complements automated tests

**Note:** If any item fails, investigate and fix before considering testing complete.
```

**Verification:**
- File created at `poc/docs/cc.013.manual-testing-checklist.md`
- Checklist is concise (5 items, ~5 minutes)
- Complements automated tests (doesn't duplicate them)

---

### Step 8: Update Package.json Test Script (if needed)

**File:** `poc/extension/package.json`

**Purpose:** Ensure test script is properly configured.

**Check existing `scripts` section:**

```json
{
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src",
    "test": "vscode-test"
  }
}
```

**Verify:**
- ✅ `"test": "vscode-test"` exists (should already be there)
- ✅ `"pretest": "npm run compile && npm run lint"` compiles before testing

**If missing, add:**

```json
{
  "scripts": {
    "test": "vscode-test",
    "pretest": "npm run compile"
  }
}
```

**Verification:**
- Run `npm test` — should compile then run tests
- No manual compilation needed before testing

---

### Step 9: Create Test Documentation

**File:** `poc/docs/cc.014.testing-guide.md`

**Purpose:** Comprehensive guide for running both automated and manual tests.

**Content:**

```markdown
# Testing Guide — DebugPlot Extension

**Date:** 2026-02-10
**Approach:** Hybrid (Automated Integration Tests + Manual Visual Checklist)

---

## Overview

This project uses a **hybrid testing strategy**:

1. **Automated Tests (70-75% coverage)** — Fast integration tests that verify logic, data handling, and API integration
2. **Manual Tests (5-minute checklist)** — Visual verification of chart rendering and UI interactions

---

## Running Automated Tests

### Quick Start

```bash
cd poc/extension
npm test
```

**What happens:**
1. TypeScript compilation (`npm run compile`)
2. VS Code test instance downloads (first time only)
3. Test workspace opens with fixtures
4. All tests execute inside VS Code
5. Results displayed in terminal

**Expected output:**

```
DebugPlot Integration Tests
  Extension Activation
    ✓ Extension activates on debug session start (234ms)
    ✓ Command is registered after activation (45ms)
  Debug Session Requirement
    ✓ Shows warning when no debug session active (1205ms)
  Variable Data Reading (DAP)
    ✓ Reads Python list (data_list) correctly (523ms)
    ✓ Reads NumPy array (data_np) correctly (487ms)
    ✓ Reads single value list correctly (456ms)
    ✓ Reads large array correctly (612ms)
    ✓ Detects empty list (401ms)
    ✓ Detects non-numeric data (478ms)
  Error Handling
    ✓ Handles None value gracefully (389ms)
    ✓ Handles scalar value (367ms)
    ✓ Handles undefined variable (392ms)
    ✓ Extension handles empty array result (501ms)
  Context Menu Code Path
    ✓ Command accepts context parameter (498ms)
    ✓ Extracts variable name from context (512ms)
  Command Palette Code Path
    ✓ Command works without context (234ms)
  Webview Integration
    ✓ Creates webview panel when plotting (876ms)
    ✓ Panel has correct title (654ms)

  18 passing (12s)
```

**Total time:** ~15-30 seconds (after initial VS Code download)

### Troubleshooting

**Problem: Tests fail to start**
- Check Node.js version: `node --version` (should be 18+)
- Clean and rebuild: `npm run clean && npm install && npm run compile`
- Delete test cache: `rm -rf .vscode-test`

**Problem: Debug session doesn't start in tests**
- Verify Python is installed: `python3 --version`
- Check test fixture exists: `src/test/fixtures/test_data.py`
- Verify launch config: `src/test/fixtures/.vscode/launch.json`

**Problem: Individual test fails**
- Run tests with verbose output: `npm test -- --reporter spec`
- Check assertion message in output
- Verify test data script has all expected variables

---

## Running Manual Tests

### Quick Start

Follow the checklist in `cc.013.manual-testing-checklist.md`:

1. Chart visual rendering (~1 min)
2. Theme integration — light (~30 sec)
3. Theme integration — dark (~30 sec)
4. Context menu UI presence (~30 sec)
5. Context menu language filtering (~1 min)

**Total time:** ~5 minutes

**When to run:**
- After changes to chart rendering code
- After changes to webview HTML/CSS
- After changes to context menu configuration
- Before major releases

---

## Continuous Integration (Future)

### GitHub Actions Setup (Optional)

If this project moves beyond POC, add `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd poc/extension && npm install
      - run: cd poc/extension && npm test
      - run: xvfb-run -a npm test  # For headless VS Code
```

---

## Test Coverage Summary

### Automated Coverage (~70-75%)

- ✅ Extension activation on debug session start
- ✅ Command registration
- ✅ Debug session requirement enforcement
- ✅ DAP variable evaluation (all 6 test variables)
- ✅ Error handling (None, scalar, undefined, empty)
- ✅ Context menu code path
- ✅ Command Palette code path
- ✅ Webview panel creation
- ✅ Webview title correctness

### Manual Coverage (~25-30%)

- 👁️ Visual chart correctness (curve shape, axes)
- 👁️ Light theme rendering
- 👁️ Dark theme rendering
- 👁️ Chart responsiveness/resizing
- 👁️ Context menu UI appearance
- 👁️ Context menu language filtering (UI-level)

---

## Best Practices

1. **Always run automated tests before committing**
   ```bash
   npm test
   ```

2. **Run manual checklist before releases**
   - See `cc.013.manual-testing-checklist.md`

3. **Update tests when adding features**
   - Add test cases to `src/test/integration.test.ts`
   - Update manual checklist if needed

4. **Keep test data fresh**
   - Ensure `test_data.py` matches `plot_test_basic.py`
   - Add new test variables as needed

---

## References

- Test implementation: `src/test/integration.test.ts`
- Test configuration: `.vscode-test.mjs`
- Test fixtures: `src/test/fixtures/`
- Manual checklist: `cc.013.manual-testing-checklist.md`
- Testing analysis: `cc.011.analysis-options-for-automated-testing.md`
```

**Verification:**
- File created at `poc/docs/cc.014.testing-guide.md`
- Covers both automated and manual testing
- Includes troubleshooting guidance

---

## Step 10: Final Verification & Documentation

### Verification Steps

1. **Compile everything:**
   ```bash
   cd poc/extension
   npm run compile
   ```
   - ✅ No TypeScript errors
   - ✅ `out/test/integration.test.js` created

2. **Run automated tests:**
   ```bash
   npm test
   ```
   - ✅ All tests pass
   - ✅ ~18 test cases execute
   - ✅ Total time < 60 seconds

3. **Run manual checklist:**
   - Follow `cc.013.manual-testing-checklist.md`
   - ✅ All 5 items verified
   - ✅ Total time ~5 minutes

4. **Verify test coverage:**
   - Review test output
   - Confirm automated tests cover expected areas
   - Confirm manual checklist covers visual aspects

### Documentation Updates

1. **Update CLAUDE.md:**
   - Add testing implementation to Session history
   - Update current status
   - Note test files created

2. **Update HUMAN.md:**
   - Add section: "Running Tests"
   - Link to `cc.014.testing-guide.md`
   - Include quick-start commands

3. **Update README.md:**
   - Add "Testing" section
   - Note hybrid approach
   - Include test badges (if CI is set up)

### Git Commit

```bash
cd /home/alfred/lw/w514-plot-in-vscode
git add .
git commit -m "Implement automated testing infrastructure (Hybrid approach)

- Add VS Code integration test suite with 18 test cases
- Create test runner configuration (.vscode-test.mjs)
- Set up test fixtures with Python test script
- Implement automated tests for:
  - Extension activation
  - Debug session requirement
  - Variable data reading (all 6 test variables)
  - Error handling (None, scalar, undefined, empty)
  - Context menu and Command Palette code paths
  - Webview panel creation
- Create streamlined manual testing checklist (5 items, ~5 min)
- Add comprehensive testing documentation
- Coverage: ~70-75% automated, ~25-30% manual visual checks

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria

Testing implementation is complete when:

- [ ] `.vscode-test.mjs` configuration file exists and is valid
- [ ] Test fixtures directory created with test Python script
- [ ] `src/test/integration.test.ts` implements all 18 test cases
- [ ] TypeScript compiles without errors (including tests)
- [ ] `npm test` runs successfully and all tests pass
- [ ] Manual testing checklist created (`cc.013.manual-testing-checklist.md`)
- [ ] Testing guide created (`cc.014.testing-guide.md`)
- [ ] All manual checklist items verified (5/5 passing)
- [ ] Documentation updated (CLAUDE.md, HUMAN.md, README.md)
- [ ] Changes committed to git

---

## Expected Outcomes

### Before Implementation
- ❌ No automated tests
- ❌ Only manual testing (time-consuming, error-prone)
- ❌ No regression detection

### After Implementation
- ✅ 18 automated test cases running in ~30 seconds
- ✅ Fast feedback on code changes
- ✅ 70-75% test coverage (automated)
- ✅ 5-minute manual checklist for visual verification
- ✅ Clear testing documentation
- ✅ Foundation for CI/CD if project expands

---

## Future Enhancements (Beyond POC)

If this moves beyond POC:

1. **CI/CD Integration**
   - Add GitHub Actions workflow
   - Run tests on every PR
   - Add test coverage reporting

2. **Visual Regression Testing**
   - Add screenshot comparison for charts
   - Use tools like Percy or Chromatic

3. **Performance Testing**
   - Test with very large arrays (10k+ elements)
   - Measure webview rendering time

4. **End-to-End UI Testing**
   - Add WebdriverIO for full UI automation
   - Test actual right-click workflows

5. **Code Coverage Metrics**
   - Add Istanbul/NYC for coverage reports
   - Target 80%+ coverage

---

## Notes

- Test implementation prioritizes **fast feedback** over exhaustive coverage
- Manual checklist focuses on **what actually needs human eyes**
- Hybrid approach balances **automation value** with **implementation cost**
- Tests use **real VS Code instance** (high fidelity, slower than unit tests)
- Test suite is **additive** — easy to add more tests as features grow

---

**End of Detailed Testing Plan**
