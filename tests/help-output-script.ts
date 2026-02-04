/**
 * @fileoverview 帮助输出测试脚本
 *
 * 用于子进程测试，创建带子命令别名的命令并输出帮助信息。
 * 通过 deno run 执行此脚本可验证帮助中是否显示子命令别名（如 generate (g)）。
 */

import { Command } from "../src/command.ts";

const cmd = new Command("dweb", "Dweb CLI 工具");
const gen = cmd.command("generate", "生成代码");
gen.alias("g");
gen.action(() => {});
const mig = cmd.command("migrate", "数据库迁移");
mig.alias("m");
mig.action(() => {});

// 输出帮助并退出（测试时由子进程捕获 stdout）
cmd.showHelp();
