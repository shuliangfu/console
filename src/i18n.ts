/**
 * @module @dreamer/console/i18n
 *
 * @fileoverview 控制台 i18n 桥接：使用 @dreamer/i18n 的 $t，供 Command / 帮助文案等使用
 *
 * 支持在 new Command(name, description, { lang: "en-US" }) 时指定语言；
 * 未传 lang 时自动检测环境语言（LANGUAGE / LC_ALL / LANG），与 dweb 行为一致。
 * 英语使用 en-US。文案来自 src/locales/zh-CN.json、en-US.json。
 */

import {
  $i18n,
  getGlobalI18n,
  getI18n,
  type TranslationData,
} from "@dreamer/i18n";
import { getEnv } from "@dreamer/runtime-adapter";
import zhCN from "./locales/zh-CN.json" with { type: "json" };
import enUS from "./locales/en-US.json" with { type: "json" };

/** 支持的 locale，zh-CN 为默认；英语使用 en-US */
export type Locale = "zh-CN" | "en-US";

/** 默认语言（与历史行为一致） */
export const DEFAULT_LOCALE: Locale = "zh-CN";

/** 控制台支持的 locale 列表（仅 zh-CN、en-US） */
const CONSOLE_LOCALES: Locale[] = ["zh-CN", "en-US"];

let consoleTranslationsLoaded = false;

/**
 * 从环境变量检测系统语言（优先级：LANGUAGE > LC_ALL > LANG），
 * 无法检测或不在支持列表时返回 en-US。
 */
export function detectLocale(): Locale {
  const langEnv = getEnv("LANGUAGE") || getEnv("LC_ALL") || getEnv("LANG");
  if (!langEnv) return "en-US";

  const first = langEnv.split(/[:\s]/)[0]?.trim();
  if (!first) return "en-US";

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
  return "en-US";
}

/**
 * 确保控制台文案已注入到当前使用的 I18n 实例（懒加载，仅执行一次）
 * 优先注入到全局已安装的实例（如 dweb 的 initDwebI18n），否则注入到 getI18n()。
 */
export function ensureConsoleI18n(): void {
  if (consoleTranslationsLoaded) return;
  const i18n = getGlobalI18n() ?? getI18n();
  i18n.loadTranslations("zh-CN", zhCN as TranslationData);
  i18n.loadTranslations("en-US", enUS as TranslationData);
  consoleTranslationsLoaded = true;
}

/**
 * 加载翻译并设置当前 locale。在入口（如 mod）调用一次，$t 内不再做 ensure/init。
 */
export function initConsoleI18n(): void {
  ensureConsoleI18n();
  $i18n.setLocale(detectLocale());
}

/**
 * 根据 key 取翻译文案。未传 lang 时使用入口处设置的当前 locale；传 lang 时临时切换后恢复。
 * 不在 $t 内调用 ensure/init，请在入口调用 initConsoleI18n()。
 *
 * @param key 文案 key，如 "command.versionNotSet"、"help.usage"
 * @param params 占位替换，如 { message: "xxx" } -> 替换 {message}
 * @param lang 语言，不传则使用当前 locale
 * @returns 翻译后的字符串
 */
export function $t(
  key: string,
  params?: Record<string, string | number>,
  lang?: Locale,
): string {
  if (lang !== undefined) {
    const prev = $i18n.getLocale();
    $i18n.setLocale(lang);
    try {
      return $i18n.t(key, params);
    } finally {
      $i18n.setLocale(prev);
    }
  }
  return $i18n.t(key, params);
}
