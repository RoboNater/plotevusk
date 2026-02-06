# DebugPlot - Developer Guide

## Overview
This project is developing a proof-of-concept VS Code extension that adds inline plotting capability to the Python debugger. When debugging Python code, developers will be able to right-click numeric variables (lists, numpy arrays) and see them visualized as charts.

## Quick Start

### Prerequisites
- Node.js 18+ (we're using v24.11.1 via NVM)
- Python 3.x with numpy
- VS Code with Python and Python Debugger extensions

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
# 3. In Extension Development Host: Ctrl+Shift+P → "DebugPlot: Plot Variable"
# 4. Should see: "Hello from DebugPlot! Ready to plot variables."
```

## Key Documents

### Planning & Design
- **[High-Level POC Plan](poc/docs/debugplot-poc-plan.md)** - Overall architecture and phase breakdown
- **[Phase 1 Detailed Plan](poc/docs/cc.001.plan-phase-1-detailed.md)** - Step-by-step Phase 1 implementation
- **[Phase 1 Accomplishment Report](poc/docs/cc.002.accomplished-phase-1.md)** - Phase 1 completion summary ✅

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

2. **Phase 2** - Read Variables from Debug Session (NEXT)
   - Hook into active debug session
   - Evaluate expressions using DAP
   - Serialize data to JSON

3. **Phase 3** - Render Plots
   - Create webview panel
   - Bundle charting library
   - Display data as charts

4. **Phase 4** - Integration
   - Add context menu entries
   - Configure activation events
   - End-to-end testing

5. **Phase 5** - Polish & Package
   - Error handling
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

### Test Script
Create a simple Python file with numeric data:
```python
import numpy as np

data = [1, 4, 9, 16, 25, 36, 49]
arr = np.array([2.0, 3.1, 5.2, 4.8, 7.1, 6.5])
# Set breakpoint here
print("done")
```

### Testing Workflow
1. Open test script in VS Code
2. Set breakpoint
3. Start debugging (F5)
4. When paused, right-click variable
5. Select "Plot Variable"
6. Verify chart appears in webview

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
