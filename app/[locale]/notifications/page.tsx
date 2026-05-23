export const dynamic = 'force-dynamic';
import { getLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth/guards";
import { SiteHeader } from "@/components/public/site-header";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { AppNotification } from "@/types/database";

export default async function NotificationsPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const profile = await requireUser();

  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Mark all as read on view
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);

  const items = (notifications as AppNotification[]) ?? [];

  return (
    <>
      <SiteHeader />
      <main className="container py-8 max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{isAr ? "الإشعارات" : "Notifications"}</h1>
          <p className="text-muted-foreground">
            {isAr ? `${items.length} إشعار` : `${items.length} notifications`}
          </p>
        </header>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                {isAr ? "لا توجد إشعارات" : "No notifications"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {items.map((n) => {
                  const Body = (
                    <>
                      <p className="font-medium">{n.title}</p>
                      {n.body && (
                        <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(n.created_at, isAr ? "ar-EG" : "en-US")}
                      </p>
                    </>
                  );
                  return (
                    <li key={n.id} className="p-4 hover:bg-muted/30">
                      {n.link ? <Link href={n.link as never}>{Body}</Link> : Body}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
