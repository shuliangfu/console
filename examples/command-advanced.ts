/**
 * @fileoverview 高级命令功能示例
 *
 * 演示子命令、钩子、验证、冲突检测等高级功能
 */

import { Command, success, error, info, warning } from "../src/mod.ts";
import type { ParsedOptions } from "../src/mod.ts";

const app = new Command("app", "高级 CLI 应用示例")
  .setVersion("1.0.0")
  .example("app deploy --env prod --token xxx", "部署到生产环境")
  .example("app deploy --env dev", "部署到开发环境")
  .example("app create user --name Alice", "创建用户");

// 部署命令
const deployCmd = app
  .command("deploy", "部署应用")
  .option({
    name: "env",
    description: "部署环境",
    requiresValue: true,
    type: "string",
    choices: ["dev", "staging", "prod"],
    required: true,
    group: "部署选项",
  })
  .option({
    name: "token",
    description: "认证令牌",
    requiresValue: true,
    type: "string",
    validator: (value: string) => {
      if (value.length < 10) {
        return "令牌长度必须至少 10 个字符";
      }
      return true;
    },
    group: "部署选项",
  })
  .option({
    name: "force",
    description: "强制部署",
    type: "boolean",
    conflicts: ["dry-run"],
    group: "部署选项",
  })
  .option({
    name: "dry-run",
    description: "试运行（不实际部署）",
    type: "boolean",
    group: "部署选项",
  })
  .option({
    name: "notify",
    description: "发送通知",
    type: "boolean",
    dependsOn: ["env"],
    group: "通知选项",
  })
  .before(async (args: string[], options: ParsedOptions) => {
    info("准备部署...");
    // 可以在这里验证环境、加载配置等
  })
  .action(async (args, options) => {
    const env = options.env as string;
    const token = options.token as string;
    const force = options.force as boolean;
    const dryRun = options["dry-run"] as boolean;
    const notify = options.notify as boolean;

    if (dryRun) {
      warning("试运行模式：不会实际部署");
    }

    info(`部署环境: ${env}`);
    info(`使用令牌: ${token.substring(0, 4)}...`);

    if (force) {
      warning("强制部署模式");
    }

    if (notify) {
      info("将发送部署通知");
    }

    // 模拟部署过程
    await new Promise((resolve) => setTimeout(resolve, 1000));

    success("部署完成！");
  })
  .after(async (args: string[], options: ParsedOptions) => {
    info("清理临时文件...");
    // 可以在这里清理资源、保存日志等
  });

// 创建命令
const createCmd = app
  .command("create", "创建资源")
  .argument({
    name: "type",
    description: "资源类型",
    required: true,
    choices: ["user", "project", "task"],
  })
  .option({
    name: "name",
    alias: "n",
    description: "资源名称",
    requiresValue: true,
    type: "string",
    required: true,
  })
  .option({
    name: "tags",
    description: "标签（多个用逗号分隔）",
    requiresValue: true,
    type: "array",
  })
  .action(async (args: string[], options: ParsedOptions) => {
    const type = args[0];
    const name = options.name as string;
    const tags = options.tags as string[] | undefined;

    success(`创建 ${type}: ${name}`);
    if (tags && tags.length > 0) {
      info(`标签: ${tags.join(", ")}`);
    }
  });

// 为子命令添加别名
app.subcommandAlias("d", "deploy");
app.subcommandAlias("c", "create");

await app.execute();
