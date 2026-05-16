import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationInput = {
  user_id: string;
  title: string;
  body?: string | null;
  type?: string | null;
  link?: string | null;
};

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

export async function notifyAdmins(payload: Omit<NotificationInput, "user_id">) {
  const supabase = createAdminClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["admin", "sales"]);

  if (!admins) return;
  await Promise.all(
    admins.map((a) =>
      createNotification({ ...payload, user_id: (a as { id: string }).id })
    )
  );
}
