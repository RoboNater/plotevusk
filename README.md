# Plotevusk - VS Code Python Debug Plot Viewer

## Purpose
A proof-of-concept VS Code extension that adds inline plotting capability to Python debugging sessions. Visualize numeric variables (lists and numpy arrays) as charts without leaving the debugger.

**Goal:** Hit a breakpoint → right-click a variable → see a plot. That's it.

Compare to:  VS Code Extension "Python Debug Plotter: Arrays, Tensors & Graphs"
             Extension ID: inag-ufscar.python-debug-plotter VS Code Extension
             github:  https://github.com/chcomin/vscode-python-debug-plotter

The inag-ufscar extension is more capable and more mature than this extension (Plotevusk, aka DebugPlot),
while this extension is simpler and easier to understand than the above.
See opus-4.6 generated comparison of this extension (ext1) vs inga-ufscar extenion (ext2) in: [poc/docs/comparison-to-inag-ufscar.python-debug-plotter/comparison-results.md](poc/docs/comparison-to-inag-ufscar.python-debug-plotter/comparison-results.md)

## Status
- **Start Date:** 2026-02-06
- **Completion Date:** 2026-02-14
- **Current Phase:** Phase 6 - Polish & Package ✅ **COMPLETE**
- **Development Status:** 🟢 **POC SUCCESSFULLY DELIVERED**

### Phase Progress
- [✅] Phase 1 - Scaffold & Hello World **COMPLETE & VERIFIED**
- [✅] Phase 2 - Read Variables from Debug Session **COMPLETE & TESTED**
- [✅] Phase 3 - Render Plots in Webview **COMPLETE & TESTED**
- [✅] Phase 4 - Context Menu Integration **COMPLETE & TESTED**
- [✅] Phase 5 - Automated Testing Infrastructure **COMPLETE & TESTED**
- [✅] Phase 6 - Polish & Package **COMPLETE & TESTED**

## Quick Overview

### What It Does
During a Python debug session, this extension allows developers to:
1. Pause at a breakpoint
2. Right-click a numeric variable
3. See it instantly visualized as a chart in a webview panel

### What It Supports (POC)
- ✅ Python lists of numbers
- ✅ NumPy 1D arrays
- ❌ Pandas DataFrames (future)
- ❌ Multi-dimensional arrays (future)
- ❌ Custom chart types (future)

### How It Works
- Uses VS Code's Debug Adapter Protocol (DAP) to communicate with the running Python debugger
- Does NOT modify debugpy - acts as a companion extension
- Evaluates expressions to serialize data as JSON
- Renders charts in a VS Code webview using a JavaScript charting library

## Project Structure
```
.
├── poc/
│   ├── docs/               # Planning and design documents ✅
│   ├── extension/          # VS Code extension source ✅
│   │   ├── src/
│   │   │   ├── extension.ts          # Main extension code
│   │   │   └── test/                 # Integration tests ✅
│   │   │       ├── integration.test.ts
│   │   │       └── fixtures/         # Test workspace
│   │   ├── out/            # Compiled JavaScript
│   │   ├── .vscode-test.mjs          # Test runner config ✅
│   │   └── package.json    # Extension manifest
│   └── test-scripts/       # Python test files ✅
├── CLAUDE.md               # AI assistant working memory
├── HUMAN.md                # Developer guide and resources
└── README.md               # This file
```

## Documentation
- **[POC Plan](poc/docs/debugplot-poc-plan.md)** - High-level architecture and phased approach
- **[Developer Guide (HUMAN.md)](HUMAN.md)** - Setup instructions, resources, and architecture details
- **[AI Working Memory (CLAUDE.md)](CLAUDE.md)** - Current development status and session history

## Technology Stack
- **Extension:** TypeScript, VS Code Extension API
- **Debugging:** VS Code Debug Adapter Protocol (DAP)
- **Visualization:** Chart.js (lightweight) or Plotly.js (feature-rich)
- **Target:** Python 3.x with debugpy

## Development Environment
- Node.js 18+ (using v24.11.1)
- Python 3.x with numpy
- VS Code with Python and Python Debugger extensions
- Yeoman + generator-code (for scaffolding)
- vsce (for packaging)

## License
Uses only permissive open-source licenses (MIT, Apache 2.0, BSD).

## Recent Progress

**Session 1 (2026-02-06):** Phase 1 - Scaffold & Hello World
- ✅ Created extension structure with TypeScript
- ✅ Registered `debugplot.plotVariable` command
- ✅ Verified in Extension Development Host

**Session 2 (2026-02-06):** Phase 2 - Implementation
- ✅ Created Python test script with sample data (6 test variables)
- ✅ Implemented Debug Adapter Protocol (DAP) integration
- ✅ Extension detects active debug sessions
- ✅ Retrieves variable data from paused debugger
- ✅ Serializes Python lists and numpy arrays to JSON
- ✅ Validates numeric array data

**Session 3 (2026-02-07):** Phase 2 - Testing & Finalization
- ✅ Comprehensive manual testing completed (all cases passed)
- ✅ Improved error messages with consistent format
- ✅ Phase 2 accomplishment report created

**Session 4 (2026-02-07):** Phase 3 - Chart Rendering
- ✅ Implemented webview panel creation with Chart.js
- ✅ Rendered line charts from numeric data
- ✅ Integrated VS Code theme support (light/dark mode)
- ✅ Responsive chart sizing and layout
- ✅ Phase 3 testing guide created

**Session 5 (2026-02-10):** Phase 4 - Context Menu Integration
- ✅ Added context menu for right-click variables in Variables pane
- ✅ Implemented variable context extraction from VS Code DAP
- ✅ Added `onDebug` activation event for automatic extension loading
- ✅ Maintained Command Palette fallback with input prompt
- ✅ Restricted context menu to Python debug sessions only
- ✅ Phase 4 testing guide created

**Session 6 (2026-02-10):** Phase 5 - Automated Testing Infrastructure
- ✅ Created VS Code integration test suite (18 automated tests)
- ✅ Set up test runner configuration and isolated test workspace
- ✅ Implemented comprehensive test coverage (70-75% automated)
- ✅ Created manual testing checklist for visual verification (5 minutes)
- ✅ Documented hybrid testing approach (automated + manual)
- ✅ All tests compile successfully and ready to execute
- ✅ Test coverage includes: activation, debug session handling, DAP communication, error cases, context menu/Command Palette paths, webview integration

**Session 7 (2026-02-11):** Phase 4 & 5 Testing Completed
- ✅ Comprehensive manual testing of Phase 4 and Phase 5 functionality completed
- ✅ All core POC features working correctly
- ✅ Minor issues documented in [dev.008.issues-and-notes-from-testing.md](poc/docs/dev.008.issues-and-notes-from-testing.md)
- ✅ All issues deemed acceptable for proof-of-concept
- ✅ Test results: 1 non-critical UI issue (menu item position), several minor areas for future improvement
- ✅ POC ready for Phase 6 - Polish & Package

**Session 8 (2026-02-11):** Phase 6 Steps 1-2 Complete
- ✅ Error handling reviewed and validated (17/17 tests passing)
- ✅ Performance validation completed with test script
- ✅ Performance metrics documented (arrays up to 10,000 elements)
- ✅ DAP size limit discovered (~43KB) and handled gracefully
- ✅ Improved error messages for oversized arrays

**Session 9 (2026-02-13):** Phase 6 Steps 3-5 Complete
- ✅ Documentation polished: Created USAGE_EXAMPLES.md with 7 real-world examples
- ✅ Pre-package validation: Clean compilation, 16/17 tests passing, secure dependencies
- ✅ Extension packaged: debugplot-0.0.1.vsix (13 KB) ready for distribution
- ✅ Package verified and ready for installation testing

**Session 10 (2026-02-14):** Phase 6 Complete - POC Delivered
- ✅ Installed and tested extension in clean Windows environment
- ✅ All functionality working perfectly in production environment
- ✅ Final validation complete: All POC objectives achieved
- ✅ Project documentation finalized
- ✅ **POC SUCCESSFULLY DELIVERED** 🎉

**What Works:**
- ✅ Right-click variables in Variables pane → "Plot Variable" → instant chart visualization
- ✅ Command Palette fallback: "DebugPlot: Plot Variable" → enter variable name → chart
- ✅ Supports Python lists and NumPy arrays (up to ~10,000 elements)
- ✅ Automatic extension activation during Python debug sessions
- ✅ User-friendly error messages for invalid data and size limits
- ✅ Automated test suite with 16/17 integration tests passing
- ✅ Professional documentation with usage examples and troubleshooting
- ✅ Clean installation from .vsix package (13 KB)
- ✅ Theme integration (light/dark mode)

**Deliverables:**
- 📦 **debugplot-0.0.1.vsix** - Production-ready extension package
- 📚 **Comprehensive Documentation** - README, usage examples, performance metrics
- ✅ **Automated Tests** - 16/17 passing integration tests
- 📊 **Performance Data** - Validated for arrays up to 10,000 elements
- 🎯 **Proof of Concept** - Technical feasibility demonstrated

---

*Last Updated: 2026-02-14 - **POC COMPLETE**: All 6 Phases Delivered Successfully*
