/**
 * 控制台工具模块
 * 统一导出所有控制台相关功能
 */

import { initConsoleI18n } from "./i18n.ts";

// 入口处初始化控制台 i18n（加载翻译并设置当前 locale，$t 内不再做 ensure/init）
initConsoleI18n();

// ANSI 颜色和格式化工具
export * from "./ansi.ts";

// 命令行输出工具
export * from "./output.ts";

// 命令行命令封装类
export * from "./command.ts";

// 命令行输入工具
export * from "./prompt.ts";

// 表格输出工具
export * from "./table.ts";

// 类型定义
export * from "./types.ts";

// 加载指示器（Spinner）
export * from "./spinner.ts";
