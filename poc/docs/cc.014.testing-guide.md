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
- ✅ DAP variable evaluation (all test variables)
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
   - Ensure `test_data.py` matches `plot_test_basic.py` structure
   - Add new test variables as needed

---

## References

- Test implementation: `src/test/integration.test.ts`
- Test configuration: `.vscode-test.mjs`
- Test fixtures: `src/test/fixtures/`
- Manual checklist: `cc.013.manual-testing-checklist.md`
- Testing analysis: `cc.011.analysis-options-for-automated-testing.md`
