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

                // Step 6: Success — display the data
                console.log(`DebugPlot: Read ${data.length} values from '${variableName}':`, data);
                vscode.window.showInformationMessage(
                    `DebugPlot: Read ${data.length} numeric values from '${variableName}'`
                );

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

export function deactivate() {}
