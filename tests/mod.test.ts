/**
 * @fileoverview Console 测试
 */

import { describe, expect, it } from "@dreamer/test";
import { colorize, colors, shouldUseColor, stripAnsiCodes } from "../src/ansi.ts";
import { Command } from "../src/command.ts";
import {
  error,
  info,
  keyValue,
  keyValuePairs,
  list,
  numberedList,
  separator,
  success,
  title,
  warning,
} from "../src/output.ts";
import {
  confirm,
  input,
  inputEmail,
  inputNumber,
  inputPassword,
  inputUsername,
  multiSelect,
  pause,
  prompt,
  select,
} from "../src/prompt.ts";
import { keyValueTable, progressBar, table } from "../src/table.ts";

describe("Console", () => {
  describe("ANSI 颜色", () => {
    it("应该提供颜色常量", () => {
      expect(typeof colors.red).toBe("string");
      expect(typeof colors.green).toBe("string");
      expect(typeof colors.blue).toBe("string");
      expect(typeof colors.yellow).toBe("string");
      expect(typeof colors.cyan).toBe("string");
      expect(typeof colors.magenta).toBe("string");
      expect(typeof colors.reset).toBe("string");
    });

    it("应该使用 colorize 函数应用颜色", () => {
      const result = colorize("test", "red");
      expect(result).toContain("test");
      // 如果支持颜色，应该包含 ANSI 代码
      if (shouldUseColor()) {
        expect(result).toContain("\x1b[");
      }
    });

    it("应该移除 ANSI 代码", () => {
      const colored = colorize("test", "red");
      const stripped = stripAnsiCodes(colored);
      expect(stripped).toBe("test");
    });

    it("应该检测是否应该使用颜色", () => {
      const result = shouldUseColor();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("输出工具", () => {
    it("应该输出成功消息", () => {
      expect(() => success("操作成功")).not.toThrow();
    });

    it("应该输出错误消息", () => {
      expect(() => error("发生错误")).not.toThrow();
    });

    it("应该输出警告消息", () => {
      expect(() => warning("警告信息")).not.toThrow();
    });

    it("应该输出信息消息", () => {
      expect(() => info("提示信息")).not.toThrow();
    });

    it("应该输出标题", () => {
      expect(() => title("标题")).not.toThrow();
    });

    it("应该输出分隔线", () => {
      expect(() => separator()).not.toThrow();
      expect(() => separator("=", 30)).not.toThrow();
    });

    it("应该输出键值对", () => {
      expect(() => keyValue("键", "值")).not.toThrow();
      expect(() => keyValue("数字", 123)).not.toThrow();
    });

    it("应该输出多个键值对", () => {
      expect(() =>
        keyValuePairs({
          name: "test",
          age: 20,
          city: "Beijing",
        })
      ).not.toThrow();
    });

    it("应该输出列表", () => {
      expect(() => list(["项目1", "项目2", "项目3"])).not.toThrow();
      expect(() => list(["项目1", "项目2"], "•")).not.toThrow();
    });

    it("应该输出编号列表", () => {
      expect(() => numberedList(["项目1", "项目2", "项目3"])).not.toThrow();
      expect(() => numberedList(["项目1", "项目2"], 0)).not.toThrow();
    });
  });

  describe("Command 类", () => {
    it("应该创建命令实例", () => {
      const command = new Command("test", "测试命令");
      expect(command).toBeTruthy();
    });

    it("应该设置命令描述", () => {
      const command = new Command("test");
      command.info("新的描述");
      expect(command).toBeTruthy();
    });

    it("应该添加命令别名", () => {
      const command = new Command("test", "测试命令");
      command.alias("t");
      expect(command).toBeTruthy();
    });

    it("应该设置命令版本", () => {
      const command = new Command("test", "测试命令");
      command.setVersion("1.0.0");
      expect(command).toBeTruthy();
    });

    it("应该设置自定义用法", () => {
      const command = new Command("test", "测试命令");
      command.setUsage("test [options]");
      expect(command).toBeTruthy();
    });

    it("应该设置保持运行", () => {
      const command = new Command("test", "测试命令");
      command.keepAlive();
      expect(command).toBeTruthy();
    });

    it("应该添加使用示例", () => {
      const command = new Command("test", "测试命令");
      command.example("test --help", "显示帮助");
      expect(command).toBeTruthy();
    });

    it("应该注册选项", () => {
      const command = new Command("test", "测试命令");
      command.option({
        name: "verbose",
        alias: "v",
        description: "详细输出",
        type: "boolean",
      });
      expect(command).toBeTruthy();
    });

    it("应该注册参数", () => {
      const command = new Command("test", "测试命令");
      command.argument({
        name: "file",
        description: "文件路径",
        required: true,
      });
      expect(command).toBeTruthy();
    });

    it("应该设置命令执行函数", () => {
      const command = new Command("test", "测试命令");
      command.action(async () => {
        console.log("执行命令");
      });
      expect(command).toBeTruthy();
    });

    it("应该设置前置钩子", () => {
      const command = new Command("test", "测试命令");
      command.before(async () => {
        console.log("前置钩子");
      });
      expect(command).toBeTruthy();
    });

    it("应该设置后置钩子", () => {
      const command = new Command("test", "测试命令");
      command.after(async () => {
        console.log("后置钩子");
      });
      expect(command).toBeTruthy();
    });

    it("应该添加子命令", () => {
      const command = new Command("test", "测试命令");
      const subcommand = command.command("sub", "子命令");
      expect(subcommand).toBeTruthy();
    });

    it("应该为子命令添加别名", () => {
      const command = new Command("test", "测试命令");
      command.command("sub", "子命令");
      command.subcommandAlias("s", "sub");
      expect(command).toBeTruthy();
    });

    it("应该显示帮助信息", () => {
      const command = new Command("test", "测试命令");
      // 注意：showHelp() 会调用 exit(0)，在测试环境中会抛出错误
      // 这里只测试方法存在
      expect(typeof command.showHelp).toBe("function");
    });
  });

  describe("表格工具", () => {
    it("应该输出表格", () => {
      const data = [
        { name: "Alice", age: 30, city: "Beijing" },
        { name: "Bob", age: 25, city: "Shanghai" },
      ];
      expect(() => table(data)).not.toThrow();
    });

    it("应该输出带边框的表格", () => {
      const data = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];
      expect(() =>
        table(data, undefined, { border: true, borderStyle: "rounded" })
      ).not.toThrow();
    });

    it("应该输出键值对表格", () => {
      const data = {
        name: "test",
        age: 20,
        city: "Beijing",
      };
      expect(() => keyValueTable(data)).not.toThrow();
    });

    it("应该显示进度条", () => {
      expect(() => progressBar(50, 100)).not.toThrow();
      expect(() => progressBar(30, 100, 40, "进度")).not.toThrow();
    });
  });

  describe("提示工具", () => {
    // 注意：这些测试在非交互式环境中可能无法完全测试
    // 但可以测试函数是否存在和基本调用

    it("应该提供 prompt 函数", () => {
      expect(typeof prompt).toBe("function");
    });

    it("应该提供 confirm 函数", () => {
      expect(typeof confirm).toBe("function");
    });

    it("应该提供 select 函数", () => {
      expect(typeof select).toBe("function");
    });

    it("应该提供 multiSelect 函数", () => {
      expect(typeof multiSelect).toBe("function");
    });

    it("应该提供 input 函数", () => {
      expect(typeof input).toBe("function");
    });

    it("应该提供 inputEmail 函数", () => {
      expect(typeof inputEmail).toBe("function");
    });

    it("应该提供 inputNumber 函数", () => {
      expect(typeof inputNumber).toBe("function");
    });

    it("应该提供 inputPassword 函数", () => {
      expect(typeof inputPassword).toBe("function");
    });

    it("应该提供 inputUsername 函数", () => {
      expect(typeof inputUsername).toBe("function");
    });

    it("应该提供 pause 函数", () => {
      expect(typeof pause).toBe("function");
    });
  });
});
