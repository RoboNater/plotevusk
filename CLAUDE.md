# CLAUDE.md - AI Assistant Working Memory

**Last Updated:** 2026-02-11 (Session 7)

## Project: DebugPlot VS Code Extension POC

### Current Status
- **Phase:** Phase 5 - Automated Testing Infrastructure (✅ COMPLETE & TESTED)
- **Session:** 7
- **Current Step:** Ready for Phase 6 - Polish & Package
- **Testing Status:** ✅ Phase 4 & 5 testing completed successfully - minor issues documented and deemed acceptable for POC
- **Next Steps:** Phase 6 - Polish & Package

### Environment Status
✅ **All Tools Ready:**
- Node.js: v24.11.1 (via NVM)
- npm: 11.6.4
- Python: 3.12.3
- numpy: 1.26.4
- NVM: v0.40.2 with v22.14.0 and v24.11.1 installed
- Yeoman (yo): 6.0.0 ✅ INSTALLED
- generator-code: ✅ INSTALLED
- vsce: 3.7.1 ✅ INSTALLED

### Key Decisions Made
1. **Charting Library:** Use simplest option for POC (likely Chart.js - lightweight)
2. **Scope:** Support Python lists and numpy arrays; exclude pandas for POC
3. **UI Approach:** Use simplest method (command palette first, context menu if time permits)
4. **License:** Only use permissive open-source (MIT, Apache 2.0, BSD)

### Project Structure
```
/home/alfred/lw/w514-plot-in-vscode/
├── .claude/
│   └── settings.json                          # Permission mode: auto
├── poc/
│   ├── docs/
│   │   ├── debugplot-poc-plan.md              # High-level plan
│   │   └── cc.001.plan-phase-1-detailed.md    # Phase 1 detailed plan ✅
│   └── extension/                             # ✅ EXTENSION CREATED
│       ├── .vscode/                           # Debug configurations
│       │   ├── launch.json
│       │   └── tasks.json
│       ├── .vscode-test.mjs                   # ✅ Test runner configuration
│       ├── src/
│       │   ├── extension.ts                   # Main extension code
│       │   └── test/
│       │       ├── integration.test.ts        # ✅ Integration test suite (18 tests)
│       │       └── fixtures/
│       │           ├── test_data.py           # ✅ Test data script
│       │           └── .vscode/
│       │               ├── launch.json        # ✅ Test workspace config
│       │               └── settings.json      # ✅ Test workspace settings
│       ├── out/
│       │   ├── extension.js                   # Compiled output
│       │   ├── extension.js.map
│       │   └── test/
│       │       ├── integration.test.js        # ✅ Compiled tests
│       │       └── integration.test.js.map
│       ├── node_modules/                      # 259 packages installed
│       ├── package.json                       # Extension manifest
│       ├── tsconfig.json                      # TypeScript config
│       └── README.md                          # Extension README
├── CLAUDE.md                  # This file - AI working memory
├── HUMAN.md                   # Human developer guide
└── README.md                  # Project overview
```

### Files to Track
- **Plan Documents:** `poc/docs/*.md` ✅
  - Phase plans (cc.00X.plan-*.md)
  - Testing analysis (cc.011.analysis-options-for-automated-testing.md)
  - Testing plan (cc.012.plan-automated-testing-detailed.md)
  - Manual checklist (cc.013.manual-testing-checklist.md) ✅
  - Testing guide (cc.014.testing-guide.md) ✅
- **Extension Code:** `poc/extension/` ✅ CREATED
  - Source: `src/extension.ts`
  - Tests: `src/test/integration.test.ts` ✅
  - Test fixtures: `src/test/fixtures/` ✅
- **Test Scripts:** `poc/test-scripts/` ✅ CREATED

### Important Notes
- Always update CLAUDE.md, HUMAN.md, and README.md at end of each session
- Extension will NOT modify debugpy - uses DAP API only
- Target: Right-click variable → see plot (simplest path to success)

### Technical Strategy
- Use VS Code's `vscode.debug.activeDebugSession` API
- Serialize data via `customRequest('evaluate', ...)` with expression:
  - For lists: `__import__('json').dumps(list(var))`
  - For numpy: `__import__('json').dumps(var.tolist())`
- Render in Webview Panel with bundled charting library

### Phase 1 Implementation Summary
**Tools Installed:**
- ✅ Yeoman (yo): 6.0.0
- ✅ generator-code (bundled with yo code)
- ✅ vsce: 3.7.1

**Extension Created:**
- ✅ Structure: `poc/extension/` with TypeScript config
- ✅ Command registered: `debugplot.plotVariable`
- ✅ Package manifest configured with DebugPlot branding
- ✅ Source code: `src/extension.ts` with "Hello from DebugPlot!" message
- ✅ Dependencies installed: 259 packages, 0 vulnerabilities
- ✅ TypeScript compiled successfully to `out/extension.js`

**Verification Results:**
- ✅ Manual testing completed successfully
- ✅ Extension loads in Development Host without errors
- ✅ Command appears in Command Palette: "DebugPlot: Plot Variable"
- ✅ Notification displays correctly: "Hello from DebugPlot! Ready to plot variables."
- ✅ Console log confirms activation: "DebugPlot extension is now active"
- ✅ Phase 1 accomplishment report created: cc.002.accomplished-phase-1.md

### Session History
**Session 1 (2026-02-06):**
- Read high-level plan and detailed Phase 1 plan
- Verified development environment
- Created organizational documents (CLAUDE.md, HUMAN.md, README.md)
- Installed required tools (yo 6.0.0, vsce 3.7.1)
- Created extension structure (manual approach due to yo interactive prompts)
- Configured package.json with debugplot.plotVariable command
- Wrote src/extension.ts with Hello World functionality
- Installed dependencies (259 packages)
- Compiled TypeScript successfully
- Committed Phase 1 work to git (commit d8394e2)
- User completed manual testing successfully
- Created Phase 1 accomplishment report (cc.002.accomplished-phase-1.md)
- **Phase 1 Status:** ✅ COMPLETE & VERIFIED - Ready for Phase 2

**Session 2 (2026-02-06):**
- Read CLAUDE.md and Phase 2 detailed plan (cc.003.plan-phase-2-detailed.md)
- **Step 1: Create Python Test Script** ✅ COMPLETE
  - Created `poc/test-scripts/plot_test_basic.py` with 6 test variables
  - Verified script runs: `python3 plot_test_basic.py` → "done"
  - Added Python debug launch config to `.vscode/launch.json`
- **Step 2: Add Debug Session Detection** ✅ COMPLETE
  - Made command handler async
  - Added `vscode.debug.activeDebugSession` check
  - Shows warning if no debug session active
- **Step 3: Get Current Stack Frame ID** ✅ COMPLETE
  - Implemented `threads` DAP request to get thread ID
  - Implemented `stackTrace` DAP request to get frame ID
  - Added error handling for missing threads/frames
- **Step 4: Prompt User for Variable Name** ✅ COMPLETE
  - Created `showInputBox` with helpful prompt
  - Implemented regex validation for Python identifiers
  - Allows dot notation and indexing (e.g., `obj.data`, `arr[0]`)
- **Step 5: Evaluate Expression via DAP** ✅ COMPLETE
  - Implemented auto-detect expression: `json.dumps(var.tolist() if hasattr(var, 'tolist') else list(var))`
  - Uses DAP `evaluate` request with `context: 'repl'`
  - Handles both lists and numpy arrays transparently
- **Step 6: Parse the Result** ✅ COMPLETE
  - Strip Python repr quotes from result
  - Parse JSON string into `number[]` array
  - Validate all elements are numeric
  - Display success message with count
- **Compilation & Commit** ✅ COMPLETE
  - TypeScript compiles without errors
  - Committed to git: commit 3e73af8
  - Created Phase 2 testing guide: cc.004.phase-2-testing-guide.md
- **Phase 2 Status:** ✅ IMPLEMENTATION COMPLETE - Ready for manual testing

**Session 3 (2026-02-07):**
- User performed comprehensive manual testing of Phase 2
- **Testing Results:** ✅ ALL TEST CASES PASSED
  - Successfully read Python lists and numpy arrays
  - All 6 test variables working correctly
  - Error cases handled appropriately
- **Error Message Improvements** ✅ COMPLETE
  - Implemented consistent error format: "No plottable data in 'varname' (reason)"
  - NoneType case: "(variable is None)"
  - Non-iterable case: "(cannot convert to array)"
  - Empty array case: "(variable is empty)"
  - Improved debugger state messages
  - Fixed variable scope for proper error handling
- **Final Commit** ✅ COMPLETE
  - Committed to git: commit d5b63fe
  - Created Phase 2 accomplishment report: cc.005.accomplished-phase-2.md
  - Updated CLAUDE.md, HUMAN.md, README.md
- **Phase 2 Status:** ✅ COMPLETE & TESTED - Ready for Phase 3

**Session 4 (2026-02-07):**
- **Phase 3 Implementation** ✅ COMPLETE
  - Added `createPlotPanel()` function to create VS Code webview panels
  - Added `getWebviewContent()` function with full HTML/CSS/JS for Chart.js
  - Implemented webview message listener for receiving data from extension
  - Added `renderChart()` function using Chart.js for line chart visualization
  - Updated command handler to create chart panel instead of showing message
  - Included proper Content Security Policy for Chart.js CDN integration
  - Used VS Code theme CSS variables for consistent light/dark theme support
  - Implemented responsive chart sizing and automatic previous chart destruction
- **Compilation** ✅ SUCCESSFUL
  - TypeScript compiled without errors
  - Generated `/out/extension.js` with all Phase 3 functions
- **Testing Documentation** ✅ CREATED
  - Created comprehensive Phase 3 testing guide: cc.007.phase-3-testing-guide.md
  - Test matrix covers all 6 test variables
  - Theme integration tests (light/dark)
  - Responsiveness checks
  - Error case validation
- **Commit** ✅ COMPLETE
  - Committed to git: commit 9fc398d
  - Updated CLAUDE.md with Phase 3 progress
- **Phase 3 Status:** ✅ IMPLEMENTATION COMPLETE - Ready for Manual Testing

**Session 5 (2026-02-10):**
- **Phase 4 Implementation** ✅ COMPLETE
  - Reviewed detailed Phase 4 plan (cc.009.plan-phase-4-detailed.md)
  - Added `debug/variables/context` menu contribution to package.json
  - Changed `activationEvents` from `onCommand` to `onDebug`
  - Modified command handler to accept optional `context?: any` parameter
  - Implemented variable extraction from `context.evaluateName || context.name`
  - Added fallback to input prompt when context not provided (Command Palette)
  - Added type guard to satisfy TypeScript strict mode
- **Compilation** ✅ SUCCESSFUL
  - Fixed TypeScript strict mode error with proper type guard
  - TypeScript compiled without errors
  - Generated `/out/extension.js` with Phase 4 functions
- **Testing Documentation** ✅ CREATED
  - Created comprehensive Phase 4 testing guide: cc.010.phase-4-testing-guide.md
  - Test matrix covers context menu, Command Palette, nested variables, and edge cases
  - 10 detailed test cases with expected results and evidence collection
  - Troubleshooting guide for common issues
- **Commit** ✅ COMPLETE
  - Committed to git: commit c52efd8
  - Updated CLAUDE.md with Phase 4 progress
- **Phase 4 Status:** ✅ IMPLEMENTATION COMPLETE - Ready for Manual Testing

**Session 6 (2026-02-10):**
- **Automated Testing Implementation** ✅ COMPLETE
  - Reviewed detailed testing plan (cc.012.plan-automated-testing-detailed.md)
  - Created `.vscode-test.mjs` configuration with VS Code test runner setup
  - Created test fixtures directory structure: `src/test/fixtures/`
  - Created `test_data.py` with 6 test variables matching test plan requirements
  - Created test workspace launch config: `fixtures/.vscode/launch.json`
  - Created test workspace settings: `fixtures/.vscode/settings.json`
  - Implemented comprehensive integration test suite (`src/test/integration.test.ts`):
    - **Test Group 1:** Extension Activation (2 tests)
    - **Test Group 2:** Debug Session Requirement (1 test)
    - **Test Group 3:** Variable Data Reading via DAP (6 tests - all test variables)
    - **Test Group 4:** Error Handling (4 tests)
    - **Test Group 5:** Context Menu Code Path (2 tests)
    - **Test Group 6:** Command Palette Code Path (1 test)
    - **Test Group 7:** Webview Integration (2 tests)
    - **Total:** 18 automated test cases
  - Helper functions implemented: `startDebugSession()`, `stopDebugSession()`, `evaluateVariable()`
- **Compilation Verification** ✅ SUCCESSFUL
  - TypeScript compilation with zero errors
  - Test files compiled to `out/test/integration.test.js`
  - All dependencies satisfied
- **Documentation Created** ✅ COMPLETE
  - Manual testing checklist: `cc.013.manual-testing-checklist.md` (5 items, ~5 min)
  - Comprehensive testing guide: `cc.014.testing-guide.md` (setup, troubleshooting, CI/CD)
  - Hybrid approach: 70-75% automated, 25-30% manual visual verification
- **Testing Architecture Highlights:**
  - Uses VS Code's real test runner (`@vscode/test-electron`)
  - Creates isolated test workspace with test fixtures
  - Validates DAP communication with Python debug sessions
  - Tests both context menu and Command Palette code paths
  - Includes webview panel creation verification
  - Timeout handling for debug session initialization (20-30s)
- **Status:** ✅ IMPLEMENTATION COMPLETE - Ready for Test Execution

**Session 7 (2026-02-11):**
- **Phase 4 & Phase 5 Testing** ✅ COMPLETE
  - User completed comprehensive manual testing of all Phase 4 and Phase 5 functionality
  - **Test Results:** All major functionality working correctly
  - **Test Failures:** 1 non-critical UI issue (context menu item position)
    - Failed: "Menu item is near the top of the menu" - Item appears at bottom but is fully functional
  - **Issues Documented:** `poc/docs/dev.008.issues-and-notes-from-testing.md`
    - Color theme switching doesn't update text in existing plots (axis labels, tic labels)
    - Split panel capability doesn't populate plot in new panel (Move capability works)
    - One unrepeatable instance of missing plot on first request (could not reproduce)
  - **Areas for Improvement Noted:**
    - Panel reuse (currently creates new panel for each plot)
    - Context menu icon (currently no icon, consistent with other menu items)
  - **Assessment:** All issues deemed acceptable for proof-of-concept
- **Documentation Updates** ✅ COMPLETE
  - Updated CLAUDE.md with Session 7 and testing results
  - Updated HUMAN.md with Phase 4 & 5 testing status
  - Updated README.md with current project status
- **Status:** ✅ PHASE 5 COMPLETE & TESTED - Ready for Phase 6
