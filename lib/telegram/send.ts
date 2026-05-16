import "server-only";

import { getTelegramSettings } from "@/lib/settings/get";
import type { TelegramEvent } from "@/types/database";

/**
 * Telegram Bot API integration.
 *
 * Workflow:
 * 1. Admin creates a bot via @BotFather → gets bot_token.
 * 2. Admin starts a chat with the bot and visits
 *    https://api.telegram.org/bot<TOKEN>/getUpdates to obtain admin_chat_id.
 * 3. Save both in /admin/settings → Telegram tab.
 *
 * Templates support these placeholders, replaced when sending:
 *   {order_number}, {customer_name}, {service_name},
 *   {estimated_price}, {final_price}, {amount}, {currency},
 *   {method}, {reason}, {rating}, {comment}, {preview},
 *   {new_status}, {old_status}, {order_url}
 *
 * Markdown is enabled (parse_mode: MarkdownV2 is fragile; we use legacy
 * Markdown for simplicity since templates are admin-controlled).
 */

const API_BASE = "https://api.telegram.org";

export type TelegramTemplateVars = Partial<{
  order_number: string;
  customer_name: string;
  service_name: string;
  estimated_price: string | number;
  final_price: string | number;
  amount: string | number;
  currency: string;
  method: string;
  reason: string;
  rating: string | number;
  comment: string;
  preview: string;
  new_status: string;
  old_status: string;
  order_url: string;
}>;

function fillTemplate(template: string, vars: TelegramTemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = (vars as Record<string, unknown>)[key];
    return v == null ? "" : String(v);
  });
}

/**
 * Send a Telegram message to the admin chat. Resolves to:
 * - true when sent
 * - false when disabled / missing config / API rejected
 *
 * Never throws — Telegram is best-effort.
 */
export async function sendTelegramForEvent(
  event: TelegramEvent,
  vars: TelegramTemplateVars
): Promise<boolean> {
  try {
    const cfg = await getTelegramSettings();
    if (!cfg?.enabled) return false;
    if (!cfg.bot_token || !cfg.admin_chat_id) return false;
    if (!cfg.events?.[event]) return false;

    const template = cfg.templates?.[event];
    if (!template) return false;

    const text = fillTemplate(template, vars);
    return await sendTelegramRaw(cfg.bot_token, cfg.admin_chat_id, text);
  } catch (err) {
    console.error("[telegram] sendTelegramForEvent failed:", err);
    return false;
  }
}

/**
 * Lower-level: send raw text to a specific chat. Used for the "test message"
 * button in the settings UI.
 */
export async function sendTelegramRaw(
  botToken: string,
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
      // Don't keep the request alive too long if Telegram is slow.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[telegram] sendMessage failed:", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] sendMessage error:", err);
    return false;
  }
}
