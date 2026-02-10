# DebugPlot: VS Code Python Debug Plot Viewer — Proof of Concept Plan

## Goal

Build the **simplest possible VS Code extension** that adds a "Plot This Variable" command during a Python debug session. When paused at a breakpoint, the user right-clicks a numeric variable (list, numpy array, or pandas Series/DataFrame) and sees a basic chart rendered in a VS Code webview panel.

**Success criteria:** Hit a breakpoint → right-click a variable → see a plot. That's it.

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│         VS Code Extension           │
│         (TypeScript)                │
│                                     │
│  1. Register "Plot Variable" cmd    │
│  2. Use Debug Adapter Protocol to   │
│     evaluate expression in frame    │
│  3. Serialize data to JSON          │
│  4. Send JSON to Webview Panel      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     Webview Panel (HTML/JS)   │  │
│  │     - Receives JSON data      │  │
│  │     - Renders chart via       │  │
│  │       Chart.js or Plotly.js   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
          │
          │  vscode.debug.activeDebugSession
          │    .customRequest('evaluate', ...)
          ▼
┌─────────────────────────────────┐
│   Python Debugger (debugpy)     │
│   Already running via VS Code   │
│   - Evaluates expressions       │
│   - Returns serialized data     │
└─────────────────────────────────┘
```

**Key insight:** We do NOT fork or modify debugpy. We build a **companion extension** that talks to the active debug session through VS Code's built-in Debug Adapter Protocol API.

---

## Development Environment

### Required Tools

| Tool | Purpose | Install |
|------|---------|---------|
| **Node.js** (18+) | Extension runtime & build | `nvm install 18` (already available in WSL2) |
| **VS Code** | Development & testing | Already installed |
| **Python 3.x** | Test target for debugging | Already installed |
| **Yeoman + VS Code Generator** | Scaffold the extension | `npm install -g yo generator-code` |
| **vsce** | Package the extension for local install | `npm install -g @vscode/vsce` |

### VS Code Extensions (for development)

- **Python** (ms-python.python) — already installed
- **Python Debugger** (ms-python.debugpy) — already installed
- **ESLint** — recommended for TypeScript linting

### Key npm Dependencies (for the extension)

- `@types/vscode` — VS Code API typings
- `chart.js` or `plotly.js-dist-min` — charting library bundled into the webview

### Test Script

A simple Python file to debug against:

```python
import numpy as np

data = [1, 4, 9, 16, 25, 36, 49]
arr = np.array([2.0, 3.1, 5.2, 4.8, 7.1, 6.5])
# Set breakpoint here
print("done")
```

---

## High-Level Steps

### Phase 1 — Scaffold & Hello World

1. **Generate the extension project** using `yo code` (TypeScript, no bundler initially)
2. **Register a command** `debugplot.plotVariable` in `package.json`
3. **Verify it works** — run the extension in the Extension Development Host, trigger the command from the command palette, show a notification ("Hello from DebugPlot!")

### Phase 2 — Read a Variable from the Debug Session

4. **Hook into the active debug session** using `vscode.debug.activeDebugSession`
5. **Get the selected variable** — determine the variable name from context (either from the user's text selection or a quick-pick input prompt)
6. **Evaluate an expression** against the paused frame using the DAP `evaluate` request:
   ```typescript
   const session = vscode.debug.activeDebugSession;
   const result = await session.customRequest('evaluate', {
       expression: `__import__('json').dumps(list(${variableName}))`,
       frameId: frameId,
       context: 'repl'
   });
   ```
7. **Parse the result** — extract the JSON string from the evaluation response

### Phase 3 — Render a Plot in a Webview

8. **Create a Webview Panel** (`vscode.window.createWebviewPanel`)
9. **Bundle Chart.js** into the webview's HTML (inline or via a local resource URI)
10. **Post the data** from the extension to the webview using `webview.postMessage()`
11. **Render a line chart** from the received data array

### Phase 4 — Context Menu Integration

12. **Add a context menu entry** so "Plot Variable" appears when right-clicking in the Variables pane during a debug session (via `menus` contribution in `package.json`)
13. **Add an activation event** — `onDebug` so the extension activates only during debug sessions
14. **Update command handler** to accept context parameter from right-click events
15. **Extract variable name** from context (evaluateName or name property)
16. **End-to-end test** — debug the test Python script, pause at breakpoint, right-click `data`, see a line chart

### Phase 5 — Automated Testing Infrastructure

17. **Create test runner configuration** — `.vscode-test.mjs` for VS Code integration tests
18. **Set up test fixtures** — isolated test workspace with Python test script and debug config
19. **Implement integration test suite** — 18 automated tests covering:
    - Extension activation and command registration
    - Debug session requirement enforcement
    - Variable data reading via DAP (all test variables)
    - Error handling (None, scalar, undefined, empty arrays)
    - Context menu and Command Palette code paths
    - Webview panel creation and titles
20. **Create manual testing checklist** — streamlined 5-minute visual verification for chart rendering and UI
21. **Document testing approach** — comprehensive testing guide with troubleshooting and CI/CD setup
22. **Verify test coverage** — achieve 70-75% automated coverage + 25-30% manual visual checks

### Phase 6 — Polish & Package

23. **Final error handling review** — ensure graceful messages for all edge cases
24. **Performance review** — test with large arrays (1000+ elements)
25. **Package locally** with `vsce package` to produce a `.vsix` file
26. **Install and test** via `code --install-extension debugplot-0.0.1.vsix`
27. **Documentation cleanup** — finalize README, add usage examples, create demo screenshots

---

## Risks & Open Questions

- **Variable serialization** — `json.dumps(list(x))` works for simple cases but will break on multi-dimensional arrays, DataFrames, or non-numeric types. The PoC only needs to handle 1D numeric data.
- **Frame ID retrieval** — Getting the correct `frameId` for the evaluate request requires listening to `onDidChangeActiveStackItem` or using the Stopped event. Needs experimentation.
- **Context menu in Variables pane** — VS Code's `debug/variables/context` menu contribution point should work, but the exact variable name extraction API may be limited. Fallback: prompt the user to type the variable name.
- **Webview security** — For the PoC, we can use a permissive content security policy. Tighten for any real release.

---

## Future Enhancements (Out of Scope for PoC)

- Support 2D arrays as heatmaps
- DataFrame column selection UI
- Multiple chart types (scatter, bar, histogram)
- Live-updating plots as you step through code
- Plot comparison across breakpoint hits
- Integration with matplotlib's `fig.savefig()` to render existing figures
