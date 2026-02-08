# Changelog

English | [中文 (Chinese)](./CHANGELOG-zh.md)

All notable changes to @dreamer/console are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.5] - 2026-02-08

### Fixed

- **Windows readLineRaw double echo**: When `setStdinRaw` fails on Windows (e.g. PowerShell), the terminal keeps default echo. Previously the code also called `writeStdoutSync` for echo, causing double display and the "confirm twice" feeling. Now echo is only performed when `setStdinRaw` succeeds (`isRaw === true`).

### Compatibility

- Deno 2.5.0+
- Bun 1.0.0+
- Requires TTY for interactive features

---

## [1.0.4] - 2025-02-07

### Added

- **CHANGELOG-zh.md**: Chinese changelog
- **README changelog section**: Changelog summary in README.md and README-zh.md

### Changed

- **@dreamer/runtime-adapter**: Bump to ^1.0.2 for Bun createCommand stdin compatibility
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

- Help output now correctly shows subcommand aliases (e.g. `generate (g)`, `migrate (m)`)

### Compatibility

- Deno 2.5.0+
- Bun 1.0.0+
- Requires TTY for interactive features
