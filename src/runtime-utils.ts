/**
 * 运行时工具函数
 * 提供统一的运行时 API 封装，兼容 Deno 和 Bun
 *
 * 注意：所有功能都通过 @dreamer/runtime-adapter 提供
 * 这里只是重新导出，保持向后兼容
 */

// 直接使用 runtime-adapter 的 API
export { args as getArgs, exit } from "@dreamer/runtime-adapter";

// 重新导出 runtime-adapter 的终端功能
export {
  readStdin,
  setStdinRaw,
  writeStdoutSync,
} from "@dreamer/runtime-adapter";
