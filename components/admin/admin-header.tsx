import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { MobileAdminNav } from "@/components/admin/admin-sidebar";
import type { Profile } from "@/types/database";

export async function AdminHeader({ profile }: { profile: Profile }) {
  const tc = await getTranslations("common");
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left: mobile trigger + logo */}
        <div className="flex items-center gap-2">
          <MobileAdminNav role={profile.role} locale={locale} />
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
              ⚡
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-sm font-bold">{tc("siteName")}</span>
              <span className="ms-1.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {locale === "ar" ? "عرض الموقع ↗" : "View site ↗"}
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <LocaleSwitcher currentLocale={locale} />
          <NotificationsBell userId={profile.id} />
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
