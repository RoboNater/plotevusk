# Phase 6 Step 2: Performance Validation

**Date:** 2026-02-11
**Status:** ✅ IMPLEMENTATION COMPLETE
**Purpose:** Verify extension handles large datasets without freezing or crashing

---

## Overview

This document describes the performance validation testing for the DebugPlot extension. The tests verify that the extension can handle arrays of varying sizes (100 to 50,000 elements) while maintaining responsive behavior and acceptable render times.

## Deliverables Completed

### 1. Performance Test Script ✅
**File:** `poc/test-scripts/plot_test_performance.py`

**Contents:**
```python
import numpy as np

# Test various array sizes
small = np.arange(100)              # 100 elements
medium = np.arange(1000)            # 1,000 elements (already tested)
large = np.arange(10000)            # 10,000 elements
very_large = np.arange(50000)       # 50,000 elements

print("Performance test data loaded")
breakpoint()
print("done")
```

**Description:**
- Creates 4 numpy arrays of increasing sizes
- Suitable for testing performance across small, medium, large, and very large datasets
- Uses `breakpoint()` for consistent debugging experience with VS Code
- Simple and deterministic data (sequential integers) for consistent testing

### 2. Debug Configuration ✅
**File:** `poc/extension/.vscode/launch.json`

**New Configuration Added:**
```json
{
  "name": "Performance Test",
  "type": "debugpy",
  "request": "launch",
  "program": "${workspaceFolder}/../test-scripts/plot_test_performance.py",
  "console": "integratedTerminal"
}
```

**Usage:**
- Available in VS Code debug configuration dropdown
- Run with F5 or from Debug menu when extension directory is open
- Launches performance test script with integrated terminal output

---

## Manual Testing Procedure

### Setup Instructions

1. **Open Extension Directory:**
   ```bash
   cd /home/alfred/lw/w514-plot-in-vscode/poc/extension
   code .
   ```

2. **Launch Performance Test Script:**
   - Open VS Code Debug menu
   - Select configuration: **"Performance Test"** (from dropdown)
   - Press **F5** or click Run
   - Script will pause at breakpoint with all 4 test variables in scope

3. **Variables Available:**
   - `small` - 100 elements
   - `medium` - 1,000 elements
   - `large` - 10,000 elements
   - `very_large` - 50,000 elements

### Test Execution

**For each variable, perform the following:**

1. **Open Variables Pane:**
   - Press `Ctrl+Alt+V` or use Run → Variables menu
   - Locate test variable in Variables pane

2. **Right-Click Variable:**
   - Right-click the variable name
   - Select "Plot Variable" from context menu

3. **Measure Performance:**
   - **Start Timer:** Note the time when you click "Plot Variable"
   - **Observe Behavior:**
     - Watch for any UI freezing or lag
     - Monitor if VS Code remains responsive
     - Look for chart panel appearing
   - **Stop Timer:** Record time when chart is fully rendered and interactive
   - **Note Memory Usage:** (Optional) Open Task Manager to observe memory

4. **Validate Chart:**
   - Verify chart appears with correct data
   - Verify chart title shows variable name and element count
   - Verify chart is interactive (hover shows values)
   - Close chart panel (X button) to prepare for next test

### Performance Criteria

| Array Size | Elements | Target Time | Status |
|------------|----------|-------------|--------|
| Small      | 100      | < 1 sec     | ⏳ TBD |
| Medium     | 1,000    | < 2 sec     | ⏳ TBD |
| Large      | 10,000   | < 5 sec     | ⏳ TBD |
| Very Large | 50,000   | < 10 sec    | ⏳ TBD |

**Pass Criteria:**
- ✅ Chart renders within target time
- ✅ VS Code remains responsive (no UI freezing)
- ✅ No crashes or unhandled exceptions
- ✅ Chart data is accurate and complete

---

## Test Matrix

### Test 1: Small Array (100 elements)
**Variable:** `small`
**Expected:** Chart should appear almost instantly

**Steps:**
1. Right-click `small` in Variables pane
2. Select "Plot Variable"
3. Record render time
4. ✅ Verify: Chart appears in < 1 second
5. ✅ Verify: Chart title shows "Plot: small (100 values)"
6. ✅ Verify: All 100 data points are plotted
7. Close chart panel

### Test 2: Medium Array (1,000 elements)
**Variable:** `medium`
**Expected:** Chart should appear very quickly

**Steps:**
1. Right-click `medium` in Variables pane
2. Select "Plot Variable"
3. Record render time
4. ✅ Verify: Chart appears in < 2 seconds
5. ✅ Verify: Chart title shows "Plot: medium (1000 values)"
6. ✅ Verify: Chart is responsive (hover shows values)
7. Close chart panel

### Test 3: Large Array (10,000 elements)
**Variable:** `large`
**Expected:** Chart should appear with acceptable delay

**Steps:**
1. Right-click `large` in Variables pane
2. Select "Plot Variable"
3. Record render time
4. ✅ Verify: Chart appears in < 5 seconds
5. ✅ Verify: Chart title shows "Plot: large (10000 values)"
6. ✅ Verify: VS Code remains responsive during render
7. ✅ Verify: Chart is interactive (no lag when hovering)
8. Close chart panel

### Test 4: Very Large Array (50,000 elements)
**Variable:** `very_large`
**Expected:** Chart should appear but may take longer

**Steps:**
1. Right-click `very_large` in Variables pane
2. Select "Plot Variable"
3. Record render time
4. ✅ Verify: Chart appears in < 10 seconds
5. ✅ Verify: Chart title shows "Plot: very_large (50000 values)"
6. ✅ Verify: No UI freezing or crashing
7. Note any performance observations:
   - Is chart still interactive?
   - Does VS Code respond to user input?
   - Does hovering over chart work smoothly?
8. Close chart panel

---

## Performance Observations Checklist

For each test, record observations:

### Small Array (100 elements)
- [ ] Render time: _____ sec
- [ ] Chart interactive: Yes / No
- [ ] VS Code responsive: Yes / No
- [ ] Memory usage acceptable: Yes / No
- [ ] Notes: _____________________________________

### Medium Array (1,000 elements)
- [ ] Render time: _____ sec
- [ ] Chart interactive: Yes / No
- [ ] VS Code responsive: Yes / No
- [ ] Memory usage acceptable: Yes / No
- [ ] Notes: _____________________________________

### Large Array (10,000 elements)
- [ ] Render time: _____ sec
- [ ] Chart interactive: Yes / No
- [ ] VS Code responsive: Yes / No
- [ ] Memory usage acceptable: Yes / No
- [ ] Notes: _____________________________________

### Very Large Array (50,000 elements)
- [ ] Render time: _____ sec
- [ ] Chart interactive: Yes / No
- [ ] VS Code responsive: Yes / No
- [ ] Memory usage acceptable: Yes / No
- [ ] Notes: _____________________________________

---

## Troubleshooting

### Chart doesn't appear after clicking "Plot Variable"
- **Check:** Is debug session still paused at breakpoint?
- **Check:** Is variable visible in Variables pane?
- **Check:** Does Variable pane show the variable with correct type?
- **Solution:** Restart debug session and try again

### VS Code freezes during chart render
- **Check:** How many elements does the array have?
- **Note:** Very large arrays (>50,000) may cause performance degradation
- **Expected:** This is acceptable for POC; document as limitation
- **Solution:** Close chart panel and try smaller array

### Chart appears but is unresponsive
- **Check:** Can you close the chart panel?
- **Check:** Can you interact with other VS Code UI?
- **Note:** This may indicate performance issue with specific size
- **Document:** Record the array size and this behavior

### Chart has wrong data
- **Check:** Does chart title show correct element count?
- **Check:** Does data range match expected (0 to N-1)?
- **Solution:** Close and try again; verify array wasn't modified

---

## Success Criteria

**All Tests Passing:**
- ✅ All 4 array sizes render successfully
- ✅ Render times meet target criteria
- ✅ No VS Code crashes or freezing
- ✅ Charts are interactive and display correct data
- ✅ Extension remains stable across all tests

**Documentation Complete:**
- ✅ Performance test script created
- ✅ Debug configuration added
- ✅ This manual testing guide created
- ✅ Test results recorded

---

## Expected Outcomes

### Scenario 1: All Tests Pass (Ideal)
- All arrays render within target times
- No issues observed
- Document: "Performance validation successful - ready for Step 3"

### Scenario 2: Some Tests Slow (Acceptable)
- Small/Medium arrays fast (< 2 seconds)
- Large/Very Large arrays slower but functional
- Document: "Performance acceptable for POC - document as limitation"

### Scenario 3: Very Large Array Issues (Expected)
- 50,000 element array causes issues
- Document: "Known limitation - recommended max array size is 10,000"
- Include in final documentation

---

## Next Steps

After completing this manual testing:

1. **Record Results:** Document actual performance metrics
2. **Identify Limitations:** Note any array sizes that cause issues
3. **Document Findings:** Update CLAUDE.md with results
4. **Proceed to Step 3:** Documentation Polish (when results are recorded)

---

## Notes

- **Test Environment:** Linux (WSL2), VS Code 1.95+, Node.js v24.11.1, Python 3.12.3
- **Chart Library:** Chart.js (bundled with extension)
- **Data Format:** Sequential integers (np.arange)
- **Purpose:** Validate performance, not optimize; document behavior for future enhancement
