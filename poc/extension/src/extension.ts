import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('DebugPlot extension is now active');

    let disposable = vscode.commands.registerCommand(
        'debugplot.plotVariable',
        async () => {
            // Step 1: Check for active debug session
            const session = vscode.debug.activeDebugSession;
            if (!session) {
                vscode.window.showWarningMessage(
                    'DebugPlot: No active debug session. Start debugging first.'
                );
                return;
            }

            let variableName: string | undefined;

            try {
                // Step 2: Get the current frame ID
                const threadsResponse = await session.customRequest('threads');
                if (!threadsResponse.threads || threadsResponse.threads.length === 0) {
                    vscode.window.showWarningMessage(
                        'DebugPlot: No threads available. Is the debugger paused?'
                    );
                    return;
                }
                const threadId = threadsResponse.threads[0].id;

                const stackResponse = await session.customRequest('stackTrace', {
                    threadId: threadId,
                    startFrame: 0,
                    levels: 1
                });

                if (!stackResponse.stackFrames || stackResponse.stackFrames.length === 0) {
                    vscode.window.showWarningMessage(
                        'DebugPlot: No stack frames. Is the debugger paused at a breakpoint?'
                    );
                    return;
                }
                const frameId = stackResponse.stackFrames[0].id;

                // Step 3: Prompt user for variable name
                variableName = await vscode.window.showInputBox({
                    prompt: 'Enter the variable name to plot',
                    placeHolder: 'e.g., data_list, data_np',
                    validateInput: (value) => {
                        if (!value || !value.trim()) {
                            return 'Variable name cannot be empty';
                        }
                        if (!/^[a-zA-Z_][a-zA-Z0-9_.\[\]]*$/.test(value.trim())) {
                            return 'Invalid variable name';
                        }
                        return null;
                    }
                });

                if (!variableName) {
                    return; // User cancelled
                }

                // Step 4: Evaluate expression to serialize variable as JSON
                const expression =
                    `__import__('json').dumps(`
                    + `${variableName}.tolist() if hasattr(${variableName}, 'tolist') `
                    + `else list(${variableName}))`;

                const evalResponse = await session.customRequest('evaluate', {
                    expression: expression,
                    frameId: frameId,
                    context: 'repl'
                });

                // Step 5: Parse the result
                let jsonString: string = evalResponse.result;
                console.log('DebugPlot raw result:', jsonString);

                // Strip Python repr quotes
                if ((jsonString.startsWith("'") && jsonString.endsWith("'"))
                    || (jsonString.startsWith('"') && jsonString.endsWith('"'))) {
                    jsonString = jsonString.slice(1, -1);
                }

                const data: unknown = JSON.parse(jsonString);

                if (!Array.isArray(data) || !data.every(v => typeof v === 'number')) {
                    vscode.window.showErrorMessage(
                        `DebugPlot: No plottable data in '${variableName}' (cannot convert to array)`
                    );
                    return;
                }

                if (data.length === 0) {
                    vscode.window.showErrorMessage(
                        `DebugPlot: No plottable data in '${variableName}' (variable is empty)`
                    );
                    return;
                }

                // Step 6: Success — create the chart panel
                console.log(`DebugPlot: Read ${data.length} values from '${variableName}':`, data);
                createPlotPanel(context, variableName, data as number[]);
                console.log(`DebugPlot: Created chart panel for '${variableName}' with ${data.length} values`);

            } catch (err: any) {
                const varName = variableName || 'variable';
                let userMessage = err.message;

                // Transform common Python errors into user-friendly messages
                if (userMessage.includes("'NoneType' object is not iterable")) {
                    userMessage = `No plottable data in '${varName}' (variable is None)`;
                } else if (userMessage.includes("is not iterable")) {
                    userMessage = `No plottable data in '${varName}' (cannot convert to array)`;
                } else if (userMessage.includes("Unable to find thread")) {
                    userMessage = "Debugger is running but not paused. Pause at a breakpoint first.";
                } else if (userMessage.includes("name '") && userMessage.includes("is not defined")) {
                    // Keep the Python error message as-is for undefined variables (clear enough)
                    userMessage = `Error reading '${varName}': ${userMessage}`;
                } else {
                    // For other errors, add context
                    userMessage = `Error reading '${varName}': ${userMessage}`;
                }

                vscode.window.showErrorMessage(`DebugPlot: ${userMessage}`);
                console.error('DebugPlot error:', err);
            }
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
