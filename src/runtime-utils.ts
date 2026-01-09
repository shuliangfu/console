/**
 * 运行时工具函数
 * 提供统一的运行时 API 封装，兼容 Deno 和 Bun
 *
 * 注意：大部分功能已迁移到 @dreamer/runtime-adapter
 * 这里只保留 console 库特有的功能
 */

import { IS_BUN, IS_DENO } from "@dreamer/runtime-adapter";

/**
 * 获取命令行参数
 */
export function getArgs(): string[] {
  if (IS_DENO) {
    return (globalThis as any).Deno.args;
  }
  if (IS_BUN) {
    return (globalThis as any).process?.argv?.slice(2) || [];
  }
  return [];
}

/**
 * 退出程序
 */
export function exit(code: number): never {
  if (IS_DENO) {
    (globalThis as any).Deno.exit(code);
  }
  if (IS_BUN) {
    (globalThis as any).process?.exit(code);
  }
  throw new Error("不支持的运行时环境");
}

// 重新导出 runtime-adapter 的终端功能
export {
  readStdin,
  setStdinRaw,
  writeStdoutSync,
} from "@dreamer/runtime-adapter";
