import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/**/*.test.js',
  version: 'stable', // Use latest stable VS Code
  workspaceFolder: './src/test/fixtures',
  mocha: {
    ui: 'tdd', // Use TDD style (suite/test) instead of BDD (describe/it)
    timeout: 30000, // 30s timeout for debug session setup
    color: true
  },
  launchArgs: [
    '--disable-workspace-trust', // Avoid trust prompt
    // Use system Python extension if available
    '--extensions-dir=' + (process.env.HOME || process.env.USERPROFILE) + '/.vscode-server/extensions'
  ],
  extensionDevelopmentPath: process.cwd()
});
