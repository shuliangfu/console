# Changelog

English | [中文 (Chinese)](../zh-CN/CHANGELOG.md)

All notable changes to @dreamer/console are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.10] - 2026-02-17

### Changed

- **i18n**: Init at entry only; `initConsoleI18n()` is called once in `mod.ts`.
  `$t()` no longer calls `ensureConsoleI18n()` or sets locale internally.
  Removed redundant `ensureConsoleI18n()` from command, help, table, prompt, and
  parser modules.

---

## [1.0.9] - 2026-02-17

### Added

- **i18n**: Full internationalization for CLI messages (command, help, parser,
  prompt, table) with zh-CN and en-US locales;
  `new Command(name, desc, {
  lang: "en-US" })` and env-based detection when
  `lang` is omitted.
- **parser**: `argumentValueInvalid` locale key for argument validation errors.
- **table**: `noData`, `keyHeader`, `valueHeader` for empty table and key-value
  table headers.

### Changed

- **command**: Set `LANGUAGE` only when `lang` is explicitly passed; no longer
  overwrites env when omitted.
- **help**: Renamed `ungroupedOptions` to `ungroupedOpts` to avoid i18n-ally
  false match on "Options".
- **prompt**: Confirm prompt uses literal `Y/n` / `y/N` (not translated).

---

## [1.0.8] - 2026-02-17

### Changed

- JSR release: version bump and changelog sync for publish.

---

## [1.0.7] - 2026-02-17

### Fixed

- **CLI process exit**: After printing `--version` / `-v` or `--help`, the
  process now calls `exit(0)` so the CLI exits instead of hanging.

### Changed

- **License**: Project license updated to Apache License 2.0.
- **Docs layout**: Changelog and README moved to `docs/en-US` and `docs/zh-CN`;
  Chinese doc filenames no longer use `-zh` suffix.
- **Links**: All cross-doc links updated to the new paths; root README test
  badge and TEST_REPORT link point to `docs/en-US/TEST_REPORT.md`.
- **zh-CN TEST_REPORT**: Translated to Chinese in `docs/zh-CN/TEST_REPORT.md`.

---

## [1.0.6] - 2026-02-08

### Fixed

- **readLineRaw multi-byte handling**: When a single read returns multiple bytes
  (e.g. `"1\r\n"`), the loop now correctly processes each byte instead of only
  the first. Ensures proper handling of line endings when input arrives in one
  chunk.

---

## [1.0.5] - 2026-02-08

### Fixed

- **Windows readLineRaw double echo**: When `setStdinRaw` fails on Windows (e.g.
  PowerShell), the terminal keeps default echo. Previously the code also called
  `writeStdoutSync` for echo, causing double display and the "confirm twice"
  feeling. Now echo is only performed when `setStdinRaw` succeeds
  (`isRaw === true`).

### Compatibility

- Deno 2.5.0+
- Bun 1.0.0+
- Requires TTY for interactive features

---

## [1.0.4] - 2025-02-07

### Added

- **docs/zh-CN/CHANGELOG.md**: Chinese changelog
- **README changelog section**: Changelog summary in README.md and
  docs/zh-CN/README.md

### Changed

- **@dreamer/runtime-adapter**: Bump to ^1.0.2 for Bun createCommand stdin
  compatibility
- **TEST_REPORT.md**: Update to 141 tests (140 passed, 1 skipped)
- **README**: Update test report badges and coverage summary

### Compatibility

- Deno 2.5.0+
- Bun 1.0.0+
- Requires TTY for interactive features

---

## [1.0.3] - 2026-02-06

### Added

- **Stable release**: First stable version (1.0.3) with stable API

- **Styled output**:
  - Success, error, warning, info messages
  - ANSI colors and styles
  - Auto-detect terminal capability
  - CJK display support

- **Table display**:
  - Multiple table styles (single, double, rounded borders)
  - Custom column alignment
  - Key-value tables
  - Progress bar (single output and in-place live)

- **User interaction**:
  - Text input, password input
  - Select, multi-select, confirm
  - Dedicated inputs (email, number, username)
  - Interactive menu (single/multi, searchable)
  - pause

- **Command wrapping**:
  - Command class with full CLI parsing
  - Option and argument registration
  - Subcommand support with alias (e.g. `create (c)`, `app c` routing)
  - Hooks (before/after)
  - Auto help generation
  - keepAlive() for long-running apps

- **Smart parsing**:
  - Multiple option formats (`--option`, `-o`, `--option=value`)
  - Auto type conversion (string, number, boolean, array)
  - Option validation, conflict detection, dependencies
  - Argument validation and enum support

- **Spinner**:
  - startSpinner, stopSpinner, succeedSpinner, failSpinner

- **ANSI utilities**:
  - colors, colorize, stripAnsiCodes, shouldUseColor
  - clearScreen, hideCursor, showCursor, moveCursor, clearLine

### Changed

- Improved help info generation logic
- Enhanced subcommand alias (alias(), subcommandAlias(), HelpConfig aliases)
- readLine compatibility for different terminal Enter/Return inputs
- Optimized argument parsing variable naming
- Improved option validation and conflict detection

### Fixed

- Help output now correctly shows subcommand aliases (e.g. `generate (g)`,
  `migrate (m)`)

### Compatibility

- Deno 2.5.0+
- Bun 1.0.0+
- Requires TTY for interactive features
