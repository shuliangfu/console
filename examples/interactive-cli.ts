/**
 * @fileoverview 交互式 CLI 示例
 *
 * 演示用户交互功能（需要在终端中运行）
 */

import {
  prompt,
  input,
  inputEmail,
  inputNumber,
  inputPassword,
  inputUsername,
  confirm,
  select,
  multiSelect,
  pause,
  success,
  info,
} from "../src/mod.ts";

async function main() {
  console.log("=== 交互式 CLI 示例 ===\n");

  // 文本输入
  const name = await input("请输入你的姓名: ");
  if (name) {
    success(`你好, ${name}!`);
  }

  // 邮箱输入
  const email = await inputEmail("请输入邮箱地址: ");
  if (email) {
    info(`邮箱: ${email}`);
  }

  // 数字输入
  const age = await inputNumber("请输入年龄: ");
  if (age !== null) {
    info(`年龄: ${age}`);
  }

  // 用户名输入
  const username = await inputUsername("请输入用户名: ");
  if (username) {
    info(`用户名: ${username}`);
  }

  // 密码输入（隐藏显示）
  const password = await inputPassword("请输入密码: ");
  if (password) {
    success("密码已设置");
  }

  // 确认
  const confirmed = await confirm("确定要继续吗？", true);
  if (confirmed) {
    success("你选择了继续");
  } else {
    info("你选择了取消");
  }

  // 单选
  const frameworks = ["React", "Vue", "Preact"];
  const frameworkValues = ["react", "vue", "preact"];
  const choiceIndex = await select("选择你喜欢的框架:", frameworks);

  if (choiceIndex !== null && choiceIndex >= 0) {
    const choice = frameworkValues[choiceIndex];
    success(`你选择了: ${choice}`);
  }

  // 多选
  const tools = ["VS Code", "Vim", "WebStorm", "Sublime Text"];
  const toolValues = ["vscode", "vim", "webstorm", "sublime"];
  const choiceIndices = await multiSelect("选择你使用的工具（可多选）:", tools);

  if (choiceIndices.length > 0) {
    const selectedTools = choiceIndices.map((idx) => toolValues[idx]);
    success(`你选择了: ${selectedTools.join(", ")}`);
  }

  // 暂停
  await pause("按 Enter 键继续...");

  success("示例完成！");
}

main().catch((err) => {
  console.error("发生错误:", err);
  Deno.exit(1);
});
