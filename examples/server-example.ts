/**
 * @fileoverview 服务器应用示例
 *
 * 演示如何使用 keepAlive() 保持服务器运行
 */

import { Command, success, info, error } from "../src/mod.ts";
import type { ParsedOptions } from "../src/mod.ts";

const server = new Command("server", "启动服务器")
  .setVersion("1.0.0")
  .option({
    name: "port",
    alias: "p",
    description: "端口号",
    requiresValue: true,
    type: "number",
    defaultValue: 3000,
  })
  .option({
    name: "host",
    description: "主机地址",
    requiresValue: true,
    type: "string",
    defaultValue: "0.0.0.0",
  })
  .keepAlive() // 重要：保持程序运行，不自动退出
  .before(async (args: string[], options: ParsedOptions) => {
    info("正在启动服务器...");
  })
  .action(async (args: string[], options: ParsedOptions) => {
    const port = options.port as number;
    const host = options.host as string;

    success(`服务器启动在 http://${host}:${port}`);
    info("按 Ctrl+C 停止服务器");

    // 模拟服务器运行
    // 在实际应用中，这里会启动 HTTP 服务器、WebSocket 服务器等
    // 使用 keepAlive() 后，程序会持续运行，不会自动退出

    // 示例：监听信号
    if (typeof Deno !== "undefined") {
      Deno.addSignalListener("SIGINT", () => {
        info("\n正在关闭服务器...");
        Deno.exit(0);
      });
    }
  })
  .after(async (args: string[], options: ParsedOptions) => {
    info("服务器已关闭");
  });

await server.execute();
