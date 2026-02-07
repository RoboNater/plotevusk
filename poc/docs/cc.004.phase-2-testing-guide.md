# Phase 2 Testing Guide

## Status: READY FOR MANUAL TESTING

All 6 implementation steps are complete:
1. ✅ Python test script created with 6 sample variables
2. ✅ Debug session detection implemented
3. ✅ Frame ID retrieval via DAP working
4. ✅ Variable name input box with validation implemented
5. ✅ JSON serialization expression evaluates via DAP
6. ✅ Result parsing and validation working
7. ✅ TypeScript compiled successfully

**Commit:** 3e73af8 - Phase 2 Step 1-6: Implement DAP-based variable reader

---

## How to Test

### Setup

1. Open `/home/alfred/lw/w514-plot-in-vscode/poc/extension/` in VS Code
2. Ensure Python debugging is available:
   - Install debugpy if needed: `pip3 install debugpy`
   - Or rely on VS Code's built-in Python debugging

### Test Procedure

**Steps to verify Phase 2 functionality:**

1. **Start Extension Development Host:**
   - Press `F5` or use Run > Start Debugging
   - Wait for Extension Development Host window to open
   - ⚠️ **Important:** The Dev Host should show the `Run Extension` configuration running

2. **Open Test Script in Dev Host:**
   - In the Extension Development Host window, open `/home/alfred/lw/w514-plot-in-vscode/poc/test-scripts/plot_test_basic.py`
   - Navigate to the test script using File > Open File

3. **Set Breakpoint and Start Debugging:**
   - Click on the line number next to `print("done")` to set a breakpoint (should be line 15)
   - Press `F5` to start debugging the Python script
   - The debugger should pause at the breakpoint
   - You should see the Debug Console at the bottom

4. **Test Variable Reading:**
   - Once paused at the breakpoint, open Command Palette: `Ctrl+Shift+P`
   - Search for and run: **"DebugPlot: Plot Variable"**
   - Input box appears with prompt: "Enter the variable name to plot"
   - Type: `data_list`
   - You should see success message: **"DebugPlot: Read 7 numeric values from 'data_list'"**
   - Check Debug Console (lower panel) - should show: `DebugPlot: Read 7 values from 'data_list': [1, 4, 9, 16, 25, 36, 49]`

### Test Matrix

Run the command multiple times with different variables to verify each case:

| Variable | Expected Values | Expected Count |
|----------|-----------------|-----------------|
| `data_list` | [1, 4, 9, 16, 25, 36, 49] | 7 |
| `data_np` | [2.0, 3.1, 5.2, 4.8, 7.1, 6.5] | 6 |
| `data_float_list` | [1.1, 2.2, 3.3, 4.4, 5.5] | 5 |
| `data_int_range` | [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] | 10 |
| `data_single` | [42] | 1 |
| `data_negative` | [-3, -1, 0, 1, 3] | 5 |
| `nonexistent` | ❌ Error message | N/A |

### Error Cases to Verify

1. **Invoke without debug session:**
   - Stop debugging (Shift+F5)
   - Run "DebugPlot: Plot Variable" in Command Palette
   - Should see: **"DebugPlot: No active debug session. Start debugging first."**

2. **Invoke while debugger is running (not paused):**
   - Remove/disable the breakpoint, start debugging
   - Run "DebugPlot: Plot Variable"
   - Should see: **"DebugPlot: No threads available. Is the debugger paused?"** or **"DebugPlot: No stack frames. Is the debugger paused at a breakpoint?"**

3. **Enter invalid variable name:**
   - Run "DebugPlot: Plot Variable"
   - Try entering: `123invalid` or `my-var`
   - Input box should reject with: **"Invalid variable name"**

4. **Enter non-existent variable:**
   - Run "DebugPlot: Plot Variable"
   - Enter: `nonexistent`
   - Should see error: **"DebugPlot: Error reading 'nonexistent': name 'nonexistent' is not defined"**

5. **Enter non-array variable:**
   - Add a variable like `scalar = 42` in the Python script
   - Run command with: `scalar`
   - Should see: **"DebugPlot: Error reading 'scalar': ..."** or **"DebugPlot: 'scalar' is not a 1D numeric array."**

### Debug Console Output

When successful, the Debug Console should show similar to:
```
DebugPlot: Read 7 values from 'data_list': [1, 4, 9, 16, 25, 36, 49]
```

If there are issues with quote stripping or parsing, the raw result will be logged:
```
DebugPlot raw result: '[1, 4, 9, 16, 25, 36, 49]'
```

---

## Troubleshooting

### Issue: "No threads available" when paused

**Cause:** Extension may not be properly detecting the debug session
**Fix:** Ensure you're paused at a breakpoint (yellow highlight)

### Issue: "Could not parse data" error

**Cause:** The quote-stripping logic might not handle the debugpy output format correctly
**Fix:** Check the Debug Console for "DebugPlot raw result" and examine the exact format returned

### Issue: Input box doesn't appear

**Cause:** Previous step might have failed silently
**Fix:** Check the notification area (bottom right) for error messages

### Issue: Expression evaluation timeout

**Cause:** Very large arrays or expression evaluation taking too long
**Fix:** Try with smaller test variables first

---

## What Happens Next (Phase 3)

Once Phase 2 testing is verified, Phase 3 will:
- Create a Webview Panel to display the numeric data
- Bundle Chart.js library
- Render a line chart of the extracted data
- The interface will be: Phase 2 produces `number[]`, Phase 3 consumes and visualizes it

---

## Success Criteria for Phase 2

✅ All implementation steps complete
✅ TypeScript compiles without errors
✅ Test script runs without errors
✅ Variable reading works for Python lists
✅ Variable reading works for numpy arrays
✅ Error handling for undefined variables
✅ Input validation prevents invalid variable names
✅ Works when paused at breakpoint
✅ Warns appropriately when not paused/no session

---

## Files Changed

- `poc/test-scripts/plot_test_basic.py` - New test script
- `poc/extension/src/extension.ts` - Updated with DAP integration
- `poc/extension/.vscode/launch.json` - Added Python debug config
- `CLAUDE.md` - Updated session history
