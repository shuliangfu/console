/**
 * @fileoverview 表格显示示例
 *
 * 演示各种表格显示功能
 */

import { table, keyValueTable, progressBar } from "../src/mod.ts";

// 基本表格
console.log("\n=== 基本表格 ===");
const users = [
  { name: "Alice", age: 30, city: "Beijing", role: "Developer" },
  { name: "Bob", age: 25, city: "Shanghai", role: "Designer" },
  { name: "Charlie", age: 35, city: "Guangzhou", role: "Manager" },
];

table(users);

// 带边框的表格
console.log("\n=== 带边框的表格 ===");
table(users, undefined, {
  border: true,
  borderStyle: "rounded",
  header: true,
});

// 自定义列
// 注意：columns 的顺序必须与数据对象的键顺序一致
console.log("\n=== 自定义列 ===");
table(users, [
  { header: "姓名", align: "left" },
  { header: "年龄", align: "right" },
  { header: "城市", align: "center" },
  { header: "角色", align: "left" },
], {
  border: true,
  borderStyle: "single",
  header: true,
});

// 键值对表格
console.log("\n=== 键值对表格 ===");
keyValueTable({
  项目名称: "My Project",
  版本: "1.0.0",
  许可证: "MIT",
  作者: "Alice",
  创建时间: "2024-01-01",
  描述: "一个示例项目",
}, {
  border: true,
  borderStyle: "rounded",
});

// 进度条
console.log("\n=== 进度条 ===");
for (let i = 0; i <= 100; i += 10) {
  progressBar(i, 100, 40, `进度 ${i}%`);
  await new Promise((resolve) => setTimeout(resolve, 200));
}
console.log(); // 换行
