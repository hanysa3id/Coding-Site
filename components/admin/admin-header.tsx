import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import type { Profile } from "@/types/database";

export async function AdminHeader({ profile }: { profile: Profile }) {
  const tc = await getTranslations("common");
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <span className="text-primary">⚡</span>
          {tc("siteName")} · Admin
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            {locale === "ar" ? "عرض الموقع" : "View site"}
          </Link>
          <LocaleSwitcher currentLocale={locale} />
          <NotificationsBell userId={profile.id} />
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
