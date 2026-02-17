/**
 * 命令行输入工具
 * 提供美化的用户输入和交互功能，包括文本输入、密码输入、选择等
 */

import { colors } from "./ansi.ts";
import { $t } from "./i18n.ts";
import { error } from "./output.ts";
import {
  exit,
  isStdinTerminal,
  readStdin,
  setStdinRaw,
  writeStdoutSync,
} from "./runtime-utils.ts";

/** 延迟指定毫秒 */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 解析方向键转义序列（兼容 Windows 与 Linux/macOS）
 * - ANSI: ESC [ A (上) / ESC [ B (下)
 * - 应用模式（Windows Terminal 等）: ESC O A (上) / ESC O B (下)
 * @param bytes 已读取的字节
 * @param n 读取长度
 * @returns "up" | "down" | "esc" | null
 */
export function parseArrowKey(
  bytes: Uint8Array,
  n: number,
): "up" | "down" | "esc" | null {
  if (n < 1 || bytes[0] !== 0x1b) return null;
  if (n >= 3) {
    if (bytes[1] === 0x5b) {
      if (bytes[2] === 0x41) return "up";
      if (bytes[2] === 0x42) return "down";
    }
    if (bytes[1] === 0x4f) {
      if (bytes[2] === 0x41) return "up";
      if (bytes[2] === 0x42) return "down";
    }
  }
  if (n === 1) return "esc";
  return null;
}

/**
 * 读取转义序列续字节（当首字节为 0x1b 且未读够 3 字节时）
 * 兼容分片到达：可能先收到 0x1b，再收到 0x5b 0x41 或 0x4f 0x41
 * @param alreadyRead 已读字节（如 [0x1b] 或 [0x1b, 0x5b]）
 * @returns "up" | "down" | "esc" | null
 */
async function readEscSequence(
  alreadyRead: Uint8Array,
): Promise<"up" | "down" | "esc" | null> {
  const need = 3 - alreadyRead.length;
  if (need <= 0) return parseArrowKey(alreadyRead, alreadyRead.length);
  const buf2 = new Uint8Array(5);
  const n2 = await Promise.race([
    readStdin(buf2),
    sleep(50).then(() => null),
  ]);
  if (n2 !== null && n2 >= need) {
    const combined = new Uint8Array(alreadyRead.length + n2);
    combined.set(alreadyRead);
    combined.set(buf2.subarray(0, n2), alreadyRead.length);
    const arrow = parseArrowKey(combined, combined.length);
    if (arrow) return arrow;
  }
  return "esc";
}

/** prompt 可选配置（默认值、超时） */
export interface PromptOptions {
  /** 空回车时返回的默认值 */
  default?: string;
  /** 超时毫秒数，超时后返回 default 或 null */
  timeoutMs?: number;
}

/** input 可选配置（默认值、超时） */
export interface InputOptions {
  /** 空回车时返回的默认值 */
  default?: string;
  /** 超时毫秒数，超时后返回 default 或空字符串 */
  timeoutMs?: number;
}

/**
 * 根据 UTF-8 首字节返回该字符占用的字节数（1～4）
 */
function utf8LeadLength(b: number): number {
  if (b <= 0x7f) return 1;
  if (b >= 0xc2 && b <= 0xdf) return 2;
  if (b >= 0xe0 && b <= 0xef) return 3;
  if (b >= 0xf0 && b <= 0xf4) return 4;
  return 1;
}

/**
 * 在 TTY 下用原始模式读一行（逐字符读取、回显，遇 \r 或 \n 结束）
 * 支持 UTF-8 多字节字符（如中文）；避免通过 ./script 执行时终端未把 \r 当行尾导致回车无效
 *
 * Windows 兼容：setStdinRaw 在 Windows 上可能失败（返回 false），此时终端保持默认 echo。
 * 若程序再 writeStdoutSync 回显，会导致双重回显（用户误以为需二次确认）。仅在 isRaw 时回显。
 */
async function readLineRaw(): Promise<string | null> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let input = "";
  const pending: number[] = [];
  let isRaw = false;
  try {
    if (setStdinRaw(true, { cbreak: true })) {
      isRaw = true;
    }
    while (true) {
      const buf = new Uint8Array(10);
      const n = await readStdin(buf);
      if (n === null || n === 0) continue;
      // 遍历本次读取的所有字节，正确处理一次 read 返回 "1\r\n" 等情况
      for (let i = 0; i < n; i++) {
        const b = buf[i];
        if (b === 0x0d || b === 0x0a) {
          // 遇到回车/换行立即结束
          if (isRaw) writeStdoutSync(encoder.encode("\n"));
          return input.trim() || null;
        }
        if (b === 0x03) {
          if (isRaw) writeStdoutSync(encoder.encode("\n"));
          exit(0);
        }
        if (b === 0x7f || b === 0x08) {
          if (input.length > 0) {
            input = input.slice(0, -1);
            if (isRaw) writeStdoutSync(encoder.encode("\b \b"));
          }
          continue;
        }
        pending.push(b);
        const need = pending.length >= 1 ? utf8LeadLength(pending[0]) : 0;
        if (need > 0 && pending.length >= need) {
          const bytes = new Uint8Array(pending.splice(0, need));
          const ch = decoder.decode(bytes);
          input += ch;
          if (isRaw) writeStdoutSync(bytes);
        }
      }
    }
  } finally {
    if (isRaw) setStdinRaw(false);
  }
}

/**
 * 非 TTY 模式下 stdin 行缓冲（同一次 read 可能收到多行如 "a\nb\n"，需保留剩余部分）
 */
let _stdinLineBuffer: number[] = [];

/**
 * 读取一行输入（读到 \r 或 \n 为止，兼容不同终端的回车）
 * 当 stdin 为 TTY 时使用原始模式，与 deno run / ./script 行为一致
 * 非 TTY 时支持同一次 read 收到多行的情况，将剩余字节保留供下次 readLine 使用
 * @returns 输入的内容
 */
async function readLine(): Promise<string | null> {
  if (isStdinTerminal()) {
    return await readLineRaw();
  }
  const decoder = new TextDecoder();
  const parts: number[] = [..._stdinLineBuffer];
  _stdinLineBuffer = [];

  const flushLine = (): string | null => {
    const line = decoder.decode(new Uint8Array(parts)).trim();
    return line || null;
  };

  while (true) {
    // 检查 buffer 中是否已有完整行
    const newlineIdx = parts.findIndex((b) => b === 0x0d || b === 0x0a);
    if (newlineIdx >= 0) {
      const lineBytes = parts.splice(0, newlineIdx);
      const skip = (parts[0] === 0x0d && parts[1] === 0x0a) ? 2 : 1;
      parts.splice(0, skip);
      _stdinLineBuffer = parts;
      return decoder.decode(new Uint8Array(lineBytes)).trim() || null;
    }

    const buf = new Uint8Array(256);
    const n = await readStdin(buf);
    if (n === null || n === 0) {
      if (parts.length === 0) return null;
      return flushLine();
    }
    for (let i = 0; i < n; i++) parts.push(buf[i]);
  }
}

/**
 * 基础输入提示
 * @param message 提示信息
 * @param hidden 是否隐藏输入（用于密码，显示为 *）
 * @param options 可选：default（空回车时的默认值）、timeoutMs（超时毫秒，超时后返回 default 或 null）
 * @returns 用户输入的内容
 */
export async function prompt(
  message: string,
  hidden = false,
  options?: PromptOptions,
): Promise<string | null> {
  const encoder = new TextEncoder();
  const defaultVal = options?.default;
  const timeoutMs = options?.timeoutMs;
  const defaultLabel = defaultVal != null
    ? $t("prompt.defaultLabel", { defaultVal: String(defaultVal) })
    : "";
  const displayMessage = defaultVal != null
    ? `${message}${colors.dim} ${defaultLabel}${colors.reset}`
    : message;
  const formattedMessage =
    `${colors.cyan}${colors.bright}❯${colors.reset} ${colors.dim}${displayMessage}${colors.reset}`;

  writeStdoutSync(encoder.encode(formattedMessage));

  let result: string | null;
  if (hidden) {
    result = timeoutMs != null
      ? await Promise.race([
        readLineHidden(),
        sleep(timeoutMs).then(() => null),
      ])
      : await readLineHidden();
  } else {
    result = timeoutMs != null
      ? await Promise.race([
        readLine(),
        sleep(timeoutMs).then(() => null),
      ])
      : await readLine();
  }
  if ((result === null || result.trim() === "") && defaultVal != null) {
    return defaultVal;
  }
  return result;
}

/**
 * 读取隐藏输入（显示为 * 号）
 * @returns 用户输入的内容
 */
async function readLineHidden(): Promise<string | null> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let input = "";
  let isRaw = false;

  try {
    // 尝试启用原始模式
    if (setStdinRaw(true, { cbreak: true })) {
      isRaw = true;
    }

    while (true) {
      const buf = new Uint8Array(10);
      const n = await readStdin(buf);

      if (n === null || n === 0) {
        continue;
      }

      const bytes = buf.subarray(0, n);
      const char = bytes[0];

      // Enter 键（\r 或 \n）
      if (char === 0x0d || char === 0x0a) {
        break;
      }

      // Ctrl+C
      if (char === 0x03) {
        writeStdoutSync(encoder.encode("\n"));
        exit(0);
      }

      // 退格键或 Delete 键
      if (char === 0x7f || char === 0x08) {
        if (input.length > 0) {
          input = input.slice(0, -1);
          // 回退光标并清除字符
          writeStdoutSync(encoder.encode("\b \b"));
        }
        continue;
      }

      // 可打印字符（ASCII 32-126）
      if (char >= 32 && char <= 126) {
        input += decoder.decode(bytes.subarray(0, 1));
        // 显示 * 号
        writeStdoutSync(encoder.encode("*"));
      }
    }

    // 换行
    writeStdoutSync(encoder.encode("\n"));

    return input || null;
  } catch (_err) {
    // 如果原始模式失败，回退到普通输入
    if (isRaw) {
      setStdinRaw(false);
    }
    // 回退到普通输入（不隐藏）
    return await readLine();
  } finally {
    // 恢复终端
    if (isRaw) {
      setStdinRaw(false);
    }
  }
}

/**
 * 确认输入（yes/no）
 * @param message 提示信息
 * @param defaultValue 默认值（true 表示默认 yes，false 表示默认 no）
 * @returns 用户确认结果
 */
export async function confirm(
  message: string,
  defaultValue = false,
): Promise<boolean> {
  // Y/n、y/N 为 CLI 通用约定，不翻译
  const defaultText = defaultValue ? "Y/n" : "y/N";
  const input = await prompt(`${message} (${defaultText}): `);

  if (!input || input.trim() === "") {
    return defaultValue;
  }

  const lower = input.trim().toLowerCase();
  return lower === "y" || lower === "yes";
}

/**
 * 输入文本（带验证）
 * @param message 提示信息
 * @param validator 验证函数，返回错误信息或 null
 * @param required 是否必填
 * @param options 可选：default（空回车时的默认值）、timeoutMs（超时毫秒，超时后返回 default 或空字符串）
 * @returns 用户输入的内容；required 为 false 且空回车时返回 ""；timeout 时返回 options.default ?? ""
 */
export async function input(
  message: string,
  validator?: (value: string) => string | null,
  required = true,
  options?: InputOptions,
): Promise<string> {
  while (true) {
    const value = await prompt(message, false, options);

    if (!value || value.trim() === "") {
      if (required) {
        error($t("prompt.required"));
        continue;
      }
      return options?.default ?? "";
    }

    const trimmed = value.trim();

    if (validator) {
      const errorMsg = validator(trimmed);
      if (errorMsg) {
        error(errorMsg);
        continue;
      }
    }

    return trimmed;
  }
}

/**
 * 输入密码（带确认）
 * @param message 提示信息
 * @param minLength 最小长度
 * @param confirmMessage 确认提示信息
 * @returns 用户输入的密码
 */
export async function inputPassword(
  message?: string,
  minLength = 8,
  confirmMessage?: string,
): Promise<string> {
  const msg = message ?? $t("prompt.passwordPrompt");
  const confirmMsg = confirmMessage ?? $t("prompt.passwordConfirm");
  while (true) {
    const passwordHint = $t("prompt.passwordMinLength", {
      minLength: String(minLength),
    });
    const password = await prompt(`${msg}${passwordHint}`, true);

    if (!password || password.length < minLength) {
      error(
        $t("prompt.passwordEmptyOrShort", { minLength: String(minLength) }),
      );
      continue;
    }

    const confirmPassword = await prompt(confirmMsg, true);

    if (password !== confirmPassword) {
      error($t("prompt.passwordMismatch"));
      continue;
    }

    return password;
  }
}

/**
 * 输入邮箱（带验证）
 * @param message 提示信息
 * @param required 是否必填
 * @returns 用户输入的邮箱
 */
export async function inputEmail(
  message?: string,
  required = true,
): Promise<string> {
  const msg = message ?? $t("prompt.emailPrompt");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return await input(
    msg,
    (value) => {
      if (!emailRegex.test(value)) {
        return $t("prompt.emailInvalid");
      }
      return null;
    },
    required,
  );
}

/**
 * 输入用户名（带验证）
 * @param message 提示信息
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @param required 是否必填
 * @returns 用户输入的用户名
 */
export async function inputUsername(
  message?: string,
  minLength = 3,
  maxLength = 50,
  required = true,
): Promise<string> {
  const msg = message ?? $t("prompt.usernamePrompt");
  const usernameRegex = /^[a-zA-Z0-9_]+$/;

  return await input(
    msg,
    (value) => {
      if (value.length < minLength) {
        return $t("prompt.usernameMinLength", { minLength: String(minLength) });
      }
      if (value.length > maxLength) {
        return $t("prompt.usernameMaxLength", { maxLength: String(maxLength) });
      }
      if (!usernameRegex.test(value)) {
        return $t("prompt.usernameInvalid");
      }
      return null;
    },
    required,
  );
}

/**
 * 输入数字（带验证）
 * @param message 提示信息
 * @param min 最小值
 * @param max 最大值
 * @param required 是否必填
 * @returns 用户输入的数字
 */
export async function inputNumber(
  message: string,
  min?: number,
  max?: number,
  required = true,
): Promise<number> {
  while (true) {
    const value = await prompt(message);

    if (!value || value.trim() === "") {
      if (required) {
        error($t("prompt.numberRequired"));
        continue;
      }
      return NaN;
    }

    const num = Number(value.trim());

    if (isNaN(num)) {
      error($t("prompt.numberInvalid"));
      continue;
    }

    if (min !== undefined && num < min) {
      error($t("prompt.numberMin", { min: String(min) }));
      continue;
    }

    if (max !== undefined && num > max) {
      error($t("prompt.numberMax", { max: String(max) }));
      continue;
    }

    return num;
  }
}

/**
 * 单选（从选项列表中选择）
 * @param message 提示信息
 * @param options 选项列表
 * @param defaultValue 默认选项索引
 * @returns 选中的选项索引
 */
export async function select(
  message: string,
  options: string[],
  defaultValue?: number,
): Promise<number> {
  console.log(`\n${colors.cyan}${colors.bright}${message}${colors.reset}`);

  options.forEach((option, index) => {
    const marker = defaultValue === index
      ? `${colors.green}●${colors.reset}`
      : "○";
    console.log(
      `  ${marker} ${colors.dim}[${index + 1}]${colors.reset} ${option}`,
    );
  });

  while (true) {
    const max = options.length;
    const promptText = defaultValue !== undefined
      ? $t("prompt.selectPromptDefault", {
        max: String(max),
        default: String(defaultValue + 1),
      })
      : $t("prompt.selectPromptRange", { max: String(max) });
    const input = await prompt(`\n${promptText}`);

    if (!input || input.trim() === "") {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      error($t("prompt.selectChooseOne"));
      continue;
    }

    const num = Number(input.trim());

    if (isNaN(num) || num < 1 || num > options.length) {
      error($t("prompt.selectRange", { max: String(options.length) }));
      continue;
    }

    return num - 1;
  }
}

/**
 * 多选（从选项列表中选择多个）
 * @param message 提示信息
 * @param options 选项列表
 * @param min 最少选择数量
 * @param max 最多选择数量
 * @returns 选中的选项索引数组
 */
export async function multiSelect(
  message: string,
  options: string[],
  min = 1,
  max?: number,
): Promise<number[]> {
  console.log(`\n${colors.cyan}${colors.bright}${message}${colors.reset}`);

  options.forEach((option, index) => {
    console.log(`  ${colors.dim}[${index + 1}]${colors.reset} ${option}`);
  });

  const maxText = max ? $t("prompt.multiSelectMax", { max: String(max) }) : "";
  const minText = min > 0
    ? $t("prompt.multiSelectMin", { min: String(min) })
    : "";

  while (true) {
    const promptText = $t("prompt.multiSelectPrompt", { minText, maxText });
    const input = await prompt(`\n${promptText}`);

    if (!input || input.trim() === "") {
      if (min === 0) {
        return [];
      }
      error($t("prompt.multiSelectAtLeastOne"));
      continue;
    }

    const parts = input.split(",").map((p) => p.trim()).filter((p) => p !== "");
    const indices = parts.map((p) => Number(p)).filter((n) =>
      !isNaN(n) && n >= 1 && n <= options.length
    );

    if (indices.length === 0) {
      error($t("prompt.multiSelectValid"));
      continue;
    }

    // 去重并转换为 0-based 索引
    const uniqueIndices = [...new Set(indices)].map((n) => n - 1);

    if (uniqueIndices.length < min) {
      error($t("prompt.multiSelectMinCount", { min: String(min) }));
      continue;
    }

    if (max !== undefined && uniqueIndices.length > max) {
      error($t("prompt.multiSelectMaxCount", { max: String(max) }));
      continue;
    }

    return uniqueIndices.sort((a, b) => a - b);
  }
}

/**
 * 等待用户按键继续
 * @param message 提示信息
 */
export async function pause(message?: string): Promise<void> {
  const msg = message ?? $t("prompt.pauseDefault");
  await prompt(msg);
}

/**
 * 交互式菜单选择（支持上下键导航）
 * @param message 提示信息
 * @param options 选项列表
 * @param defaultValue 默认选项索引
 * @returns 选中的选项索引
 */
export async function interactiveMenu(
  message: string,
  options: string[],
  defaultValue = 0,
): Promise<number> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let selectedIndex = defaultValue;

  // 显示菜单
  const renderMenu = () => {
    // 移动光标到行首并清除当前行
    writeStdoutSync(encoder.encode("\r\x1b[K"));

    // 显示标题
    console.log(`${colors.cyan}${colors.bright}${message}${colors.reset}\n`);

    // 显示选项
    options.forEach((option, index) => {
      if (index === selectedIndex) {
        // 选中的选项：高亮显示
        console.log(
          `  ${colors.green}${colors.bright}▶${colors.reset} ${colors.green}${colors.bright}${option}${colors.reset}`,
        );
      } else {
        // 未选中的选项：普通显示
        console.log(`    ${colors.dim}${option}${colors.reset}`);
      }
    });

    console.log(
      `\n${colors.dim}${$t("prompt.menuHint")}${colors.reset}`,
    );
  };

  // 尝试使用原始模式（Windows 下 setStdinRaw 可能失败，此时回退到数字选择）
  try {
    const isRaw = setStdinRaw(true, { cbreak: true });
    if (!isRaw) {
      return await select(message, options, defaultValue);
    }

    // 隐藏光标
    writeStdoutSync(encoder.encode("\x1b[?25l"));

    renderMenu();

    while (true) {
      const buf = new Uint8Array(10);
      const n = await readStdin(buf);

      if (n === null || n === 0) {
        continue;
      }

      const bytes = buf.subarray(0, n);
      const input = decoder.decode(bytes);

      // 处理方向键（ANSI 与 Windows 应用模式）
      // 上: ESC [ A 或 ESC O A；下: ESC [ B 或 ESC O B
      if (bytes[0] === 0x1b) {
        let arrow: "up" | "down" | "esc" | null = parseArrowKey(bytes, n);
        if (arrow === null && n < 3) {
          arrow = await readEscSequence(bytes.subarray(0, n));
        }
        if (arrow === "up") {
          selectedIndex = selectedIndex > 0
            ? selectedIndex - 1
            : options.length - 1;
          writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
          renderMenu();
        } else if (arrow === "down") {
          selectedIndex = selectedIndex < options.length - 1
            ? selectedIndex + 1
            : 0;
          writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
          renderMenu();
        } else if (arrow === "esc") {
          writeStdoutSync(encoder.encode("\x1b[?25h"));
          if (isRaw) setStdinRaw(false);
          exit(0);
        }
        continue;
      }

      // 检测 Enter（含多字节如 "1\r\n" 时，取数字键并确认）
      let hasEnter = input === "\r" || input === "\n" ||
        bytes[0] === 0x0d || bytes[0] === 0x0a;
      let digitBeforeEnter = -1;
      if (!hasEnter) {
        for (let i = 0; i < n; i++) {
          if (bytes[i] === 0x0d || bytes[i] === 0x0a) {
            hasEnter = true;
            break;
          }
          if (digitBeforeEnter === -1 && bytes[i] >= 0x31 && bytes[i] <= 0x39) {
            digitBeforeEnter = bytes[i] - 0x30;
          }
        }
      }
      if (hasEnter) {
        if (digitBeforeEnter >= 1 && digitBeforeEnter <= options.length) {
          selectedIndex = Math.min(digitBeforeEnter - 1, options.length - 1);
        }
        break;
      }
      if (bytes[0] === 0x03) {
        writeStdoutSync(encoder.encode("\x1b[?25h"));
        if (isRaw) setStdinRaw(false);
        exit(0);
      }
    }

    // 恢复终端
    writeStdoutSync(encoder.encode("\x1b[?25h"));
    if (isRaw) {
      setStdinRaw(false);
    }

    // 清屏
    writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));

    return selectedIndex;
  } catch (_err) {
    // 如果原始模式不支持，回退到普通选择
    console.log(
      `\n${colors.yellow}${$t("prompt.menuFallback")}${colors.reset}\n`,
    );
    return await select(message, options, defaultValue);
  }
}

/** 多选菜单的配置 */
export interface InteractiveMultiMenuOptions {
  /** 最少选择数量 */
  min?: number;
  /** 最多选择数量（不设则不限制） */
  max?: number;
}

/**
 * 交互式多选菜单（空格勾选/取消，Enter 确认）
 * @param message 提示信息
 * @param options 选项列表
 * @param initialSelected 初始选中索引（默认空）
 * @param menuOptions min/max 限制
 * @returns 选中的选项索引数组
 */
export async function interactiveMultiMenu(
  message: string,
  options: string[],
  initialSelected: number[] = [],
  menuOptions: InteractiveMultiMenuOptions = {},
): Promise<number[]> {
  const encoder = new TextEncoder();
  const { min = 0, max } = menuOptions;
  const selected = new Set(
    initialSelected.filter((i) => i >= 0 && i < options.length),
  );
  let cursor = selected.size > 0 ? Math.min(...selected) : 0;

  const renderMenu = () => {
    writeStdoutSync(encoder.encode("\r\x1b[K"));
    console.log(`${colors.cyan}${colors.bright}${message}${colors.reset}\n`);
    options.forEach((option, index) => {
      const checked = selected.has(index);
      const isCursor = index === cursor;
      const check = checked ? `${colors.green}●${colors.reset}` : "○";
      const line = isCursor
        ? `  ${colors.green}${colors.bright}▶${colors.reset} ${check} ${colors.green}${colors.bright}${option}${colors.reset}`
        : `    ${check} ${colors.dim}${option}${colors.reset}`;
      console.log(line);
    });
    const minText = min > 0
      ? $t("prompt.multiMenuMin", { min: String(min) })
      : "";
    const maxText = max != null
      ? $t("prompt.multiMenuMax", { max: String(max) })
      : "";
    const hint = $t("prompt.multiMenuHint");
    console.log(
      `\n${colors.dim}${hint}${minText}${maxText}${colors.reset}`,
    );
  };

  try {
    const isRaw = setStdinRaw(true, { cbreak: true });
    if (!isRaw) {
      return await multiSelect(message, options, min, max);
    }

    writeStdoutSync(encoder.encode("\x1b[?25l"));
    renderMenu();

    while (true) {
      const buf = new Uint8Array(10);
      const n = await readStdin(buf);
      if (n === null || n === 0) continue;
      const bytes = buf.subarray(0, n);

      if (bytes[0] === 0x1b) {
        let arrow: "up" | "down" | "esc" | null = parseArrowKey(bytes, n);
        if (arrow === null && n < 3) {
          arrow = await readEscSequence(bytes.subarray(0, n));
        }
        if (arrow === "up") {
          cursor = cursor > 0 ? cursor - 1 : options.length - 1;
          writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
          renderMenu();
        } else if (arrow === "down") {
          cursor = cursor < options.length - 1 ? cursor + 1 : 0;
          writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
          renderMenu();
        } else if (arrow === "esc") {
          writeStdoutSync(encoder.encode("\x1b[?25h"));
          if (isRaw) setStdinRaw(false);
          exit(0);
        }
        continue;
      }

      if (bytes[0] === 0x20) {
        if (selected.has(cursor)) {
          selected.delete(cursor);
        } else {
          if (max != null && selected.size >= max) continue;
          selected.add(cursor);
        }
        writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
        renderMenu();
        continue;
      }

      // 检测 Enter（含多字节如 "1\r\n"）
      let hasEnterMulti = false;
      for (let i = 0; i < n; i++) {
        if (bytes[i] === 0x0d || bytes[i] === 0x0a) {
          hasEnterMulti = true;
          break;
        }
      }
      if (hasEnterMulti) {
        const arr = [...selected].sort((a, b) => a - b);
        if (arr.length < min) continue;
        writeStdoutSync(encoder.encode("\x1b[?25h"));
        if (isRaw) setStdinRaw(false);
        writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
        return arr;
      }

      if (bytes[0] === 0x03) {
        writeStdoutSync(encoder.encode("\x1b[?25h"));
        if (isRaw) setStdinRaw(false);
        exit(0);
      }
    }
  } catch (_err) {
    writeStdoutSync(encoder.encode("\x1b[?25h"));
    setStdinRaw(false);
    return await multiSelect(message, options, min, max);
  }
}

/**
 * 可搜索的交互式单选菜单（输入过滤，↑↓ 选择，Enter 确认）
 * @param message 提示信息
 * @param options 选项列表
 * @param defaultValue 默认选中索引
 * @returns 选中的选项索引（在原始 options 中的索引）
 */
export async function interactiveMenuSearch(
  message: string,
  options: string[],
  defaultValue = 0,
): Promise<number> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let search = "";
  let selectedIndex = defaultValue >= 0 && defaultValue < options.length
    ? defaultValue
    : 0;
  let filteredIndices = options.map((_, i) => i);

  const filterOptions = () => {
    if (!search.trim()) {
      filteredIndices = options.map((_, i) => i);
      return;
    }
    const lower = search.toLowerCase();
    filteredIndices = options
      .map((text, i) => (text.toLowerCase().includes(lower) ? i : -1))
      .filter((i) => i >= 0);
    if (
      filteredIndices.length > 0 && !filteredIndices.includes(selectedIndex)
    ) {
      selectedIndex = filteredIndices[0];
    } else if (filteredIndices.length === 0) {
      selectedIndex = -1;
    }
  };

  const renderMenu = () => {
    writeStdoutSync(encoder.encode("\r\x1b[K"));
    console.log(`${colors.cyan}${colors.bright}${message}${colors.reset}\n`);
    if (search) {
      const filterLabel = $t("prompt.searchFilter");
      console.log(`${colors.dim}${filterLabel}${search}${colors.reset}\n`);
    }
    const noMatchText = $t("prompt.searchNoMatch");
    const toShow = filteredIndices.length === 0
      ? [{ index: -1, text: noMatchText }]
      : filteredIndices.map((i) => ({ index: i, text: options[i] }));
    toShow.forEach(({ index, text }) => {
      const isSel = index === selectedIndex;
      const line = isSel
        ? `  ${colors.green}${colors.bright}▶${colors.reset} ${colors.green}${colors.bright}${text}${colors.reset}`
        : `    ${colors.dim}${text}${colors.reset}`;
      console.log(line);
    });
    const searchHint = $t("prompt.searchHint");
    console.log(
      `\n${colors.dim}${searchHint}${colors.reset}`,
    );
  };

  try {
    const isRaw = setStdinRaw(true, { cbreak: true });
    if (!isRaw) {
      return await select(message, options, defaultValue);
    }

    writeStdoutSync(encoder.encode("\x1b[?25l"));
    filterOptions();
    renderMenu();

    while (true) {
      const buf = new Uint8Array(10);
      const n = await readStdin(buf);
      if (n === null || n === 0) continue;
      const bytes = buf.subarray(0, n);

      if (bytes[0] === 0x1b) {
        let arrow: "up" | "down" | "esc" | null = parseArrowKey(bytes, n);
        if (arrow === null && n < 3) {
          arrow = await readEscSequence(bytes.subarray(0, n));
        }
        if (arrow === "up") {
          if (filteredIndices.length > 0) {
            const idx = filteredIndices.indexOf(selectedIndex);
            selectedIndex = idx <= 0
              ? filteredIndices[filteredIndices.length - 1]
              : filteredIndices[idx - 1];
          }
          writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
          renderMenu();
        } else if (arrow === "down") {
          if (filteredIndices.length > 0) {
            const idx = filteredIndices.indexOf(selectedIndex);
            selectedIndex = idx < 0 || idx >= filteredIndices.length - 1
              ? filteredIndices[0]
              : filteredIndices[idx + 1];
          }
          writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
          renderMenu();
        } else if (arrow === "esc") {
          writeStdoutSync(encoder.encode("\x1b[?25h"));
          if (isRaw) setStdinRaw(false);
          exit(0);
        }
        continue;
      }

      // 检测 Enter（含多字节如 "a\r\n"）
      let hasEnterSearch = false;
      for (let i = 0; i < n; i++) {
        if (bytes[i] === 0x0d || bytes[i] === 0x0a) {
          hasEnterSearch = true;
          break;
        }
      }
      if (hasEnterSearch) {
        if (filteredIndices.length > 0 && selectedIndex >= 0) {
          writeStdoutSync(encoder.encode("\x1b[?25h"));
          if (isRaw) setStdinRaw(false);
          writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
          return selectedIndex;
        }
        continue;
      }

      if (bytes[0] === 0x03) {
        writeStdoutSync(encoder.encode("\x1b[?25h"));
        if (isRaw) setStdinRaw(false);
        exit(0);
      }

      if (bytes[0] === 0x7f || bytes[0] === 0x08) {
        search = search.slice(0, -1);
        filterOptions();
        writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
        renderMenu();
        continue;
      }

      if (bytes[0] >= 32 && bytes[0] <= 126) {
        search += decoder.decode(bytes.subarray(0, 1));
        filterOptions();
        writeStdoutSync(encoder.encode("\x1b[2J\x1b[H"));
        renderMenu();
      }
    }
  } catch (_err) {
    writeStdoutSync(encoder.encode("\x1b[?25h"));
    setStdinRaw(false);
    return await select(message, options, defaultValue);
  }
}
