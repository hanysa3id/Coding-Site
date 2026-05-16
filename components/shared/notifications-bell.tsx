"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { formatDateTime } from "@/lib/utils";
import type { AppNotification } from "@/types/database";

export function NotificationsBell({ userId }: { userId: string }) {
  const locale = useLocale() as "ar" | "en";
  const isAr = locale === "ar";
  const supabase = createClient();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isPending, startTransition] = useTransition();

  const unread = items.filter((n) => !n.is_read).length;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);
      if (mounted && data) setItems(data as AppNotification[]);
    })();

    const channel = supabase
      .channel(`notif-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setItems((prev) => [payload.new as AppNotification, ...prev].slice(0, 15));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  function markAllRead() {
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    startTransition(async () => {
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 end-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <span className="font-semibold text-sm">
            {isAr ? "الإشعارات" : "Notifications"}
          </span>
          {unread > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={markAllRead}
              disabled={isPending}
            >
              <Check className="h-3 w-3" />
              {isAr ? "تعليم الكل كمقروء" : "Mark all read"}
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {isAr ? "لا توجد إشعارات" : "No notifications"}
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`p-3 hover:bg-muted/30 ${!n.is_read ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                >
                  {n.link ? (
                    <a href={`/${locale}${n.link}`} className="block">
                      <NotificationBody n={n} locale={locale} />
                    </a>
                  ) : (
                    <NotificationBody n={n} locale={locale} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationBody({ n, locale }: { n: AppNotification; locale: "ar" | "en" }) {
  return (
    <>
      <p className="font-medium text-sm">{n.title}</p>
      {n.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>}
      <p className="text-xs text-muted-foreground mt-1">
        {formatDateTime(n.created_at, locale === "ar" ? "ar-EG" : "en-US")}
      </p>
    </>
  );
}
