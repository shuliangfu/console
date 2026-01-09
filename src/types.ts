/**
 * @module @dreamer/console/types
 *
 * @fileoverview 命令行命令类型定义
 */

/**
 * 选项值类型
 */
export type OptionValueType = "string" | "number" | "boolean" | "array";

/**
 * 选项值验证函数
 */
export type OptionValidator = (value: string) => boolean | string;

/**
 * 参数值验证函数
 */
export type ArgumentValidator = (value: string) => boolean | string;

/**
 * 命令选项定义
 */
export interface CommandOption {
  /** 选项名称（长格式，如 --help） */
  name: string;
  /** 选项别名（短格式，如 -h） */
  alias?: string;
  /** 选项描述 */
  description: string;
  /** 是否需要值 */
  requiresValue?: boolean;
  /** 默认值 */
  defaultValue?: string | boolean | number;
  /** 选项值类型（用于自动类型转换） */
  type?: OptionValueType;
  /** 选项值验证函数，返回 true 或错误消息字符串 */
  validator?: OptionValidator;
  /** 选项分组名称（用于在帮助信息中分组显示） */
  group?: string;
  /** 选项是否必需 */
  required?: boolean;
  /** 与此选项冲突的选项名称列表 */
  conflicts?: string[];
  /** 此选项依赖的选项名称列表 */
  dependsOn?: string[];
  /** 选项的可选值列表（用于枚举验证） */
  choices?: string[];
}

/**
 * 命令参数定义
 */
export interface CommandArgument {
  /** 参数名称 */
  name: string;
  /** 参数描述 */
  description: string;
  /** 是否必需 */
  required?: boolean;
  /** 参数值验证函数，返回 true 或错误消息字符串 */
  validator?: ArgumentValidator;
  /** 参数的可选值列表（用于枚举验证） */
  choices?: string[];
}

/**
 * 解析后的命令选项
 */
export interface ParsedOptions {
  [key: string]: string | boolean | number | string[] | undefined;
}

/**
 * 命令执行函数类型
 * @param args 命令行参数
 * @param options 解析后的选项
 * @param command Command 实例
 */
export type CommandHandler = (
  args: string[],
  options: ParsedOptions,
  command?: unknown,
) => Promise<void> | void;

/**
 * 命令钩子函数类型
 */
export type CommandHook = (
  args: string[],
  options: ParsedOptions,
) => Promise<void> | void;
