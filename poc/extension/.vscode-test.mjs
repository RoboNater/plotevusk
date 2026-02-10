import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'out/test/**/*.test.js',
  version: 'stable', // Use latest stable VS Code
  workspaceFolder: './src/test/fixtures',
  mocha: {
    ui: 'bdd',
    timeout: 20000, // 20s timeout for debug session setup
    color: true
  },
  launchArgs: [
    '--disable-extensions', // Run in clean environment
    '--disable-workspace-trust' // Avoid trust prompt
  ]
});
