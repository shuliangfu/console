/**
 * @fileoverview Prompt 子进程测试脚本
 *
 * 通过子进程运行 prompt 函数，stdin 提供输入，stdout 输出 JSON 结果。
 * 供 mod.test.ts 通过 createCommand 调用，兼容 Deno 和 Bun。
 *
 * 用法: deno run prompt-script.ts <case> 或 bun run prompt-script.ts <case>
 * 用例: select | multiSelect | confirm | input | inputEmail | inputNumber | inputUsername
 */

import { args, exit } from "@dreamer/runtime-adapter";
import {
  confirm,
  input,
  inputEmail,
  inputNumber,
  inputUsername,
  interactiveMenu,
  multiSelect,
  select,
} from "../src/prompt.ts";

const caseName = args()[0];

async function run(): Promise<void> {
  try {
    let result: unknown;

    switch (caseName) {
      case "select": {
        const opts = ["选项A", "选项B", "选项C"];
        result = await select("请选择", opts, 0);
        break;
      }
      case "selectNoDefault": {
        const opts = ["选项A", "选项B"];
        result = await select("请选择", opts);
        break;
      }
      case "multiSelect": {
        const opts = ["A", "B", "C"];
        result = await multiSelect("多选", opts, 1, 3);
        break;
      }
      case "multiSelectMin0": {
        const opts = ["A", "B"];
        result = await multiSelect("多选（可选空）", opts, 0);
        break;
      }
      case "confirmY": {
        result = await confirm("确认?", false);
        break;
      }
      case "confirmN": {
        result = await confirm("确认?", true);
        break;
      }
      case "confirmDefault": {
        result = await confirm("确认?", true);
        break;
      }
      case "input": {
        result = await input("输入:", () => null, true);
        break;
      }
      case "inputWithDefault": {
        result = await input("输入:", () => null, false, {
          default: "default",
        });
        break;
      }
      case "inputEmail": {
        result = await inputEmail("邮箱:", true);
        break;
      }
      case "inputNumber": {
        result = await inputNumber("数字:", 0, 100, true);
        break;
      }
      case "inputUsername": {
        result = await inputUsername("用户名:", 3, 20, true);
        break;
      }
      case "inputValidatorRetry": {
        result = await input(
          "输入（需为 ok）:",
          (v) => v === "ok" ? null : "必须输入 ok",
          true,
        );
        break;
      }
      case "selectInvalidThenValid": {
        const opts = ["A", "B"];
        result = await select("请选择", opts);
        break;
      }
      case "interactiveMenuFallback": {
        const opts = ["A", "B", "C"];
        result = await interactiveMenu(
          "请选择（管道 stdin 时回退到 select）",
          opts,
          0,
        );
        break;
      }
      case "inputCRLF": {
        result = await input("输入（测试 \\r\\n）:", () => null, true);
        break;
      }
      default:
        console.error(JSON.stringify({ error: `unknown case: ${caseName}` }));
        exit(1);
    }

    // 使用分隔符便于测试从混有 prompt 输出的 stdout 中提取
    console.log(`__PROMPT_RESULT__${JSON.stringify(result)}`);
  } catch (err) {
    console.error(JSON.stringify({ error: String(err) }));
    exit(1);
  }
}

run();
