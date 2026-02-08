# CLAUDE.md - AI Assistant Working Memory

**Last Updated:** 2026-02-07 (Session 3)

## Project: DebugPlot VS Code Extension POC

### Current Status
- **Phase:** Phase 3 - Render Charts in Webview (✅ IMPLEMENTATION COMPLETE, READY FOR TESTING)
- **Session:** 4
- **Current Step:** Phase 3 core implementation finished, webview with Chart.js integrated
- **Next Steps:** Manual testing of Phase 3, then Phase 4 - Context Menu Integration

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
│       ├── src/
│       │   └── extension.ts                   # Main extension code
│       ├── out/
│       │   ├── extension.js                   # Compiled output
│       │   └── extension.js.map
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
- **Extension Code:** `poc/extension/` ✅ CREATED
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
