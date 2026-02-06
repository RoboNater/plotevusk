import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('DebugPlot extension is now active');

    let disposable = vscode.commands.registerCommand(
        'debugplot.plotVariable',
        () => {
            vscode.window.showInformationMessage(
                'Hello from DebugPlot! Ready to plot variables.'
            );
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
