# @dreamer/console

> 一个兼容 Deno 和 Bun 的控制台工具库，提供命令行命令封装、美化输出、表格显示和用户交互等功能

[![JSR](https://jsr.io/badges/@dreamer/console)](https://jsr.io/@dreamer/console)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 功能

控制台工具库，提供命令行命令封装、美化输出、表格显示和用户交互等功能，让命令行应用开发更简单、更美观。

---

## ✨ 特性

- **美化输出**：
  - 成功、错误、警告、信息等美化的消息输出
  - 支持 ANSI 颜色和样式
  - 自动检测终端能力
  - 支持中文显示
- **表格显示**：
  - 支持多种样式的表格输出
  - 边框样式（single、double、rounded）
  - 自定义列对齐方式
  - 键值对表格
  - 进度条显示
- **用户交互**：
  - 文本输入、密码输入
  - 选择、多选、确认
  - 专用输入函数（邮箱、数字、用户名等）
- **命令封装**：
  - 强大的命令行命令封装类
  - 参数解析、选项处理
  - 子命令支持
  - 钩子函数（前置/后置）
  - 自动帮助信息生成
- **智能解析**：
  - 支持多种选项格式（`--option`, `-o`, `--option=value`）
  - 自动类型转换（string、number、boolean、array）
  - 选项验证、冲突检测、依赖关系
  - 参数验证和枚举值支持
- **ANSI 颜色**：
  - 完整的 ANSI 颜色和样式支持
  - 自动检测终端能力
  - 光标控制和屏幕操作
  - 支持中文显示宽度计算

---

## 🎨 设计原则

**所有 @dreamer/* 库都遵循以下原则**：

- **主包（@dreamer/xxx）**：用于服务端（兼容 Deno 和 Bun 运行时）
- **客户端子包（@dreamer/xxx/client）**：用于客户端（浏览器环境）

这样可以：
- 明确区分服务端和客户端代码
- 避免在客户端代码中引入服务端依赖
- 提供更好的类型安全和代码提示
- 支持更好的 tree-shaking

---

## 🎯 使用场景

- **命令行工具开发**：快速构建 CLI 应用
- **服务器管理工具**：启动、停止、配置服务器
- **开发工具**：构建工具、代码生成器等
- **数据展示**：表格、列表、进度条等格式化输出
- **用户交互**：交互式配置、选择、确认等

---

## 📦 安装

### Deno

```bash
deno add jsr:@dreamer/console
```

### Bun

```bash
bunx jsr add @dreamer/console
```

---

## 🌍 环境兼容性

| 环境 | 版本要求 | 状态 |
|------|---------|------|
| **Deno** | 2.5+ | ✅ 完全支持 |
| **Bun** | 1.0+ | ✅ 完全支持 |
| **服务端** | - | ✅ 支持（兼容 Deno 和 Bun 运行时，需要 TTY 终端支持） |
| **客户端** | - | ❌ 不支持（浏览器环境不支持终端交互） |
| **终端要求** | - | 📦 支持 ANSI 转义序列的终端（大多数现代终端都支持） |

---

## 🚀 快速开始

### 命令封装

#### 基本使用

```typescript
import { Command } from "jsr:@dreamer/console";

const cmd = new Command("my-command", "命令描述")
  .option({
    name: "verbose",
    alias: "v",
    description: "显示详细信息",
    type: "boolean",
  })
  .option({
    name: "output",
    alias: "o",
    description: "输出文件",
    requiresValue: true,
    type: "string",
  })
  .argument({
    name: "file",
    description: "输入文件",
    required: true,
  })
  .action(async (args, options) => {
    console.log("参数:", args);
    console.log("选项:", options);
  });

await cmd.execute();
```

#### 保持应用运行（keepAlive）

默认情况下，命令执行完成后会自动退出程序。如果你需要保持程序运行（例如服务器、监听器等），可以使用 `keepAlive()` 方法：

```typescript
import { Command } from "jsr:@dreamer/console";

const server = new Command("server", "启动服务器")
  .option({
    name: "port",
    alias: "p",
    description: "端口号",
    requiresValue: true,
    type: "number",
    defaultValue: 3000,
  })
  .keepAlive() // 重要：保持程序运行，不自动退出
  .action(async (args, options) => {
    const port = options.port as number;
    console.log(`服务器启动在端口 ${port}`);

    // 启动服务器逻辑...
    // 程序会持续运行，不会自动退出
  });

await server.execute();
```

**注意**：如果不使用 `keepAlive()`，命令执行完成后会自动调用 `exit(0)` 退出程序。这对于需要持续运行的应用（如服务器、守护进程、监听器等）非常重要。

#### 子命令

```typescript
import { Command } from "jsr:@dreamer/console";

const app = new Command("app", "应用程序");

// 创建子命令
const createCmd = app.command("create", "创建资源")
  .option({
    name: "name",
    alias: "n",
    description: "资源名称",
    requiresValue: true,
    type: "string",
  })
  .action(async (args, options) => {
    console.log(`创建资源: ${options.name}`);
  });

// 为子命令添加别名
app.subcommandAlias("c", "create");

await app.execute();
```

#### 选项验证和依赖

```typescript
import { Command } from "jsr:@dreamer/console";

const cmd = new Command("deploy", "部署应用")
  .option({
    name: "env",
    description: "环境",
    requiresValue: true,
    type: "string",
    choices: ["dev", "staging", "prod"], // 枚举值
    required: true,
  })
  .option({
    name: "token",
    description: "认证令牌",
    requiresValue: true,
    type: "string",
    validator: (value) => {
      if (value.length < 10) {
        return "令牌长度必须至少 10 个字符";
      }
      return true;
    },
  })
  .option({
    name: "force",
    description: "强制部署",
    type: "boolean",
    conflicts: ["dry-run"], // 与 --dry-run 冲突
  })
  .option({
    name: "dry-run",
    description: "试运行",
    type: "boolean",
  })
  .option({
    name: "notify",
    description: "发送通知",
    type: "boolean",
    dependsOn: ["env"], // 依赖 --env 选项
  })
  .action(async (args, options) => {
    // 处理逻辑
  });

await cmd.execute();
```

#### 钩子函数

```typescript
import { Command } from "jsr:@dreamer/console";

const cmd = new Command("task", "执行任务")
  .before(async (args, options) => {
    console.log("执行前准备...");
    // 验证环境、加载配置等
  })
  .action(async (args, options) => {
    console.log("执行任务...");
  })
  .after(async (args, options) => {
    console.log("执行后清理...");
    // 清理资源、保存日志等
  });

await cmd.execute();
```

### 美化输出

```typescript
import { success, error, warning, info, title, separator, keyValue, keyValuePairs, list, numberedList } from "jsr:@dreamer/console";

// 基本消息
success("操作成功！");
error("发生错误！");
warning("警告信息");
info("提示信息");

// 标题和分隔线
title("标题");
separator("━", 50);
separator("=", 30); // 自定义字符和长度

// 键值对
keyValue("版本", "1.0.0");
keyValue("端口", 3000);

// 多个键值对
keyValuePairs({
  name: "Alice",
  age: 30,
  city: "Beijing",
});

// 列表
list(["项目1", "项目2", "项目3"]);
list(["项目1", "项目2"], "→"); // 自定义前缀

// 编号列表
numberedList(["第一项", "第二项", "第三项"]);
numberedList(["第一项", "第二项"], 0); // 自定义起始编号
```

### 表格显示

```typescript
import { table, keyValueTable, progressBar } from "jsr:@dreamer/console";

// 基本表格
const data = [
  { name: "Alice", age: 30, city: "Beijing" },
  { name: "Bob", age: 25, city: "Shanghai" },
];

table(data);

// 带边框的表格
table(data, undefined, {
  border: true,
  borderStyle: "rounded", // "single" | "double" | "rounded"
  header: true,
});

// 自定义列
table(data, [
  { key: "name", label: "姓名", align: "left" },
  { key: "age", label: "年龄", align: "right" },
  { key: "city", label: "城市", align: "center" },
]);

// 键值对表格
keyValueTable({
  name: "Alice",
  age: 30,
  city: "Beijing",
});

// 进度条
progressBar(50, 100); // 50%
progressBar(30, 100, 40, "进度"); // 自定义宽度和标签
```

### 用户交互

```typescript
import { prompt, input, inputEmail, inputNumber, inputPassword, inputUsername, confirm, select, multiSelect, pause } from "jsr:@dreamer/console";

// 文本输入
const name = await prompt("请输入姓名：");
const hidden = await prompt("请输入密码：", true); // 隐藏输入

// 专用输入函数
const email = await inputEmail("请输入邮箱：");
const age = await inputNumber("请输入年龄：");
const password = await inputPassword("请输入密码：");
const username = await inputUsername("请输入用户名：");
const text = await input("请输入文本：");

// 确认
const confirmed = await confirm("确定要继续吗？");
const confirmedWithDefault = await confirm("确定要继续吗？", true); // 默认值

// 单选
const choice = await select("选择选项：", [
  { value: "1", label: "选项 1" },
  { value: "2", label: "选项 2" },
  { value: "3", label: "选项 3" },
]);

// 多选
const choices = await multiSelect("选择多个选项：", [
  { value: "1", label: "选项 1" },
  { value: "2", label: "选项 2" },
  { value: "3", label: "选项 3" },
]);

// 暂停
await pause("按 Enter 键继续...");
```

### ANSI 颜色和样式

```typescript
import { colors, colorize, stripAnsiCodes, shouldUseColor, clearScreen, hideCursor, showCursor, moveCursor, clearLine } from "jsr:@dreamer/console";

// 使用颜色常量
console.log(`${colors.red}红色文本${colors.reset}`);
console.log(`${colors.green}绿色文本${colors.reset}`);
console.log(`${colors.blue}蓝色文本${colors.reset}`);

// 使用 colorize 函数
console.log(colorize("红色文本", "red"));
console.log(colorize("加粗文本", "green", true));

// 移除 ANSI 代码
const colored = colorize("测试", "red");
const plain = stripAnsiCodes(colored); // "测试"

// 检查是否应该使用颜色
if (shouldUseColor()) {
  console.log("终端支持颜色");
}

// 光标控制
clearScreen(); // 清屏
hideCursor(); // 隐藏光标
showCursor(); // 显示光标
moveCursor(10, 20); // 移动光标到指定位置
clearLine(); // 清除当前行
```

---

## 📚 API 文档

### Command 类

命令行命令封装类，提供完整的命令解析和执行功能。

#### 方法

##### 配置方法

- **`info(description: string): this`** - 设置命令描述
- **`alias(alias: string): this`** - 添加命令别名
- **`setVersion(version: string): this`** - 设置命令版本
- **`setUsage(usage: string): this`** - 设置自定义用法字符串
- **`keepAlive(): this`** - 设置保持应用运行，命令执行完成后不会自动退出程序
- **`example(command: string, description?: string): this`** - 添加使用示例

##### 选项和参数

- **`option(option: CommandOption): this`** - 添加命令选项
- **`argument(argument: CommandArgument): this`** - 添加命令参数

##### 执行控制

- **`action(handler: CommandHandler): this`** - 设置命令执行函数
- **`before(hook: CommandHook): this`** - 设置命令执行前钩子
- **`after(hook: CommandHook): this`** - 设置命令执行后钩子

##### 子命令

- **`command(name: string, description?: string): Command`** - 添加子命令
- **`subcommandAlias(alias: string, commandName: string): this`** - 为子命令添加别名

##### 其他

- **`showHelp(): void`** - 显示帮助信息
- **`execute(args?: string[]): Promise<void>`** - 执行命令

#### 选项类型 (CommandOption)

```typescript
interface CommandOption {
  name: string;                    // 选项名称（长格式，如 --help）
  alias?: string;                  // 选项别名（短格式，如 -h）
  description: string;             // 选项描述
  requiresValue?: boolean;         // 是否需要值
  defaultValue?: string | boolean | number; // 默认值
  type?: "string" | "number" | "boolean" | "array"; // 选项值类型
  validator?: (value: string) => boolean | string; // 验证函数
  group?: string;                  // 选项分组名称
  required?: boolean;              // 是否必需
  conflicts?: string[];            // 冲突的选项名称列表
  dependsOn?: string[];            // 依赖的选项名称列表
  choices?: string[];             // 可选值列表（枚举）
}
```

#### 参数类型 (CommandArgument)

```typescript
interface CommandArgument {
  name: string;                    // 参数名称
  description: string;             // 参数描述
  required?: boolean;              // 是否必需
  validator?: (value: string) => boolean | string; // 验证函数
  choices?: string[];             // 可选值列表（枚举）
}
```

### 输出工具

- **`success(message: string): void`** - 输出成功消息（绿色 ✓）
- **`error(message: string): void`** - 输出错误消息（红色 ✗）
- **`warning(message: string): void`** - 输出警告消息（黄色 ⚠）
- **`info(message: string): void`** - 输出信息消息（蓝色 ℹ）
- **`separator(char?: string, length?: number): void`** - 输出分隔线（默认：━，50 字符）
- **`title(title: string): void`** - 输出标题（加粗，青色）
- **`keyValue(key: string, value: string | number): void`** - 输出键值对
- **`keyValuePairs(data: Record<string, string | number>): void`** - 输出多个键值对
- **`list(items: string[], prefix?: string): void`** - 输出列表（默认前缀：•）
- **`numberedList(items: string[], start?: number): void`** - 输出编号列表（默认起始：1）

### 表格工具

- **`table(data: Record<string, any>[], columns?: TableColumn[], options?: TableOptions): void`** - 创建表格
- **`keyValueTable(data: Record<string, any>, options?: TableOptions): void`** - 创建键值对表格
- **`progressBar(current: number, total: number, width?: number, label?: string): void`** - 显示进度条

#### TableColumn

```typescript
interface TableColumn {
  key: string;                     // 数据键名
  label?: string;                  // 列标题（默认使用 key）
  align?: "left" | "right" | "center"; // 对齐方式（默认：left）
  width?: number;                  // 列宽度（自动计算）
}
```

#### TableOptions

```typescript
interface TableOptions {
  border?: boolean;                // 是否显示边框
  borderStyle?: "single" | "double" | "rounded"; // 边框样式
  header?: boolean;                // 是否显示表头
}
```

### 提示工具

- **`prompt(message: string, hidden?: boolean): Promise<string | null>`** - 文本输入提示
- **`input(message: string): Promise<string | null>`** - 文本输入
- **`inputEmail(message: string): Promise<string | null>`** - 邮箱输入（带验证）
- **`inputNumber(message: string): Promise<number | null>`** - 数字输入（带验证）
- **`inputPassword(message: string): Promise<string | null>`** - 密码输入（隐藏显示）
- **`inputUsername(message: string): Promise<string | null>`** - 用户名输入（带验证）
- **`confirm(message: string, defaultValue?: boolean): Promise<boolean>`** - 确认提示
- **`select(message: string, choices: Array<{value: string, label: string}>, options?: SelectOptions): Promise<string | null>`** - 单选提示
- **`multiSelect(message: string, choices: Array<{value: string, label: string}>, options?: SelectOptions): Promise<string[]>`** - 多选提示
- **`pause(message?: string): Promise<void>`** - 暂停等待用户输入

### ANSI 工具

- **`colors`** - ANSI 颜色代码对象（reset, bright, dim, red, green, yellow, blue, magenta, cyan, white, gray）
- **`colorize(text: string, color: keyof typeof colors, bold?: boolean): string`** - 为文本添加颜色
- **`stripAnsiCodes(text: string): string`** - 移除 ANSI 代码
- **`shouldUseColor(): boolean`** - 检查是否应该使用颜色（自动检测环境变量、TTY、Docker 等）
- **`clearScreen(): void`** - 清屏
- **`hideCursor(): void`** - 隐藏光标
- **`showCursor(): void`** - 显示光标
- **`moveCursor(row: number, col: number): void`** - 移动光标到指定位置
- **`clearLine(): void`** - 清除当前行

---

## 🧪 测试

### 运行测试

```bash
# Deno 环境
deno test --allow-env tests/mod.test.ts

# Bun 环境
bun test tests/mod.test.ts
```

### 测试报告

详细的测试报告请查看 [TEST_REPORT.md](./TEST_REPORT.md)。

测试覆盖包括：
- ✅ 87 个测试用例全部通过
- ✅ 7 个功能模块完整测试
- ✅ Deno 和 Bun 跨运行时兼容性验证
- ✅ 边界情况和错误处理测试

---

## 📝 备注

- **keepAlive() 的使用**：对于需要持续运行的应用（服务器、监听器等），必须使用 `keepAlive()`，否则程序会在命令执行完成后自动退出。
- **颜色支持**：库会自动检测终端是否支持颜色，在非 TTY 环境或 Docker 容器中会自动禁用颜色。
- **中文支持**：帮助信息支持中文显示，会自动计算中文字符的显示宽度（中文字符占 2 个字符宽度）。
- **选项格式**：支持多种选项格式（`--option`、`-o`、`--option=value`、`--option value`）。
- **类型转换**：选项值会自动根据 `type` 进行类型转换（string、number、boolean、array）。
- **参数验证**：支持选项和参数的验证、冲突检测、依赖关系等高级功能。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License - 详见 [LICENSE.md](./LICENSE.md)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
