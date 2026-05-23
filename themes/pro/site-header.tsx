import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings, getLandingSettings } from "@/lib/settings/get";
import { resolveNav } from "@/lib/landing/helpers";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { ProMobileMenu } from "./pro-mobile-menu";
import { ProHeaderClient } from "./pro-header-client";

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
    <ProHeaderClient>
      <div className="container mx-auto max-w-7xl pt-2 px-4">
        <div className="pro-glass-bar grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3.5 py-1.5">
          
          {/* Logo & Mobile Menu */}
          <div className="flex items-center gap-2">
            <ProMobileMenu profile={profile} locale={locale} items={navItems} />
            <Link href="/" className="flex items-center gap-2">
              {site?.logo_url ? (
                <Image
                  src={site.logo_url}
                  alt={siteName}
                  width={28}
                  height={28}
                  className="h-7 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <span
                  className="grid place-items-center h-7.5 w-7.5 rounded-lg text-slate-950 text-xs font-bold shadow-lg"
                  style={{ background: "linear-gradient(135deg, var(--pro-primary), var(--pro-secondary))" }}
                >
                  {(siteName || "P").slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="text-[0.95rem] font-bold tracking-tight text-white hidden sm:block">
                {siteName}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center gap-1" aria-label={isAr ? "روابط رئيسية" : "Main links"}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="pro-nav-link text-[13px] font-medium tracking-wide text-slate-300 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-2 justify-end">
            <LocaleSwitcher currentLocale={locale} />
            {profile ? (
              <>
                <NotificationsBell userId={profile.id} />
                <UserMenu profile={profile} />
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="pro-btn pro-btn-ghost text-xs py-1.5 px-3 font-semibold"
                >
                  {tc("login")}
                </Link>
                <Link
                  href="/register"
                  className="pro-btn pro-btn-primary text-xs py-1.5 px-3.5 font-bold text-slate-950 rounded-lg"
                  style={{ color: "#000" }}
                >
                  {tc("register")}
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </ProHeaderClient>
  );
}
