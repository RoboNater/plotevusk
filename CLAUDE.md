# CLAUDE.md - AI Assistant Working Memory

**Last Updated:** 2026-02-06 (Session 2)

## Project: DebugPlot VS Code Extension POC

### Current Status
- **Phase:** Phase 2 - Read Variables from Debug Session (🚀 IN PROGRESS)
- **Session:** 2
- **Current Step:** Step 2 - Add Debug Session Detection
- **Next Steps:** Implement DAP integration for reading variables

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
- **Test Scripts:** `poc/test-scripts/` (will create in Phase 2)

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
  - Added Python debug launch config "Debug plot_test_basic.py" to `.vscode/launch.json`
- **Now proceeding to Step 2: Add Debug Session Detection**
