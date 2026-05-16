import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings, getLandingSettings } from "@/lib/settings/get";
import { resolveNav } from "@/lib/landing/helpers";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { PrismButton } from "./ui/prism-button";
import { PrismMobileMenu } from "./prism-mobile-menu";

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
          className="rounded-2xl border-2 border-white/15 shadow-[6px_6px_0_0_rgba(255,43,181,0.55)]"
          style={{
            background: "rgba(11, 11, 20, 0.78)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          }}
        >
          <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-4">
            <div className="flex items-center gap-2">
              <PrismMobileMenu profile={profile} locale={locale} navItems={navItems} />
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
                  <span className="prism-ring h-9 w-9">
                    <span className="h-full w-full grid place-items-center text-white text-sm font-black">
                      {(siteName || "P").slice(0, 1).toUpperCase()}
                    </span>
                  </span>
                )}
                <span className="text-base font-black tracking-tight text-white">
                  {siteName}
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="prism-nav-link">
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
                  <PrismButton asChild size="sm" variant="ghost">
                    <Link href="/login">{tc("login")}</Link>
                  </PrismButton>
                  <PrismButton asChild size="sm" variant="primary">
                    <Link href="/register">{tc("register")}</Link>
                  </PrismButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
