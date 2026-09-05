# 变更日志

[English](../en-US/CHANGELOG.md) | 中文 (Chinese)

本文件记录 @dreamer/console 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.1.1] - 2026-09-05

### 新增

- **CommandParser 支持裸 `--` 参数透传**：在 `CommandParser.parseArgs()`
  中，遇到裸 `--` 之后的所有参数均视为位置参数保留并直接追加至
  `arguments`，支持向子命令或下层执行器透传参数（例如
  `dweb-cli run hello -- --force`）。
- 单元测试覆盖裸 `--` 参数透传场景（`tests/mod.test.ts`）。

---

## [1.1.0] - 2026-07-23

### 新增

- **Node.js 兼容**：console 现可在 Node.js 22+ 上运行，与 Deno、Bun 三端共用。
  所有文件系统、环境与进程操作均经 `@dreamer/runtime-adapter`（v1.2.2，已支持
  Node）。
  - `src/help.ts`：新增 `IS_NODE` 分支处理运行时命令提示（`npx tsx`）与主模块
    检测（Bun/Node 共用 `process.argv[1]`；Deno 用 `Deno.mainModule`）。
  - `tests/mod.test.ts`：新增 `buildScriptArgs()` 辅助函数按运行时分发子进程启动
    参数——Node 用 `["--import", "tsx", script]`、Deno 用
    `["run", "-A", "--no-prompt", script]`、Bun 用 `["run", script]`。新增
    `readAllBytes()` 辅助函数，改用 Web Streams `getReader()` 循环读取替代
    `new Response(stream).arrayBuffer()`——后者在 Node 下当子进程「写完即退出」时
    报 "Response body object should not be disturbed or locked"（undici 限制，见
    runtime-adapter `collectNodeReadable`）。
- **Node 测试基础设施**：`package.json` 含 `test:node` 脚本
  （`tsx --tsconfig tsconfig.json --test --test-force-exit tests/*.test.ts`）、
  `tsconfig.json`。`runtime-adapter` 从 devDependencies 移至 dependencies
  （`src/` 中使用）。console 无浏览器测试，无需安装 Chromium 或排除浏览器测试。
- **CI 工作流**升级为 9 个 job — 3 Deno v2.9 + 3 Bun + 3 Node 22。无需
  Playwright/Chromium（console 是纯 CLI 库）。Windows Bun 运行全部测试（无浏览器
  测试需排除）。
- `deno.json` 添加 `minimumDependencyAge: 0`，以兼容当日发布的 `@dreamer/*`
  依赖。

### 变更

- 依赖升级：`@dreamer/i18n` ^1.1.2、`@dreamer/test` ^1.2.3、
  `@dreamer/runtime-adapter` ^1.2.2。
- `runtime-adapter` 提升为运行时依赖（原先仅 dev 依赖）。

### 文档

- 中英文测试报告更新为三端结果：Deno 141、Bun 140、Node 140（三端各 1 个跳过——
  Windows 平台专属测试）。

---

## [1.0.12] - 2026-02-19

### 变更

- **i18n**：初始化改为在加载 i18n 模块时自动执行。入口文件（`mod.ts`）不再
  导入或调用 `initConsoleI18n`；请从你的代码中移除相关用法。测试仅在需要覆盖
  语言时使用 `setConsoleLocale()` 即可。

---

## [1.0.11] - 2026-02-19

### 变更

- **i18n**：翻译方法由 `$t` 重命名为 `$tr`，避免与全局 `$t`
  冲突。请将现有代码中本包消息改为使用 `$tr`。

### 修复

- **i18n**：`$tr` 现会在首次使用时惰性初始化 i18n，未加载 mod
  时也能得到翻译；新增 `setConsoleLocale()` 供测试固定语言；测试中通过
  `beforeAll(initConsoleI18n, setConsoleLocale("zh-CN"))` 使用中文。

---

## [1.0.10] - 2026-02-17

### 变更

- **i18n**：仅在入口初始化；`mod.ts` 中调用一次 `initConsoleI18n()`。`$t()`
  内不再调用 `ensureConsoleI18n()` 或设置 locale。从
  command、help、table、prompt、parser 模块中移除冗余的 `ensureConsoleI18n()`
  调用。

---

## [1.0.9] - 2026-02-17

### 新增

- **i18n**：命令行文案（command、help、parser、prompt、table）完整国际化，支持
  zh-CN 与 en-US；`new Command(name, desc, { lang: "en-US" })` 可指定语言，未传
  `lang` 时按环境检测。
- **parser**：参数校验错误文案使用 `argumentValueInvalid` locale 键。
- **table**：空表格与键值表表头使用 `noData`、`keyHeader`、`valueHeader`。

### 变更

- **command**：仅在显式传入 `lang` 时设置 `LANGUAGE`，未传时不再改写环境变量。
- **help**：`ungroupedOptions` 重命名为 `ungroupedOpts`，避免 i18n-ally 误匹配
  "Options"。
- **prompt**：确认提示固定使用 `Y/n`、`y/N`，不参与翻译。

---

## [1.0.8] - 2026-02-17

### 变更

- JSR 发布：版本号与变更日志同步，用于发布。

---

## [1.0.7] - 2026-02-17

### 修复

- **CLI 进程退出**：打印 `--version` / `-v` 或 `--help` 后现会调用
  `exit(0)`，进程正常退出，不再挂起。

### 变更

- **许可证**：项目许可证已变更为 Apache License 2.0。
- **文档结构**：变更日志与 README 移至
  `docs/en-US`、`docs/zh-CN`；中文文档文件名不再使用 `-zh` 后缀。
- **链接**：所有文档间链接已按新路径更新；根目录 README 的测试徽章与 TEST_REPORT
  链接指向 `docs/en-US/TEST_REPORT.md`。
- **zh-CN 测试报告**：`docs/zh-CN/TEST_REPORT.md` 已翻译为中文。

---

## [1.0.6] - 2026-02-08

### 修复

- **readLineRaw 多字节处理**：单次 read 返回多字节（如
  `"1\r\n"`）时，循环现正确逐字节处理而非仅处理首字节，确保输入一次性到达时行尾正确处理。

---

## [1.0.5] - 2026-02-08

### 修复

- **Windows readLineRaw 双重回显**：当 `setStdinRaw` 在 Windows（如
  PowerShell）上失败时，终端保持默认回显。此前代码还会调用 `writeStdoutSync`
  进行回显，导致双重显示和「需二次确认」的错觉。现仅在 `setStdinRaw`
  成功（`isRaw === true`）时才进行回显。

### 兼容性

- Deno 2.5.0+
- Bun 1.0.0+
- 交互式功能需要 TTY

---

## [1.0.4] - 2025-02-07

### 新增

- **CHANGELOG.md**：中文变更日志（位于 docs/zh-CN/）
- **README 变更日志章节**：根目录 README.md 与 docs/zh-CN/README.md
  中增加变更日志摘要

### 变更

- **@dreamer/runtime-adapter**：升级至 ^1.0.2，支持 Bun createCommand stdin 兼容
- **TEST_REPORT.md**：更新为 141 个测试（140 通过，1 跳过）
- **README**：更新测试徽章与覆盖说明

### 兼容性

- Deno 2.5.0+
- Bun 1.0.0+
- 交互式功能需要 TTY

---

## [1.0.3] - 2026-02-06

### 新增

- **稳定版发布**：首个稳定版本 (1.0.3)，API 稳定

- **美化输出**：
  - 成功、错误、警告、信息等消息
  - ANSI 颜色和样式
  - 自动检测终端能力
  - 支持 CJK 显示

- **表格显示**：
  - 多种表格样式（单线、双线、圆角边框）
  - 自定义列对齐方式
  - 键值对表格
  - 进度条（单次输出与原地实时刷新）

- **用户交互**：
  - 文本输入、密码输入
  - 选择、多选、确认
  - 专用输入（邮箱、数字、用户名）
  - 交互式菜单（单选/多选、可搜索）
  - pause 暂停

- **命令封装**：
  - Command 类，完整 CLI 解析
  - 选项与参数注册
  - 子命令支持及别名（如 `create (c)`，`app c` 路由）
  - 钩子（前置/后置）
  - 自动帮助生成
  - keepAlive() 用于长运行应用

- **智能解析**：
  - 多种选项格式（`--option`、`-o`、`--option=value`）
  - 自动类型转换（string、number、boolean、array）
  - 选项验证、冲突检测、依赖关系
  - 参数验证与枚举支持

- **Spinner**：
  - startSpinner、stopSpinner、succeedSpinner、failSpinner

- **ANSI 工具**：
  - colors、colorize、stripAnsiCodes、shouldUseColor
  - clearScreen、hideCursor、showCursor、moveCursor、clearLine

### 变更

- 改进帮助信息生成逻辑
- 增强子命令别名（alias()、subcommandAlias()、HelpConfig aliases）
- readLine 兼容不同终端 Enter/Return 输入
- 优化参数解析变量命名
- 改进选项验证与冲突检测

### 修复

- 帮助输出现在正确显示子命令别名（如 `generate (g)`、`migrate (m)`）

### 兼容性

- Deno 2.5.0+
- Bun 1.0.0+
- 交互式功能需要 TTY
