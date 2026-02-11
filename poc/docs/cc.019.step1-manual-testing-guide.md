# Phase 6 Step 1: Error Handling Manual Testing Guide

**Status:** Ready for User Testing
**Test Date:** [When executed]
**Tester:** [User name]

---

## Overview

This guide provides step-by-step instructions for manually testing all error handling scenarios in the DebugPlot extension. The automated test suite has verified 17/18 cases; these manual tests provide visual confirmation and ensure user experience is appropriate.

**Estimated Time:** 5-10 minutes

---

## Prerequisites

✅ **Before starting:**
- [ ] Automated tests passing (npm test completed successfully)
- [ ] VS Code open with `/home/alfred/lw/w514-plot-in-vscode/poc/extension/` folder
- [ ] Python extension installed (ms-python.python)
- [ ] Python Debugger installed (ms-python.debugpy)

---

## Test Environment Setup

### Step 1: Verify Test Data Script

The test script should be available at:
```
/home/alfred/lw/w514-plot-in-vscode/poc/extension/src/test/fixtures/test_data.py
```

**File contents verification:**
```python
# Should contain these test variables:
data_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]              # Valid data
data_np = np.array([0, 10, 20, 30, 40, 50, 60, 70, 80, 90])  # Valid numpy array
single_value = [42]                                      # Single value
large_array = np.arange(1000)                           # Large array
data_none = None                                         # Error case: None
data_scalar = 42                                         # Error case: scalar
empty_list = []                                          # Error case: empty
text_data = ['hello', 'world']                          # Error case: non-numeric
```

### Step 2: Configure Debug Launch

**Option 1: Using Extension Development Host** (Recommended for Phase 6)
1. Open `/home/alfred/lw/w514-plot-in-vscode/poc/extension/` in VS Code
2. Press **F5** to launch Extension Development Host
3. In the new VS Code window, open the test workspace at `poc/extension/src/test/fixtures/.vscode`
4. Press **F5** to debug `test_data.py`

**Option 2: Direct Python Debug**
In VS Code, ensure the debug configuration is available:
```
Debug > Select and Start Debugging > Python > test_data.py
```
(Navigate to `poc/extension/src/test/fixtures/test_data.py`)

Or use the keyboard shortcut: **F5**

---

## Manual Test Cases

### Test Case 1: Valid Data - Python List
**Purpose:** Verify baseline functionality works correctly

**Steps:**
1. Start debugging: **F5** → Select "Python" → Select "plot_test_basic.py"
2. Wait for breakpoint to pause execution
3. In Variables pane, locate `data_list`
4. Right-click `data_list`
5. Select "**Plot Variable**" from context menu

**Expected Result:**
- ✅ Chart panel opens immediately
- ✅ Chart title shows: "Plot: data_list (10 values)"
- ✅ Line chart renders with 10 data points: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
- ✅ No error message displayed

**Screenshot/Evidence:** [Take screenshot for records]

---

### Test Case 2: Valid Data - NumPy Array
**Purpose:** Verify numpy array handling works correctly

**Steps:**
1. Ensure still in debug session (use Test Case 1's debug session)
2. In Variables pane, locate `data_np`
3. Right-click `data_np`
4. Select "**Plot Variable**" from context menu

**Expected Result:**
- ✅ Chart panel opens (may reuse previous panel or create new one)
- ✅ Chart title shows: "Plot: data_np (10 values)"
- ✅ Line chart renders with 10 values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
- ✅ No error message displayed

**Screenshot/Evidence:** [Take screenshot for records]

---

### Test Case 3: Error Case - Variable is None
**Purpose:** Verify graceful handling of None values

**Steps:**
1. Ensure still in debug session
2. In Variables pane, scroll down to locate `data_none`
3. Right-click `data_none`
4. Select "**Plot Variable**" from context menu

**Expected Result:**
- ❌ NO chart panel opens
- ✅ Error message appears:
  ```
  DebugPlot: No plottable data in 'data_none' (variable is None)
  ```
- ✅ Message is clear and explains the issue
- ✅ Message includes variable name in quotes

**Error Message Verification:**
- [ ] Starts with "DebugPlot: "
- [ ] Contains variable name in quotes: 'data_none'
- [ ] Includes clear reason in parentheses: (variable is None)
- [ ] Is displayed as error notification (red background)

**Screenshot/Evidence:** [Take screenshot showing error message]

---

### Test Case 4: Error Case - Variable is Scalar (Non-Iterable)
**Purpose:** Verify handling of scalar values

**Steps:**
1. Ensure still in debug session
2. In Variables pane, locate `data_scalar`
3. Right-click `data_scalar`
4. Select "**Plot Variable**" from context menu

**Expected Result:**
- ❌ NO chart panel opens
- ✅ Error message appears:
  ```
  DebugPlot: No plottable data in 'data_scalar' (cannot convert to array)
  ```
- ✅ Message is clear and explains the limitation
- ✅ Message includes variable name in quotes

**Error Message Verification:**
- [ ] Starts with "DebugPlot: "
- [ ] Contains variable name in quotes: 'data_scalar'
- [ ] Includes clear reason in parentheses: (cannot convert to array)
- [ ] Is displayed as error notification (red background)

**Screenshot/Evidence:** [Take screenshot showing error message]

---

### Test Case 5: Error Case - Empty Array
**Purpose:** Verify handling of empty lists/arrays

**Steps:**
1. Ensure still in debug session
2. In Variables pane, locate `empty_list`
3. Right-click `empty_list`
4. Select "**Plot Variable**" from context menu

**Expected Result:**
- ❌ NO chart panel opens
- ✅ Error message appears:
  ```
  DebugPlot: No plottable data in 'empty_list' (variable is empty)
  ```
- ✅ Message is clear and explains the limitation
- ✅ Message includes variable name in quotes

**Error Message Verification:**
- [ ] Starts with "DebugPlot: "
- [ ] Contains variable name in quotes: 'empty_list'
- [ ] Includes clear reason in parentheses: (variable is empty)
- [ ] Is displayed as error notification (red background)

**Screenshot/Evidence:** [Take screenshot showing error message]

---

### Test Case 6: Error Case - Non-Numeric Data
**Purpose:** Verify handling of text/string arrays

**Steps:**
1. Ensure still in debug session
2. In Variables pane, locate `text_data`
3. Right-click `text_data`
4. Select "**Plot Variable**" from context menu

**Expected Result:**
- ❌ NO chart panel opens
- ✅ Error message appears:
  ```
  DebugPlot: No plottable data in 'text_data' (cannot convert to array)
  ```
- ✅ Message is clear and explains the limitation
- ✅ Message includes variable name in quotes

**Error Message Verification:**
- [ ] Starts with "DebugPlot: "
- [ ] Contains variable name in quotes: 'text_data'
- [ ] Includes clear reason in parentheses: (cannot convert to array)
- [ ] Is displayed as error notification (red background)

**Screenshot/Evidence:** [Take screenshot showing error message]

---

### Test Case 7: Alternative Path - Command Palette
**Purpose:** Verify error handling works via Command Palette (not just context menu)

**Steps:**
1. Ensure still in debug session (or start new one with F5)
2. Open Command Palette: **Ctrl+Shift+P** (or **Cmd+Shift+P** on Mac)
3. Type: "DebugPlot: Plot Variable"
4. Press Enter
5. When prompted for variable name, enter: `data_none`
6. Press Enter

**Expected Result:**
- ❌ NO chart panel opens
- ✅ Error message appears:
  ```
  DebugPlot: No plottable data in 'data_none' (variable is None)
  ```
- ✅ Same message format as context menu path

**Verification:**
- [ ] Command appears in palette search
- [ ] Input prompt appears for variable name
- [ ] Error message uses same format as context menu
- [ ] No console errors in Developer Tools

**Screenshot/Evidence:** [Take screenshot of command palette and error]

---

### Test Case 8: Console Check - No Unhandled Exceptions
**Purpose:** Verify no unhandled exceptions appear in VS Code console

**Steps:**
1. After completing all error test cases
2. Open VS Code Developer Console: **Help > Toggle Developer Tools** or **Ctrl+Shift+I**
3. Switch to "Console" tab
4. Scroll through output

**Expected Result:**
- ✅ No JavaScript errors from DebugPlot extension
- ✅ No red error icons in console
- ✅ May see other VS Code extensions' messages (ignore)
- ✅ DebugPlot logs should be blue/normal (not red)

**Verification:**
- [ ] No "DebugPlot" errors in console
- [ ] No unhandled promise rejections related to DebugPlot
- [ ] All DebugPlot messages are informational (blue) or logged errors

**Screenshot/Evidence:** [Take screenshot of clean console]

---

## Summary Checklist

After completing all test cases, verify:

### Error Handling Quality
- [ ] All error messages start with "DebugPlot: "
- [ ] All error messages include variable name in quotes
- [ ] All error messages explain the reason in parentheses
- [ ] Error messages are grammatically correct and professional
- [ ] Error messages are distinct from each other (no duplicate messages)

### User Experience
- [ ] Error messages appear as notifications (not console only)
- [ ] Error messages are readable (appropriate font size, contrast)
- [ ] No error messages contain technical jargon
- [ ] No error messages contain raw Python stack traces
- [ ] Users can understand what went wrong and why

### Robustness
- [ ] No unhandled exceptions in console
- [ ] Extension continues working after errors
- [ ] Can test multiple variables in same session
- [ ] Debugger remains responsive after errors

### Code Path Coverage
- [ ] Context menu path tested (Test Cases 1-6)
- [ ] Command Palette path tested (Test Case 7)
- [ ] Both valid and error cases tested
- [ ] Console remains clean (Test Case 8)

---

## Test Results Summary

**Overall Status:**

| Test Case | Result | Notes |
|-----------|--------|-------|
| 1. Valid Data - Python List | [ ] Pass / [ ] Fail | Expected: Chart renders |
| 2. Valid Data - NumPy Array | [ ] Pass / [ ] Fail | Expected: Chart renders |
| 3. Error - None Value | [ ] Pass / [ ] Fail | Expected: Error message |
| 4. Error - Scalar Value | [ ] Pass / [ ] Fail | Expected: Error message |
| 5. Error - Empty Array | [ ] Pass / [ ] Fail | Expected: Error message |
| 6. Error - Non-Numeric Data | [ ] Pass / [ ] Fail | Expected: Error message |
| 7. Command Palette Path | [ ] Pass / [ ] Fail | Expected: Works identically |
| 8. Console Check | [ ] Pass / [ ] Fail | Expected: No errors |

**Total:** ___/8 tests passing

---

## Troubleshooting

### Issue: Breakpoint Not Hitting
**Solution:**
- Verify `plot_test_basic.py` has a `breakpoint()` call or explicit breakpoint set
- Check Debug Console for error messages
- Ensure Python extension is properly installed

### Issue: Variables Pane Empty
**Solution:**
- Verify debugger is actually paused (check Debug Console)
- Try using Command Palette path instead
- Check Python version compatibility (3.7+)

### Issue: Chart Renders for Error Case (Shouldn't)
**Solution:**
- This indicates error handling issue
- Check error handling logic in `src/extension.ts` (lines 101-113)
- Verify data validation catches empty/non-numeric data

### Issue: Error Message Different Than Expected
**Solution:**
- Note the exact message received
- Compare with expected messages in this guide
- Check if error message includes variable name and reason
- Document discrepancy for developer review

### Issue: Console Shows Errors
**Solution:**
- Take screenshot of console error
- Note which test case triggered it
- Check if error is from DebugPlot or other extension
- Document for developer investigation

---

## Notes & Observations

**Space for test notes:**

```
[Notes from test execution will be added here]
```

---

## Sign-Off

**Tester Name:** _______________________
**Date Tested:** ______________________
**Time Spent:** _______ minutes

**Overall Assessment:**
- [ ] All tests passed - Error handling is robust ✅
- [ ] Some issues found - Document in notes above ⚠️
- [ ] Significant issues - Escalate to developer ❌

**Recommendations:**
[Space for any observations or suggestions]

---

## Reference

- **Test Data Location:** `/home/alfred/lw/w514-plot-in-vscode/poc/extension/src/test/fixtures/test_data.py`
- **Extension Source:** `/home/alfred/lw/w514-plot-in-vscode/poc/extension/src/extension.ts`
- **Error Handling Code:** Lines 101-141 of extension.ts (validation) & Lines 120-141 (exception handling)
- **Automated Test Results:** 17/18 passing
- **Step 1 Review Document:** `cc.018.step1-error-handling-review.md`
- **Extension Folder:** `/home/alfred/lw/w514-plot-in-vscode/poc/extension/`

