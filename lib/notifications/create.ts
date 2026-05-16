import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramForEvent, type TelegramTemplateVars } from "@/lib/telegram/send";
import type { TelegramEvent } from "@/types/database";

export type NotificationInput = {
  user_id: string;
  title: string;
  body?: string | null;
  type?: string | null;
  link?: string | null;
};

/**
 * Insert a single in-app notification. Errors are logged but never thrown —
 * notifications are best-effort and should not break the calling flow.
 */
export async function createNotification(n: NotificationInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: n.user_id,
    title: n.title,
    body: n.body ?? null,
    type: n.type ?? null,
    link: n.link ?? null,
  });
  if (error) console.error("Failed to create notification:", error.message);
}

/**
 * Broadcast a notification to every admin/sales user. Optionally fires a
 * Telegram message too (if a telegramEvent is provided and Telegram is
 * configured + enabled for that event).
 */
export async function notifyAdmins(
  payload: Omit<NotificationInput, "user_id"> & {
    /** When set, also dispatch a Telegram message using this event's template. */
    telegramEvent?: TelegramEvent;
    telegramVars?: TelegramTemplateVars;
  }
) {
  const supabase = createAdminClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["admin", "sales"]);

  if (admins) {
    await Promise.all(
      admins.map((a) =>
        createNotification({
          user_id: (a as { id: string }).id,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          link: payload.link,
        })
      )
    );
  }

  // Fan out to Telegram (best-effort, never blocks/throws)
  if (payload.telegramEvent) {
    sendTelegramForEvent(payload.telegramEvent, payload.telegramVars ?? {}).catch(
      (e) => console.error("[telegram] fan-out failed:", e)
    );
  }
}
