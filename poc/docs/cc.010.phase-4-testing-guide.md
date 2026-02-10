# Phase 4 Testing Guide — Context Menu Integration

**Phase:** 4 of 5
**Status:** Ready for Manual Testing
**Implementation Commit:** c52efd8
**Date:** 2026-02-10

---

## Overview

Phase 4 adds context menu integration, allowing users to **right-click variables in the Variables pane during debug sessions** and select "Plot Variable" to visualize them without manual entry.

This guide provides step-by-step instructions for testing all aspects of Phase 4 functionality.

---

## Test Environment Setup

### Prerequisites
1. ✅ VS Code with DebugPlot extension installed
2. ✅ Python test script: `poc/test-scripts/plot_test_basic.py`
3. ✅ Extension compiled: `poc/extension/out/extension.js`
4. ✅ Python debugger configured in `.vscode/launch.json`

### Test Script Reminder

**Location:** `/home/alfred/lw/w514-plot-in-vscode/poc/test-scripts/plot_test_basic.py`

**Variables available for testing:**
- `data_list` — Python list with 10 values
- `data_np` — NumPy array with 10 values
- `empty_list` — Empty list (should error)
- `single_value` — List with 1 value
- `large_array` — Array with 1000 values
- `text_data` — List of strings (should error)

### VS Code Setup

1. Open the workspace in VS Code:
   ```bash
   code /home/alfred/lw/w514-plot-in-vscode
   ```

2. Ensure Python extension is installed
3. Verify launch configuration points to `poc/test-scripts/plot_test_basic.py`

---

## Test Cases

### Test 1: Context Menu Appears for Python Debug Session

**Purpose:** Verify that the "Plot Variable" context menu item appears during Python debugging.

**Steps:**
1. Open `poc/test-scripts/plot_test_basic.py` in the editor
2. Press **F5** to start debugging (or click Debug → Start Debugging)
3. Wait for the script to pause at the breakpoint (or manually pause with Ctrl+C)
4. In the Debug Sidebar, expand the **Variables** pane
5. Right-click on any variable (e.g., `data_list`)
6. Look for "Plot Variable" context menu item

**Expected Result:**
- ✅ "Plot Variable" menu item appears in the context menu
- ✅ Menu item is positioned at the top of the context menu
- ✅ Menu item shows "Plot Variable" text (from `title` in package.json)

**Evidence:**
- Screenshot or description of the context menu

---

### Test 2: Context Menu Invocation — Python List

**Purpose:** Verify that right-clicking a Python list variable and selecting "Plot Variable" plots it without prompting.

**Steps:**
1. Start Python debugging session (from Test 1)
2. Ensure debugger is paused at a breakpoint
3. In Variables pane, right-click on `data_list`
4. Click "Plot Variable"
5. Observe the response

**Expected Result:**
- ✅ **No input prompt appears** (this is key — context menu should skip input)
- ✅ Chart panel opens immediately with title "Plot: data_list"
- ✅ Line chart renders with 10 data points
- ✅ Console shows message: "DebugPlot: Variable from context menu: 'data_list'"
- ✅ Console shows success message: "DebugPlot: Read 10 values from 'data_list'"
- ✅ Chart displays correctly with proper axes and labels

**Evidence:**
- Console output showing "Variable from context menu" message
- Screenshot of rendered chart

---

### Test 3: Context Menu Invocation — NumPy Array

**Purpose:** Verify that context menu works with NumPy arrays.

**Steps:**
1. Continue from previous test (or restart debug session)
2. In Variables pane, right-click on `data_np`
3. Click "Plot Variable"
4. Observe the chart

**Expected Result:**
- ✅ **No input prompt appears**
- ✅ Chart panel opens with title "Plot: data_np"
- ✅ Line chart renders with 10 data points
- ✅ Console shows: "DebugPlot: Variable from context menu: 'data_np'"
- ✅ Chart displays same style as Python list (indistinguishable to user)

**Evidence:**
- Console output
- Screenshot of chart

---

### Test 4: Command Palette Fallback

**Purpose:** Verify that invoking the command from Command Palette still works with input prompt (backward compatibility).

**Steps:**
1. Ensure debugging is still active and paused
2. Press **Ctrl+Shift+P** to open Command Palette
3. Type "DebugPlot" and select "DebugPlot: Plot Variable"
4. In the input box that appears, type `data_list`
5. Press Enter

**Expected Result:**
- ✅ Input box appears with prompt "Enter the variable name to plot"
- ✅ Placeholder text shows "e.g., data_list, data_np"
- ✅ After typing and pressing Enter, chart renders for `data_list`
- ✅ **No "Variable from context menu" message in console** (shows this came from input, not context)
- ✅ Chart displays correctly

**Evidence:**
- Screenshot of input box
- Console output showing absence of "Variable from context menu" message
- Screenshot of rendered chart

---

### Test 5: Invalid Input Validation (Command Palette)

**Purpose:** Verify that input validation still works when using Command Palette.

**Steps:**
1. Open Command Palette: **Ctrl+Shift+P**
2. Run "DebugPlot: Plot Variable"
3. Type invalid variable name: `123invalid` (starts with number)
4. Observe the validation message
5. Type valid name: `data_list`
6. Press Enter

**Expected Result:**
- ✅ Invalid name shows error: "Invalid variable name"
- ✅ Error message is red/highlighted
- ✅ Cannot proceed until valid name is entered
- ✅ Clearing and typing valid name removes error
- ✅ Pressing Escape cancels without error

**Evidence:**
- Screenshot of validation error message
- Screenshot of successful entry

---

### Test 6: Non-Python Debug Session (Menu Should NOT Appear)

**Purpose:** Verify that the context menu only appears for Python debug sessions.

**Prerequisites:**
- Node.js installed
- A simple Node.js debug configuration in `.vscode/launch.json`

**Steps:**
1. Create a simple Node.js file: `test.js`
   ```javascript
   const x = [1, 2, 3];
   debugger;
   ```

2. Add Node.js launch config to `.vscode/launch.json`:
   ```json
   {
     "name": "Launch Node.js",
     "type": "node",
     "request": "launch",
     "program": "${workspaceFolder}/test.js",
     "skipFiles": ["<node_internals>/**"]
   }
   ```

3. Start Node.js debugging with this config
4. Wait for debugger to pause
5. In Variables pane, right-click a variable
6. Look for "Plot Variable" menu item

**Expected Result:**
- ✅ "Plot Variable" menu item does **NOT appear** in the context menu
- ✅ Other context menu items still appear normally
- ✅ This confirms the `when: "debugType == 'python'"` clause is working

**Evidence:**
- Screenshot of context menu without "Plot Variable" item

---

### Test 7: Empty Array Error Handling (Context Menu)

**Purpose:** Verify that error handling works correctly when plotting empty arrays.

**Steps:**
1. Restart debug session with Python test script
2. In Variables pane, right-click `empty_list`
3. Click "Plot Variable"
4. Observe error message

**Expected Result:**
- ✅ **No input prompt appears**
- ✅ Error message shows: "DebugPlot: No plottable data in 'empty_list' (variable is empty)"
- ✅ No chart panel opens
- ✅ Console shows which variable came from context

**Evidence:**
- Screenshot of error message
- Console output

---

### Test 8: Nested Variable Access (Context Menu)

**Purpose:** Verify that context menu handles nested variables (if available in test script).

**Prerequisites:**
- Modify test script to have nested data:
  ```python
  import json
  class DataContainer:
      def __init__(self):
          self.data = [1, 2, 3, 4, 5]

  container = DataContainer()
  breakpoint()  # Pause here
  ```

**Steps:**
1. Add nested variable class to test script (if available)
2. Start debug session
3. In Variables pane, expand `container` to reveal `data`
4. Right-click on `container.data` (if it shows as a separate variable)
5. Click "Plot Variable"

**Expected Result:**
- ✅ If `evaluateName` is properly set for nested variable, it plots correctly
- ✅ If not, provides helpful error message
- ✅ Context menu extracts full path (`container.data`) from `context.evaluateName`

**Evidence:**
- Console output showing extracted variable name
- Chart or error message

---

### Test 9: Extension Activation Event

**Purpose:** Verify that the extension activates when debugging starts (not at VS Code startup).

**Steps:**
1. **Close all VS Code instances**
2. Open a fresh VS Code window with the workspace:
   ```bash
   code /home/alfred/lw/w514-plot-in-vscode
   ```
3. Do NOT start debugging yet
4. Open the Debug Console (View → Debug Console or Ctrl+Shift+Y)
5. Look for "DebugPlot extension is now active" message
6. **It should NOT be there yet**
7. Press F5 to start debugging
8. Look for the message again

**Expected Result:**
- ✅ No "DebugPlot extension is now active" message before debug session starts
- ✅ Message appears in Debug Console immediately after F5
- ✅ This confirms `onDebug` activation event is working

**Evidence:**
- Screenshot of Debug Console before debug start
- Screenshot of Debug Console after debug start

---

### Test 10: Multiple Plots in Sequence

**Purpose:** Verify that multiple context menu plots work without issues.

**Steps:**
1. Start debug session
2. Pause at breakpoint
3. Right-click `data_list` → "Plot Variable" → Chart 1 opens
4. Right-click `data_np` → "Plot Variable" → Chart 2 opens
5. Right-click `single_value` → "Plot Variable" → Chart 3 opens (or error)
6. Switch between chart tabs

**Expected Result:**
- ✅ Each chart opens in a new tab
- ✅ All charts display correctly
- ✅ Can switch between tabs
- ✅ Tabs show correct titles: "Plot: data_list", "Plot: data_np", etc.
- ✅ No memory leaks or performance issues

**Evidence:**
- Screenshot showing multiple chart tabs

---

## Testing Checklist

- [ ] Test 1: Context menu appears for Python debugging
- [ ] Test 2: Context menu plots Python lists without prompting
- [ ] Test 3: Context menu plots NumPy arrays
- [ ] Test 4: Command Palette fallback with input prompt works
- [ ] Test 5: Input validation works correctly
- [ ] Test 6: Context menu does NOT appear for non-Python debug sessions
- [ ] Test 7: Error handling for empty arrays
- [ ] Test 8: Nested variable access (if applicable)
- [ ] Test 9: Extension activation event (`onDebug` works)
- [ ] Test 10: Multiple sequential plots work correctly

---

## Console Messages Expected

During successful context menu invocation, you should see in the Debug Console:

```
DebugPlot extension is now active
DebugPlot: Variable from context menu: 'data_list'
DebugPlot raw result: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]'
DebugPlot: Read 10 values from 'data_list': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
DebugPlot: Created chart panel for 'data_list' with 10 values
Chart rendered for data_list
```

During Command Palette invocation, you should see:

```
DebugPlot extension is now active
DebugPlot raw result: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]'
DebugPlot: Read 10 values from 'data_list': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
DebugPlot: Created chart panel for 'data_list' with 10 values
Chart rendered for data_list
```

(Note: No "Variable from context menu" message — this distinguishes the two invocation methods)

---

## Troubleshooting

### Problem: Context menu doesn't appear

**Possible causes:**
1. Extension not activated during debug session
   - **Solution:** Check Debug Console for "DebugPlot extension is now active" message
   - **Solution:** Verify `activationEvents: ["onDebug"]` in package.json

2. Not in a Python debug session
   - **Solution:** Verify `debugType` shows as "python" in VS Code
   - **Solution:** Check `when: "debugType == 'python'"` condition is in package.json

3. Variables pane not showing variables
   - **Solution:** Pause at breakpoint first (use `breakpoint()` or set manual breakpoint)
   - **Solution:** Expand the Variables pane if collapsed

### Problem: Input prompt appears when right-clicking

**Possible causes:**
1. Context not being passed to command handler
   - **Solution:** Verify `context?: any` parameter in command handler
   - **Solution:** Check that `context.evaluateName || context.name` is being checked

2. Variable context is null/undefined
   - **Solution:** This should fallback to input prompt (correct behavior)

### Problem: Chart doesn't render after context menu click

**Possible causes:**
1. Variable name not extracted correctly from context
   - **Solution:** Check console for "Variable from context menu: 'varname'" message
   - **Solution:** Verify variable exists in scope

2. Data format incompatible
   - **Solution:** Check error message: "No plottable data in 'varname'"
   - **Solution:** Verify variable is a list or numpy array

### Problem: Extension doesn't activate on debug start

**Possible causes:**
1. `onDebug` not in activationEvents
   - **Solution:** Verify package.json has `"activationEvents": ["onDebug"]`
   - **Solution:** Run `npm run compile` to ensure changes are compiled

2. Extension cache issue
   - **Solution:** Reload VS Code window (Developer: Reload Window command)
   - **Solution:** Restart VS Code completely

---

## Success Criteria

Phase 4 testing is complete when:

- [ ] Context menu appears during Python debugging
- [ ] Right-clicking variables and selecting "Plot Variable" plots them without input prompt
- [ ] Command Palette invocation still works with input prompt
- [ ] Context menu does NOT appear for non-Python debug sessions
- [ ] Error messages display correctly for invalid data
- [ ] Extension activates on debug start (not on VS Code startup)
- [ ] Multiple sequential plots work without issues
- [ ] Console shows correct messages for context menu invocations
- [ ] All existing Phase 3 functionality still works
- [ ] TypeScript compiles without errors

---

## Next Steps

After successful testing:

1. Create Phase 4 accomplishment report: `cc.011.accomplished-phase-4.md`
2. Update CLAUDE.md with Phase 4 completion and Session 5 history
3. Update HUMAN.md with context menu usage instructions
4. Update README.md with context menu feature
5. Plan Phase 5 — Polish & Package

---

**End of Phase 4 Testing Guide**
