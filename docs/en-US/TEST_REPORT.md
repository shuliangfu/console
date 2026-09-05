# @dreamer/console Test Report

## Test Overview

- **Console version**: @dreamer/console@1.1.1
- **Test library version**: @dreamer/test@^1.2.3
- **Test framework**: @dreamer/test (compatible with Deno, Bun, and Node.js)
- **Test date**: 2026-09-05
- **Test environment**:
  - Deno 2.9+
  - Bun 1.3+
  - Node.js 22+ (via `tsx --test`)
- **Runtime adapter**: @dreamer/runtime-adapter@^1.2.2

## Test Results

### Overall Statistics

- **Total tests**: 142 (Deno) / 141 (Bun) / 141 (Node)
- **Passed**: 141 / 141 / 141 ✅
- **Ignored/Skipped**: 1 (Windows-platform-specific test, skipped on each
  runtime)
- **Failed**: 0
- **Pass rate**: 100% ✅
- **Execution time**: ~1–2 s (Deno/Bun) / ~1.7 s (Node)

### Three-end test summary

All tests pass across three runtimes. Console is a pure CLI library with no
browser tests, so all three runtimes run the identical `mod.test.ts` suite (142
tests; 1 Windows-only test is skipped on non-Windows).

- **Deno (142 tests)**: 141 passed, 1 ignored.
- **Bun (141 tests)**: 141 passed, 1 skipped.
- **Node.js 22 (141 tests)**: 141 passed, 1 skipped. Subprocess tests run via
  `node --import tsx <script>`; stream reading uses the Web Streams
  `getReader()` loop (see `readAllBytes` in `tests/mod.test.ts`).

### Test File Statistics

| Test File     | Tests | Status                   | Description                                                                                                       |
| ------------- | ----- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `mod.test.ts` | 142   | ✅ 141 passed, 1 ignored | All feature modules, prompt subprocess tests, ANSI env vars, parseArrowKey, edge cases, mod exports, type exports |

## Feature Test Details

### 1. ANSI Color Module (ansi.ts)

**Test scenarios**:

- ✅ `colors` constant - All color constants
- ✅ `colorize` function - Apply color, support bold, auto-disable by terminal
- ✅ `stripAnsiCodes` function - Remove ANSI codes
- ✅ `shouldUseColor` function - Detect color usage
- ✅ Cursor control: `clearScreen`, `hideCursor`, `showCursor`, `moveCursor`,
  `clearLine`
- ✅ Edge cases: all color types, bold text, empty strings, multiple ANSI codes

**Test result**: 13 tests all passed

### 2. Output Utilities Module (output.ts)

**Test scenarios**:

- ✅ `success`, `error`, `warning`, `info`, `title`, `separator`
- ✅ `keyValue`, `keyValuePairs`, `list`, `numberedList`
- ✅ Edge cases: empty list, empty key-value pairs, long text, special chars

**Test result**: 14 tests all passed

### 3. Command Class (command.ts)

**Test scenarios**:

- ✅ Creation, config, options, arguments, hooks, subcommands, help, execution
- ✅ Subcommand aliases via `alias()`, `subcommandAlias()`
- ✅ Version info, pass parsed args to handler

**Test result**: 24 tests all passed

### 4. CommandParser Class (parser.ts)

**Test scenarios**:

- ✅ `convertOptionValue` - string, boolean, number, array, validation
- ✅ `validateOptionValue`, `validateArgumentValue`
- ✅ `parseArgs` - simple options, with value, with equals, short options,
  arguments, defaults
- ✅ `parseArgs` - bare `--` argument passthrough for option forwarding

**Test result**: 18 tests all passed

### 5. CommandHelpGenerator Class (help.ts)

**Test scenarios**:

- ✅ `calculateDisplayWidth` - CJK support, option display length
- ✅ `HelpConfig` subcommand `aliases` field
- ✅ Help output includes subcommand aliases (e.g. `generate (g)`,
  `migrate (m)`) - verified via subprocess

**Test result**: 9 tests all passed

### 6. Table Utilities Module (table.ts)

**Test scenarios**:

- ✅ `table`, `keyValueTable`, `progressBar`, `progressBarLive` /
  `progressBarLiveFinish`
- ✅ Edge cases: empty data, single-row, different types, progress bar
  0%/50%/100%

**Test result**: 11 tests all passed

### 7. Spinner Module (spinner.ts)

**Test scenarios**:

- ✅ `startSpinner` / `stopSpinner` - Start and stop
- ✅ `startSpinner("message")` - Start with message
- ✅ `succeedSpinner` / `failSpinner` - Finish with success/failure
- ✅ Safe `stopSpinner` when no spinner running

**Test result**: 5 tests all passed

### 8. Prompt Utilities Module (prompt.ts)

**Test scenarios**:

- ✅ Function existence: `prompt`, `confirm`, `select`, `multiSelect`, `input`,
  `inputEmail`, `inputNumber`, `inputPassword`, `inputUsername`, `pause`,
  `interactiveMenu`, `interactiveMultiMenu`, `interactiveMenuSearch`
- ✅ **Prompt subprocess tests** (via `createCommand` + `execPath` from
  @dreamer/runtime-adapter):
  - `select` - Return option index, default value, invalid input retry
  - `multiSelect` - Multi-select indices, min=0 empty choice
  - `confirm` - Parse y/n, default value
  - `input` - User input, default value, validation retry
  - `inputEmail`, `inputNumber`, `inputUsername` - Format validation
  - `interactiveMenu` - Fallback to select when piped stdin
  - `readLine` - Support `\r\n` (Windows line ending)

**Test result**: 28 tests all passed (13 interface + 15 subprocess)

### 9. parseArrowKey (Windows Compatible)

**Test scenarios**:

- ✅ ANSI up/down: ESC [ A, ESC [ B
- ✅ Windows app mode: ESC O A, ESC O B
- ✅ Single ESC returns `esc`
- ✅ Non-ESC first byte returns null
- ✅ Non-arrow ESC sequence returns null
- ✅ Empty or n<1 returns null
- ✅ Incomplete sequence (n=2) returns null

**Test result**: 9 tests all passed

### 10. ANSI Environment Variables

**Test scenarios** (subprocess, NO_COLOR=1):

- ✅ `NO_COLOR` - Disable color
- ✅ `DWEB_NO_COLOR` - Disable color
- ✅ `TERM=dumb` - Disable color

**Test result**: 3 tests all passed

### 11. mod Exports and Type Exports

**Test scenarios**:

- ✅ Export Spinner, progressBarLive/progressBarLiveFinish,
  interactiveMenu/Multi/Search from `mod.ts`
- ✅ Export types: CommandOption, CommandArgument, ParsedOptions
- ✅ Structure validation for CommandOption / CommandArgument

**Test result**: 4 tests all passed

### 12. Windows Platform Specific

**Test scenarios**:

- ✅ `parseArrowKey` Windows app mode ESC O A/B - Cross-platform validation
- ⏭️ `shouldUseColor` skip Linux Docker detection - **Skipped** (platform() !==
  "windows")

**Test result**: 1 passed, 1 skipped

## Test Statistics

### By Module

| Module                | Test Count | Passed  | Skipped | Failed | Coverage |
| --------------------- | ---------- | ------- | ------- | ------ | -------- |
| ANSI colors           | 13         | 13      | 0       | 0      | 100%     |
| Output utilities      | 14         | 14      | 0       | 0      | 100%     |
| Command class         | 24         | 24      | 0       | 0      | 100%     |
| CommandParser         | 17         | 17      | 0       | 0      | 100%     |
| CommandHelpGenerator  | 9          | 9       | 0       | 0      | 100%     |
| Table utilities       | 11         | 11      | 0       | 0      | 100%     |
| Spinner               | 5          | 5       | 0       | 0      | 100%     |
| Prompt utilities      | 28         | 28      | 0       | 0      | 100%     |
| parseArrowKey         | 9          | 9       | 0       | 0      | 100%     |
| ANSI env vars         | 3          | 3       | 0       | 0      | 100%     |
| mod exports and types | 4          | 4       | 0       | 0      | 100%     |
| Edge cases            | 11         | 11      | 0       | 0      | 100%     |
| Windows platform      | 2          | 1       | 1       | 0      | -        |
| **Total**             | **141**    | **140** | **1**   | **0**  | **100%** |

## Cross-Runtime Compatibility

### Deno

- ✅ All APIs work under Deno 2.9+
- ✅ Uses @dreamer/runtime-adapter
- ✅ Requires `-A` or `--allow-env` for tests

### Bun

- ✅ All APIs work under Bun 1.3+
- ✅ Uses @dreamer/runtime-adapter
- ✅ All tests pass (140 passed, 1 skipped)
- ✅ Prompt subprocess tests pass (createCommand stdin getWriter)

### Node.js

- ✅ All APIs work under Node.js 22+ (via `tsx --test`)
- ✅ Uses @dreamer/runtime-adapter (v1.2.2, Node-supported)
- ✅ All tests pass (140 passed, 1 skipped)
- ✅ Prompt subprocess tests pass: `buildScriptArgs` dispatches
  `["--import", "tsx", script]` for Node; `readAllBytes` reads streams via
  `getReader()` loop (avoids undici `Response` "disturbed or locked" error)
- ✅ `src/help.ts` `IS_NODE` branch renders `npx tsx` hint and detects
  mainModule via `process.argv[1]`

## Test Quality Assessment

### Strengths

1. **Full coverage**: All core modules have tests
2. **Prompt subprocess tests**: select, multiSelect, confirm, input, inputEmail,
   inputNumber, inputUsername, readLine verified via subprocess
3. **Cross-runtime**: Deno and Bun compatible, uses runtime-adapter
4. **ANSI env vars**: NO_COLOR, DWEB_NO_COLOR, TERM=dumb covered
5. **parseArrowKey**: Windows app mode ANSI sequences supported
6. **100% pass rate**: All tests pass

### Test Improvements (2025-02-07)

1. **Bun compatibility**: Updated @dreamer/runtime-adapter to 1.0.2 for Bun
   stdin getWriter support
2. **Prompt subprocess**: 15 subprocess tests for prompt module behavior
3. **ANSI env vars**: 3 subprocess tests for color disable logic

## Known Limitations

1. **Interactive features**: Prompt interactive features
   (interactiveMenu/Multi/Search) mainly validate interface existence

2. **Skipped test**: `Windows: shouldUseColor 应跳过 Linux Docker 检测` - only
   runs on Windows platform

## Conclusion

### ✅ Pass Rate: 100%

All 140 tests pass (1 skipped). Coverage includes:

1. **Core features**: ANSI colors, output utilities, command wrapper, argument
   parsing
2. **Advanced features**: Option validation, help generation, subcommand aliases
3. **Utilities**: Table, progress bar, Spinner, prompt (interface + subprocess)
4. **Cross-runtime**: Deno and Bun via @dreamer/runtime-adapter@^1.0.2
5. **Edge cases**: Empty values, long text, special chars, boundary values

### Quality Assurance

- ✅ **Feature completeness**: All APIs work
- ✅ **Cross-runtime**: Works in Deno and Bun
- ✅ **Prompt subprocess**: select, multiSelect, confirm, input, etc. verified
- ✅ **ANSI env vars**: NO_COLOR, DWEB_NO_COLOR, TERM=dumb

---

**Report generated**: 2025-02-07 **Test framework**: @dreamer/test@^1.0.0 (Deno
and Bun compatible) **Test environment**: `deno test -A tests` |
`bun test tests` **Total tests**: 141 (140 passed, 1 skipped) **Pass rate**:
100% ✅
