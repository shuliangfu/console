/**
 * @module @dreamer/console/i18n
 *
 * @fileoverview 控制台 i18n：不挂全局，各模块通过 import $tr 使用。
 *
 * 支持在 new Command(name, description, { lang: "en-US" }) 时指定语言；
 * 未传 lang 时自动检测环境语言（LANGUAGE / LC_ALL / LANG）。
 * 文案来自 src/locales/zh-CN.json、en-US.json。
 */

import {
  createI18n,
  type I18n,
  type TranslationData,
  type TranslationParams,
} from "@dreamer/i18n";
import { getEnv } from "@dreamer/runtime-adapter";
import zhCN from "./locales/zh-CN.json" with { type: "json" };
import enUS from "./locales/en-US.json" with { type: "json" };

/** 支持的 locale，zh-CN 为默认；英语使用 en-US */
export type Locale = "zh-CN" | "en-US";

/** 默认语言（与框架统一为 en-US） */
export const DEFAULT_LOCALE: Locale = "en-US";

/** 控制台支持的 locale 列表（仅 zh-CN、en-US） */
const CONSOLE_LOCALES: Locale[] = ["zh-CN", "en-US"];

const LOCALE_DATA: Record<string, TranslationData> = {
  "zh-CN": zhCN as TranslationData,
  "en-US": enUS as TranslationData,
};

/** init 时创建的控制台实例，不挂全局，$tr 专用 */
let consoleI18n: I18n | null = null;

/**
 * 从环境变量检测系统语言（优先级：LANGUAGE > LC_ALL > LANG），
 * 无法检测或不在支持列表时返回 DEFAULT_LOCALE（en-US）。
 */
export function detectLocale(): Locale {
  const langEnv = getEnv("LANGUAGE") || getEnv("LC_ALL") || getEnv("LANG");
  if (!langEnv) return DEFAULT_LOCALE;

  const first = langEnv.split(/[:\s]/)[0]?.trim();
  if (!first) return DEFAULT_LOCALE;

  const match = first.match(/^([a-z]{2})[-_]([A-Z]{2})/i);
  if (match) {
    const normalized = `${match[1].toLowerCase()}-${
      match[2].toUpperCase()
    }` as Locale;
    if (CONSOLE_LOCALES.includes(normalized)) return normalized;
  }

  const primary = first.substring(0, 2).toLowerCase();
  for (const locale of CONSOLE_LOCALES) {
    if (locale.startsWith(primary + "-") || locale === primary) return locale;
  }
  return DEFAULT_LOCALE;
}

/** 内部初始化，导入 i18n 时自动执行，不导出 */
function initConsoleI18n(): void {
  if (consoleI18n) return;
  const i18n = createI18n({
    defaultLocale: DEFAULT_LOCALE,
    fallbackBehavior: "default",
    locales: [...CONSOLE_LOCALES],
    translations: LOCALE_DATA as Record<string, TranslationData>,
  });
  i18n.setLocale(detectLocale());
  consoleI18n = i18n;
}

initConsoleI18n();

/**
 * 设置控制台当前语言（常用于测试固定语言）。
 */
export function setConsoleLocale(locale: Locale): void {
  initConsoleI18n();
  if (consoleI18n) consoleI18n.setLocale(locale);
}

/**
 * 框架专用翻译函数：仅用本模块 init 时创建的实例，不依赖全局。
 * 未传 lang 时使用当前 locale；传 lang 时临时切换后恢复。
 *
 * @param key 文案 key，如 "command.versionNotSet"、"help.usage"
 * @param params 占位替换，如 { message: "xxx" } -> 替换 {message}
 * @param lang 语言，不传则使用当前 locale
 */
export function $tr(
  key: string,
  params?: Record<string, string | number>,
  lang?: Locale,
): string {
  if (!consoleI18n) initConsoleI18n();
  if (!consoleI18n) return key;
  if (lang !== undefined) {
    const prev = consoleI18n.getLocale();
    consoleI18n.setLocale(lang);
    try {
      return consoleI18n.t(key, params as TranslationParams);
    } finally {
      consoleI18n.setLocale(prev);
    }
  }
  return consoleI18n.t(key, params as TranslationParams);
}
