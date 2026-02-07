# Plotevusk - VS Code Python Debug Plot Viewer

## Purpose
A proof-of-concept VS Code extension that adds inline plotting capability to Python debugging sessions. Visualize numeric variables (lists and numpy arrays) as charts without leaving the debugger.

**Goal:** Hit a breakpoint → right-click a variable → see a plot. That's it.

## Status
- **Start Date:** 2026-02-06
- **Current Phase:** Phase 2 - Read Variables from Debug Session ✅ COMPLETE & TESTED
- **Development Status:** 🟢 Ready for Phase 3

### Phase Progress
- [✅] Phase 1 - Scaffold & Hello World **COMPLETE**
- [✅] Phase 2 - Read Variables from Debug Session **COMPLETE & TESTED**
- [ ] Phase 3 - Render Plots in Webview (NEXT)
- [ ] Phase 4 - Integration & End-to-End Testing
- [ ] Phase 5 - Polish & Package

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
│   │   ├── src/            # TypeScript source
│   │   ├── out/            # Compiled JavaScript
│   │   └── package.json    # Extension manifest
│   └── test-scripts/       # Python test files ✅ CREATED
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

**What Works Now:**
While debugging Python code, pause at a breakpoint, run "DebugPlot: Plot Variable", enter a variable name (e.g., `data_list`), and the extension successfully extracts numeric values from Python lists and numpy arrays. User-friendly error messages guide proper usage.

**Next:** Phase 3 will add chart rendering in a webview panel.

---

*Last Updated: 2026-02-07 - Phase 2 Complete & Tested, Ready for Phase 3*
