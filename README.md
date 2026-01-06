# @dreamer/console

一个用于 Deno 的控制台工具库，提供命令行命令封装、美化输出、表格显示和用户交互等功能。

## 特性

- 🎨 **美化输出**：提供成功、错误、警告、信息等美化的消息输出
- 📋 **表格显示**：支持多种样式的表格输出，包括边框、对齐等
- 💬 **用户交互**：提供文本输入、密码输入、选择、确认等交互功能
- 🎯 **命令封装**：强大的命令行命令封装类，支持参数解析、选项处理、子命令等
- 🌈 **ANSI 颜色**：完整的 ANSI 颜色和样式支持，自动检测终端能力
- 📊 **进度条**：支持进度条显示

## 安装

```bash
deno add jsr:@dreamer/console
```

或者直接在代码中导入：

```typescript
import { Command, success, error, table, prompt } from "jsr:@dreamer/console";
```

## 环境兼容性

- **Deno 版本**：要求 Deno 2.5 或更高版本
- **服务端**：✅ 支持（Deno 运行时，需要 TTY 终端支持）
- **客户端**：❌ 不支持（浏览器环境不支持终端交互）
- **终端要求**：支持 ANSI 转义序列的终端（大多数现代终端都支持）

## 使用方法

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

**注意**：如果不使用 `keepAlive()`，命令执行完成后会自动调用 `Deno.exit(0)` 退出程序。这对于需要持续运行的应用（如服务器、守护进程、监听器等）非常重要。

### 美化输出

```typescript
import { success, error, warning, info, title, separator } from "jsr:@dreamer/console";

success("操作成功！");
error("发生错误！");
warning("警告信息");
info("提示信息");

title("标题");
separator("━", 50);
```

### 表格显示

```typescript
import { table } from "jsr:@dreamer/console";

const data = [
  { name: "Alice", age: 30, city: "Beijing" },
  { name: "Bob", age: 25, city: "Shanghai" },
];

table(data, {
  border: true,
  borderStyle: "rounded",
  header: true,
});
```

### 用户交互

```typescript
import { prompt, confirm, select, password } from "jsr:@dreamer/console";

// 文本输入
const name = await prompt("请输入姓名：");

// 密码输入
const pwd = await password("请输入密码：");

// 确认
const confirmed = await confirm("确定要继续吗？");

// 选择
const choice = await select("选择选项：", [
  { value: "1", label: "选项 1" },
  { value: "2", label: "选项 2" },
]);
```

## API 文档

### Command 类

命令行命令封装类，提供完整的命令解析和执行功能。

#### 方法

- `info(description)`: 设置命令描述
- `alias(alias)`: 添加命令别名
- `setVersion(version)`: 设置命令版本
- `setUsage(usage)`: 设置自定义用法字符串
- `keepAlive()`: 设置保持应用运行，命令执行完成后不会自动退出程序。适用于服务器、监听器、守护进程等需要持续运行的应用。如果不调用此方法，命令执行完成后会自动调用 `Deno.exit(0)` 退出。
- `example(command, description?)`: 添加使用示例
- `option(option)`: 添加命令选项
- `argument(argument)`: 添加命令参数
- `action(handler)`: 设置命令执行函数
- `before(hook)`: 设置命令执行前钩子
- `after(hook)`: 设置命令执行后钩子
- `command(name, description?)`: 添加子命令
- `subcommandAlias(alias, commandName)`: 为子命令添加别名
- `showHelp()`: 显示帮助信息
- `execute(args?)`: 执行命令

### 输出工具

- `success(message)`: 输出成功消息
- `error(message)`: 输出错误消息
- `warning(message)`: 输出警告消息
- `info(message)`: 输出信息消息
- `separator(char?, length?)`: 输出分隔线
- `title(title)`: 输出标题
- `keyValue(key, value)`: 输出键值对
- `keyValuePairs(data)`: 输出多个键值对
- `list(items, prefix?)`: 输出列表
- `numberedList(items, start?)`: 输出编号列表

### 表格工具

- `table(data, columns?, options?)`: 创建表格
- `keyValueTable(data, options?)`: 创建键值对表格
- `progressBar(current, total, options?)`: 显示进度条

### 提示工具

- `prompt(message, hidden?)`: 文本输入提示
- `password(message)`: 密码输入提示
- `confirm(message, defaultValue?)`: 确认提示
- `select(message, choices, options?)`: 单选提示
- `multiSelect(message, choices, options?)`: 多选提示

### ANSI 工具

- `colors`: ANSI 颜色代码对象
- `colorize(text, color, bold?)`: 为文本添加颜色
- `stripAnsiCodes(text)`: 移除 ANSI 代码
- `shouldUseColor()`: 检查是否应该使用颜色
- `clearScreen()`: 清屏
- `hideCursor()`: 隐藏光标
- `showCursor()`: 显示光标
- `moveCursor(row, col)`: 移动光标
- `clearLine()`: 清除当前行

## 环境要求

- Deno 2.0+

## 许可证

MIT License - 详见 [LICENSE.md](./LICENSE.md)

## 版本

当前版本：[![JSR](https://jsr.io/badges/@dreamer/console)](https://jsr.io/@dreamer/console)

## 贡献

欢迎提交 Issue 和 Pull Request！
