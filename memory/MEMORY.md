# MEMORY.md

## VS Code Extension API Gotchas

- **debugType for Python:** Modern Python extension uses `"debugpy"`, not `"python"`. Use `debugType == 'debugpy' || debugType == 'python'` in `when` clauses for backwards compatibility.
- **debug/variables/context menu argument:** VS Code passes a container object with the DAP variable nested at `.variable` (e.g., `arg.variable.evaluateName`), not the variable directly. Use `arg?.variable ?? arg` to handle both cases.
- **Parameter shadowing in registerCommand:** Avoid naming the command handler parameter `context` inside `activate(context: ExtensionContext)` — it shadows the outer ExtensionContext.
