/**
 * 加载指示器（Spinner）
 * 执行中显示旋转动画，适用于长时间任务
 */

import { colorize } from "./ansi.ts";
import { writeStdoutSync } from "./runtime-utils.ts";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const INTERVAL_MS = 80;

let intervalId: ReturnType<typeof setInterval> | null = null;
let currentText = "";

/**
 * 渲染当前帧到终端（同一行覆盖）
 */
function render(frame: string): void {
  const line = `\r ${frame} ${currentText}`;
  const encoder = new TextEncoder();
  writeStdoutSync(encoder.encode(line));
}

/**
 * 启动 Spinner
 * @param text 提示文案（可选）
 */
export function startSpinner(text = ""): void {
  stopSpinner();
  currentText = text;
  let i = 0;
  render(FRAMES[i]);
  intervalId = setInterval(() => {
    i = (i + 1) % FRAMES.length;
    render(FRAMES[i]);
  }, INTERVAL_MS);
}

/**
 * 停止 Spinner（不输出结果，仅清行）
 */
export function stopSpinner(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  currentText = "";
}

/**
 * 停止 Spinner 并输出成功信息
 * @param message 成功文案（可选，不传则只停止）
 */
export function succeedSpinner(message?: string): void {
  stopSpinner();
  if (message !== undefined && message !== "") {
    const encoder = new TextEncoder();
    writeStdoutSync(encoder.encode("\r" + " ".repeat(80) + "\r"));
    console.log(
      `${colorize("✓", "green", true)} ${colorize(message, "green")}`,
    );
  }
}

/**
 * 停止 Spinner 并输出失败信息
 * @param message 失败文案（可选，不传则只停止）
 */
export function failSpinner(message?: string): void {
  stopSpinner();
  if (message !== undefined && message !== "") {
    const encoder = new TextEncoder();
    writeStdoutSync(encoder.encode("\r" + " ".repeat(80) + "\r"));
    console.error(`${colorize("✗", "red", true)} ${colorize(message, "red")}`);
  }
}
