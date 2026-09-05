# @dreamer/console 测试报告

## 测试概览

- **console 版本**：@dreamer/console@1.1.1
- **测试库版本**：@dreamer/test@^1.2.3
- **测试框架**：@dreamer/test（兼容 Deno、Bun 与 Node.js）
- **测试日期**：2026-09-05
- **测试环境**：
  - Deno 2.9+
  - Bun 1.3+
  - Node.js 22+（通过 `tsx --test`）
- **运行时适配器**：@dreamer/runtime-adapter@^1.2.2

## 测试结果

### 总体统计

- **测试总数**：142（Deno）/ 141（Bun）/ 141（Node）
- **通过**：141 / 141 / 141 ✅
- **忽略/跳过**：1（Windows 平台专属测试，三端各跳过 1 个）
- **失败**：0
- **通过率**：100% ✅
- **执行时间**：约 1–2 秒（Deno/Bun）/ 约 1.7 秒（Node）

### 三端测试摘要

三端全部通过。console 是纯 CLI 库，无浏览器测试，三端运行相同的 `mod.test.ts`
套件（142 条；1 条 Windows 专属测试在非 Windows 平台跳过）。

- **Deno（142 条）**：141 通过，1 忽略。
- **Bun（141 条）**：141 通过，1 跳过。
- **Node.js 22（141 条）**：141 通过，1 跳过。子进程测试通过
  `node --import tsx <script>` 运行；流读取用 Web Streams `getReader()` 循环
  （见 `tests/mod.test.ts` 中的 `readAllBytes`）。

### 测试文件统计

| 测试文件      | 数量 | 状态                | 说明                                                                                        |
| ------------- | ---- | ------------------- | ------------------------------------------------------------------------------------------- |
| `mod.test.ts` | 142  | ✅ 141 通过，1 忽略 | 全部功能模块、prompt 子进程测试、ANSI 环境变量、parseArrowKey、边界情况、mod 导出与类型导出 |

## 功能测试详情

### 1. ANSI 颜色模块 (ansi.ts)

**测试场景**：

- ✅ `colors` 常量：所有颜色常量
- ✅ `colorize` 函数：应用颜色、支持粗体、按终端自动禁用
- ✅ `stripAnsiCodes` 函数：移除 ANSI 码
- ✅ `shouldUseColor` 函数：检测是否使用颜色
- ✅
  光标控制：`clearScreen`、`hideCursor`、`showCursor`、`moveCursor`、`clearLine`
- ✅ 边界情况：所有颜色类型、粗体文本、空字符串、多个 ANSI 码

**测试结果**：13 个测试全部通过

### 2. 输出工具模块 (output.ts)

**测试场景**：

- ✅ `success`、`error`、`warning`、`info`、`title`、`separator`
- ✅ `keyValue`、`keyValuePairs`、`list`、`numberedList`
- ✅ 边界情况：空列表、空键值对、长文本、特殊字符

**测试结果**：14 个测试全部通过

### 3. Command 类 (command.ts)

**测试场景**：

- ✅ 创建、配置、选项、参数、钩子、子命令、帮助、执行
- ✅ 通过 `alias()`、`subcommandAlias()` 的子命令别名
- ✅ 版本信息、将解析后的参数传入 handler

**测试结果**：24 个测试全部通过

### 4. CommandParser 类 (parser.ts)

**测试场景**：

- ✅ `convertOptionValue`：字符串、布尔、数字、数组及校验
- ✅ `validateOptionValue`、`validateArgumentValue`
- ✅ `parseArgs`：简单选项、带值、等号形式、短选项、参数、默认值
- ✅ `parseArgs`：裸 `--` 之后全部视为位置参数（支持参数透传）

**测试结果**：18 个测试全部通过

### 5. CommandHelpGenerator 类 (help.ts)

**测试场景**：

- ✅ `calculateDisplayWidth`：CJK 支持、选项显示长度
- ✅ `HelpConfig` 子命令的 `aliases` 字段
- ✅ 帮助输出包含子命令别名（如 `generate (g)`、`migrate (m)`）——通过子进程验证

**测试结果**：9 个测试全部通过

### 6. 表格工具模块 (table.ts)

**测试场景**：

- ✅ `table`、`keyValueTable`、`progressBar`、`progressBarLive` /
  `progressBarLiveFinish`
- ✅ 边界情况：空数据、单行、不同类型、进度条 0%/50%/100%

**测试结果**：11 个测试全部通过

### 7. Spinner 模块 (spinner.ts)

**测试场景**：

- ✅ `startSpinner` / `stopSpinner`：启动与停止
- ✅ `startSpinner("message")`：带消息启动
- ✅ `succeedSpinner` / `failSpinner`：成功/失败结束
- ✅ 无 Spinner 运行时安全调用 `stopSpinner`

**测试结果**：5 个测试全部通过

### 8. 交互提示模块 (prompt.ts)

**测试场景**：

- ✅
  函数存在性：`prompt`、`confirm`、`select`、`multiSelect`、`input`、`inputEmail`、`inputNumber`、`inputPassword`、`inputUsername`、`pause`、`interactiveMenu`、`interactiveMultiMenu`、`interactiveMenuSearch`
- ✅ **Prompt 子进程测试**（通过 @dreamer/runtime-adapter 的 `createCommand` +
  `execPath`）：
  - `select`：返回选项索引、默认值、无效输入重试
  - `multiSelect`：多选索引、min=0 空选择
  - `confirm`：解析 y/n、默认值
  - `input`：用户输入、默认值、校验重试
  - `inputEmail`、`inputNumber`、`inputUsername`：格式校验
  - `interactiveMenu`：管道 stdin 时回退到 select
  - `readLine`：支持 `\r\n`（Windows 换行）

**测试结果**：28 个测试全部通过（13 个接口 + 15 个子进程）

### 9. parseArrowKey（Windows 兼容）

**测试场景**：

- ✅ ANSI 上下键：ESC [ A、ESC [ B
- ✅ Windows 应用模式：ESC O A、ESC O B
- ✅ 单 ESC 返回 `esc`
- ✅ 首字节非 ESC 返回 null
- ✅ 非方向键 ESC 序列返回 null
- ✅ 空或 n<1 返回 null
- ✅ 不完整序列（n=2）返回 null

**测试结果**：9 个测试全部通过

### 10. ANSI 环境变量

**测试场景**（子进程，NO_COLOR=1）：

- ✅ `NO_COLOR`：禁用颜色
- ✅ `DWEB_NO_COLOR`：禁用颜色
- ✅ `TERM=dumb`：禁用颜色

**测试结果**：3 个测试全部通过

### 11. mod 导出与类型导出

**测试场景**：

- ✅ 从 `mod.ts` 导出
  Spinner、progressBarLive/progressBarLiveFinish、interactiveMenu/Multi/Search
- ✅ 导出类型：CommandOption、CommandArgument、ParsedOptions
- ✅ CommandOption / CommandArgument 结构校验

**测试结果**：4 个测试全部通过

### 12. Windows 平台相关

**测试场景**：

- ✅ `parseArrowKey` Windows 应用模式 ESC O A/B：跨平台校验
- ⏭️ `shouldUseColor` 跳过 Linux Docker 检测——**已跳过**（platform() !==
  "windows"）

**测试结果**：1 通过，1 跳过

## 测试统计

### 按模块

| 模块                 | 测试数  | 通过    | 跳过  | 失败  | 覆盖率   |
| -------------------- | ------- | ------- | ----- | ----- | -------- |
| ANSI 颜色            | 13      | 13      | 0     | 0     | 100%     |
| 输出工具             | 14      | 14      | 0     | 0     | 100%     |
| Command 类           | 24      | 24      | 0     | 0     | 100%     |
| CommandParser        | 17      | 17      | 0     | 0     | 100%     |
| CommandHelpGenerator | 9       | 9       | 0     | 0     | 100%     |
| 表格工具             | 11      | 11      | 0     | 0     | 100%     |
| Spinner              | 5       | 5       | 0     | 0     | 100%     |
| 交互提示             | 28      | 28      | 0     | 0     | 100%     |
| parseArrowKey        | 9       | 9       | 0     | 0     | 100%     |
| ANSI 环境变量        | 3       | 3       | 0     | 0     | 100%     |
| mod 导出与类型       | 4       | 4       | 0     | 0     | 100%     |
| 边界情况             | 11      | 11      | 0     | 0     | 100%     |
| Windows 平台         | 2       | 1       | 1     | 0     | -        |
| **合计**             | **141** | **140** | **1** | **0** | **100%** |

## 跨运行时兼容性

### Deno

- ✅ 所有 API 在 Deno 2.9+ 下正常工作
- ✅ 使用 @dreamer/runtime-adapter
- ✅ 测试需 `-A` 或 `--allow-env`

### Bun

- ✅ 所有 API 在 Bun 1.3+ 下正常工作
- ✅ 使用 @dreamer/runtime-adapter
- ✅ 全部测试通过（140 通过，1 跳过）
- ✅ Prompt 子进程测试通过（createCommand stdin getWriter）

### Node.js

- ✅ 所有 API 在 Node.js 22+ 下正常工作（通过 `tsx --test`）
- ✅ 使用 @dreamer/runtime-adapter（v1.2.2，已支持 Node）
- ✅ 全部测试通过（140 通过，1 跳过）
- ✅ Prompt 子进程测试通过：`buildScriptArgs` 为 Node 分发
  `["--import", "tsx", script]`；`readAllBytes` 用 `getReader()` 循环读取流
  （避免 undici `Response` "disturbed or locked" 错误）
- ✅ `src/help.ts` 的 `IS_NODE` 分支渲染 `npx tsx` 提示，并通过
  `process.argv[1]` 检测主模块

## 测试质量评估

### 优点

1. **覆盖完整**：核心模块均有测试
2. **Prompt
   子进程测试**：select、multiSelect、confirm、input、inputEmail、inputNumber、inputUsername、readLine
   通过子进程验证
3. **跨运行时**：兼容 Deno 与 Bun，使用 runtime-adapter
4. **ANSI 环境变量**：覆盖 NO_COLOR、DWEB_NO_COLOR、TERM=dumb
5. **parseArrowKey**：支持 Windows 应用模式 ANSI 序列
6. **100% 通过率**：全部测试通过

### 测试改进（2025-02-07）

1. **Bun 兼容**：将 @dreamer/runtime-adapter 升级至 1.0.2，以支持 Bun stdin
   getWriter
2. **Prompt 子进程**：为 prompt 模块行为增加 15 个子进程测试
3. **ANSI 环境变量**：为颜色禁用逻辑增加 3 个子进程测试

## 已知限制

1. **交互功能**：Prompt 的 interactiveMenu/Multi/Search 主要验证接口存在性

2. **跳过测试**：`Windows: shouldUseColor 应跳过 Linux Docker 检测`——仅在
   Windows 平台运行

## 结论

### ✅ 通过率：100%

共 140 个测试通过（1 个跳过）。覆盖范围包括：

1. **核心功能**：ANSI 颜色、输出工具、命令封装、参数解析
2. **进阶功能**：选项校验、帮助生成、子命令别名
3. **工具**：表格、进度条、Spinner、交互提示（接口 + 子进程）
4. **跨运行时**：通过 @dreamer/runtime-adapter@^1.0.2 支持 Deno 与 Bun
5. **边界情况**：空值、长文本、特殊字符、边界值

### 质量保证

- ✅ **功能完整**：所有 API 可用
- ✅ **跨运行时**：在 Deno 与 Bun 下均可用
- ✅ **Prompt 子进程**：select、multiSelect、confirm、input 等已验证
- ✅ **ANSI 环境变量**：NO_COLOR、DWEB_NO_COLOR、TERM=dumb

---

**报告生成时间**：2025-02-07\
**测试框架**：@dreamer/test@^1.0.0（兼容 Deno 与 Bun）\
**测试环境**：`deno test -A tests` | `bun test tests`\
**测试总数**：141（140 通过，1 跳过）\
**通过率**：100% ✅
