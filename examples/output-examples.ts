/**
 * @fileoverview 输出工具示例
 *
 * 演示各种美化输出功能
 */

import {
  success,
  error,
  warning,
  info,
  title,
  separator,
  keyValue,
  keyValuePairs,
  list,
  numberedList,
} from "../src/mod.ts";

// 基本消息
console.log("\n=== 基本消息 ===");
success("操作成功完成！");
error("发生了一个错误！");
warning("这是一个警告信息");
info("这是一条提示信息");

// 标题和分隔线
console.log("\n=== 标题和分隔线 ===");
title("系统信息");
separator();
keyValue("版本", "1.0.0");
keyValue("作者", "Dreamer Team");

separator("=", 40);
title("项目详情");

// 键值对
console.log("\n=== 键值对 ===");
keyValuePairs({
  项目名称: "My Project",
  版本: "1.0.0",
  许可证: "MIT",
  作者: "Alice",
  创建时间: "2024-01-01",
});

// 列表
console.log("\n=== 列表 ===");
list(["功能 1", "功能 2", "功能 3"]);
list(["项目 A", "项目 B"], "→");

// 编号列表
console.log("\n=== 编号列表 ===");
numberedList(["第一步", "第二步", "第三步"]);
numberedList(["任务 A", "任务 B"], 0);
