# DebugPlot - Developer Guide

## Overview
This project is developing a proof-of-concept VS Code extension that adds inline plotting capability to the Python debugger. When debugging Python code, developers will be able to right-click numeric variables (lists, numpy arrays) and see them visualized as charts.

## Quick Start

### Prerequisites
- Node.js 18+ (we're using v24.11.1 via NVM)
- Python 3.x with numpy
- VS Code with Python and Python Debugger extensions
- debugpy installed for Python debugging (usually included with VS Code Python extension)

### Development Setup
```bash
# Install required global npm packages (✅ DONE)
npm install -g yo generator-code @vscode/vsce

# Extension already created in poc/extension/ (✅ DONE)
cd /home/alfred/lw/w514-plot-in-vscode/poc/extension

# Install dependencies (✅ DONE)
npm install

# Compile TypeScript (✅ DONE)
npm run compile

# Test the extension
# 1. Open poc/extension/ folder in VS Code
# 2. Press F5 to launch Extension Development Host
# 3. In the Dev Host, open poc/test-scripts/plot_test_basic.py
# 4. Set a breakpoint on the print("done") line
# 5. Press F5 to debug the Python script (select "Debug plot_test_basic.py")
# 6. When paused at breakpoint: Ctrl+Shift+P → "DebugPlot: Plot Variable"
# 7. Type "data_list" → Should see: "DebugPlot: Read 7 numeric values from 'data_list'"
# 8. Check Debug Console to see extracted values: [1, 4, 9, 16, 25, 36, 49]
```

## Key Documents

### Planning & Design
- **[High-Level POC Plan](poc/docs/debugplot-poc-plan.md)** - Overall architecture and phase breakdown
- **[Phase 1 Detailed Plan](poc/docs/cc.001.plan-phase-1-detailed.md)** - Step-by-step Phase 1 implementation
- **[Phase 1 Accomplishment Report](poc/docs/cc.002.accomplished-phase-1.md)** - Phase 1 completion summary ✅
- **[Phase 2 Detailed Plan](poc/docs/cc.003.plan-phase-2-detailed.md)** - DAP integration and variable reading (7 implementation steps)
- **[Phase 2 Testing Guide](poc/docs/cc.004.phase-2-testing-guide.md)** - Instructions for testing Phase 2 functionality ✅

### Project Management
- **[README.md](README.md)** - Project status and high-level info
- **[CLAUDE.md](CLAUDE.md)** - AI assistant working memory (updated each session)

## Architecture Overview

```
┌─────────────────────────────────┐
│    VS Code Extension            │
│    - Registers commands         │
│    - Reads variables via DAP    │
│    - Sends data to webview      │
│                                 │
│    ┌────────────────────────┐   │
│    │  Webview Panel         │   │
│    │  (Chart.js rendering)  │   │
│    └────────────────────────┘   │
└─────────────────────────────────┘
          │
          │ Debug Adapter Protocol
          ▼
┌─────────────────────────────────┐
│    Python Debugger (debugpy)    │
│    - Already running            │
│    - Evaluates expressions      │
└─────────────────────────────────┘
```

**Key Insight:** We don't modify debugpy. Instead, we build a companion extension that communicates through VS Code's Debug Adapter Protocol API.

## Development Phases

1. **Phase 1** - Scaffold & Hello World ✅ COMPLETE & VERIFIED
   - ✅ Generate extension project
   - ✅ Register basic command (`debugplot.plotVariable`)
   - ✅ Verified in Extension Development Host - all tests passed
   - Commit: `d8394e2`

2. **Phase 2** - Read Variables from Debug Session ✅ IMPLEMENTATION COMPLETE
   - ✅ Create Python test script with sample data
   - ✅ Detect active debug session (show warning if none)
   - ✅ Retrieve thread and stack frame IDs via DAP
   - ✅ Prompt user for variable name with validation
   - ✅ Evaluate serialization expression via DAP `evaluate` request
   - ✅ Parse JSON result and validate numeric array
   - ✅ Display extracted data count to user
   - ⏳ **Ready for manual testing** - See [Phase 2 Testing Guide](poc/docs/cc.004.phase-2-testing-guide.md)
   - Commits: `3e73af8`, `9db31a5`

3. **Phase 3** - Render Plots (NEXT)
   - Create webview panel
   - Bundle charting library (Chart.js)
   - Display data as interactive line chart

4. **Phase 4** - Integration
   - Add context menu entries
   - Configure activation events
   - End-to-end testing

5. **Phase 5** - Polish & Package
   - Error handling refinements
   - Package as .vsix
   - Installation testing

## Resources

### VS Code Extension Development
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)
- [Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [Webview API Guide](https://code.visualstudio.com/api/extension-guides/webview)

### Debugging & DAP
- [VS Code Debug API](https://code.visualstudio.com/api/references/vscode-api#debug)
- [Python Debug Extension (debugpy)](https://github.com/microsoft/debugpy)
- [DAP Specification](https://microsoft.github.io/debug-adapter-protocol/specification)

### Charting Libraries
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/) - Simple, lightweight (likely choice)
- [Plotly.js Documentation](https://plotly.com/javascript/) - Feature-rich, larger bundle

### Extension Publishing
- [vsce (VS Code Extension Manager)](https://github.com/microsoft/vscode-vsce)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Testing

### Phase 2 Testing (Current)

**Test Script:** `poc/test-scripts/plot_test_basic.py`
Contains 6 sample variables:
- `data_list` - Simple list: [1, 4, 9, 16, 25, 36, 49]
- `data_np` - Numpy array: [2.0, 3.1, 5.2, 4.8, 7.1, 6.5]
- `data_float_list` - Float list: [1.1, 2.2, 3.3, 4.4, 5.5]
- `data_int_range` - Range list: [0, 1, 2, ..., 9]
- `data_single` - Single element: [42]
- `data_negative` - With negatives: [-3, -1, 0, 1, 3]

**Testing Workflow:**
1. Open `poc/extension/` in VS Code
2. Press F5 to launch Extension Development Host
3. In Dev Host, open `poc/test-scripts/plot_test_basic.py`
4. Set breakpoint on `print("done")` line
5. Press F5 to debug the Python script
6. When paused at breakpoint: Ctrl+Shift+P → "DebugPlot: Plot Variable"
7. Enter variable name (e.g., `data_list`)
8. Verify success message and check Debug Console for extracted values
9. Test error cases: non-existent variable, invalid name, no debug session

**Full Instructions:** See [Phase 2 Testing Guide](poc/docs/cc.004.phase-2-testing-guide.md)

### Future Testing (Phase 3+)
- Verify webview panel creation
- Verify Chart.js rendering
- Test chart interactivity

## Known Limitations (POC Scope)
- Only 1D numeric data (lists and numpy arrays)
- No pandas DataFrame support (future enhancement)
- No multi-dimensional arrays
- Basic line charts only
- No chart customization options

## License
All code must use permissive open-source licenses (MIT, Apache 2.0, BSD).

## Getting Help
- Check the [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples) repository
- Review the POC plan documents in `poc/docs/`
- Consult CLAUDE.md for current development status
