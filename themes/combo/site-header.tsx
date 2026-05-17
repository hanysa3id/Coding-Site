import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings, getLandingSettings } from "@/lib/settings/get";
import { resolveNav } from "@/lib/landing/helpers";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { ComboButton } from "./ui/combo-button";
import { ComboMobileMenu } from "./combo-mobile-menu";

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
        <div
          className="rounded-2xl border border-white/10 shadow-[0_18px_50px_-22px_rgba(139,92,246,0.55)]"
          style={{
            background: "rgba(14, 6, 35, 0.78)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          }}
        >
          <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-4">
            <div className="flex items-center gap-2">
              <ComboMobileMenu profile={profile} locale={locale} navItems={navItems} />
              <Link href="/" className="flex items-center gap-2.5 group">
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
                    className="grid place-items-center h-9 w-9 rounded-xl text-white text-sm font-bold shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)",
                      boxShadow: "0 8px 20px -8px rgba(139,92,246,0.65)",
                    }}
                  >
                    {(siteName || "C").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="text-base font-bold text-white tracking-tight">
                  {siteName}
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="combo-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <LocaleSwitcher currentLocale={locale} />
              {profile ? (
                <>
                  <NotificationsBell userId={profile.id} />
                  <UserMenu profile={profile} />
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <ComboButton asChild size="sm" variant="ghost">
                    <Link href="/login">{tc("login")}</Link>
                  </ComboButton>
                  <ComboButton asChild size="sm" variant="primary">
                    <Link href="/register">{tc("register")}</Link>
                  </ComboButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
