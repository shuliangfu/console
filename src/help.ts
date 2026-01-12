/**
 * @module @dreamer/console/help
 *
 * @fileoverview 命令行帮助信息生成器
 */

import { cwd, IS_BUN, IS_DENO } from "@dreamer/runtime-adapter";
import { colors } from "./ansi.ts";
import { exit } from "./runtime-utils.ts";
import type { CommandArgument, CommandOption } from "./types.ts";

/**
 * 帮助信息生成器类
 */
export class CommandHelpGenerator {
  /**
   * 计算字符串的实际显示宽度（考虑中文字符占 2 个字符宽度）
   * @param str 字符串
   * @returns 实际显示宽度
   */
  static calculateDisplayWidth(str: string): number {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      // 判断是否为中文字符（包括中文标点）
      // 中文字符的 Unicode 范围：\u4e00-\u9fff
      // 中文标点等：\u3000-\u303f, \uff00-\uffef
      const code = char.charCodeAt(0);
      if (
        (code >= 0x4e00 && code <= 0x9fff) || // 中文字符
        (code >= 0x3000 && code <= 0x303f) || // 中文标点
        (code >= 0xff00 && code <= 0xffef) // 全角字符
      ) {
        width += 2;
      } else {
        width += 1;
      }
    }
    return width;
  }

  /**
   * 计算选项的实际显示长度（不包含 ANSI 颜色代码）
   * 考虑中文字符的宽度（中文字符占 2 个字符宽度）
   * @param opt 选项定义
   * @returns 实际显示长度
   */
  static calculateOptionDisplayLength(opt: CommandOption): number {
    let length = 2; // 前面的两个空格 "  "

    // 必需标记
    if (opt.required) {
      length += 2; // "* "
    }

    // 别名: "-a, " = 4 个字符（"-" + alias + ", "）
    if (opt.alias) {
      // 别名通常是单个字符，但也要考虑中文字符的情况
      length += 1 + this.calculateDisplayWidth(opt.alias) + 2; // "-" + alias + ", "
    }

    // 选项名称: "--name" = name.length + 2
    // 选项名称通常不包含中文，但也要考虑中文字符的情况
    length += this.calculateDisplayWidth(opt.name) + 2; // "--" + name

    // 需要值
    if (opt.requiresValue) {
      // " <值>" 需要整体计算宽度（考虑中文字符）
      length += this.calculateDisplayWidth(" <值>");
    }

    // 可选值
    if (opt.choices && opt.choices.length > 0) {
      const choicesStr = `(${opt.choices.join("|")})`;
      length += this.calculateDisplayWidth(choicesStr) + 1; // " (choices)"
    }

    return length;
  }

  /**
   * 打印单个选项信息
   * @param opt 选项定义
   * @param maxLength 最大显示长度（用于对齐）
   */
  static printOption(opt: CommandOption, maxLength?: number): void {
    let optionStr = "  ";

    // 显示必需标记
    if (opt.required) {
      optionStr += `${colors.red}*${colors.reset} `;
    }

    if (opt.alias) {
      optionStr += `${colors.cyan}-${opt.alias}${colors.reset}, `;
    }
    optionStr += `${colors.cyan}--${opt.name}${colors.reset}`;

    if (opt.requiresValue) {
      optionStr += ` <值>`;
    }

    // 显示可选值
    if (opt.choices && opt.choices.length > 0) {
      optionStr += ` ${colors.dim}(${opt.choices.join("|")})${colors.reset}`;
    }

    // 对齐描述（如果提供了最大长度，使用它；否则使用固定值）
    const actualLength = this.calculateOptionDisplayLength(opt);
    // 如果 maxLength 为 0 或 undefined，使用实际长度（不 padding）
    const targetLength = maxLength && maxLength > 0 ? maxLength : actualLength;
    const padding = Math.max(0, targetLength - actualLength);
    optionStr += " ".repeat(padding);
    optionStr += opt.description;

    if (opt.defaultValue !== undefined) {
      optionStr += ` ${colors.dim}(默认: ${opt.defaultValue})${colors.reset}`;
    }

    console.log(optionStr);
  }

  /**
   * 生成并显示帮助信息
   * @param config 命令配置
   */
  static showHelp(config: {
    name: string;
    aliases: string[];
    description?: string;
    version?: string;
    usage?: string;
    examples: Array<{ command: string; description?: string }>;
    options: CommandOption[];
    arguments: CommandArgument[];
    subcommands: Map<string, {
      description?: string;
      options: CommandOption[];
    }>;
  }): void {
    // 显示命令名称和别名
    let nameDisplay =
      `${colors.cyan}${colors.bright}${config.name}${colors.reset}`;
    if (config.aliases.length > 0) {
      nameDisplay += ` ${colors.dim}(${
        config.aliases.join(", ")
      })${colors.reset}`;
    }
    console.log(`\n${nameDisplay}`);

    if (config.description) {
      console.log(`  ${config.description}\n`);
    }

    // 显示用法
    console.log(`${colors.dim}用法:${colors.reset}`);

    // 如果设置了自定义用法，直接使用
    if (config.usage) {
      console.log(`  ${config.usage}\n`);
    } else {
      // 否则自动生成用法
      let usage = `  ${config.name}`;

      // 如果有子命令，添加子命令提示
      if (config.subcommands.size > 0) {
        usage += " <command>";
      }

      // 添加选项
      const optionalOptions = config.options.filter((opt) =>
        !opt.requiresValue
      );
      const requiredOptions = config.options.filter((opt) => opt.requiresValue);
      if (optionalOptions.length > 0 || requiredOptions.length > 0) {
        usage += " [选项]";
      }

      // 添加参数
      for (const arg of config.arguments) {
        if (arg.required) {
          usage += ` <${arg.name}>`;
        } else {
          usage += ` [${arg.name}]`;
        }
      }

      console.log(usage + "\n");
    }

    // 显示参数
    if (config.arguments.length > 0) {
      console.log(`${colors.dim}参数:${colors.reset}`);
      for (const arg of config.arguments) {
        const required = arg.required ? `${colors.red}*${colors.reset} ` : "  ";
        let argStr = `  ${required}${colors.cyan}${arg.name}${colors.reset}`;

        // 显示可选值
        if (arg.choices && arg.choices.length > 0) {
          argStr += ` ${colors.dim}(${arg.choices.join("|")})${colors.reset}`;
        }

        // 对齐描述
        const padding = 30 - argStr.length;
        argStr += " ".repeat(Math.max(0, padding));
        argStr += arg.description;

        console.log(argStr);
      }
      console.log();
    }

    // 显示选项（按分组）
    if (config.options.length > 0) {
      // 按分组组织选项
      const groupedOptions = new Map<string, CommandOption[]>();
      const ungroupedOptions: CommandOption[] = [];

      for (const opt of config.options) {
        if (opt.group) {
          if (!groupedOptions.has(opt.group)) {
            groupedOptions.set(opt.group, []);
          }
          groupedOptions.get(opt.group)!.push(opt);
        } else {
          ungroupedOptions.push(opt);
        }
      }

      // 计算所有选项的最大显示长度（用于对齐）
      let maxOptionLength = 0;
      for (const opts of groupedOptions.values()) {
        for (const opt of opts) {
          maxOptionLength = Math.max(
            maxOptionLength,
            this.calculateOptionDisplayLength(opt),
          );
        }
      }
      for (const opt of ungroupedOptions) {
        maxOptionLength = Math.max(
          maxOptionLength,
          this.calculateOptionDisplayLength(opt),
        );
      }
      // 确保最小宽度，保证对齐效果
      maxOptionLength = Math.max(maxOptionLength, 20);

      // 显示分组选项
      for (const [groupName, opts] of groupedOptions) {
        console.log(`${colors.dim}${groupName}:${colors.reset}`);
        for (const opt of opts) {
          this.printOption(opt, maxOptionLength);
        }
        console.log();
      }

      // 显示未分组选项
      if (ungroupedOptions.length > 0) {
        if (groupedOptions.size > 0) {
          console.log(`${colors.dim}选项:${colors.reset}`);
        } else {
          console.log(`${colors.dim}选项:${colors.reset}`);
        }
        for (const opt of ungroupedOptions) {
          this.printOption(opt, maxOptionLength);
        }
        console.log();
      }
    }

    // 显示使用示例
    if (config.examples.length > 0) {
      console.log(`${colors.dim}示例:${colors.reset}`);

      // 计算所有示例命令的最大显示宽度（用于对齐描述）
      let maxCommandWidth = 0;
      for (const example of config.examples) {
        const commandWidth = this.calculateDisplayWidth(example.command);
        maxCommandWidth = Math.max(maxCommandWidth, commandWidth);
      }
      // 确保最小宽度
      maxCommandWidth = Math.max(maxCommandWidth, 20);

      // 显示示例，描述在同一行并对齐
      for (const example of config.examples) {
        const commandWidth = this.calculateDisplayWidth(example.command);
        const padding = maxCommandWidth - commandWidth;
        let exampleStr = `  ${colors.cyan}${example.command}${colors.reset}`;

        if (example.description) {
          // 添加 padding 使描述对齐
          exampleStr += " ".repeat(padding);
          exampleStr += ` ${colors.dim}${example.description}${colors.reset}`;
        }

        console.log(exampleStr);
      }
      console.log();
    }

    // 显示子命令
    if (config.subcommands.size > 0) {
      console.log(`${colors.dim}子命令:${colors.reset}`);

      // 计算最长的子命令名称长度，用于对齐
      let maxNameLength = 0;
      for (const [name] of config.subcommands) {
        maxNameLength = Math.max(maxNameLength, name.length);
      }

      // 统一的对齐宽度（命令名称 + 4个空格）
      const alignWidth = maxNameLength + 4;

      for (const [name, cmd] of config.subcommands) {
        const nameStr = `${colors.cyan}${name}${colors.reset}`;
        const padding = alignWidth - name.length;
        // 显示子命令名称和描述（子命令名称后加点）
        console.log(
          `  ${nameStr}.${" ".repeat(Math.max(0, padding - 1))}${
            cmd.description || ""
          }`,
        );

        // 显示子命令的选项（最多显示前5个常用选项）
        if (cmd.options.length > 0) {
          // 计算选项名称的最大长度（用于对齐，包含颜色代码但不影响实际宽度）
          // 先计算所有子命令中选项的最大长度，确保统一对齐
          let globalMaxOptionLength = 0;
          for (const [, subCmd] of config.subcommands) {
            for (const opt of subCmd.options.slice(0, 5)) {
              const optionDisplayLength = opt.alias
                ? opt.alias.length + 2 // -a.
                : opt.name.length + 3; // --name.
              globalMaxOptionLength = Math.max(
                globalMaxOptionLength,
                optionDisplayLength,
              );
            }
          }

          // 计算当前子命令选项的最大长度
          let maxOptionDisplayLength = 0;
          for (const opt of cmd.options.slice(0, 5)) {
            // 计算实际显示长度（不包含 ANSI 颜色代码）
            const optionDisplayLength = opt.alias
              ? opt.alias.length + 2 // -a.
              : opt.name.length + 3; // --name.
            maxOptionDisplayLength = Math.max(
              maxOptionDisplayLength,
              optionDisplayLength,
            );
          }

          // 使用全局最大长度确保所有子命令的选项对齐一致
          const alignToLength = Math.max(
            maxOptionDisplayLength,
            globalMaxOptionLength,
            8,
          );

          const displayOptions = cmd.options.slice(0, 5);
          for (const opt of displayOptions) {
            let optionStr = "    ";

            // 显示选项（优先显示别名，选项名称后加点）
            const optionName = opt.alias
              ? `${colors.cyan}-${opt.alias}${colors.reset}.`
              : `${colors.cyan}--${opt.name}${colors.reset}.`;
            optionStr += optionName;

            // 对齐选项描述（计算实际显示长度，不包含 ANSI 代码）
            const optionDisplayLength = opt.alias
              ? opt.alias.length + 2 // -a.
              : opt.name.length + 3; // --name.
            const optionPadding = alignToLength - optionDisplayLength + 2; // +2 用于额外间距
            optionStr += " ".repeat(Math.max(0, optionPadding));
            optionStr += opt.description;

            console.log(optionStr);
          }

          // 如果还有更多选项，显示提示
          if (cmd.options.length > 5) {
            console.log(
              `    ${colors.dim}... 还有 ${
                cmd.options.length - 5
              } 个选项${colors.reset}`,
            );
          }
        }
      }
      console.log();

      // 提示查看子命令详细帮助
      // 获取第一个子命令作为示例
      const firstSubcommand = config.subcommands.keys().next().value;
      if (firstSubcommand) {
        // 尝试获取当前脚本路径
        // 根据运行时环境选择命令前缀
        const runtimeCommand = IS_BUN ? "bun run" : "deno run -A";
        let scriptPath = `${runtimeCommand} <script>`;
        try {
          let mainModule: string | undefined;

          // 获取主模块路径（兼容 Deno 和 Bun）
          if (IS_DENO) {
            mainModule = (globalThis as any).Deno.mainModule;
          } else if (IS_BUN) {
            // Bun 中通过 process.argv[1] 获取主模块路径
            const process = (globalThis as any).process;
            if (process && process.argv && process.argv.length > 1) {
              const mainFile = process.argv[1];
              // 转换为 file:// URL 格式以保持一致性
              if (mainFile.startsWith("file://")) {
                mainModule = mainFile;
              } else {
                // 如果是相对路径或绝对路径，转换为 file:// URL
                const path = mainFile.startsWith("/")
                  ? mainFile
                  : `/${mainFile}`;
                mainModule = `file://${path}`;
              }
            }
          }

          if (mainModule) {
            // 从主模块路径中提取脚本路径
            // 例如：file:///path/to/console/cli.ts -> console/cli.ts
            const url = new URL(mainModule);
            if (url.protocol === "file:") {
              const path = url.pathname;
              // 获取相对于当前工作目录的路径
              const currentCwd = cwd();
              const scriptRelativePath = path.startsWith(currentCwd)
                ? path.substring(currentCwd.length + 1)
                : path.substring(path.lastIndexOf("/") + 1);
              scriptPath = `${runtimeCommand} ${scriptRelativePath}`;
            }
          }
        } catch {
          // 如果获取失败，使用默认值
        }

        // 构建完整的命令路径（包含父命令名称）
        // 例如：如果当前命令是 "db"，子命令是 "create-user"，则生成 "deno run -A console/cli.ts db create-user --help" 或 "bun run console/cli.ts db create-user --help"
        let commandPrefix =
          `${scriptPath} ${config.name} ${firstSubcommand} --help`;
        if (config.usage) {
          // 从 usage 中提取命令前缀，替换 <command> 为实际子命令，替换 [选项] 为 --help
          const firstLine = config.usage.split("\n")[0].trim();
          // 如果 usage 中已经包含运行时命令，则直接使用；否则添加脚本路径
          if (firstLine.includes("deno run") || firstLine.includes("bun run")) {
            commandPrefix = firstLine
              .replace(/<command>/g, `${config.name} ${firstSubcommand}`)
              .replace(/\[选项\]/g, "--help");
          } else {
            commandPrefix = `${scriptPath} ${firstLine}`
              .replace(/<command>/g, `${config.name} ${firstSubcommand}`)
              .replace(/\[选项\]/g, "--help");
          }
        }
        console.log(
          `${colors.dim}提示: 查看子命令详细帮助，例如: ${colors.reset}${colors.cyan}${commandPrefix}${colors.reset}${colors.dim}${colors.reset}\n`,
        );
      } else {
        console.log(
          `${colors.dim}提示: 使用 ${colors.reset}${colors.cyan}${config.name} <command> --help${colors.reset}${colors.dim} 查看子命令的详细选项${colors.reset}\n`,
        );
      }
    }

    // 显示版本
    if (config.version) {
      console.log(`${colors.dim}版本:${colors.reset} ${config.version}\n`);
    }

    // 显示完帮助信息后退出程序
    exit(0);
  }
}
