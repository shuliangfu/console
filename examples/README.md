# @dreamer/console 使用示例

本目录包含了 `@dreamer/console` 库的各种使用示例，涵盖了从基础到高级的所有功能。

## 📁 示例结构

```
examples/
├── README.md                    # 本文件
├── basic-cli.ts                # 基础 CLI 示例
├── command-advanced.ts         # 高级命令功能示例
├── output-examples.ts          # 输出工具示例
├── table-examples.ts           # 表格显示示例
├── interactive-cli.ts          # 交互式 CLI 示例
├── ansi-examples.ts            # ANSI 颜色和样式示例
└── server-example.ts           # 服务器应用示例
```

## 🚀 快速开始

### 运行基础 CLI 示例

```bash
# Deno
deno run -A examples/basic-cli.ts --name Alice --verbose

# Bun
bun run examples/basic-cli.ts --name Alice --verbose
```

### 运行高级命令示例

```bash
# 部署命令
deno run -A examples/command-advanced.ts deploy --env prod --token my-secret-token

# 创建命令
deno run -A examples/command-advanced.ts create user --name Alice --tags dev,frontend
```

### 运行输出示例

```bash
deno run -A examples/output-examples.ts
```

### 运行表格示例

```bash
deno run -A examples/table-examples.ts
```

### 运行交互式示例

```bash
# 注意：此示例需要在终端中运行，需要用户交互
deno run -A examples/interactive-cli.ts
```

### 运行 ANSI 示例

```bash
deno run -A examples/ansi-examples.ts
```

### 运行服务器示例

```bash
# 启动服务器（使用 keepAlive 保持运行）
deno run -A examples/server-example.ts --port 3000

# 按 Ctrl+C 停止服务器
```

## 📚 示例说明

### 基础 CLI 示例 (`basic-cli.ts`)

演示如何创建简单的命令行工具：
- 创建命令实例
- 添加选项和参数
- 执行命令处理函数

**关键特性**：
- 基本命令创建
- 选项定义和使用
- 参数解析

### 高级命令功能示例 (`command-advanced.ts`)

演示高级命令功能：
- 子命令创建和管理
- 钩子函数（before/after）
- 选项验证
- 选项冲突检测
- 选项依赖关系
- 子命令别名

**关键特性**：
- 子命令系统
- 选项分组
- 验证和约束
- 钩子函数

### 输出工具示例 (`output-examples.ts`)

演示各种美化输出功能：
- 成功/错误/警告/信息消息
- 标题和分隔线
- 键值对显示
- 列表显示

**关键特性**：
- 美化的消息输出
- 格式化显示
- 中文支持

### 表格显示示例 (`table-examples.ts`)

演示表格显示功能：
- 基本表格
- 带边框的表格
- 自定义列对齐
- 键值对表格
- 进度条

**关键特性**：
- 多种表格样式
- 自定义列配置
- 进度条显示

### 交互式 CLI 示例 (`interactive-cli.ts`)

演示用户交互功能：
- 文本输入
- 专用输入函数（邮箱、数字、用户名、密码）
- 确认提示
- 单选和多选

**关键特性**：
- 用户输入处理
- 输入验证
- 交互式选择

**注意**：此示例需要在终端中运行，需要用户交互。

### ANSI 颜色和样式示例 (`ansi-examples.ts`)

演示 ANSI 颜色和光标控制：
- 颜色常量使用
- colorize 函数
- 移除 ANSI 代码
- 光标控制

**关键特性**：
- 颜色支持检测
- 颜色和样式应用
- 光标控制

### 服务器应用示例 (`server-example.ts`)

演示如何使用 `keepAlive()` 保持服务器运行：
- keepAlive() 的使用
- 服务器启动和关闭
- 信号处理

**关键特性**：
- 保持程序运行
- 信号监听
- 优雅关闭

## ⚠️ 注意事项

1. **运行环境**：
   - 所有示例都可以在 Deno 和 Bun 环境中运行
   - 交互式示例需要在终端中运行

2. **路径问题**：
   - 所有示例使用相对路径导入（`../../src/mod.ts`）
   - 确保在项目根目录运行示例

3. **交互式示例**：
   - `interactive-cli.ts` 需要用户输入，不适合自动化测试
   - 在终端中运行以获得最佳体验

4. **keepAlive() 使用**：
   - 对于需要持续运行的应用（服务器、监听器等），必须使用 `keepAlive()`
   - 否则程序会在命令执行完成后自动退出

## 🔗 相关文档

- [README.md](../README.md) - 库的主要文档
- [TEST_REPORT.md](../TEST_REPORT.md) - 测试报告

## 💡 更多示例

如果你需要更多示例或有问题，请查看：
- 测试文件 (`tests/`) - 包含大量实际使用场景
- 源代码 (`src/`) - 包含详细的 JSDoc 注释
