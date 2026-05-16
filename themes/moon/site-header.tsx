import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings, getLandingSettings } from "@/lib/settings/get";
import { resolveNav } from "@/lib/landing/helpers";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { MoonButton } from "./ui/moon-button";
import { MoonMobileMenu } from "./moon-mobile-menu";

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
          className="rounded-2xl border border-white/[0.07] shadow-[0_10px_40px_-15px_rgba(96,165,250,0.30)]"
          style={{
            background: "rgba(13, 24, 46, 0.65)",
            backdropFilter: "blur(18px) saturate(150%)",
            WebkitBackdropFilter: "blur(18px) saturate(150%)",
          }}
        >
          <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <MoonMobileMenu profile={profile} locale={locale} navItems={navItems} />
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
                  <span className="grid place-items-center h-8 w-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white text-sm font-bold shadow-md">
                    {(siteName || "M").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="text-base font-bold text-white tracking-tight">
                  {siteName}
                </span>
              </Link>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="moon-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <LocaleSwitcher currentLocale={locale} />
              {profile ? (
                <>
                  <NotificationsBell userId={profile.id} />
                  <UserMenu profile={profile} />
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <MoonButton asChild size="sm" variant="ghost">
                    <Link href="/login">{tc("login")}</Link>
                  </MoonButton>
                  <MoonButton asChild size="sm" variant="primary">
                    <Link href="/register">{tc("register")}</Link>
                  </MoonButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
