# 变更日志

[English](./CHANGELOG.md) | 中文 (Chinese)

本文件记录 @dreamer/console 的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.0.4] - 2025-02-07

### 新增

- **CHANGELOG-zh.md**：中文变更日志
- **README 变更日志章节**：README.md 与 README-zh.md 中增加变更日志摘要

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
