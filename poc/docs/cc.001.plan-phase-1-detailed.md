# Phase 1 Detailed Plan - Scaffold & Hello World

**Phase:** 1 of 5
**Goal:** Generate a working VS Code extension that responds to a basic command
**Success Criteria:** Extension loads in Development Host and shows "Hello from DebugPlot!" notification

---

## Prerequisites Check

### Required Tools Status
| Tool | Status | Version | Action |
|------|--------|---------|--------|
| Node.js | ✅ Installed | v24.11.1 | Ready |
| npm | ✅ Installed | 11.6.4 | Ready |
| Python 3 | ✅ Installed | 3.12.3 | Ready |
| numpy | ✅ Installed | 1.26.4 | Ready |
| NVM | ✅ Installed | 0.40.2 | Ready |
| Yeoman (yo) | ❌ Missing | - | **Install required** |
| generator-code | ❌ Missing | - | **Install required** |
| vsce | ❌ Missing | - | **Install required** |

---

## Step-by-Step Implementation

### Step 1: Install Required Tools
**Estimated Time:** 2-3 minutes
**Purpose:** Install Yeoman, VS Code extension generator, and extension packager

#### Commands:
```bash
# Install Yeoman and VS Code extension generator
npm install -g yo generator-code

# Install VS Code Extension Manager
npm install -g @vscode/vsce

# Verify installations
yo --version
vsce --version
```

#### Expected Output:
- `yo --version` → 4.x or higher
- `vsce --version` → 2.x or higher

#### Success Criteria:
- [ ] yo command is available
- [ ] vsce command is available
- [ ] No installation errors

---

### Step 2: Create Extension Directory Structure
**Estimated Time:** 1 minute
**Purpose:** Set up clean workspace for the extension

#### Commands:
```bash
cd /home/alfred/lw/w514-plot-in-vscode/poc
mkdir -p extension
cd extension
```

#### Expected Output:
- Working directory: `/home/alfred/lw/w514-plot-in-vscode/poc/extension`

#### Success Criteria:
- [ ] Directory created
- [ ] Current working directory confirmed

---

### Step 3: Generate Extension with Yeoman
**Estimated Time:** 3-5 minutes
**Purpose:** Scaffold a TypeScript-based VS Code extension

#### Command:
```bash
yo code
```

#### Interactive Prompts & Answers:
| Prompt | Answer | Rationale |
|--------|--------|-----------|
| What type of extension? | **New Extension (TypeScript)** | Need full extension with commands |
| Extension name? | **debugplot** | Simple, descriptive name |
| Extension identifier? | **debugplot** | Accept default |
| Description? | **Plot numeric variables during Python debugging** | Clear purpose |
| Initialize git repository? | **No** | Already in git repo |
| Bundle source code with webpack? | **No** | Keep simple for POC |
| Package manager? | **npm** | Using npm (already have it) |

#### Expected Output:
- Extension scaffolded in current directory
- `package.json` created
- `src/extension.ts` created
- `node_modules/` installed
- Success message from yo

#### Generated Structure:
```
poc/extension/
├── .vscode/
│   ├── launch.json          # Debug configuration for testing
│   └── tasks.json           # Build tasks
├── src/
│   ├── extension.ts         # Main extension code
│   └── test/                # Test files
├── .vscodeignore            # Files to exclude from package
├── package.json             # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md                # Generated README
```

#### Success Criteria:
- [ ] All files generated without errors
- [ ] `npm install` completed successfully
- [ ] `package.json` exists with correct name and description

---

### Step 4: Understand Generated Code
**Estimated Time:** 5 minutes
**Purpose:** Review key files before modifications

#### Files to Review:

**4.1 - `package.json` (Extension Manifest)**
Key sections to understand:
- `name`: Extension identifier
- `displayName`: User-facing name
- `activationEvents`: When extension activates
- `contributes.commands`: Commands exposed to users
- `engines.vscode`: Minimum VS Code version

**4.2 - `src/extension.ts` (Main Extension Code)**
Key functions:
- `activate()`: Called when extension is activated
- `deactivate()`: Cleanup when extension is deactivated
- Command registration: `vscode.commands.registerCommand()`

**4.3 - `.vscode/launch.json` (Debug Configuration)**
- Pre-configured to run Extension Development Host
- Press F5 to test extension

#### Success Criteria:
- [ ] Understand where commands are registered
- [ ] Understand activation events
- [ ] Know how to launch Extension Development Host

---

### Step 5: Modify Extension for DebugPlot
**Estimated Time:** 5-7 minutes
**Purpose:** Customize the generated extension for our use case

#### 5.1 - Update `package.json`
**Changes needed:**
```json
{
  "name": "debugplot",
  "displayName": "DebugPlot",
  "description": "Plot numeric variables during Python debugging",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.95.0"
  },
  "categories": [
    "Debuggers",
    "Visualization"
  ],
  "activationEvents": [
    "onCommand:debugplot.plotVariable"
  ],
  "contributes": {
    "commands": [
      {
        "command": "debugplot.plotVariable",
        "title": "Plot Variable",
        "category": "DebugPlot"
      }
    ]
  }
}
```

**Key changes:**
- Command ID: `debugplot.plotVariable`
- Command title: "Plot Variable"
- Category: Changed to "Debuggers" and "Visualization"
- Activation: Only when command is invoked

#### 5.2 - Update `src/extension.ts`
**Changes needed:**
```typescript
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
```

**Key changes:**
- Command ID matches `package.json`: `debugplot.plotVariable`
- Message clearly identifies the extension
- Simple test that doesn't require debug session

#### Success Criteria:
- [ ] `package.json` updated correctly
- [ ] `src/extension.ts` updated correctly
- [ ] No syntax errors (TypeScript compiler should be happy)

---

### Step 6: Compile TypeScript
**Estimated Time:** 1-2 minutes
**Purpose:** Transpile TypeScript to JavaScript

#### Command:
```bash
npm run compile
```

#### Expected Output:
- TypeScript compiled successfully
- Output in `out/` directory
- No compilation errors

#### Success Criteria:
- [ ] Compilation succeeds
- [ ] `out/extension.js` exists
- [ ] No TypeScript errors

---

### Step 7: Test in Extension Development Host
**Estimated Time:** 5 minutes
**Purpose:** Verify the extension loads and responds to command

#### Steps:
1. **Open Extension in VS Code:**
   ```bash
   code /home/alfred/lw/w514-plot-in-vscode/poc/extension
   ```

2. **Launch Extension Development Host:**
   - Press `F5` (or Run → Start Debugging)
   - New VS Code window opens with extension loaded
   - Title bar shows "[Extension Development Host]"

3. **Trigger the Command:**
   - Press `Ctrl+Shift+P` (Command Palette)
   - Type: "DebugPlot: Plot Variable"
   - Select the command
   - Should see notification: "Hello from DebugPlot! Ready to plot variables."

4. **Verify in Debug Console:**
   - Original VS Code window shows Debug Console
   - Should see: "DebugPlot extension is now active"

#### Success Criteria:
- [ ] Extension Development Host launches without errors
- [ ] Command appears in Command Palette
- [ ] Notification displays correctly
- [ ] Console log appears in Debug Console

---

### Step 8: Verify Extension Structure
**Estimated Time:** 2 minutes
**Purpose:** Ensure all files are in correct locations

#### Directory Check:
```bash
cd /home/alfred/lw/w514-plot-in-vscode/poc/extension
ls -la
```

#### Expected Structure:
```
poc/extension/
├── .vscode/
├── node_modules/         # Dependencies installed
├── out/                  # Compiled JavaScript
│   └── extension.js
├── src/                  # TypeScript source
│   └── extension.ts
├── package.json          # Updated manifest
├── package-lock.json     # Dependency lock file
└── tsconfig.json         # TypeScript config
```

#### Success Criteria:
- [ ] All directories present
- [ ] `out/extension.js` exists (compiled output)
- [ ] `node_modules/` contains dependencies

---

## Testing & Validation

### Manual Test Checklist
- [ ] Extension loads in Development Host without errors
- [ ] Command appears in Command Palette with correct name
- [ ] Command executes and shows notification
- [ ] Console log confirms activation
- [ ] Extension unloads cleanly when Development Host closes

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Command not found | Command doesn't appear in palette | Check `package.json` command ID matches `extension.ts` |
| Extension not activating | No console log appears | Check `activationEvents` in `package.json` |
| Compilation errors | TypeScript fails to compile | Review syntax in `extension.ts`, check imports |
| Module not found | Import errors | Run `npm install` to ensure dependencies installed |

---

## Deliverables

### Phase 1 Outputs
- [ ] Working extension in `poc/extension/`
- [ ] `package.json` configured with DebugPlot command
- [ ] `src/extension.ts` with basic command handler
- [ ] Compiled JavaScript in `out/`
- [ ] Successfully tested in Extension Development Host

### Next Phase Preparation
- Extension structure ready for Phase 2 enhancements
- Command registration pattern established
- Development workflow validated

---

## Phase 1 Complete - Definition of Done

✅ **Phase 1 is complete when:**
1. All required tools installed (yo, generator-code, vsce)
2. Extension generated in `poc/extension/`
3. Command "DebugPlot: Plot Variable" registered
4. Extension loads in Development Host
5. Command shows "Hello from DebugPlot!" notification
6. No errors in Debug Console
7. Code committed to git (optional but recommended)

**Estimated Total Time:** 25-35 minutes

---

## Notes for Phase 2

Phase 2 will build on this foundation by:
- Hooking into active debug session
- Reading variables using Debug Adapter Protocol
- Serializing data from Python to JSON

But for now, we have a working extension skeleton! 🎉
