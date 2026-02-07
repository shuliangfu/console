/**
 * @fileoverview ANSI 环境变量测试脚本
 * 子进程运行，输出 shouldUseColor() 结果供测试断言
 */
import { shouldUseColor } from "../src/ansi.ts";
console.log(shouldUseColor() ? "true" : "false");
