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
- **[Phase 2 Accomplishment Report](poc/docs/cc.005.accomplished-phase-2.md)** - Phase 2 completion summary ✅
- **[Phase 3 Detailed Plan](poc/docs/cc.006.plan-phase-3-detailed.md)** - Webview panel and Chart.js integration
- **[Phase 3 Testing Guide](poc/docs/cc.007.phase-3-testing-guide.md)** - Instructions for testing Phase 3 functionality ✅
- **[Phase 3 Accomplishment Report](poc/docs/cc.008.accomplished-phase-3.md)** - Phase 3 completion summary ✅
- **[Phase 4 Detailed Plan](poc/docs/cc.009.plan-phase-4-detailed.md)** - Context menu integration with DAP
- **[Phase 4 Testing Guide](poc/docs/cc.010.phase-4-testing-guide.md)** - Instructions for testing Phase 4 functionality ✅
- **[Phase 5 Testing Options Analysis](poc/docs/cc.011.analysis-options-for-automated-testing.md)** - Analysis of automated testing approaches
- **[Phase 5 Detailed Plan](poc/docs/cc.012.plan-automated-testing-detailed.md)** - Hybrid testing infrastructure implementation
- **[Phase 5 Manual Testing Checklist](poc/docs/cc.013.manual-testing-checklist.md)** - 5-minute visual verification checklist ✅
- **[Phase 5 Testing Guide](poc/docs/cc.014.testing-guide.md)** - Comprehensive guide for running automated and manual tests ✅

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
   - Report: [Phase 1 Accomplishment Report](poc/docs/cc.002.accomplished-phase-1.md)

2. **Phase 2** - Read Variables from Debug Session ✅ COMPLETE & TESTED
   - ✅ Create Python test script with sample data
   - ✅ Detect active debug session (show warning if none)
   - ✅ Retrieve thread and stack frame IDs via DAP
   - ✅ Prompt user for variable name with validation
   - ✅ Evaluate serialization expression via DAP `evaluate` request
   - ✅ Parse JSON result and validate numeric array
   - ✅ Display extracted data count to user
   - ✅ Improved error messages with consistent format
   - ✅ Comprehensive manual testing passed (all test cases)
   - Commits: `3e73af8`, `d5b63fe`
   - Report: [Phase 2 Accomplishment Report](poc/docs/cc.005.accomplished-phase-2.md)

3. **Phase 3** - Render Plots ✅ COMPLETE
   - ✅ Create webview panel with `vscode.window.createWebviewPanel`
   - ✅ Bundle charting library (Chart.js via CDN)
   - ✅ Display data as interactive line chart
   - ✅ Theme support (light/dark mode using VS Code CSS variables)
   - ✅ Responsive chart sizing and layout
   - ✅ Message passing from extension to webview
   - Commit: `9fc398d`
   - Report: [Phase 3 Accomplishment Report](poc/docs/cc.008.accomplished-phase-3.md)

4. **Phase 4** - Context Menu Integration ✅ COMPLETE
   - ✅ Add `debug/variables/context` menu contribution
   - ✅ Configure `onDebug` activation event
   - ✅ Extract variable context from menu invocation
   - ✅ Accept optional variable context in command handler
   - ✅ Fallback to input prompt for Command Palette invocation
   - ✅ Restrict context menu to Python debug sessions only
   - Commit: `c52efd8`
   - Testing Guide: [Phase 4 Testing Guide](poc/docs/cc.010.phase-4-testing-guide.md)

5. **Phase 5** - Automated Testing Infrastructure ✅ COMPLETE
   - ✅ Create test runner configuration (`.vscode-test.mjs`)
   - ✅ Set up test fixtures with isolated test workspace
   - ✅ Implement 18 integration tests covering all major functionality
   - ✅ Create manual testing checklist for visual verification (5 minutes)
   - ✅ Document comprehensive testing approach and troubleshooting
   - ✅ Achieve 70-75% automated coverage + 25-30% manual visual checks
   - Commit: `9f89fb1`
   - Testing Guide: [Phase 5 Testing Guide](poc/docs/cc.014.testing-guide.md)
   - Run tests: `cd poc/extension && npm test`

6. **Phase 6** - Polish & Package (NEXT)
   - Error handling refinements
   - Performance review (large arrays 1000+ elements)
   - Package as .vsix with `vsce package`
   - Installation and smoke testing
   - Final documentation and demo screenshots

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

### Running Automated Tests

**Quick Start:**
```bash
cd poc/extension
npm test
```

This runs 18 integration tests that verify:
- Extension activation and command registration
- Debug session requirement enforcement
- Variable data reading via DAP (all test variables)
- Error handling (None, scalar, undefined, empty arrays)
- Context menu and Command Palette code paths
- Webview panel creation and titles

**Expected output:** All tests passing in ~15-30 seconds

**For details:** See [Phase 5 Testing Guide](poc/docs/cc.014.testing-guide.md)

### Manual Testing Checklist

After running automated tests, perform visual verification:

**Quick checklist (~5 minutes):**
1. Chart visual rendering
2. Theme integration (light)
3. Theme integration (dark)
4. Context menu UI presence
5. Context menu language filtering

**For details:** See [Phase 5 Manual Testing Checklist](poc/docs/cc.013.manual-testing-checklist.md)

### How to Use the Extension (Current Capabilities)

**Method 1: Right-Click Context Menu (RECOMMENDED)**
1. Start debugging Python code (F5)
2. Pause at a breakpoint
3. In the Debug Sidebar, expand the **Variables** pane
4. Right-click on a numeric variable (e.g., `data_list`, `data_np`)
5. Select "Plot Variable" from the context menu
6. Chart renders instantly in a new webview panel

**Method 2: Command Palette (Fallback)**
1. Start debugging Python code (F5)
2. Pause at a breakpoint
3. Press Ctrl+Shift+P to open Command Palette
4. Type "DebugPlot" and select "DebugPlot: Plot Variable"
5. Enter the variable name in the input prompt
6. Chart renders in a new webview panel

### Phase 4 Testing (Current - READY FOR MANUAL TESTING)

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
6. When paused at breakpoint:
   - **Context Menu:** Right-click `data_list` in Variables pane → "Plot Variable"
   - **Command Palette:** Ctrl+Shift+P → "DebugPlot: Plot Variable" → type `data_list`
7. Verify chart renders correctly
8. Test both invocation methods to ensure both work

**Full Instructions:** See [Phase 4 Testing Guide](poc/docs/cc.010.phase-4-testing-guide.md)

### Test Cases Covered
- Context menu appears during Python debugging ✅
- Context menu plots variables without input prompt ✅
- Command Palette fallback with manual input ✅
- Non-Python debug sessions don't show menu ✅
- Error handling for empty/invalid data ✅
- Multiple sequential plots work correctly ✅
- Extension activates on debug start (not VS Code startup) ✅

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
