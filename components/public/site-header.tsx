import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings, getLandingSettings } from "@/lib/settings/get";
import { resolveNav } from "@/lib/landing/helpers";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { MobileMenu } from "@/components/public/mobile-menu";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const [profile, site, landing] = await Promise.all([
    getCurrentProfile(),
    getSiteSettings(),
    getLandingSettings().catch(() => null),
  ]);

  const isAr = locale === "ar";
  const siteName = site ? (isAr ? site.name_ar : site.name_en) : tc("siteName");
  const navItems = resolveNav(landing, locale, {
    services: tc("services"),
    portfolio: tc("portfolio"),
    blog: tc("blog"),
    about: tc("about"),
    contact: tc("contact"),
  });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MobileMenu profile={profile} siteName={siteName} locale={locale} />
          <Link
            href="/"
            className="flex items-center gap-2 whitespace-nowrap"
            aria-label={siteName}
          >
            {site?.logo_url ? (
              <Image
                src={site.logo_url}
                alt={siteName}
                width={32}
                height={32}
                className="h-8 w-auto object-contain"
                unoptimized
              />
            ) : null}
            <span className="text-xl font-bold">{siteName}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LocaleSwitcher currentLocale={locale} />
          {profile ? (
            <>
              <NotificationsBell userId={profile.id} />
              <UserMenu profile={profile} />
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{tc("login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{tc("register")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
