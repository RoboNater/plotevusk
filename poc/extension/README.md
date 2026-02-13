# DebugPlot

**Plot numeric variables during Python debugging** — Right-click any numeric variable (list, numpy array) in VS Code's Variables pane during a debug session to see an instant visualization.

## Features

- 🎯 **One-Click Plotting**: Right-click a variable in the Variables pane → see a chart
- 🐍 **Python Support**: Works with Python lists and numpy arrays
- 🎨 **Theme Integration**: Charts automatically adapt to VS Code light/dark themes
- 📊 **Chart.js Visualization**: Clean, responsive line charts
- ⚡ **Debug Session Integration**: Seamlessly integrated into VS Code's debugging workflow

## Requirements

- **VS Code** 1.95.0 or higher
- **Python** 3.x
- **Python Debugger** extension (ms-python.debugpy)
- **Python** extension (ms-python.python)

## Installation

### From .vsix File (Local Install)

1. Download `debugplot-0.0.1.vsix`
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
4. Click "..." menu → "Install from VSIX..."
5. Select the `debugplot-0.0.1.vsix` file

Or via command line:
```bash
code --install-extension debugplot-0.0.1.vsix
```

## Usage

### Quick Start

1. **Set a breakpoint** in your Python file
2. **Start debugging** (F5)
3. **Wait for breakpoint** to pause execution
4. **Right-click a numeric variable** in the Variables pane
5. **Select "Plot Variable"** from context menu
6. **View the chart** in a new panel

### Supported Data Types

```python
# Python lists
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# NumPy arrays
import numpy as np
arr = np.array([2.0, 3.1, 5.2, 4.8, 7.1, 6.5])

# Large arrays (tested up to 10,000 elements)
large = np.arange(10000)
```

### Alternative: Command Palette

1. **Pause at breakpoint** during debugging
2. **Open Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. **Type** "DebugPlot: Plot Variable"
4. **Enter variable name** when prompted

## Limitations (POC Version)

This is a proof-of-concept extension. Known limitations:

- **1D Data Only**: Only supports one-dimensional numeric arrays
- **No Multi-Dimensional Support**: 2D arrays, DataFrames not supported
- **Single Chart Type**: Line charts only (no scatter, bar, histogram)
- **Size Limit**: Maximum 10,000 elements (DAP protocol constraint)
- **Theme Switching**: Existing charts don't update text colors when theme changes
- **Panel Management**: Each plot creates a new panel (no automatic reuse)

## Performance

Performance characteristics based on testing:

| Array Size | Render Time | Status |
|------------|-------------|--------|
| 100 elements | ~0.5 sec | ✅ Instant |
| 1,000 elements | ~0.5 sec | ✅ Fast |
| 10,000 elements | ~2.0 sec | ✅ Acceptable |
| >10,000 elements | N/A | ❌ Not supported |

The 10,000-element limit is due to Debug Adapter Protocol (DAP) response size constraints (~43KB). Arrays exceeding this size will show a helpful error message.

## Development

### Build from Source

```bash
cd poc/extension
npm install
npm run compile
```

### Run Tests

```bash
npm test
```

Expected: 17 passing tests

### Debug the Extension

1. Open `poc/extension/` in VS Code
2. Press F5 to launch Extension Development Host
3. In the new VS Code window, debug a Python script
4. Test the extension functionality

## Contributing

This is a proof-of-concept project. Issues and suggestions welcome!

## License

MIT

## Release Notes

### 0.0.1 (POC Release)

Initial proof-of-concept release:
- ✅ Right-click variable plotting during Python debug sessions
- ✅ Support for Python lists and numpy arrays
- ✅ Chart.js visualization with theme integration
- ✅ Command Palette support
- ✅ Comprehensive error handling
- ✅ Automated test suite (17 tests)
- ✅ Performance validated up to 10,000 elements
