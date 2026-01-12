/**
 * @fileoverview 基础 CLI 示例
 *
 * 演示如何使用 Command 类创建简单的命令行工具
 */

import type { ParsedOptions } from "../src/mod.ts";
import { Command, info, success } from "../src/mod.ts";

// 创建一个简单的命令
const app = new Command("myapp", "一个简单的 CLI 应用")
  .setVersion("1.0.0")
  .option({
    name: "name",
    alias: "n",
    description: "你的名字",
    requiresValue: true,
    type: "string",
    required: true,
  })
  .option({
    name: "verbose",
    alias: "v",
    description: "显示详细信息",
    type: "boolean",
  })
  .action(async (args: string[], options: ParsedOptions) => {
    const name = options.name as string;
    const verbose = options.verbose as boolean;

    success(`你好, ${name}!`);

    if (verbose) {
      info("这是详细信息模式");
      info(`参数数量: ${args.length}`);
      info(`选项: ${JSON.stringify(options, null, 2)}`);
    }
  });

// 执行命令
await app.execute();
