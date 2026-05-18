import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings, getLandingSettings } from "@/lib/settings/get";
import { resolveNav } from "@/lib/landing/helpers";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { HanyButton } from "./ui/hany-button";
import { HanyMobileMenu } from "./hany-mobile-menu";

export async function SiteHeader() {
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const isAr = locale === "ar";
  const [profile, site, landing] = await Promise.all([
    getCurrentProfile(),
    getSiteSettings(),
    getLandingSettings().catch(() => null),
  ]);

  const siteName = site ? (isAr ? site.name_ar : site.name_en) : tc("siteName");
  const navItems = resolveNav(landing, locale, {
    services: tc("services"),
    portfolio: tc("portfolio"),
    blog: tc("blog"),
    about: tc("about"),
    contact: tc("contact"),
  });

  return (
    <header className="sticky top-0 z-50 pt-3 px-3 md:px-4">
      <div className="container">
        <div className="hany-glass rounded-2xl shadow-[0_8px_30px_-12px_rgba(15,23,42,0.10)]">
          <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-4">
            {/* Left: logo + mobile menu */}
            <div className="flex items-center gap-2">
              <HanyMobileMenu profile={profile} locale={locale} items={navItems} />
              <Link href="/" className="flex items-center gap-2.5">
                {site?.logo_url ? (
                  <Image
                    src={site.logo_url}
                    alt={siteName}
                    width={32}
                    height={32}
                    className="h-8 w-auto object-contain"
                    unoptimized
                  />
                ) : (
                  <span
                    className="grid place-items-center h-8 w-8 rounded-xl text-white text-sm font-bold shadow-md"
                    style={{ background: "var(--hany-grad)" }}
                  >
                    {(siteName || "H").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="text-base font-bold tracking-tight">{siteName}</span>
              </Link>
            </div>

            {/* Center: nav */}
            <nav className="hidden md:flex items-center">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hany-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <LocaleSwitcher currentLocale={locale} />
              {profile ? (
                <>
                  <NotificationsBell userId={profile.id} />
                  <UserMenu profile={profile} />
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <HanyButton asChild size="sm" variant="ghost">
                    <Link href="/login">{tc("login")}</Link>
                  </HanyButton>
                  <HanyButton asChild size="sm" variant="primary">
                    <Link href="/register">{tc("register")}</Link>
                  </HanyButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
