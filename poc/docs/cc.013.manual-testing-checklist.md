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
- [ ] Chart renders with correct shape (linear: values 1,4,9,16,25,36,49)
- [ ] X-axis shows indices 0-6
- [ ] Y-axis shows values 1-49
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
2. Plot `data_int_range` via context menu
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
