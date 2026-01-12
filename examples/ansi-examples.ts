/**
 * @fileoverview ANSI 颜色和样式示例
 *
 * 演示 ANSI 颜色、光标控制等功能
 */

import {
  colors,
  colorize,
  stripAnsiCodes,
  shouldUseColor,
  clearScreen,
  hideCursor,
  showCursor,
  moveCursor,
  clearLine,
} from "../src/mod.ts";

// 检查是否支持颜色
console.log("=== 颜色支持检测 ===");
if (shouldUseColor()) {
  console.log("✅ 终端支持颜色");
} else {
  console.log("❌ 终端不支持颜色");
}

// 使用颜色常量
console.log("\n=== 颜色常量 ===");
console.log(`${colors.red}红色文本${colors.reset}`);
console.log(`${colors.green}绿色文本${colors.reset}`);
console.log(`${colors.blue}蓝色文本${colors.reset}`);
console.log(`${colors.yellow}黄色文本${colors.reset}`);
console.log(`${colors.cyan}青色文本${colors.reset}`);
console.log(`${colors.magenta}洋红色文本${colors.reset}`);
console.log(`${colors.white}白色文本${colors.reset}`);
console.log(`${colors.gray}灰色文本${colors.reset}`);

// 使用 colorize 函数
console.log("\n=== colorize 函数 ===");
console.log(colorize("红色文本", "red"));
console.log(colorize("绿色文本", "green"));
console.log(colorize("加粗绿色文本", "green", true));
console.log(colorize("蓝色文本", "blue"));

// 移除 ANSI 代码
console.log("\n=== 移除 ANSI 代码 ===");
const colored = colorize("测试文本", "red");
const plain = stripAnsiCodes(colored);
console.log(`原始: ${colored}`);
console.log(`移除后: ${plain}`);

// 光标控制（注释掉，避免影响终端）
console.log("\n=== 光标控制（已注释，避免影响终端） ===");
console.log("// clearScreen() - 清屏");
console.log("// hideCursor() - 隐藏光标");
console.log("// showCursor() - 显示光标");
console.log("// moveCursor(10, 20) - 移动光标到 (10, 20)");
console.log("// clearLine() - 清除当前行");

// 实际演示（可选，取消注释以测试）
// clearScreen();
// hideCursor();
// await new Promise(resolve => setTimeout(resolve, 1000));
// showCursor();
