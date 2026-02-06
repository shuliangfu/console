# @dreamer/console

> A console utility library compatible with Deno and Bun, providing CLI command wrapping, styled output, table display, and user interaction

English | [中文 (Chinese)](./README-zh.md)

[![JSR](https://jsr.io/badges/@dreamer/console)](https://jsr.io/@dreamer/console)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE.md)
[![Tests](https://img.shields.io/badge/tests-106%20passed-brightgreen)](./TEST_REPORT.md)

---

## 🎯 Features

Console utility library providing CLI command wrapping, styled output, table display, and user interaction for simpler, cleaner CLI app development.

---

## ✨ Characteristics

- **Styled output**:
  - Success, error, warning, info messages
  - ANSI colors and styles
  - Auto-detect terminal capability
  - CJK display support
- **Table display**:
  - Multiple table styles
  - Border styles (single, double, rounded)
  - Custom column alignment
  - Key-value tables
  - Progress bars
- **User interaction**:
  - Text input, password input
  - Select, multi-select, confirm
  - Dedicated inputs (email, number, username, etc.)
- **Command wrapping**:
  - CLI command wrapper class
  - Argument parsing, option handling
  - Subcommand support
  - Hooks (before/after)
  - Auto help generation
- **Smart parsing**:
  - Multiple option formats (`--option`, `-o`, `--option=value`)
  - Auto type conversion (string, number, boolean, array)
  - Option validation, conflict detection, dependencies
  - Argument validation and enum support
- **ANSI colors**:
  - Full ANSI color and style support
  - Auto-detect terminal capability
  - Cursor control and screen ops
  - CJK display width calculation

---

## 🎨 Design Principles

**All @dreamer/* packages follow these principles**:

- **Main package (@dreamer/xxx)**: Server-side (Deno and Bun compatible)
- **Client subpackage (@dreamer/xxx/client)**: Client-side (browser)

This provides:
- Clear separation of server and client code
- Avoid server deps in client code
- Better type safety and hints
- Better tree-shaking

---

## 🎯 Use Cases

- **CLI development**: Quick CLI apps
- **Server management**: Start, stop, configure servers
- **Dev tools**: Build tools, code generators, etc.
- **Data display**: Tables, lists, progress bars
- **User interaction**: Interactive config, select, confirm

---

## 📦 Installation

### Deno

```bash
deno add jsr:@dreamer/console
```

### Bun

```bash
bunx jsr add @dreamer/console
```

---

## 🌍 Environment Compatibility

| Environment | Version | Status |
|-------------|---------|--------|
| **Deno** | 2.5+ | ✅ Fully supported |
| **Bun** | 1.0+ | ✅ Fully supported |
| **Server** | - | ✅ Supported (Deno/Bun, requires TTY) |
| **Client** | - | ❌ Not supported (no terminal in browser) |
| **Terminal** | - | 📦 ANSI escape sequences (most modern terminals) |

---

## 🚀 Quick Start

### Command Wrapping

#### Basic Usage

```typescript
import { Command } from "jsr:@dreamer/console";

const cmd = new Command("my-command", "Command description")
  .option({
    name: "verbose",
    alias: "v",
    description: "Show verbose output",
    type: "boolean",
  })
  .option({
    name: "output",
    alias: "o",
    description: "Output file",
    requiresValue: true,
    type: "string",
  })
  .argument({
    name: "file",
    description: "Input file",
    required: true,
  })
  .action(async (args, options) => {
    console.log("Args:", args);
    console.log("Options:", options);
  });

await cmd.execute();
```

#### Keep Application Running (keepAlive)

By default, the process exits after command execution. Use `keepAlive()` to keep it running (e.g. servers, listeners):

```typescript
import { Command } from "jsr:@dreamer/console";

const server = new Command("server", "Start server")
  .option({
    name: "port",
    alias: "p",
    description: "Port number",
    requiresValue: true,
    type: "number",
    defaultValue: 3000,
  })
  .keepAlive() // Important: keep process running, no auto exit
  .action(async (args, options) => {
    const port = options.port as number;
    console.log(`Server starting on port ${port}`);

    // Server logic...
    // Process keeps running, no auto exit
  });

await server.execute();
```

**Note**: Without `keepAlive()`, the process calls `exit(0)` after command completion. Use `keepAlive()` for long-running apps (servers, daemons, listeners).

#### Subcommands

```typescript
import { Command } from "jsr:@dreamer/console";

const app = new Command("app", "Application");

// Create subcommand
const createCmd = app.command("create", "Create resource")
  .alias("c")  // Subcommand alias, shown as "create (c)" in help, supports "app c" routing
  .option({
    name: "name",
    alias: "n",
    description: "Resource name",
    requiresValue: true,
    type: "string",
  })
  .action(async (args, options) => {
    console.log(`Create resource: ${options.name}`);
  });
// Or use app.subcommandAlias("c", "create") to add alias

await app.execute();
```

#### Option Validation and Dependencies

```typescript
import { Command } from "jsr:@dreamer/console";

const cmd = new Command("deploy", "Deploy application")
  .option({
    name: "env",
    description: "Environment",
    requiresValue: true,
    type: "string",
    choices: ["dev", "staging", "prod"], // enum
    required: true,
  })
  .option({
    name: "token",
    description: "Auth token",
    requiresValue: true,
    type: "string",
    validator: (value) => {
      if (value.length < 10) {
        return "Token must be at least 10 characters";
      }
      return true;
    },
  })
  .option({
    name: "force",
    description: "Force deploy",
    type: "boolean",
    conflicts: ["dry-run"], // conflicts with --dry-run
  })
  .option({
    name: "dry-run",
    description: "Dry run",
    type: "boolean",
  })
  .option({
    name: "notify",
    description: "Send notification",
    type: "boolean",
    dependsOn: ["env"], // depends on --env
  })
  .action(async (args, options) => {
    // Handle logic
  });

await cmd.execute();
```

#### Hooks

```typescript
import { Command } from "jsr:@dreamer/console";

const cmd = new Command("task", "Execute task")
  .before(async (args, options) => {
    console.log("Preparing...");
    // Validate env, load config, etc.
  })
  .action(async (args, options) => {
    console.log("Executing task...");
  })
  .after(async (args, options) => {
    console.log("Cleaning up...");
    // Cleanup, save logs, etc.
  });

await cmd.execute();
```

### Styled Output

```typescript
import { success, error, warning, info, title, separator, keyValue, keyValuePairs, list, numberedList } from "jsr:@dreamer/console";

// Basic messages
success("Operation succeeded!");
error("An error occurred!");
warning("Warning message");
info("Info message");

// Title and separator
title("Title");
separator("━", 50);
separator("=", 30); // Custom char and length

// Key-value
keyValue("Version", "1.0.0");
keyValue("Port", 3000);

// Multiple key-values
keyValuePairs({
  name: "Alice",
  age: 30,
  city: "Beijing",
});

// List
list(["Item 1", "Item 2", "Item 3"]);
list(["Item 1", "Item 2"], "→"); // Custom prefix

// Numbered list
numberedList(["First", "Second", "Third"]);
numberedList(["First", "Second"], 0); // Custom start number
```

### Table Display

```typescript
import { table, keyValueTable, progressBar, progressBarLive, progressBarLiveFinish } from "jsr:@dreamer/console";

// Basic table
const data = [
  { name: "Alice", age: 30, city: "Beijing" },
  { name: "Bob", age: 25, city: "Shanghai" },
];

table(data);

// Bordered table
table(data, undefined, {
  border: true,
  borderStyle: "rounded", // "single" | "double" | "rounded"
  header: true,
});

// Custom columns
table(data, [
  { key: "name", label: "Name", align: "left" },
  { key: "age", label: "Age", align: "right" },
  { key: "city", label: "City", align: "center" },
]);

// Key-value table
keyValueTable({
  name: "Alice",
  age: 30,
  city: "Beijing",
});

// Progress bar
progressBar(50, 100); // 50%
progressBar(30, 100, 40, "Progress"); // Custom width and label

// In-place progress bar (same-line refresh in loop)
for (let i = 0; i <= 100; i++) {
  progressBarLive(i, 100, 40, "Processing");
  await new Promise((r) => setTimeout(r, 30));
}
progressBarLiveFinish();
```

### Spinner

```typescript
import { startSpinner, stopSpinner, succeedSpinner, failSpinner } from "jsr:@dreamer/console";

startSpinner("Loading...");
await doSomething();
succeedSpinner("Done"); // or failSpinner("Failed"); or stopSpinner();
```

### User Interaction

```typescript
import { prompt, input, inputEmail, inputNumber, inputPassword, inputUsername, confirm, select, multiSelect, interactiveMenu, interactiveMultiMenu, interactiveMenuSearch, pause } from "jsr:@dreamer/console";

// Text input
const name = await prompt("Enter name:");
const hidden = await prompt("Enter password:", true); // Hidden input

// Dedicated input functions
const email = await inputEmail("Enter email:");
const age = await inputNumber("Enter age:");
const password = await inputPassword("Enter password:");
const username = await inputUsername("Enter username:");
const text = await input("Enter text:");
// input with default and timeout
const nameWithDefault = await input("Name (Enter for default):", { default: "John" });
const quickReply = await input("Input within 3s:", { timeoutMs: 3000 });

// Confirm
const confirmed = await confirm("Continue?");
const confirmedWithDefault = await confirm("Continue?", true); // Default value

// Single select
// select returns selected option index (0-based)
const options = ["Option 1", "Option 2", "Option 3"];
const optionValues = ["1", "2", "3"];
const choiceIndex = await select("Select option:", options);
const choice = optionValues[choiceIndex]; // Get value

// Multi-select
// multiSelect returns selected option indices (0-based)
const multiOptions = ["Option A", "Option B", "Option C"];
const multiOptionValues = ["a", "b", "c"];
const choiceIndices = await multiSelect("Select multiple:", multiOptions);
const selectedValues = choiceIndices.map((idx) => multiOptionValues[idx]);

// Interactive menu (↑↓ + Enter, TTY)
const menuIndex = await interactiveMenu("Select one:", ["Option 1", "Option 2", "Option 3"], 0);

// Interactive multi-select (Space toggle, Enter confirm)
const multiIndices = await interactiveMultiMenu("Select multiple:", ["A", "B", "C"], [], { min: 1, max: 2 });

// Searchable interactive menu (filter + ↑↓ select)
const searchIndex = await interactiveMenuSearch("Select one:", ["Apple", "Banana", "Orange"], 0);

// Pause
await pause("Press Enter to continue...");
```

### ANSI Colors and Styles

```typescript
import { colors, colorize, stripAnsiCodes, shouldUseColor, clearScreen, hideCursor, showCursor, moveCursor, clearLine } from "jsr:@dreamer/console";

// Color constants
console.log(`${colors.red}Red text${colors.reset}`);
console.log(`${colors.green}Green text${colors.reset}`);
console.log(`${colors.blue}Blue text${colors.reset}`);

// colorize function
console.log(colorize("Red text", "red"));
console.log(colorize("Bold text", "green", true));

// Remove ANSI codes
const colored = colorize("Test", "red");
const plain = stripAnsiCodes(colored); // "Test"

// Check if color should be used
if (shouldUseColor()) {
  console.log("Terminal supports color");
}

// Cursor control
clearScreen(); // Clear screen
hideCursor(); // Hide cursor
showCursor(); // Show cursor
moveCursor(10, 20); // Move to position
clearLine(); // Clear current line
```

---

## 📚 API Reference

### Command Class

CLI command wrapper with full parsing and execution.

#### Methods

##### Config

- **`info(description: string): this`** - Set command description
- **`alias(alias: string): this`** - Add command alias
- **`setVersion(version: string): this`** - Set version
- **`setUsage(usage: string): this`** - Set custom usage string
- **`keepAlive(): this`** - Keep process running after command (no auto exit)
- **`example(command: string, description?: string): this`** - Add usage example

##### Options and Arguments

- **`option(option: CommandOption): this`** - Add option
- **`argument(argument: CommandArgument): this`** - Add argument

##### Execution

- **`action(handler: CommandHandler): this`** - Set command handler
- **`before(hook: CommandHook): this`** - Pre-execution hook
- **`after(hook: CommandHook): this`** - Post-execution hook

##### Subcommands

- **`command(name: string, description?: string): Command`** - Add subcommand
- **`subcommand.alias(alias: string): this`** - Register subcommand alias (e.g. `create (c)`, `app c` routing)
- **`subcommandAlias(alias: string, commandName: string): this`** - Add subcommand alias

##### Other

- **`showHelp(): void`** - Show help
- **`execute(args?: string[]): Promise<void>`** - Execute command

#### CommandOption

```typescript
interface CommandOption {
  name: string;                    // Option name (long, e.g. --help)
  alias?: string;                  // Alias (short, e.g. -h)
  description: string;             // Description
  requiresValue?: boolean;        // Requires value
  defaultValue?: string | boolean | number; // Default
  type?: "string" | "number" | "boolean" | "array"; // Value type
  validator?: (value: string) => boolean | string; // Validator
  group?: string;                  // Option group
  required?: boolean;             // Required
  conflicts?: string[];           // Conflicting options
  dependsOn?: string[];           // Dependent options
  choices?: string[];            // Enum values
}
```

#### CommandArgument

```typescript
interface CommandArgument {
  name: string;                    // Argument name
  description: string;             // Description
  required?: boolean;             // Required
  validator?: (value: string) => boolean | string; // Validator
  choices?: string[];             // Enum values
}
```

### Output Utilities

- **`success(message: string): void`** - Success message (green ✓)
- **`error(message: string): void`** - Error message (red ✗)
- **`warning(message: string): void`** - Warning message (yellow ⚠)
- **`info(message: string): void`** - Info message (blue ℹ)
- **`separator(char?: string, length?: number): void`** - Separator (default: ━, 50 chars)
- **`title(title: string): void`** - Title (bold, cyan)
- **`keyValue(key: string, value: string | number): void`** - Key-value pair
- **`keyValuePairs(data: Record<string, string | number>): void`** - Multiple key-values
- **`list(items: string[], prefix?: string): void`** - List (default prefix: •)
- **`numberedList(items: string[], start?: number): void`** - Numbered list (default start: 1)

### Table Utilities

- **`table(data: Record<string, any>[], columns?: TableColumn[], options?: TableOptions): void`** - Create table
- **`keyValueTable(data: Record<string, any>, options?: TableOptions): void`** - Key-value table
- **`progressBar(current: number, total: number, width?: number, label?: string): void`** - Progress bar (single output)
- **`progressBarLive(current: number, total: number, width?: number, label?: string): void`** - In-place progress bar (same-line refresh)
- **`progressBarLiveFinish(): void`** - Finish in-place progress bar and newline

#### TableColumn

```typescript
interface TableColumn {
  key: string;                     // Data key
  label?: string;                  // Column header (default: key)
  align?: "left" | "right" | "center"; // Alignment (default: left)
  width?: number;                  // Column width (auto)
}
```

#### TableOptions

```typescript
interface TableOptions {
  border?: boolean;                // Show border
  borderStyle?: "single" | "double" | "rounded"; // Border style
  header?: boolean;                // Show header
}
```

### Prompt Utilities

- **`prompt(message: string, hidden?: boolean, options?: PromptOptions): Promise<string | null>`** - Text input. `options.default` for default on empty Enter, `options.timeoutMs` for timeout (returns `default` or `null`)
- **`input(message: string, options?: InputOptions): Promise<string | null>`** - Text input. Same `options.default`, `options.timeoutMs`
- **`inputEmail(message: string): Promise<string | null>`** - Email input (with validation)
- **`inputNumber(message: string): Promise<number | null>`** - Number input (with validation)
- **`inputPassword(message: string): Promise<string | null>`** - Password input (hidden)
- **`inputUsername(message: string): Promise<string | null>`** - Username input (with validation)
- **`confirm(message: string, defaultValue?: boolean): Promise<boolean>`** - Confirm
- **`select(message: string, options: string[], defaultValue?: number): Promise<number>`** - Single select (returns index, 0-based)
- **`multiSelect(message: string, options: string[], min?: number, max?: number): Promise<number[]>`** - Multi-select (returns indices)
- **`interactiveMenu(message: string, options: string[], defaultValue?: number): Promise<number>`** - Interactive single menu (↑↓ + Enter, TTY)
- **`interactiveMultiMenu(message: string, options: string[], initialSelected?: number[], menuOptions?: InteractiveMultiMenuOptions): Promise<number[]>`** - Interactive multi menu (Space toggle, ↑↓, Enter). `menuOptions.min` / `menuOptions.max` for min/max selection
- **`interactiveMenuSearch(message: string, options: string[], defaultValue?: number): Promise<number>`** - Searchable interactive menu (filter + ↑↓ + Enter)
- **`pause(message?: string): Promise<void>`** - Pause until Enter

### Spinner

- **`startSpinner(text?: string): void`** - Start spinner (optional message)
- **`stopSpinner(): void`** - Stop spinner (no result output, clear line only)
- **`succeedSpinner(text?: string): void`** - Stop and output success (green ✓)
- **`failSpinner(text?: string): void`** - Stop and output failure (red ✗)

### ANSI Utilities

- **`colors`** - ANSI color codes (reset, bright, dim, red, green, yellow, blue, magenta, cyan, white, gray)
- **`colorize(text: string, color: keyof typeof colors, bold?: boolean): string`** - Add color to text
- **`stripAnsiCodes(text: string): string`** - Remove ANSI codes
- **`shouldUseColor(): boolean`** - Check if color should be used (env, TTY, Docker)
- **`clearScreen(): void`** - Clear screen
- **`hideCursor(): void`** - Hide cursor
- **`showCursor(): void`** - Show cursor
- **`moveCursor(row: number, col: number): void`** - Move cursor
- **`clearLine(): void`** - Clear current line

---

## 🧪 Testing

### Run Tests

```bash
# Deno
deno test --allow-env tests/mod.test.ts

# Bun
bun test tests/mod.test.ts
```

### Test Report

See [TEST_REPORT.md](./TEST_REPORT.md) for details.

Coverage:
- ✅ 106 tests all passed
- ✅ 8 feature modules (Spinner, mod exports, types)
- ✅ Deno and Bun cross-runtime
- ✅ Edge cases and error handling

---

## 📝 Notes

- **keepAlive()**: Required for long-running apps (servers, listeners); otherwise process exits after command.
- **Color support**: Auto-detects terminal color support; disabled in non-TTY or Docker.
- **CJK support**: Help supports CJK; CJK chars count as 2 display width.
- **Option formats**: `--option`, `-o`, `--option=value`, `--option value`.
- **Type conversion**: Option values auto-converted by `type` (string, number, boolean, array).
- **Validation**: Option/argument validation, conflict detection, dependencies.

---

## 🤝 Contributing

Issues and Pull Requests welcome!

---

## 📄 License

MIT License - see [LICENSE.md](./LICENSE.md)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
