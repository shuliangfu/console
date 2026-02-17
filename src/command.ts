/**
 * @module @dreamer/console/command
 *
 * @fileoverview 命令行命令封装类
 *
 * 用于创建和管理命令行命令，支持参数解析、选项处理和帮助信息
 */

import { CommandHelpGenerator } from "./help.ts";
import { error as outputError, warning } from "./output.ts";
import { CommandParser } from "./parser.ts";
import { exit, getArgs, setEnv } from "./runtime-utils.ts";
import type {
  CommandArgument,
  CommandHandler,
  CommandHook,
  CommandOption,
} from "./types.ts";

// 重新导出类型
export type {
  ArgumentValidator,
  CommandArgument,
  CommandHandler,
  CommandHook,
  CommandOption,
  OptionValidator,
  OptionValueType,
  ParsedOptions,
} from "./types.ts";
import { $t, type Locale } from "./i18n.ts";

/**
 * 命令行命令类
 */
export class Command {
  /** 命令名称 */
  private name: string;
  /** 命令别名列表 */
  private aliases: string[] = [];
  /** 命令描述 */
  private description?: string;
  /** 命令版本 */
  private version?: string;
  /** 自定义用法字符串（如果设置，将覆盖自动生成的用法） */
  private usage?: string;
  /** 是否保持应用运行 */
  private isKeepAlive?: boolean;
  /** 使用示例列表 */
  private examples: Array<{ command: string; description?: string }> = [];
  /** 命令选项列表 */
  private options: CommandOption[] = [];
  /** 命令参数列表 */
  private arguments: CommandArgument[] = [];
  /** 命令执行函数 */
  private handler?: CommandHandler;
  /** 命令执行前钩子 */
  private beforeHook?: CommandHook;
  /** 命令执行后钩子 */
  private afterHook?: CommandHook;
  /** 子命令列表 */
  private subcommands: Map<string, Command> = new Map();
  /** 子命令别名映射 */
  private subcommandAliases: Map<string, string> = new Map();
  /** 输出与帮助使用的语言（不传则自动检测环境） */
  private lang?: Locale;

  /**
   * 创建命令实例
   * @param name 命令名称
   * @param description 命令描述（可选，可通过 info() 方法设置）
   * @param options 可选配置，如 lang 指定语言（不传则按环境检测）
   */
  constructor(
    name: string,
    description?: string,
    options?: { lang?: Locale },
  ) {
    this.name = name;
    this.description = description;
    this.lang = options?.lang;
    // 仅当用户显式指定 lang 时写入环境变量，避免覆盖系统 LANGUAGE 及多 Command 互相覆盖
    if (this.lang !== undefined) {
      setEnv("LANGUAGE", this.lang);
    }
  }

  /**
   * 设置命令描述
   * @param description 命令描述
   * @returns 当前命令实例（支持链式调用）
   */
  info(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * 添加命令别名
   * @param alias 别名
   * @returns 当前命令实例（支持链式调用）
   */
  alias(alias: string): this {
    this.aliases.push(alias);
    return this;
  }

  /**
   * 设置命令版本
   * @param version 版本号
   * @returns 当前命令实例（支持链式调用）
   */
  setVersion(version: string): this {
    this.version = version;
    return this;
  }

  /**
   * 设置自定义用法字符串
   * @param usage 用法字符串
   * @returns 当前命令实例（支持链式调用）
   */
  setUsage(usage: string): this {
    this.usage = usage;
    return this;
  }

  keepAlive(): this {
    this.isKeepAlive = true;
    return this;
  }

  /**
   * 添加使用示例
   * @param command 示例命令
   * @param description 示例描述（可选）
   * @returns 当前命令实例（支持链式调用）
   */
  example(command: string, description?: string): this {
    this.examples.push({ command, description });
    return this;
  }

  /**
   * 添加命令选项
   * @param option 选项定义
   * @returns 当前命令实例（支持链式调用）
   */
  option(option: CommandOption): this {
    this.options.push(option);
    return this;
  }

  /**
   * 添加命令参数
   * @param argument 参数定义
   * @returns 当前命令实例（支持链式调用）
   */
  argument(argument: CommandArgument): this {
    this.arguments.push(argument);
    return this;
  }

  /**
   * 设置命令执行函数
   * @param handler 执行函数
   * @returns 当前命令实例（支持链式调用）
   */
  action(handler: CommandHandler): this {
    this.handler = handler;
    return this;
  }

  /**
   * 设置命令执行前钩子
   * @param hook 钩子函数
   * @returns 当前命令实例（支持链式调用）
   */
  before(hook: CommandHook): this {
    this.beforeHook = hook;
    return this;
  }

  /**
   * 设置命令执行后钩子
   * @param hook 钩子函数
   * @returns 当前命令实例（支持链式调用）
   */
  after(hook: CommandHook): this {
    this.afterHook = hook;
    return this;
  }

  /**
   * 添加子命令
   * 子命令调用 alias() 时，会同时注册到父级的 subcommandAliases，使别名（如 g、m）能正确路由
   *
   * @param name 子命令名称
   * @param description 子命令描述
   * @returns 子命令实例
   */
  command(name: string, description?: string): Command {
    const subcommand = new Command(name, description);
    this.subcommands.set(name, subcommand);

    // 包装 alias：子命令的 alias() 同时注册到父级，使 "dweb g"、"dweb m" 等能正确路由
    const originalAlias = subcommand.alias.bind(subcommand);
    subcommand.alias = (alias: string) => {
      originalAlias(alias);
      this.subcommandAliases.set(alias, name);
      return subcommand;
    };
    return subcommand;
  }

  /**
   * 为子命令添加别名
   * @param alias 别名
   * @param commandName 子命令名称
   * @returns 当前命令实例（支持链式调用）
   */
  subcommandAlias(alias: string, commandName: string): this {
    if (!this.subcommands.has(commandName)) {
      throw new Error(
        $t("command.subcommandNotFound", { name: commandName }, this.lang),
      );
    }
    this.subcommandAliases.set(alias, commandName);
    return this;
  }

  /**
   * 显示帮助信息
   */
  showHelp(): void {
    CommandHelpGenerator.showHelp({
      name: this.name,
      aliases: this.aliases,
      description: this.description,
      version: this.version,
      usage: this.usage,
      examples: this.examples,
      options: this.options,
      arguments: this.arguments,
      subcommands: new Map(
        Array.from(this.subcommands.entries()).map(([name, cmd]) => {
          const aliases = Array.from(this.subcommandAliases.entries())
            .filter(([, cmdName]) => cmdName === name)
            .map(([alias]) => alias);
          return [
            name,
            {
              description: cmd.description,
              options: cmd.options,
              aliases: aliases.length > 0 ? aliases : undefined,
            },
          ];
        }),
      ),
    });
  }

  /**
   * 执行命令
   * @param args 命令行参数（默认使用运行时参数）
   */
  async execute(args: string[] = getArgs()): Promise<void> {
    // 先检查子命令（包括别名），如果是子命令，让子命令处理后续参数（包括 --help）
    if (args.length > 0) {
      const firstArg = args[0];

      // 检查子命令别名
      if (this.subcommandAliases.has(firstArg)) {
        const commandName = this.subcommandAliases.get(firstArg)!;
        const subcommand = this.subcommands.get(commandName)!;
        await subcommand.execute(args.slice(1));
        return;
      }

      // 检查子命令
      if (this.subcommands.has(firstArg)) {
        const subcommand = this.subcommands.get(firstArg)!;
        await subcommand.execute(args.slice(1));
        return;
      }
    }

    // 检查是否请求帮助（在子命令检查之后）
    if (args.includes("--help") || args.includes("-h")) {
      this.showHelp();
      if (!this.isKeepAlive) exit(0);
      return;
    }

    // 检查是否请求版本（打印后显式退出，避免进程挂起）
    if (args.includes("--version") || args.includes("-v")) {
      if (this.version) {
        console.log(this.version);
        exit(0);
      } else {
        outputError($t("command.versionNotSet", undefined, this.lang));
        exit(1);
      }
      return;
    }

    // 有子命令但未匹配到：直接显示帮助，不提示「未设置处理函数」（根命令作为路由器无需 handler）
    if (this.subcommands.size > 0) {
      this.showHelp();
      if (!this.isKeepAlive) exit(0);
      return;
    }

    // 解析参数和选项
    const { arguments: parsedArgs, options: parsedOptions } = CommandParser
      .parseArgs(args, this.options, this.arguments);

    // 执行命令处理函数
    if (this.handler) {
      try {
        // 执行前置钩子
        if (this.beforeHook) {
          await this.beforeHook(parsedArgs, parsedOptions);
        }

        // 执行主处理函数，传递 Command 实例作为第三个参数
        await this.handler(parsedArgs, parsedOptions, this);

        // 执行后置钩子
        if (this.afterHook) {
          await this.afterHook(parsedArgs, parsedOptions);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        outputError(
          $t("command.executeError", { message }, this.lang),
        );
        exit(1);
      }
    } else {
      warning($t("command.noHandler", undefined, this.lang));
      this.showHelp();
    }

    if (!this.isKeepAlive) {
      exit(0);
    }
  }
}
