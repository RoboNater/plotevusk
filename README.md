# Plotevusk - VS Code Python Debug Plot Viewer

## Purpose
A proof-of-concept VS Code extension that adds inline plotting capability to Python debugging sessions. Visualize numeric variables (lists and numpy arrays) as charts without leaving the debugger.

**Goal:** Hit a breakpoint → right-click a variable → see a plot. That's it.

## Status
- **Start Date:** 2026-02-06
- **Current Phase:** Phase 1 - Scaffold & Hello World ✅ COMPLETE & VERIFIED
- **Development Status:** 🟢 Ready for Phase 2

### Phase Progress
- [✅] Phase 1 - Scaffold & Hello World **COMPLETE**
- [ ] Phase 2 - Read Variables from Debug Session
- [ ] Phase 3 - Render Plots in Webview
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
│   ├── extension/          # VS Code extension source ✅ CREATED
│   │   ├── src/            # TypeScript source
│   │   ├── out/            # Compiled JavaScript
│   │   └── package.json    # Extension manifest
│   └── test-scripts/       # Python test files (to be created)
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

## Current Session
**Session 1 (2026-02-06):**
- ✅ Environment verification completed
- ✅ Project documentation created
- ✅ Installed development tools (yo 6.0.0, vsce 3.7.1)
- ✅ Created extension structure in `poc/extension/`
- ✅ Configured `debugplot.plotVariable` command
- ✅ Compiled TypeScript successfully
- ✅ Manual testing completed successfully
- ✅ Created accomplishment report: `poc/docs/cc.002.accomplished-phase-1.md`

**🎉 Phase 1 Complete & Verified!** Ready for Phase 2.

---

*Last Updated: 2026-02-06 - Phase 1 Implementation Complete*
