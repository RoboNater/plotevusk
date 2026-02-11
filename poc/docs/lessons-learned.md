# Lessons Learned — DebugPlot Extension Development

**Last Updated:** 2026-02-10

---

## 1. ESLint 9 Requires Flat Config

**Context:** The Yeoman `generator-code` scaffolds a project with ESLint 9 as a devDependency but does not generate the required configuration file.

**Problem:** Running `npm run lint` (or `npm test`, which calls lint via `pretest`) fails with:
```
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
```

**Solution:** Create `eslint.config.mjs` manually. A minimal working example for a TypeScript VS Code extension:

```js
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    plugins: { "@typescript-eslint": typescriptEslint },
    languageOptions: { parser: tsParser, ecmaVersion: 2022, sourceType: "module" },
    rules: {
      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
    },
  },
  { ignores: ["out/**", "dist/**", "**/*.d.ts"] },
];
```

**Gotcha:** The `@typescript-eslint/semi` rule no longer exists in recent versions of the plugin. Remove it or you get a "Could not find semi" error.

---

## 2. Mocha UI Style Must Match Test Code

**Context:** VS Code extension tests use Mocha under the hood via `@vscode/test-cli`.

**Problem:** If `.vscode-test.mjs` specifies `ui: 'bdd'` but test files use `suite()` / `test()` / `suiteSetup()` / `suiteTeardown()`, you get:
```
ReferenceError: suite is not defined
```

**Solution:** Match the Mocha `ui` setting to the test code style:
- **TDD style** (`ui: 'tdd'`): `suite`, `test`, `suiteSetup`, `suiteTeardown`
- **BDD style** (`ui: 'bdd'`): `describe`, `it`, `before`, `after`

The Yeoman generator creates test files in TDD style by default, so use `ui: 'tdd'`.

---

## 3. VS Code Test Runner and Third-Party Extensions

**Context:** Integration tests that exercise Python debugging need the Python extension to be loaded in the test VS Code instance.

**Problem:** The test runner downloads a standalone VS Code instance that has no extensions installed. Using `--disable-extensions` (a common test config default) makes this worse. Several approaches that do NOT work:

- `installExtensions: ['ms-python.python']` in `.vscode-test.mjs` — not a supported config option
- `async setup()` function in `.vscode-test.mjs` — causes `DataCloneError` because the config object is structurally cloned and functions can't be cloned
- `--install-extension=ms-python.python` as a launch arg — silently ignored by the test runner
- Calling the downloaded VS Code binary directly in WSL — refuses to run with "please install in Windows" message

**Solution:** Point the test runner at your existing system extensions directory:

```js
launchArgs: [
  '--extensions-dir=' + process.env.HOME + '/.vscode-server/extensions'
]
```

This reuses the Python extension (and debugpy) already installed in your VS Code Server. Fast and reliable, but requires the developer to have the Python extension installed.

**Trade-off:** This couples tests to the developer's local environment. For CI, you would need a different approach (e.g., `xvfb-run` with a pre-install step).

---

## 4. Debug Sessions in Tests Need Explicit Pausing

**Context:** Tests that evaluate Python variables need the debugger to be paused at a point where those variables exist in scope.

**Problem:** Three failure modes encountered:
1. **`stopOnEntry: true`** — Debugger pauses at line 1, before any variables are defined. Tests get `NameError: name 'data_np' is not defined`.
2. **`stopOnEntry: false` with no pause** — Script runs to completion. Tests get `No debugger available, can not send 'threads'`.
3. **Restarting debug session mid-test** — After stopping and restarting, the thread may not be in a paused state. Tests get `Unable to find thread for evaluation`.

**Solution:** Use Python's built-in `breakpoint()` function at the end of the test script, after all variables are defined:

```python
data_list = [1, 2, 3, 4, 5]
data_np = np.array([0, 10, 20])
# ... more variable definitions ...

print("Test data loaded")
breakpoint()  # Debugger pauses here — all variables in scope
print("done")
```

This guarantees the debugger is paused at a point where all test variables are accessible.

---

## 5. Input Boxes and Dialogs Cannot Be Tested Automatically

**Context:** The Command Palette code path triggers `vscode.window.showInputBox()`, which opens a UI dialog.

**Problem:** In the automated test environment, `showInputBox()` returns a Promise that never resolves (no user to type input). The test hangs until it hits the Mocha timeout:
```
Error: Timeout of 30000ms exceeded.
```

**Solution:** Skip these tests and document them for manual verification:

```typescript
test('Command works without context', async function() {
  this.skip();
  // Manual testing confirms this works
});
```

**General principle:** Any VS Code API that requires user interaction (`showInputBox`, `showQuickPick`, `showOpenDialog`, etc.) cannot be tested in the automated test runner. Plan for manual testing of these paths from the start.

---

## 6. The `pretest` Script Chain Can Mask the Real Problem

**Context:** `package.json` defines `"pretest": "npm run compile && npm run lint"`, so `npm test` runs compile, then lint, then tests.

**Problem:** When ESLint fails, the error output says `npm test` failed, but the actual failure happened in the `pretest` phase. It's easy to misread this as a test failure rather than a lint failure.

**Tip:** When debugging test failures, check whether the error occurs before or after the `vscode-test` line in the output. If it's before, the issue is in compilation or linting, not in the tests themselves.

---

## 7. Copilot/GitHub Auth Errors in Test Output Are Noise

**Context:** When using `--extensions-dir` pointing to system extensions, extensions like GitHub Copilot also load in the test instance.

**Problem:** Test output is cluttered with authentication errors:
```
rejected promise not handled within 1 second: Error: GitHubLoginFailed
```

**Solution:** These errors are harmless noise — they don't affect test results. If they become distracting, you could create a dedicated extensions directory with only the Python extension, but for a POC this is unnecessary overhead.

---

## Summary Table

| Lesson | Category | Impact |
|--------|----------|--------|
| ESLint 9 flat config | Build tooling | Blocks all testing |
| Mocha UI style mismatch | Test framework | Blocks all testing |
| Third-party extensions in test runner | Test environment | Blocks debug tests |
| Debug session pausing | Test design | Blocks variable evaluation tests |
| Input box automation limits | Test design | Causes timeout failures |
| `pretest` chain masking errors | Debugging | Wastes investigation time |
| Copilot auth noise | Test output | Cosmetic distraction |
