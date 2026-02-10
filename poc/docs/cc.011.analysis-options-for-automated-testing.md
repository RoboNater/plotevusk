# Analysis: Options for Automated Testing

**Date:** 2026-02-10
**Decision:** Option C (Hybrid) — integration tests + manual visual checklist

## Context

All testing to date has been 100% manual: a human launches the Extension Development Host, starts a Python debug session, sets breakpoints, invokes commands, and visually inspects results. The test guides (Phases 2, 3, 4) document ~25 test cases covering data reading, chart rendering, context menus, and error handling.

The goal is to automate as much of this as possible at the **integration/E2E level** (not unit tests), while keeping a human-in-the-loop plan for what can't be automated.

## Current Infrastructure

Already installed in `poc/extension/package.json` (but no test files written yet):
- `@vscode/test-cli` ^0.0.10 — official test runner
- `@vscode/test-electron` ^2.4.1 — runs tests inside a real VS Code instance
- `@types/mocha` ^10.0.10 — Mocha test framework
- `"test": "vscode-test"` script configured

---

## Options Evaluated

### Option A: VS Code Integration Tests

**What it is:** Tests run inside a real VS Code Electron instance via `@vscode/test-electron`. The test code has full access to the `vscode` API — it can start debug sessions, call DAP requests, execute commands, and inspect results. This is the official Microsoft-supported approach.

**What it CAN test (programmatically):**

| Test Area | How | Covers |
|-----------|-----|--------|
| Extension activation | Start debug session, check command registration | Phase 4 activation |
| No-debug-session warning | Call command without debug session, assert warning shown | Phase 2 error case |
| DAP data reading | `startDebugging()` → set breakpoint → `customRequest('evaluate')` | Phase 2 core flow |
| All 6 test variables | Evaluate each variable, assert correct array + length | Phase 2 test matrix |
| Error cases (None, scalar, undefined) | Evaluate bad variables, assert error messages | Phase 2 error cases |
| Context menu code path | `executeCommand('debugplot.plotVariable', {evaluateName: 'data_list'})` | Phase 4 (skips right-click UI, tests same code) |
| Command Palette code path | `executeCommand('debugplot.plotVariable')` with mocked input | Phase 4 fallback |
| Webview panel creation | Assert panel created with correct title after command | Phase 3 (panel exists) |
| Webview message passing | Verify `postMessage()` called with correct data | Phase 3 (data flow) |

**What it CANNOT test:**
- Visual chart rendering (Chart.js canvas output)
- Theme integration (CSS variables applied correctly)
- Actual right-click context menu appearing in the Variables pane
- Responsive chart resizing
- Chart.js CDN loading inside the webview

**Effort:** Low-medium. Dependencies already installed, ~1-2 files to create. The biggest complexity is timing — waiting for the debug session to start and hit a breakpoint.

**Coverage estimate:** ~70-75% of current manual test cases automated.

---

### Option B: WebdriverIO with `wdio-vscode-service`

**What it is:** A browser/Electron automation framework (like Selenium) with a VS Code-specific plugin. Drives the actual VS Code UI — can click buttons, open menus, type in input boxes, and inspect rendered content.

**What it adds over Option A:**
- Can right-click in the Variables pane and select "Plot Variable"
- Can potentially inspect webview DOM (chart title, canvas element)
- Can screenshot webview panels for visual regression testing
- Tests the full user workflow end-to-end

**What it still CANNOT test well:**
- Canvas pixel content (Chart.js renders to `<canvas>`, not inspectable DOM)
- Exact chart correctness (would need screenshot comparison)

**Downsides:**
- Separate tool ecosystem (`webdriverio`, `wdio-vscode-service`, `chromedriver`)
- Significantly slower test execution (real UI automation)
- More brittle — sensitive to VS Code UI changes between versions
- Heavier setup and maintenance burden
- Overkill for a POC

**Effort:** Medium-high. New dependencies, new config, learning curve.

**Coverage estimate:** ~85-90% of manual test cases, but with higher maintenance cost.

---

### Option C: Hybrid (Selected)

Combine **Option A** for automated regression with a **slimmed-down manual checklist** for the visual/UI aspects that can't be automated.

#### Automated (Option A integration tests):
1. Extension activates on debug session start
2. Warning when no debug session active
3. All 6 test variables: correct data, correct count
4. Error cases: None, scalar, undefined variable, empty array
5. Context menu code path (command + context object)
6. Command Palette fallback (command without context)
7. Webview panel created with correct title
8. Correct data sent to webview via `postMessage()`

#### Manual (reduced checklist, ~5 minutes):
1. Chart visually renders with correct shape for `data_list` (quadratic curve)
2. Chart renders in both light and dark themes
3. Chart resizes when panel is resized
4. "Plot Variable" appears in right-click menu on Variables pane
5. "Plot Variable" does NOT appear for non-Python debug sessions

This gives fast automated regression for the logic while keeping human eyes on the inherently visual parts.

---

## Why Option C

- Leverages the test infrastructure already installed in `package.json`
- Automates the tedious repetitive checks (all 6 variables, all error cases)
- Keeps manual testing focused on what actually needs human eyes
- Low setup cost — just need a test config file and one test file
- No new dependencies required

Option B (WebdriverIO) would only make sense if this moves past POC into a production extension with CI/CD.

---

## Implementation Sketch

### Files to create:
1. **`poc/extension/.vscode-test.mjs`** — test runner config (workspace, test files, VS Code version)
2. **`poc/extension/src/test/integration.test.ts`** — all integration tests using Mocha + vscode API
3. **`poc/extension/src/test/fixtures/`** — copy of `plot_test_basic.py` for tests to debug against

### Test flow:
```
beforeAll:
  → open workspace containing test Python script
  → start Python debug session
  → wait for breakpoint hit (via onDidChangeActiveDebugSession + DAP threads check)

tests:
  → call DAP evaluate for each variable, assert results
  → call command with context objects, assert panel creation
  → call command without debug session, assert warning
  → test error cases

afterAll:
  → terminate debug session
  → clean up
```

### Run with:
```bash
npm test          # runs: vscode-test (downloads VS Code, executes tests inside it)
```

### Manual checklist:
- Separate markdown file with 5 visual checks (~5 minutes after any significant change)
