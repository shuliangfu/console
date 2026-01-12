/**
 * @fileoverview Console 测试
 */

import { describe, expect, it } from "@dreamer/test";
import {
  clearLine,
  clearScreen,
  colorize,
  colors,
  hideCursor,
  moveCursor,
  shouldUseColor,
  showCursor,
  stripAnsiCodes,
} from "../src/ansi.ts";
import { Command } from "../src/command.ts";
import { CommandHelpGenerator } from "../src/help.ts";
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
import { CommandParser } from "../src/parser.ts";
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

    it("应该清除屏幕", () => {
      expect(() => clearScreen()).not.toThrow();
    });

    it("应该隐藏光标", () => {
      expect(() => hideCursor()).not.toThrow();
    });

    it("应该显示光标", () => {
      expect(() => showCursor()).not.toThrow();
    });

    it("应该移动光标到指定位置", () => {
      expect(() => moveCursor(1, 1)).not.toThrow();
      expect(() => moveCursor(10, 20)).not.toThrow();
      expect(() => moveCursor(0, 0)).not.toThrow();
    });

    it("应该清除当前行", () => {
      expect(() => clearLine()).not.toThrow();
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

  describe("CommandParser", () => {
    describe("convertOptionValue", () => {
      it("应该转换字符串类型", () => {
        const result = CommandParser.convertOptionValue("test", "string");
        expect(result).toBe("test");
      });

      it("应该转换布尔类型", () => {
        expect(CommandParser.convertOptionValue("true", "boolean")).toBe(true);
        expect(CommandParser.convertOptionValue("1", "boolean")).toBe(true);
        expect(CommandParser.convertOptionValue("yes", "boolean")).toBe(true);
        expect(CommandParser.convertOptionValue("false", "boolean")).toBe(
          false,
        );
        expect(CommandParser.convertOptionValue("0", "boolean")).toBe(false);
      });

      it("应该转换数字类型", () => {
        expect(CommandParser.convertOptionValue("123", "number")).toBe(123);
        expect(CommandParser.convertOptionValue("0", "number")).toBe(0);
        expect(CommandParser.convertOptionValue("-42", "number")).toBe(-42);
      });

      it("应该转换数组类型", () => {
        const result = CommandParser.convertOptionValue(
          "a,b,c",
          "array",
        ) as string[];
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual(["a", "b", "c"]);
      });

      it("应该处理未指定类型（默认为字符串）", () => {
        const result = CommandParser.convertOptionValue("test");
        expect(result).toBe("test");
      });

      it("应该在数字转换失败时抛出错误", () => {
        expect(() => {
          CommandParser.convertOptionValue("not-a-number", "number");
        }).toThrow();
      });
    });

    describe("validateOptionValue", () => {
      it("应该验证枚举值", () => {
        const option = {
          name: "color",
          description: "颜色",
          type: "string" as const,
          choices: ["red", "green", "blue"],
        };
        expect(CommandParser.validateOptionValue(option, "red")).toBe(true);
        expect(CommandParser.validateOptionValue(option, "green")).toBe(true);
        const result = CommandParser.validateOptionValue(option, "yellow");
        expect(typeof result).toBe("string");
        expect(result).toContain("必须是以下之一");
      });

      it("应该执行自定义验证函数", () => {
        const option = {
          name: "age",
          description: "年龄",
          type: "number" as const,
          validator: (value: string) => {
            const num = Number(value);
            if (num < 0 || num > 150) {
              return "年龄必须在 0-150 之间";
            }
            return true;
          },
        };
        expect(CommandParser.validateOptionValue(option, "25")).toBe(true);
        const result = CommandParser.validateOptionValue(option, "200");
        expect(typeof result).toBe("string");
        expect(result).toContain("年龄必须在 0-150 之间");
      });

      it("应该在没有验证规则时返回 true", () => {
        const option = {
          name: "name",
          description: "名称",
          type: "string" as const,
        };
        expect(CommandParser.validateOptionValue(option, "test")).toBe(true);
      });
    });

    describe("validateArgumentValue", () => {
      it("应该验证枚举值", () => {
        const argument = {
          name: "action",
          description: "操作",
          required: true,
          choices: ["create", "update", "delete"],
        };
        expect(CommandParser.validateArgumentValue(argument, "create")).toBe(
          true,
        );
        const result = CommandParser.validateArgumentValue(
          argument,
          "invalid",
        );
        expect(typeof result).toBe("string");
        expect(result).toContain("必须是以下之一");
      });

      it("应该执行自定义验证函数", () => {
        const argument = {
          name: "email",
          description: "邮箱",
          required: true,
          validator: (value: string) => {
            if (!value.includes("@")) {
              return "邮箱格式无效";
            }
            return true;
          },
        };
        expect(
          CommandParser.validateArgumentValue(argument, "test@example.com"),
        ).toBe(true);
        const result = CommandParser.validateArgumentValue(
          argument,
          "invalid-email",
        );
        expect(typeof result).toBe("string");
        expect(result).toContain("邮箱格式无效");
      });
    });

    describe("parseArgs", () => {
      it("应该解析简单选项", () => {
        const options = [
          {
            name: "verbose",
            alias: "v",
            description: "详细输出",
            type: "boolean" as const,
          },
        ];
        const result = CommandParser.parseArgs(["--verbose"], options, []);
        expect(result.options.verbose).toBe(true);
      });

      it("应该解析带值的选项", () => {
        const options = [
          {
            name: "port",
            alias: "p",
            description: "端口号",
            type: "number" as const,
            requiresValue: true,
          },
        ];
        const result = CommandParser.parseArgs(["--port", "8080"], options, []);
        expect(result.options.port).toBe(8080);
      });

      it("应该解析使用等号的选项", () => {
        const options = [
          {
            name: "port",
            description: "端口号",
            type: "number" as const,
            requiresValue: true,
          },
        ];
        const result = CommandParser.parseArgs(["--port=8080"], options, []);
        expect(result.options.port).toBe(8080);
      });

      it("应该解析短选项", () => {
        const options = [
          {
            name: "help",
            alias: "h",
            description: "显示帮助",
            type: "boolean" as const,
          },
        ];
        const result = CommandParser.parseArgs(["-h"], options, []);
        expect(result.options.help).toBe(true);
      });

      it("应该解析参数", () => {
        const arguments_ = [
          {
            name: "file",
            description: "文件路径",
            required: true,
          },
        ];
        const result = CommandParser.parseArgs(["test.txt"], [], arguments_);
        expect(result.arguments).toEqual(["test.txt"]);
      });

      it("应该设置默认值", () => {
        const options = [
          {
            name: "port",
            description: "端口号",
            type: "number" as const,
            requiresValue: true,
            defaultValue: 3000,
          },
        ];
        const result = CommandParser.parseArgs([], options, []);
        expect(result.options.port).toBe(3000);
      });

      it("应该解析数组类型选项", () => {
        const options = [
          {
            name: "tags",
            description: "标签",
            type: "array" as const,
            requiresValue: true,
          },
        ];
        const result = CommandParser.parseArgs(
          ["--tags", "a,b,c"],
          options,
          [],
        );
        expect(Array.isArray(result.options.tags)).toBe(true);
        expect(result.options.tags).toEqual(["a", "b", "c"]);
      });
    });
  });

  describe("CommandHelpGenerator", () => {
    it("应该计算字符串显示宽度（支持中文）", () => {
      expect(CommandHelpGenerator.calculateDisplayWidth("abc")).toBe(3);
      expect(CommandHelpGenerator.calculateDisplayWidth("中文")).toBe(4);
      expect(CommandHelpGenerator.calculateDisplayWidth("a中b")).toBe(4);
    });

    it("应该计算选项显示长度", () => {
      const option = {
        name: "verbose",
        alias: "v",
        description: "详细输出",
        type: "boolean" as const,
      };
      const length = CommandHelpGenerator.calculateOptionDisplayLength(option);
      expect(typeof length).toBe("number");
      expect(length).toBeGreaterThan(0);
    });

    it("应该计算带必需标记的选项显示长度", () => {
      const option = {
        name: "port",
        description: "端口号",
        type: "number" as const,
        requiresValue: true,
        required: true,
      };
      const length = CommandHelpGenerator.calculateOptionDisplayLength(option);
      expect(length).toBeGreaterThan(0);
    });
  });

  describe("Command 执行功能", () => {
    it("应该执行命令处理函数", async () => {
      let executed = false;
      const command = new Command("test", "测试命令");
      command.keepAlive(); // 防止调用 exit()
      command.action(async () => {
        executed = true;
      });
      await command.execute([]);
      expect(executed).toBe(true);
    });

    it("应该执行前置和后置钩子", async () => {
      let beforeExecuted = false;
      let afterExecuted = false;
      const command = new Command("test", "测试命令");
      command.keepAlive(); // 防止调用 exit()
      command.before(async () => {
        beforeExecuted = true;
      });
      command.after(async () => {
        afterExecuted = true;
      });
      command.action(async () => {
        // 主处理函数
      });
      await command.execute([]);
      expect(beforeExecuted).toBe(true);
      expect(afterExecuted).toBe(true);
    });

    it("应该处理子命令", async () => {
      let subExecuted = false;
      const command = new Command("test", "测试命令");
      const subcommand = command.command("sub", "子命令");
      subcommand.keepAlive(); // 防止调用 exit()
      subcommand.action(async () => {
        subExecuted = true;
      });
      await command.execute(["sub"]);
      expect(subExecuted).toBe(true);
    });

    it("应该处理子命令别名", async () => {
      let subExecuted = false;
      const command = new Command("test", "测试命令");
      command.command("sub", "子命令");
      command.subcommandAlias("s", "sub");
      const subcommand = command.command("sub", "子命令");
      subcommand.keepAlive(); // 防止调用 exit()
      subcommand.action(async () => {
        subExecuted = true;
      });
      await command.execute(["s"]);
      expect(subExecuted).toBe(true);
    });

    it("应该显示版本信息", async () => {
      const command = new Command("test", "测试命令");
      command.setVersion("1.0.0");
      // 注意：execute 会调用 exit()，在测试环境中会抛出错误
      // 这里只测试方法存在和基本调用
      expect(typeof command.execute).toBe("function");
    });

    it("应该传递解析后的参数和选项给处理函数", async () => {
      let receivedArgs: string[] = [];
      let receivedOptions: any = {};
      const command = new Command("test", "测试命令");
      command.keepAlive(); // 防止调用 exit()
      command.option({
        name: "verbose",
        alias: "v",
        description: "详细输出",
        type: "boolean",
      });
      command.argument({
        name: "file",
        description: "文件",
        required: true,
      });
      command.action(async (args, options) => {
        receivedArgs = args;
        receivedOptions = options;
      });
      await command.execute(["file.txt", "--verbose"]);
      expect(receivedArgs).toEqual(["file.txt"]);
      expect(receivedOptions.verbose).toBe(true);
    });
  });

  describe("ANSI 颜色边界情况", () => {
    it("应该处理所有颜色类型", () => {
      const colorTypes: Array<keyof typeof colors> = [
        "red",
        "green",
        "blue",
        "yellow",
        "cyan",
        "magenta",
        "white",
        "gray",
      ];
      for (const color of colorTypes) {
        const result = colorize("test", color);
        expect(typeof result).toBe("string");
        expect(result).toContain("test");
      }
    });

    it("应该支持加粗文本", () => {
      const result = colorize("test", "red", true);
      expect(typeof result).toBe("string");
      expect(result).toContain("test");
    });

    it("应该正确处理空字符串", () => {
      const result = stripAnsiCodes("");
      expect(result).toBe("");
    });

    it("应该正确处理包含多个 ANSI 代码的字符串", () => {
      const colored = "\x1b[31mred\x1b[0m and \x1b[32mgreen\x1b[0m";
      const stripped = stripAnsiCodes(colored);
      expect(stripped).toBe("red and green");
    });
  });

  describe("输出工具边界情况", () => {
    it("应该处理空列表", () => {
      expect(() => list([])).not.toThrow();
    });

    it("应该处理空键值对", () => {
      expect(() => keyValuePairs({})).not.toThrow();
    });

    it("应该处理长文本", () => {
      const longText = "a".repeat(1000);
      expect(() => success(longText)).not.toThrow();
    });

    it("应该处理特殊字符", () => {
      expect(() => success("特殊字符: !@#$%^&*()")).not.toThrow();
      expect(() => success("中文字符：测试")).not.toThrow();
    });
  });

  describe("表格工具边界情况", () => {
    it("应该处理空数据", () => {
      expect(() => table([])).not.toThrow();
    });

    it("应该处理单行数据", () => {
      expect(() => table([{ name: "Alice", age: 30 }])).not.toThrow();
    });

    it("应该处理不同数据类型", () => {
      const data = [
        { name: "Alice", age: 30, active: true },
        { name: "Bob", age: 25, active: false },
      ];
      expect(() => table(data)).not.toThrow();
    });

    it("应该处理进度条边界值", () => {
      expect(() => progressBar(0, 100)).not.toThrow();
      expect(() => progressBar(100, 100)).not.toThrow();
      expect(() => progressBar(50, 100)).not.toThrow();
    });
  });
});
