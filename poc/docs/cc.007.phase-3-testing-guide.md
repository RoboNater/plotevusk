# Phase 3 Testing Guide - Render Charts in Webview

**Phase:** 3 of 5
**Status:** Implementation Complete, Ready for Testing
**Commit:** 9fc398d

---

## Overview

Phase 3 transforms the extension from displaying parsed data in a message box to rendering an interactive line chart in a VS Code Webview Panel using Chart.js.

**What changed from Phase 2:**
- ✅ Removed: `showInformationMessage` after successfully reading data
- ✅ Added: `createPlotPanel()` function that creates a webview panel
- ✅ Added: `getWebviewContent()` function with HTML/CSS/JS for Chart.js
- ✅ Added: Message listener in webview to receive data and render chart

**No changes to:**
- Debug session detection
- Stack frame retrieval
- Variable name input
- Data evaluation and parsing

---

## Setup Instructions

### Prerequisites
- VS Code installed
- Extension development environment set up (from Phase 1)
- Python 3.x with numpy installed
- `poc/test-scripts/plot_test_basic.py` available from Phase 2

### Steps

1. **Open the extension directory:**
   ```bash
   cd /home/alfred/lw/w514-plot-in-vscode/poc/extension
   ```

2. **Verify compilation:**
   ```bash
   npm run compile
   ```
   Should show no errors. Check that `/out/extension.js` is updated.

3. **Launch Extension Development Host:**
   - Open `poc/extension/` in VS Code
   - Press `F5` or run "Run → Start Debugging"
   - A new VS Code window opens (Development Host)

4. **In the Development Host:**
   - File → Open Folder
   - Select `/home/alfred/lw/w514-plot-in-vscode/poc/`
   - Open `/poc/test-scripts/plot_test_basic.py` in the editor

5. **Start debugging:**
   - Click the Debug icon in the left sidebar (or Ctrl+Shift+D)
   - Click the green "Run and Debug" button or select "Python: Current File" from the dropdown
   - The script will start and immediately hit the breakpoint on `print("done")`

---

## Testing Procedure

### Test 1: Basic Chart Rendering

**Objective:** Verify that a simple list displays as a line chart

**Steps:**
1. Debugger is paused at breakpoint
2. Open Command Palette (Ctrl+Shift+P)
3. Type "DebugPlot" and select "DebugPlot: Plot Variable"
4. When prompted, enter: `data_list`
5. Press Enter

**Expected Result:**
- A new webview panel opens with title "Plot: data_list"
- The panel displays a line chart
- Chart shows 7 data points
- Chart title shows: "Plot: data_list (7 values)"
- X-axis labeled "Index" with values 0–6
- Y-axis labeled "Value" with values approximately 0–50
- Line chart shows points at: 1, 4, 9, 16, 25, 36, 49 (perfect squares)
- Line is smooth, connecting points with slight curve (tension: 0.1)

**Verification:**
- [ ] Webview panel opens without errors
- [ ] Chart.js loads successfully (no blank canvas)
- [ ] All data points are visible
- [ ] Chart title and axis labels are readable
- [ ] No console errors in Debug Console

---

### Test 2: Numpy Array

**Objective:** Verify numpy arrays are converted and displayed correctly

**Steps:**
1. Keep debugger paused (same breakpoint)
2. Open Command Palette again
3. Run "DebugPlot: Plot Variable" command
4. Enter: `data_np`
5. Press Enter

**Expected Result:**
- New webview panel opens titled "Plot: data_np"
- Chart displays 6 points: 2.0, 3.1, 5.2, 4.8, 7.1, 6.5
- Chart title shows: "Plot: data_np (6 values)"
- Line shows a wavy pattern (not monotonic)
- Previous chart is still visible (can switch between tabs)

**Verification:**
- [ ] Numpy array is properly converted via tolist()
- [ ] Decimal values are preserved
- [ ] Chart displays all 6 points
- [ ] Can have multiple chart panels open simultaneously

---

### Test 3: Float List

**Objective:** Verify float lists render correctly

**Steps:**
1. Run "DebugPlot: Plot Variable" command
2. Enter: `data_float_list`

**Expected Result:**
- Chart displays 5 points: 1.1, 2.2, 3.3, 4.4, 5.5
- Shows a perfect linear progression
- Chart title: "Plot: data_float_list (5 values)"

**Verification:**
- [ ] Float values render with decimal points
- [ ] Linear pattern is visually clear

---

### Test 4: Integer Range

**Objective:** Verify larger integer sequences

**Steps:**
1. Run "DebugPlot: Plot Variable" command
2. Enter: `data_int_range`

**Expected Result:**
- Chart displays 10 points: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
- Shows a perfectly linear horizontal line at each index
- X-axis: 0–9, Y-axis: 0–10
- Chart title: "Plot: data_int_range (10 values)"

**Verification:**
- [ ] Large range (10 points) doesn't break chart
- [ ] Linear data visualizes clearly

---

### Test 5: Single Value

**Objective:** Verify edge case of single-element arrays

**Steps:**
1. Run "DebugPlot: Plot Variable" command
2. Enter: `data_single`

**Expected Result:**
- Chart displays as 1 point at value 42
- Chart title: "Plot: data_single (1 values)"
- Single point visible on chart (not just a line)
- Point radius (3px) makes it visible

**Verification:**
- [ ] Single-element arrays don't crash
- [ ] Single point is visible
- [ ] No rendering errors

---

### Test 6: Negative Values

**Objective:** Verify negative numbers are plotted correctly

**Steps:**
1. Run "DebugPlot: Plot Variable" command
2. Enter: `data_negative`

**Expected Result:**
- Chart displays 5 points: -3, -1, 0, 1, 3
- Y-axis includes negative region
- Chart title: "Plot: data_negative (5 values)"
- Line crosses the zero line visually

**Verification:**
- [ ] Negative values render below the zero axis
- [ ] Chart scales appropriately for negative ranges
- [ ] Visual representation is correct

---

## Visual Quality Checks

### Theme Integration

**Light Theme:**
1. In the Dev Host, switch to light theme
2. Run a plot command (any variable)
3. Verify:
   - Chart background matches VS Code editor background (light)
   - Text colors are dark and readable
   - Grid lines are visible but subtle

**Dark Theme:**
1. Switch to dark theme
2. Run another plot command
3. Verify:
   - Chart background matches VS Code editor background (dark)
   - Text colors are light and readable
   - Grid lines are visible

### Responsiveness

1. Create a chart
2. Drag the webview panel divider to resize
3. Verify:
   - Chart adapts to new size
   - Legend stays visible
   - Axis labels remain readable
   - No content is cut off

### Multiple Panels

1. Create charts for 2–3 different variables
2. Verify:
   - Each chart is in a separate tab
   - Can switch between tabs
   - Each chart retains its data when hidden/shown
   - No data corruption or mixing between charts

---

## Error Cases (Should Not Occur)

These cases should be handled by Phase 2 validation and shouldn't reach Phase 3:

### Empty Array (if somehow reaches Phase 3)
- Chart should show error message instead of blank chart
- Error message: "Error: No data to plot for {variableName}"

### Non-existent Variable (from Phase 2)
- Should show error message before reaching Phase 3
- Error: "Error reading 'var_name': name 'var_name' is not defined"

### No Debug Session
- Should show warning before reaching Phase 3
- Message: "DebugPlot: No active debug session. Start debugging first."

---

## Console Logging

### Extension Console (Debug Console in VS Code)

You should see logs like:
```
DebugPlot: Read 7 values from 'data_list': [1, 4, 9, 16, 25, 36, 49]
DebugPlot: Created chart panel for 'data_list' with 7 values
```

### Webview Console

You should see logs like:
```
DebugPlot webview received: { variableName: "data_list", values: [...] }
Chart rendered for data_list
```

To view webview console:
1. Press `Ctrl+Shift+P` in the webview
2. Select "Open Webview Developer Tools"
3. Check the console tab

---

## Test Matrix Summary

| Variable | Expected Points | Pattern | Status |
|----------|-----------------|---------|--------|
| `data_list` | 7 | Quadratic (1,4,9,16,25,36,49) | [ ] |
| `data_np` | 6 | Wavy (2.0,3.1,5.2,4.8,7.1,6.5) | [ ] |
| `data_float_list` | 5 | Linear (1.1-5.5) | [ ] |
| `data_int_range` | 10 | Linear (0-9) | [ ] |
| `data_single` | 1 | Single point at 42 | [ ] |
| `data_negative` | 5 | Crosses zero (-3 to 3) | [ ] |

---

## Success Criteria

Phase 3 testing is complete when:

- [ ] All 6 test variables render as charts
- [ ] Charts display correct data points
- [ ] X-axis shows index labels (0, 1, 2, ...)
- [ ] Y-axis shows correct value ranges
- [ ] Chart titles show variable name and count
- [ ] Theme integration works (light and dark)
- [ ] Charts are responsive to panel resizing
- [ ] Multiple panels can exist simultaneously
- [ ] No TypeScript errors in compilation
- [ ] No runtime errors in Debug Console
- [ ] No errors in webview console
- [ ] Chart.js loads from CDN successfully

---

## Troubleshooting

### Chart appears blank
- **Cause:** Chart.js CDN may not be loading
- **Check:** Open webview dev tools (see Console Logging section)
- **Solution:** Verify CDN URL in browser: https://cdn.jsdelivr.net/npm/chart.js

### Wrong color scheme
- **Cause:** VS Code CSS variables not resolved at runtime
- **Check:** Use `getComputedStyle()` in webview console
- **Solution:** Chart uses runtime CSS variable resolution, should work in all themes

### Chart doesn't update when resizing
- **Cause:** Chart.js responsive flag might need refresh
- **Solution:** Chart has `responsive: true`, should adapt automatically

### Multiple charts interfere with each other
- **Cause:** Previous chart instance not destroyed before creating new one
- **Solution:** `createPlotPanel()` creates new panel, old chart remains in old tab

---

## Next Steps

After Phase 3 testing:
1. Create accomplishment report (cc.008.accomplished-phase-3.md)
2. Update CLAUDE.md with Phase 3 completion
3. Proceed to Phase 4: Context Menu Integration (if approved)

---

**End of Phase 3 Testing Guide**
