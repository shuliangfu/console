/**
 * @module @dreamer/console/parser
 *
 * @fileoverview 命令行参数解析器
 */

import { error as outputError } from "./output.ts";
import { exit } from "./runtime-utils.ts";
import type {
  CommandArgument,
  CommandOption,
  OptionValueType,
  ParsedOptions,
} from "./types.ts";

/**
 * 参数解析器类
 */
export class CommandParser {
  /**
   * 转换选项值类型
   * @param value 原始值
   * @param type 目标类型
   * @returns 转换后的值
   */
  static convertOptionValue(
    value: string,
    type?: OptionValueType,
  ): string | number | boolean | string[] {
    if (!type || type === "string") {
      return value;
    }

    if (type === "boolean") {
      return value === "true" || value === "1" || value === "yes";
    }

    if (type === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`无法将 "${value}" 转换为数字`);
      }
      return num;
    }

    if (type === "array") {
      // 支持逗号分隔的数组值
      return value.split(",").map((v) => v.trim());
    }

    return value;
  }

  /**
   * 验证选项值
   * @param option 选项定义
   * @param value 选项值
   * @returns 验证结果，true 表示通过，字符串表示错误消息
   */
  static validateOptionValue(
    option: CommandOption,
    value: string,
  ): boolean | string {
    // 检查枚举值
    if (option.choices && option.choices.length > 0) {
      if (!option.choices.includes(value)) {
        return `选项 --${option.name} 的值必须是以下之一: ${
          option.choices.join(", ")
        }`;
      }
    }

    // 执行自定义验证函数
    if (option.validator) {
      const result = option.validator(value);
      if (result !== true) {
        return result || `选项 --${option.name} 的值无效`;
      }
    }

    return true;
  }

  /**
   * 验证参数值
   * @param argument 参数定义
   * @param value 参数值
   * @returns 验证结果，true 表示通过，字符串表示错误消息
   */
  static validateArgumentValue(
    argument: CommandArgument,
    value: string,
  ): boolean | string {
    // 检查枚举值
    if (argument.choices && argument.choices.length > 0) {
      if (!argument.choices.includes(value)) {
        return `参数 ${argument.name} 的值必须是以下之一: ${
          argument.choices.join(", ")
        }`;
      }
    }

    // 执行自定义验证函数
    if (argument.validator) {
      const result = argument.validator(value);
      if (result !== true) {
        return result || `参数 ${argument.name} 的值无效`;
      }
    }

    return true;
  }

  /**
   * 检查选项冲突和依赖
   * @param options 选项定义列表
   * @param parsedOptions 解析后的选项
   */
  static validateOptionRelations(
    options: CommandOption[],
    parsedOptions: ParsedOptions,
  ): void {
    for (const opt of options) {
      const optionValue = parsedOptions[opt.name];

      // 检查冲突
      if (
        opt.conflicts && opt.conflicts.length > 0 && optionValue !== undefined
      ) {
        for (const conflictName of opt.conflicts) {
          if (parsedOptions[conflictName] !== undefined) {
            outputError(
              `选项 --${opt.name} 与 --${conflictName} 冲突，不能同时使用`,
            );
            exit(1);
          }
        }
      }

      // 检查依赖
      if (
        opt.dependsOn && opt.dependsOn.length > 0 && optionValue !== undefined
      ) {
        for (const depName of opt.dependsOn) {
          if (parsedOptions[depName] === undefined) {
            outputError(
              `选项 --${opt.name} 依赖于 --${depName}，请先指定 --${depName}`,
            );
            exit(1);
          }
        }
      }

      // 检查必需选项
      if (opt.required && optionValue === undefined) {
        outputError(`选项 --${opt.name} 是必需的`);
        exit(1);
      }
    }
  }

  /**
   * 解析命令行参数
   * @param args 命令行参数数组
   * @param options 选项定义列表
   * @param commandArguments 参数定义列表
   * @returns 解析后的参数和选项
   */
  static parseArgs(
    args: string[],
    options: CommandOption[],
    commandArguments: CommandArgument[],
  ): {
    arguments: string[];
    options: ParsedOptions;
  } {
    const parsedOptions: ParsedOptions = {};
    const parsedArgs: string[] = [];
    let i = 0;

    // 初始化选项默认值
    for (const opt of options) {
      if (opt.defaultValue !== undefined) {
        parsedOptions[opt.name] = opt.defaultValue as string | boolean | number;
      }
    }

    // 解析参数和选项
    while (i < args.length) {
      const arg = args[i];

      // 处理选项（以 -- 或 - 开头）
      if (arg.startsWith("--")) {
        // 先检查是否包含等号，如果包含则先分离选项名和值
        let optionName: string;
        let hasValueInArg = false;
        if (arg.includes("=")) {
          const [name, val] = arg.split("=", 2);
          optionName = name.slice(2); // 移除 "--" 前缀
          hasValueInArg = true;
        } else {
          optionName = arg.slice(2);
        }
        const option = options.find((opt) => opt.name === optionName);

        if (option) {
          if (option.requiresValue) {
            // 需要值的选项：--option=value 或 --option value
            let value: string;
            if (hasValueInArg) {
              // 从等号分隔的参数中提取值
              const [, val] = arg.split("=", 2);
              value = val;
            } else if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
              value = args[i + 1];
              i++;
            } else {
              outputError(`选项 --${optionName} 需要值`);
              exit(1);
            }

            // 验证选项值
            const validation = this.validateOptionValue(option, value);
            if (validation !== true) {
              outputError(validation as string);
              exit(1);
            }

            // 转换类型
            try {
              parsedOptions[optionName] = this.convertOptionValue(
                value,
                option.type,
              );
            } catch (err) {
              outputError(
                err instanceof Error ? err.message : String(err),
              );
              exit(1);
            }
          } else {
            // 布尔选项
            parsedOptions[optionName] = true;
          }
        } else {
          outputError(`未知选项: ${arg}`);
          exit(1);
        }
      } else if (arg.startsWith("-") && arg.length > 1) {
        // 处理短选项（-h, -abc 等）
        const optionName = arg.slice(1);
        const option = options.find(
          (opt) => opt.alias === optionName,
        );

        if (option) {
          if (option.requiresValue) {
            if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
              const value = args[i + 1];

              // 验证选项值
              const validation = this.validateOptionValue(option, value);
              if (validation !== true) {
                outputError(validation as string);
                exit(1);
              }

              // 转换类型
              try {
                parsedOptions[option.name] = this.convertOptionValue(
                  value,
                  option.type,
                );
              } catch (err) {
                outputError(
                  err instanceof Error ? err.message : String(err),
                );
                exit(1);
              }

              i++;
            } else {
              outputError(`选项 -${optionName} 需要值`);
              exit(1);
            }
          } else {
            parsedOptions[option.name] = true;
          }
        } else {
          outputError(`未知选项: ${arg}`);
          exit(1);
        }
      } else {
        // 普通参数
        parsedArgs.push(arg);
      }

      i++;
    }

    // 验证必需参数
    for (let j = 0; j < commandArguments.length; j++) {
      const argDef = commandArguments[j];
      if (argDef.required && j >= parsedArgs.length) {
        outputError(`缺少必需参数: ${argDef.name}`);
        exit(1);
      }

      // 验证参数值
      if (j < parsedArgs.length) {
        const validation = this.validateArgumentValue(argDef, parsedArgs[j]);
        if (validation !== true) {
          outputError(validation as string);
          exit(1);
        }
      }
    }

    // 验证选项关系和必需选项
    this.validateOptionRelations(options, parsedOptions);

    return {
      arguments: parsedArgs,
      options: parsedOptions,
    };
  }
}
