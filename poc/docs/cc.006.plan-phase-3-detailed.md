# Phase 3 Detailed Plan - Render Charts in Webview

**Phase:** 3 of 5
**Goal:** Display the numeric data as a line chart in a VS Code Webview Panel
**Success Criteria:** While paused at a breakpoint, invoke the command, type a variable name, and see a line chart appear in a webview panel
**Prerequisite:** Phase 2 complete (commit d5b63fe)

---

## Overview

Phase 3 transforms the extension from displaying data in a message box to rendering a visual chart. We will:

1. Research and choose Chart.js as our charting library (lightweight, MIT licensed)
2. Create a Webview Panel to display custom HTML content
3. Design an HTML template that includes Chart.js and a canvas element
4. Send the numeric data from the extension to the webview via `postMessage`
5. Render a line chart in the webview when data is received
6. Add polish: chart title with variable name, axis labels, responsive sizing
7. Test with all the Phase 2 test variables

This phase does **not** add context menus or activation events — that's Phase 4. The chart is invoked via Command Palette, just like Phase 2.

---

## Technical Background

### VS Code Webview API

VS Code webviews are sandboxed iframe-like environments for displaying custom HTML/CSS/JS content within the editor. Key concepts:

| API | Purpose |
|-----|---------|
| `vscode.window.createWebviewPanel` | Creates a new webview panel with a title and view column |
| `webview.html = "..."` | Sets the HTML content (must be complete HTML document) |
| `webview.postMessage(data)` | Sends data from extension to webview JavaScript |
| `window.addEventListener('message', ...)` | Receives messages in the webview JavaScript |
| Content Security Policy (CSP) | Controls what resources the webview can load |

**Data Flow:**
```
Extension (TypeScript)                 Webview (HTML/JS)
     │                                      │
     │  createWebviewPanel                  │
     ├─────────────────────────────────────>│
     │                                      │
     │  Set webview.html                    │
     │  (includes Chart.js via CDN)         │
     ├─────────────────────────────────────>│
     │                                      │
     │  webview.postMessage({               │
     │    variableName: "data_list",        │
     │    values: [1, 4, 9, 16, ...]        │
     │  })                                  │
     ├─────────────────────────────────────>│
     │                                      │  Render chart
     │                                      │  using Chart.js
```

### Chart.js Overview

**Chart.js** is a popular, lightweight (under 200KB), MIT-licensed charting library. Perfect for our POC.

- **Official site:** https://www.chartjs.org/
- **License:** MIT (permissive, no licensing concerns)
- **CDN:** https://cdn.jsdelivr.net/npm/chart.js
- **Latest version:** 4.x (as of 2026)

**Basic usage:**
```javascript
const ctx = document.getElementById('myChart');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: [0, 1, 2, 3, 4, 5],  // X-axis labels
        datasets: [{
            label: 'My Data',
            data: [1, 4, 9, 16, 25, 36],  // Y-axis values
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});
```

For 1D numeric arrays, we'll generate simple index-based labels: `[0, 1, 2, ...]`.

---

## Step-by-Step Implementation

### Step 1: Research Chart.js Integration
**Purpose:** Understand how to use Chart.js via CDN in a VS Code webview

#### Tasks:
1. Verify Chart.js license (MIT — ✅ permissive)
2. Find the CDN link for Chart.js 4.x
3. Understand minimal Chart.js line chart example
4. Check Content Security Policy requirements for loading from CDN

#### Findings to document:
- **CDN URL:** `https://cdn.jsdelivr.net/npm/chart.js`
- **Required CSP directives:**
  - `script-src 'unsafe-inline' https://cdn.jsdelivr.net;`
  - `style-src 'unsafe-inline';` (for inline styles)
  - `img-src https: data:;` (Chart.js may use data URIs for images)
- **Minimal HTML structure:**
  ```html
  <canvas id="chartCanvas"></canvas>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    const ctx = document.getElementById('chartCanvas');
    new Chart(ctx, { /* config */ });
  </script>
  ```

#### Success Criteria:
- [ ] Chart.js CDN URL confirmed
- [ ] License verified as MIT
- [ ] CSP requirements understood
- [ ] Basic example code reviewed

---

### Step 2: Create Webview Panel Infrastructure
**Purpose:** Add a function to create and configure a webview panel

#### Implementation:

Add a new function `createPlotPanel` to `src/extension.ts`:

```typescript
function createPlotPanel(
    context: vscode.ExtensionContext,
    variableName: string,
    data: number[]
): vscode.WebviewPanel {
    // Create webview panel
    const panel = vscode.window.createWebviewPanel(
        'debugplotChart',              // Internal identifier
        `Plot: ${variableName}`,        // Title shown in tab
        vscode.ViewColumn.Beside,       // Open to the side of editor
        {
            enableScripts: true,        // Allow JavaScript execution
            retainContextWhenHidden: true  // Keep state when tab is hidden
        }
    );

    // Set the HTML content (will be implemented in Step 3)
    panel.webview.html = getWebviewContent();

    // Send data to webview (will be implemented in Step 4)
    panel.webview.postMessage({
        variableName: variableName,
        values: data
    });

    return panel;
}
```

**Key decisions:**
- **View column:** `vscode.ViewColumn.Beside` opens the chart next to the code, not covering it
- **enableScripts:** Required for Chart.js to work
- **retainContextWhenHidden:** Preserves the chart when switching tabs
- **Panel ID:** `'debugplotChart'` is unique to our extension

#### Modify the command handler:

Replace the success message at the end of the command handler with:

```typescript
// Instead of:
// vscode.window.showInformationMessage(...)

// Do this:
createPlotPanel(context, variableName, data);
console.log(`DebugPlot: Created chart panel for '${variableName}' with ${data.length} values`);
```

#### Success Criteria:
- [ ] `createPlotPanel` function exists
- [ ] Function creates a webview panel with correct title
- [ ] Panel opens in `ViewColumn.Beside`
- [ ] TypeScript compiles without errors

---

### Step 3: Design the HTML Template
**Purpose:** Create the HTML content for the webview that includes Chart.js and a canvas

#### Implementation:

Add a new function `getWebviewContent` to `src/extension.ts`:

```typescript
function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'none';
                   script-src 'unsafe-inline' https://cdn.jsdelivr.net;
                   style-src 'unsafe-inline';
                   img-src https: data:;">
    <title>DebugPlot Chart</title>
    <style>
        body {
            margin: 0;
            padding: 16px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
        }
        #chartContainer {
            position: relative;
            height: 70vh;
            width: 100%;
        }
        h2 {
            margin-top: 0;
            color: var(--vscode-editor-foreground);
        }
    </style>
</head>
<body>
    <h2 id="chartTitle">Loading...</h2>
    <div id="chartContainer">
        <canvas id="chartCanvas"></canvas>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Will receive data via postMessage (implemented in Step 4)
        console.log('DebugPlot webview loaded');
    </script>
</body>
</html>`;
}
```

**Design details:**
- **VS Code CSS variables:** `var(--vscode-editor-background)` ensures the chart matches the theme
- **Responsive container:** `height: 70vh` makes chart fill most of the viewport
- **CSP:** Allows Chart.js from CDN, inline scripts/styles, and data URIs
- **Canvas element:** Chart.js requires a `<canvas>` element to render into

#### Success Criteria:
- [ ] `getWebviewContent` function exists
- [ ] HTML includes proper CSP meta tag
- [ ] HTML uses VS Code theme CSS variables
- [ ] Canvas element has ID `chartCanvas`
- [ ] Chart.js loaded from CDN
- [ ] TypeScript compiles without errors

---

### Step 4: Post Data from Extension to Webview
**Purpose:** Send the numeric array from the extension to the webview JavaScript

#### Implementation:

The `createPlotPanel` function already has this code (from Step 2):

```typescript
panel.webview.postMessage({
    variableName: variableName,
    values: data
});
```

Now we need to receive this message in the webview. Update the `<script>` section in `getWebviewContent`:

```typescript
// Inside the <script> tag of getWebviewContent:
<script>
    const vscode = acquireVsCodeApi();
    let chart = null;

    // Listen for messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        console.log('DebugPlot webview received:', message);

        if (message.variableName && message.values) {
            renderChart(message.variableName, message.values);
        }
    });

    function renderChart(variableName, values) {
        // Will implement chart rendering in Step 5
        console.log(\`Rendering chart for \${variableName} with \${values.length} values\`);
        document.getElementById('chartTitle').textContent =
            \`Plot: \${variableName} (\${values.length} values)\`;
    }

    console.log('DebugPlot webview loaded and listening');
</script>
```

**Key points:**
- **acquireVsCodeApi():** Gets the VS Code API object (required for state persistence, though we don't use it in POC)
- **message listener:** Receives data sent via `postMessage` from the extension
- **Message structure:** `{ variableName: string, values: number[] }`

#### Success Criteria:
- [ ] Webview receives `postMessage` data
- [ ] Console logs show received data
- [ ] Chart title updates with variable name and count
- [ ] TypeScript compiles without errors

---

### Step 5: Render the Chart
**Purpose:** Use Chart.js to render a line chart from the numeric array

#### Implementation:

Complete the `renderChart` function in the webview script:

```typescript
function renderChart(variableName, values) {
    // Update title
    document.getElementById('chartTitle').textContent =
        \`Plot: \${variableName} (\${values.length} values)\`;

    // Generate labels (0, 1, 2, 3, ...)
    const labels = values.map((_, index) => index);

    // Destroy previous chart if it exists
    if (chart) {
        chart.destroy();
    }

    // Create new chart
    const ctx = document.getElementById('chartCanvas');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: variableName,
                data: values,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.1  // Slight curve on lines
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'var(--vscode-editor-foreground)'
                    }
                },
                title: {
                    display: false  // We use our own h2 instead
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Index',
                        color: 'var(--vscode-editor-foreground)'
                    },
                    ticks: {
                        color: 'var(--vscode-editor-foreground)'
                    },
                    grid: {
                        color: 'var(--vscode-editorWidget-border)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value',
                        color: 'var(--vscode-editor-foreground)'
                    },
                    ticks: {
                        color: 'var(--vscode-editor-foreground)'
                    },
                    grid: {
                        color: 'var(--vscode-editorWidget-border)'
                    }
                }
            }
        }
    });

    console.log(\`Chart rendered for \${variableName}\`);
}
```

**Design choices:**
- **Line chart:** Best for visualizing 1D sequential numeric data
- **Index labels:** Simple `[0, 1, 2, ...]` for x-axis
- **Theme integration:** Use VS Code CSS variables for colors
- **Responsive:** Chart adapts to panel size
- **Destroy previous:** Allows re-plotting without creating multiple charts
- **Visual polish:** Moderate point sizes, slight line tension for smoothness

#### Success Criteria:
- [ ] Chart renders successfully
- [ ] X-axis shows indices (0, 1, 2, ...)
- [ ] Y-axis shows data values
- [ ] Chart matches VS Code theme colors
- [ ] Chart is responsive to panel resizing
- [ ] Multiple plots work (previous chart is destroyed)

---

### Step 6: Add Polish and Error Handling
**Purpose:** Improve user experience with better titles, handling edge cases

#### Enhancements:

**A. Add loading state**

The initial HTML shows "Loading..." as the title. This is fine, but we can improve it:

```typescript
// In getWebviewContent, the initial h2:
<h2 id="chartTitle">Preparing chart...</h2>
```

**B. Handle empty data gracefully**

Add validation in the webview:

```typescript
function renderChart(variableName, values) {
    if (!values || values.length === 0) {
        document.getElementById('chartTitle').textContent =
            \`Error: No data to plot for \${variableName}\`;
        return;
    }
    // ... rest of rendering code
}
```

(Note: This should never happen since Phase 2 already validates non-empty data, but defense in depth is good.)

**C. Add a "Refresh" message**

For user clarity, add a subtle note in the HTML:

```html
<div id="chartContainer">
    <canvas id="chartCanvas"></canvas>
</div>
<p style="margin-top: 16px; font-size: 0.9em; color: var(--vscode-descriptionForeground);">
    Run the command again to update the plot with a different variable.
</p>
```

**D. Console logging**

Ensure we have good logging for debugging:
- Extension side: Log when panel is created, what data is sent
- Webview side: Log when message is received, when chart is rendered

#### Success Criteria:
- [ ] Loading state shows initially
- [ ] Empty data handled gracefully (though shouldn't occur)
- [ ] User instructions visible
- [ ] Console logs helpful for debugging

---

### Step 7: Compile and Test
**Purpose:** Verify end-to-end flow with all Phase 2 test variables

#### Build:
```bash
cd poc/extension
npm run compile
```

#### Test Procedure:

1. **Setup:**
   - Open `poc/extension/` in VS Code
   - Press F5 to launch Extension Development Host
   - In the Dev Host, open `poc/test-scripts/plot_test_basic.py`
   - Set breakpoint on `print("done")` line
   - Start debugging (F5)

2. **Basic test — `data_list`:**
   - When paused, run "DebugPlot: Plot Variable" from Command Palette
   - Enter `data_list`
   - Should see: Webview panel opens with title "Plot: data_list"
   - Should see: Line chart showing [1, 4, 9, 16, 25, 36, 49]
   - X-axis: 0 to 6
   - Y-axis: 0 to ~50
   - Chart should have smooth line through points

3. **Test — `data_np` (numpy array):**
   - Run command again, enter `data_np`
   - Should see: New chart or updated chart with [2.0, 3.1, 5.2, 4.8, 7.1, 6.5]
   - Verify: 6 data points displayed correctly

4. **Test — Other variables:**
   - `data_float_list`: [1.1, 2.2, 3.3, 4.4, 5.5]
   - `data_int_range`: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
   - `data_single`: [42] (single point)
   - `data_negative`: [-3, -1, 0, 1, 3] (negative values)

5. **Visual checks:**
   - Chart matches VS Code theme (light/dark)
   - Chart is responsive (resize panel, chart adapts)
   - Axis labels are readable
   - Chart title shows variable name and count

#### Test Matrix:

| Variable | Expected Chart | Visual Check |
|----------|---------------|--------------|
| `data_list` | 7 points rising from 1 to 49 | Quadratic curve |
| `data_np` | 6 points fluctuating 2-7 | Wavy line |
| `data_float_list` | 5 points rising 1.1 to 5.5 | Linear |
| `data_int_range` | 10 points linear 0 to 9 | Straight line |
| `data_single` | 1 point at 42 | Single dot |
| `data_negative` | 5 points from -3 to 3 | Crosses zero |

#### Success Criteria:
- [ ] All test variables render correctly
- [ ] Charts match expected visual patterns
- [ ] Theme integration works in both light/dark mode
- [ ] Panel opens to the side (not covering code)
- [ ] Multiple invocations work (can plot different variables sequentially)
- [ ] No TypeScript compilation errors
- [ ] No runtime errors in Debug Console or webview console

---

## Complete `extension.ts` Target State

After Phase 3, `src/extension.ts` should have these additions:

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('DebugPlot extension is now active');

    const disposable = vscode.commands.registerCommand(
        'debugplot.plotVariable',
        async () => {
            // ... all of Phase 2 code (session check, frame ID, evaluate, parse) ...

            // At the end, instead of showInformationMessage:
            createPlotPanel(context, variableName, data);
            console.log(`DebugPlot: Created chart panel for '${variableName}' with ${data.length} values`);
        }
    );

    context.subscriptions.push(disposable);
}

function createPlotPanel(
    context: vscode.ExtensionContext,
    variableName: string,
    data: number[]
): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
        'debugplotChart',
        `Plot: ${variableName}`,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.postMessage({
        variableName: variableName,
        values: data
    });

    return panel;
}

function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'none';
                   script-src 'unsafe-inline' https://cdn.jsdelivr.net;
                   style-src 'unsafe-inline';
                   img-src https: data:;">
    <title>DebugPlot Chart</title>
    <style>
        body {
            margin: 0;
            padding: 16px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            font-family: var(--vscode-font-family);
        }
        #chartContainer {
            position: relative;
            height: 70vh;
            width: 100%;
        }
        h2 {
            margin-top: 0;
            color: var(--vscode-editor-foreground);
        }
        .info {
            margin-top: 16px;
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <h2 id="chartTitle">Preparing chart...</h2>
    <div id="chartContainer">
        <canvas id="chartCanvas"></canvas>
    </div>
    <p class="info">Run the command again to plot a different variable.</p>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        const vscode = acquireVsCodeApi();
        let chart = null;

        window.addEventListener('message', event => {
            const message = event.data;
            console.log('DebugPlot webview received:', message);

            if (message.variableName && message.values) {
                renderChart(message.variableName, message.values);
            }
        });

        function renderChart(variableName, values) {
            if (!values || values.length === 0) {
                document.getElementById('chartTitle').textContent =
                    \`Error: No data to plot for \${variableName}\`;
                return;
            }

            document.getElementById('chartTitle').textContent =
                \`Plot: \${variableName} (\${values.length} values)\`;

            const labels = values.map((_, index) => index);

            if (chart) {
                chart.destroy();
            }

            const ctx = document.getElementById('chartCanvas');
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: variableName,
                        data: values,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: getComputedStyle(document.body)
                                    .getPropertyValue('--vscode-editor-foreground')
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Index',
                                color: getComputedStyle(document.body)
                                    .getPropertyValue('--vscode-editor-foreground')
                            },
                            ticks: {
                                color: getComputedStyle(document.body)
                                    .getPropertyValue('--vscode-editor-foreground')
                            },
                            grid: {
                                color: getComputedStyle(document.body)
                                    .getPropertyValue('--vscode-editorWidget-border')
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Value',
                                color: getComputedStyle(document.body)
                                    .getPropertyValue('--vscode-editor-foreground')
                            },
                            ticks: {
                                color: getComputedStyle(document.body)
                                    .getPropertyValue('--vscode-editor-foreground')
                            },
                            grid: {
                                color: getComputedStyle(document.body)
                                    .getPropertyValue('--vscode-editorWidget-border')
                            }
                        }
                    }
                }
            });

            console.log(\`Chart rendered for \${variableName}\`);
        }

        console.log('DebugPlot webview loaded and listening');
    </script>
</body>
</html>`;
}

export function deactivate() {}
```

**Note:** VS Code CSS variables can be accessed via `getComputedStyle(document.body).getPropertyValue('--vscode-...')` at runtime in the webview.

---

## Files Changed in Phase 3

| File | Action | Description |
|------|--------|-------------|
| `poc/extension/src/extension.ts` | **Modify** | Add `createPlotPanel` and `getWebviewContent` functions, update command handler |

**No new npm dependencies required** — Chart.js is loaded via CDN in the webview HTML.

---

## Risks and Mitigations

### Risk 1: Chart.js CDN Availability
**Risk:** If the CDN is down or blocked, the chart won't load.
**Mitigation:** For the POC, this is acceptable. Future enhancement could bundle Chart.js locally.
**Detection:** Webview console will show script loading error. Add error handling in webview if needed.

### Risk 2: Content Security Policy Too Restrictive
**Risk:** CSP might block Chart.js or inline scripts.
**Mitigation:** Test the CSP thoroughly. Use `'unsafe-inline'` for scripts in POC (acceptable for local extension). If issues arise, adjust CSP directives.
**Fallback:** Bundle Chart.js as a local resource and use `webview.asWebviewUri()` to load it.

### Risk 3: Theme Color Variables Not Working
**Risk:** `var(--vscode-editor-foreground)` might not be accessible in all contexts.
**Mitigation:** Use `getComputedStyle(document.body).getPropertyValue('--vscode-...')` at runtime in JavaScript instead of CSS for dynamic values.
**Testing:** Test in both light and dark themes.

### Risk 4: Large Data Arrays Overwhelming Chart.js
**Risk:** Very large arrays (thousands of points) might make the chart slow or unresponsive.
**Mitigation:** Out of scope for POC. If encountered during testing, add a note to the accomplishment report.
**Future enhancement:** Downsample data or limit to first N points.

### Risk 5: Multiple Panels Cluttering Workspace
**Risk:** Running the command multiple times creates many chart panels.
**Mitigation:** For POC, this is acceptable behavior (user can close old panels). Phase 4 or 5 could add logic to reuse existing panels.

---

## Definition of Done

Phase 3 is complete when:

1. [ ] `createPlotPanel` function exists and creates a webview panel
2. [ ] `getWebviewContent` function exists and returns HTML with Chart.js
3. [ ] Webview HTML includes proper CSP allowing Chart.js from CDN
4. [ ] Webview HTML uses VS Code theme CSS variables
5. [ ] Extension sends data to webview via `postMessage`
6. [ ] Webview receives data and calls `renderChart`
7. [ ] Chart.js renders a line chart with correct data
8. [ ] Chart shows index labels on x-axis, values on y-axis
9. [ ] Chart title displays variable name and count
10. [ ] Chart matches VS Code theme (light and dark modes tested)
11. [ ] All Phase 2 test variables render correctly as charts
12. [ ] TypeScript compiles with no errors
13. [ ] Code committed to git
14. [ ] Accomplishment report created documenting what works and any issues

---

## Phase 3 → Phase 4 Transition

Once Phase 3 is complete, we will have a working chart visualization. Phase 4 will:

- Add a context menu entry in the debug Variables pane (right-click to plot)
- Change activation events to `onDebug` instead of `onCommand`
- Extract variable name automatically from debug context (if possible)
- Improve UX by reducing the need to type variable names

The interface between Phase 3 and Phase 4 is the command handler: Phase 4 will enhance how the command is invoked, but the core logic (get data → create panel → render chart) remains the same.

---

## Testing Checklist

Use this checklist during Step 7 testing:

### Basic Functionality
- [ ] Extension activates without errors
- [ ] Command appears in Command Palette
- [ ] Command shows warning if no debug session active
- [ ] Webview panel opens when command runs during debug session
- [ ] Panel opens to the side (ViewColumn.Beside)
- [ ] Panel title shows "Plot: {variableName}"

### Chart Rendering
- [ ] Chart appears in webview (not blank)
- [ ] Chart.js loads successfully from CDN
- [ ] Data points match input array
- [ ] X-axis shows indices (0, 1, 2, ...)
- [ ] Y-axis shows correct value range
- [ ] Line connects points smoothly

### Visual Polish
- [ ] Chart matches VS Code theme colors
- [ ] Chart is responsive (resize panel → chart adapts)
- [ ] Title shows variable name and count
- [ ] Axis labels are visible and readable
- [ ] Legend shows variable name
- [ ] Info text appears below chart

### Edge Cases
- [ ] Single-value array (`data_single`) renders as single point
- [ ] Negative values (`data_negative`) display correctly
- [ ] Large array (`data_int_range`) renders without performance issues
- [ ] Running command twice creates new panel (or updates existing, TBD)

### Error Handling
- [ ] No debug session → warning message (from Phase 2)
- [ ] Invalid variable name → error message (from Phase 2)
- [ ] Empty array → error message (from Phase 2, shouldn't reach Phase 3)
- [ ] Console logs show helpful debugging info
- [ ] No unhandled exceptions in Debug Console
- [ ] No errors in webview console (check with F12 dev tools on webview)

### Cross-Platform
- [ ] Works in light theme
- [ ] Works in dark theme
- [ ] (Bonus: test on Windows/Mac/Linux if available, though WSL2 is primary target)

---

**End of Phase 3 Plan**
