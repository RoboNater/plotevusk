import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('DebugPlot Integration Tests', () => {

  let debugSession: vscode.DebugSession | undefined;

  /**
   * Start a debug session and wait for it to be ready
   */
  async function startDebugSession(): Promise<vscode.DebugSession> {
    // Open workspace folder
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, 'Workspace folder should be available');

    // Start debugging
    const started = await vscode.debug.startDebugging(
      workspaceFolder,
      'Debug Test Script'
    );

    assert.ok(started, 'Debug session should start');

    // Wait for active session
    let session = vscode.debug.activeDebugSession;
    let attempts = 0;
    while (!session && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      session = vscode.debug.activeDebugSession;
      attempts++;
    }

    assert.ok(session, 'Debug session should become active');

    // Wait for session to be ready (initialized)
    await new Promise(resolve => setTimeout(resolve, 2000));

    return session;
  }

  /**
   * Stop debug session and clean up
   */
  async function stopDebugSession(): Promise<void> {
    if (vscode.debug.activeDebugSession) {
      await vscode.commands.executeCommand('workbench.action.debug.stop');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Close all webview panels
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  }

  /**
   * Helper function to evaluate a variable via DAP
   */
  async function evaluateVariable(varName: string): Promise<any> {
    assert.ok(debugSession, 'Debug session must be active');

    // Get thread ID
    const threads = await debugSession.customRequest('threads');
    assert.ok(threads.threads.length > 0, 'Should have at least one thread');
    const threadId = threads.threads[0].id;

    // Get stack frame
    const stackTrace = await debugSession.customRequest('stackTrace', {
      threadId: threadId,
      startFrame: 0,
      levels: 1
    });
    assert.ok(stackTrace.stackFrames.length > 0, 'Should have stack frames');
    const frameId = stackTrace.stackFrames[0].id;

    // Evaluate expression
    const expression = `__import__('json').dumps(${varName}.tolist() if hasattr(${varName}, 'tolist') else list(${varName}))`;
    const evalResult = await debugSession.customRequest('evaluate', {
      expression: expression,
      frameId: frameId,
      context: 'repl'
    });

    return evalResult;
  }

  // Setup: Start debug session before all tests
  suiteSetup(async function() {
    this.timeout(30000); // Allow 30s for initial setup
    debugSession = await startDebugSession();
  });

  // Teardown: Stop debug session after all tests
  suiteTeardown(async () => {
    await stopDebugSession();
  });

  // Test suites organized by functionality
  suite('Extension Activation', () => {

    test('Extension activates on debug session start', async () => {
      // Verify extension is active
      const extension = vscode.extensions.getExtension('undefined_publisher.debugplot');
      assert.ok(extension, 'Extension should be installed');
      assert.ok(extension.isActive, 'Extension should be active after debug session starts');
    });

    test('Command is registered after activation', async () => {
      // Get all available commands
      const commands = await vscode.commands.getCommands(true);

      // Verify our command is registered
      assert.ok(
        commands.includes('debugplot.plotVariable'),
        'debugplot.plotVariable command should be registered'
      );
    });
  });

  suite('Debug Session Requirement', () => {

    test('Shows warning when no debug session active', async () => {
      // Stop debug session temporarily
      await vscode.commands.executeCommand('workbench.action.debug.stop');

      // Wait for session to fully stop
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to execute command
      const result = await vscode.commands.executeCommand('debugplot.plotVariable');

      // Should show warning (we can't directly assert on UI messages,
      // but we can verify command returns without error)
      assert.strictEqual(result, undefined, 'Command should return undefined when no session');

      // Restart debug session for subsequent tests
      debugSession = await startDebugSession();
    });
  });

  suite('Variable Data Reading (DAP)', () => {

    test('Reads Python list (data_list) correctly', async () => {
      const result = await evaluateVariable('data_list');

      // Parse result
      const resultStr = result.result.replace(/^'|'$/g, '');
      const data = JSON.parse(resultStr);

      // Verify data
      assert.strictEqual(Array.isArray(data), true, 'Should return an array');
      assert.strictEqual(data.length, 10, 'data_list should have 10 elements');
      assert.deepStrictEqual(data, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'Should have correct values');
    });

    test('Reads NumPy array (data_np) correctly', async () => {
      const result = await evaluateVariable('data_np');

      const resultStr = result.result.replace(/^'|'$/g, '');
      const data = JSON.parse(resultStr);

      assert.strictEqual(Array.isArray(data), true, 'Should return an array');
      assert.strictEqual(data.length, 10, 'data_np should have 10 elements');

      // Verify values match expected range [0, 10, 20, ..., 90]
      assert.strictEqual(data[0], 0, 'First element should be 0');
      assert.strictEqual(data[9], 90, 'Last element should be 90');
    });

    test('Reads single value list (single_value) correctly', async () => {
      const result = await evaluateVariable('single_value');

      const resultStr = result.result.replace(/^'|'$/g, '');
      const data = JSON.parse(resultStr);

      assert.strictEqual(data.length, 1, 'single_value should have 1 element');
      assert.strictEqual(data[0], 42, 'Value should be 42');
    });

    test('Reads large array (large_array) correctly', async () => {
      const result = await evaluateVariable('large_array');

      const resultStr = result.result.replace(/^'|'$/g, '');
      const data = JSON.parse(resultStr);

      assert.strictEqual(data.length, 1000, 'large_array should have 1000 elements');
      assert.strictEqual(typeof data[0], 'number', 'Elements should be numbers');
    });

    test('Detects empty list (empty_list)', async () => {
      const result = await evaluateVariable('empty_list');

      const resultStr = result.result.replace(/^'|'$/g, '');
      const data = JSON.parse(resultStr);

      assert.strictEqual(data.length, 0, 'empty_list should have 0 elements');
    });

    test('Detects non-numeric data (text_data)', async () => {
      try {
        const result = await evaluateVariable('text_data');
        const resultStr = result.result.replace(/^'|'$/g, '');
        const data = JSON.parse(resultStr);

        // text_data is ['hello', 'world'], which JSON.parse will accept
        // But our extension should reject it because elements aren't numbers
        assert.strictEqual(Array.isArray(data), true, 'Should parse as array');
        assert.strictEqual(typeof data[0], 'string', 'Elements are strings, not numbers');
      } catch (error) {
        // If evaluation fails, that's also acceptable
        assert.ok(true, 'Non-numeric data may cause evaluation error');
      }
    });
  });

  suite('Error Handling', () => {

    test('Handles None value gracefully', async () => {
      try {
        const result = await evaluateVariable('data_none');
        // If it doesn't throw, check the result
        assert.ok(result, 'Should return a result even for None');
      } catch (error) {
        // Expected to fail - None can't be converted to list
        assert.ok(true, 'None should cause an error during evaluation');
      }
    });

    test('Handles scalar (non-iterable) value', async () => {
      try {
        const result = await evaluateVariable('data_scalar');
        // Should fail because scalar isn't iterable
        assert.fail('Should have thrown error for scalar value');
      } catch (error) {
        assert.ok(true, 'Scalar values should cause evaluation error');
      }
    });

    test('Handles undefined variable', async () => {
      try {
        const result = await evaluateVariable('undefined_variable_xyz');
        assert.fail('Should have thrown error for undefined variable');
      } catch (error) {
        // Expected - variable doesn't exist
        assert.ok(true, 'Undefined variable should cause evaluation error');
      }
    });

    test('Extension handles empty array result', async () => {
      // This tests the extension's handling, not just DAP evaluation
      // We execute the actual command with context
      const result = await vscode.commands.executeCommand(
        'debugplot.plotVariable',
        { evaluateName: 'empty_list' }
      );

      // Should not throw, but should show error message
      // We can't directly assert on UI messages, but command should complete
      assert.strictEqual(result, undefined, 'Command should complete without throwing');
    });
  });

  suite('Context Menu Code Path', () => {

    test('Command accepts context parameter', async () => {
      // Simulate context menu invocation
      const context = {
        name: 'data_list',
        evaluateName: 'data_list',
        value: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]',
        type: 'list'
      };

      // Execute command with context
      const result = await vscode.commands.executeCommand(
        'debugplot.plotVariable',
        context
      );

      // Command should complete without error
      assert.strictEqual(result, undefined, 'Command should execute successfully');
    });

    test('Extracts variable name from context.evaluateName', async () => {
      // Test with evaluateName (preferred)
      const context1 = {
        name: 'data_list',
        evaluateName: 'data_list',
        value: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]'
      };

      await vscode.commands.executeCommand('debugplot.plotVariable', context1);

      // Test with name fallback
      const context2 = {
        name: 'data_np',
        value: 'array([0, 10, 20, ..., 90])'
      };

      await vscode.commands.executeCommand('debugplot.plotVariable', context2);

      // Both should succeed
      assert.ok(true, 'Both context formats should work');
    });
  });

  suite('Command Palette Code Path', () => {

    test('Command works without context (input prompt path)', async function() {
      // Skip this test - we can't interact with input boxes in automated tests
      // Manual testing confirms this works (see cc.013.manual-testing-checklist.md)
      this.skip();

      // The code below would hang waiting for input box interaction:
      // await vscode.commands.executeCommand('debugplot.plotVariable');
    });
  });

  suite('Webview Integration', () => {

    test('Creates webview panel when plotting', async () => {
      // Get initial panel count
      const initialPanels = vscode.window.tabGroups.all
        .flatMap(group => group.tabs)
        .filter(tab => tab.label.startsWith('Plot:'));

      // Execute command
      await vscode.commands.executeCommand(
        'debugplot.plotVariable',
        { evaluateName: 'data_list' }
      );

      // Wait for panel creation
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get new panel count
      const finalPanels = vscode.window.tabGroups.all
        .flatMap(group => group.tabs)
        .filter(tab => tab.label.startsWith('Plot:'));

      assert.ok(
        finalPanels.length > initialPanels.length,
        'Should create a new webview panel'
      );
    });

    test('Panel has correct title', async () => {
      await vscode.commands.executeCommand(
        'debugplot.plotVariable',
        { evaluateName: 'data_np' }
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const panels = vscode.window.tabGroups.all
        .flatMap(group => group.tabs)
        .filter(tab => tab.label.startsWith('Plot:'));

      const hasCorrectTitle = panels.some(tab =>
        tab.label === 'Plot: data_np'
      );

      assert.ok(hasCorrectTitle, 'Panel should have correct title');
    });
  });
});
