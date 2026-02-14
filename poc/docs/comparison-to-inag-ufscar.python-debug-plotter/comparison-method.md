# Comparison Method

## Approach

The two extensions were analyzed using Claude Code (claude-opus-4-6) with parallel automated exploration agents. The goal was to understand each extension's architecture, features, and implementation details from source code alone, then produce a structured comparison.

## Steps

### 1. Initial directory discovery

Listed the contents of the `compare/` directory to identify the two subdirectories: `ext1/` and `ext2/`.

### 2. Parallel source code exploration

Two specialized "Explore" subagents were launched simultaneously, one for each extension:

- **Agent "Explore ext1 extension"** -- explored `ext1/` (DebugPlot)
- **Agent "Explore ext2 extension"** -- explored `ext2/` (Python Debug Plotter)

Each agent was given the same structured prompt asking it to determine:

1. Extension name, description, and metadata (from `package.json`)
2. Overall architecture and key source files
3. How it integrates with the VS Code debugger
4. How it plots/visualizes Python variables
5. What UI it provides (webview, panels, etc.)
6. What plotting libraries or approaches it uses
7. Key features and capabilities
8. Any notable implementation details

The agents ran in the background concurrently (`run_in_background: true`) to save time. Each agent used the Haiku model for cost efficiency and independently read `package.json`, TypeScript source files, Python files, JavaScript files, CSS, test files, and configuration files within its assigned directory.

### 3. Agent outputs

- **ext1 agent** completed in ~51 seconds, using 16 tool calls and ~28K tokens. It read `package.json`, `src/extension.ts`, `src/test/integration.test.ts`, `README.md`, test fixtures, and configuration files.
- **ext2 agent** completed in ~52 seconds, using 13 tool calls and ~34K tokens. It read `package.json`, `src/extension.ts`, `src/webview.ts`, `media/main.js`, `python/data_handler.py`, `media/styles.css`, `tsconfig.json`, and directory listings.

Each agent returned a comprehensive structured summary of its extension.

### 4. Comparison synthesis

The two agent summaries were compared side-by-side to identify differences and similarities across the following dimensions:

- Architecture and code organization
- Supported data types
- Visualization approach and charting library
- Data transfer mechanism and size limits
- Live update behavior
- Debugger session lifecycle management
- Webview communication patterns
- Error handling and robustness
- Test coverage

The comparison was written as a structured document with tables and prose covering each dimension.

## Tools used

| Tool | Purpose |
|---|---|
| `Bash` (ls) | Initial directory listing |
| `Task` (Explore subagent, x2) | Autonomous source code exploration of each extension |
| `TaskOutput` | Retrieving completed agent results |
| `Read` / `Grep` | Inspecting agent output files for the final summaries |

## Limitations

- Analysis was based solely on source code reading; neither extension was built, installed, or executed.
- No runtime testing or performance benchmarking was performed.
- The ext2 test directory was noted but not deeply explored, so test coverage comparison may be incomplete.
- Agent exploration used the Haiku model, which is fast but may miss subtle details that a more thorough manual review would catch.
