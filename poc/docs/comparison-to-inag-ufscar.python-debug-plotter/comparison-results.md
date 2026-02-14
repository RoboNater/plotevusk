# Comparison: ext1 (DebugPlot) vs ext2 (Python Debug Plotter)

## Overview

| | **ext1: DebugPlot** | **ext2: Python Debug Plotter** |
|---|---|---|
| **Version** | 0.0.1 (POC) | 1.1.1 (production) |
| **Publisher** | debugplot-poc | inag-ufscar (Cesar Comin) |
| **VS Code** | >= 1.95.0 | >= 1.100.0 |
| **Source size** | ~348 lines (1 TS file) | ~1,200+ lines (2 TS + 1 JS + 1 Python) |
| **Charting lib** | Chart.js (CDN) | Plotly.js (bundled, ~4.8MB) |

## Architecture

**ext1** is a single-file extension (`extension.ts`). Everything -- command handling, debugger integration, data extraction, and webview HTML generation -- lives in one ~350-line TypeScript file. Data is extracted by evaluating a Python one-liner inline via DAP's `evaluate` request and returned directly in the DAP response.

**ext2** has a clean separation of concerns across four layers:

- `extension.ts` -- command registration, debugger lifecycle, panel management
- `webview.ts` -- HTML scaffold generation
- `media/main.js` -- client-side rendering logic (~510 lines)
- `python/data_handler.py` -- Python-side data extraction and type detection (~437 lines)

ext2 base64-encodes the entire Python script and injects it into the debug session via `exec()`, then writes results to a temp file that the extension reads back. This avoids DAP response size limits entirely.

## Data Types Supported

| Data type | **ext1** | **ext2** |
|---|---|---|
| Python lists (numeric) | Yes | Yes |
| NumPy 1D arrays | Yes | Yes (histogram) |
| NumPy 2D images | No | Yes (canvas + tooltips) |
| NumPy 2D point clouds (Nx2) | No | Yes (2D scatter) |
| NumPy 3D point clouds (Nx3) | No | Yes (3D scatter) |
| PyTorch tensors | No | Yes (auto `.detach().cpu().numpy()`) |
| TensorFlow tensors | No | Yes (via `.numpy()`) |
| PIL images | No | Yes |
| NetworkX graphs | No | Yes (2D and 3D) |
| Non-plottable objects | Error message | Rich text inspection |

ext1 only handles 1D numeric arrays. ext2 has a sophisticated type-detection pipeline using shape heuristics and duck typing to support a much wider range of data.

## Visualization

**ext1** renders a single chart type: a **Chart.js line chart** with area fill. X-axis is the array index, Y-axis is the value. Simple, clean, and fast.

**ext2** uses **Plotly.js** and dispatches to different visualization types:

- 1D arrays -> histogram
- Nx2 arrays -> 2D scatter (switches to `scattergl` WebGL mode for >5,000 points)
- Nx3 arrays -> 3D scatter with Viridis colorscale
- Images -> canvas-based rendering with a custom pixel-value tooltip system (shows actual float values on hover)
- Graphs -> node/edge visualization with automatic spring layout fallback
- All visualizations are interactive (pan, zoom, 3D rotation)

## Size Limits and Data Transfer

**ext1** is limited to **10,000 elements** because it passes the entire serialized array through the DAP `evaluate` response (~43KB limit). Arrays beyond this are truncated with a warning.

**ext2** sidesteps this by writing visualization data to a **temp file**, then passing only the file path through DAP. The extension reads the file and cleans it up. This means it can handle arbitrarily large arrays (images, large point clouds, etc.) without hitting DAP response limits.

## Live Update Behavior

**ext1** creates a new webview panel for each plot. There is no auto-update -- you must re-run the command to refresh.

**ext2** listens to `onDidChangeActiveStackItem` and **automatically re-evaluates** the variable as you step through code. The visualization updates live. It also uses a "silent mode" to suppress error popups during stepping (e.g., when a variable goes out of scope temporarily).

## Debugger Session Lifecycle

**ext1** checks for an active session at command time but doesn't react to session termination. Old panels remain open.

**ext2** registers an `onDidTerminateDebugSession` listener and **closes the panel** when debugging ends.

## Webview Communication

**ext1** uses a straightforward `postMessage` with `{ variableName, values }` immediately after creating the panel.

**ext2** implements a **handshake protocol**: the webview posts `{ command: 'ready' }` when loaded, and the extension waits for this signal before sending data. This prevents race conditions where data arrives before the webview is initialized.

## Error Handling and Robustness

**ext1** provides user-friendly `vscode.window.showErrorMessage` for common cases (no session, empty array, non-numeric data, NoneType) but is relatively straightforward.

**ext2** has multi-layered error handling:

- Python-side: try/except around all data extraction, falls back to text representation
- NaN/Inf handling in arrays (replaced with 0 for JSON safety)
- Silent mode for auto-update failures
- Proper event listener cleanup and memory management (clones DOM nodes to remove listeners)

## Testing

**ext1** has 17 integration tests covering activation, command registration, DAP data reading, error cases, and both context menu and Command Palette paths.

**ext2** has a test directory but appears lighter on tests relative to its feature set.

## Summary

**ext1 (DebugPlot)** is a focused, minimal proof-of-concept that does one thing well: plot 1D numeric arrays as line charts during debugging. It's simple, easy to understand, and has good test coverage for what it does. But it's limited to one data type and one chart type, and constrained by DAP response sizes.

**ext2 (Python Debug Plotter)** is a far more mature and feature-rich extension. It handles images, point clouds, graphs, PyTorch/TensorFlow tensors, and generic objects. It uses Plotly for interactive visualizations, auto-updates as you step through code, avoids DAP size limits via temp files, and has proper lifecycle management. The trade-off is complexity -- the codebase is ~4x larger and bundles a 4.8MB Plotly library.
