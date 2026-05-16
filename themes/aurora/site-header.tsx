import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings, getLandingSettings } from "@/lib/settings/get";
import { resolveNav } from "@/lib/landing/helpers";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { AuroraMobileMenu } from "./aurora-mobile-menu";
import { AuroraButton } from "./ui/aurora-button";

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
    <header
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        backgroundColor: "rgba(7, 7, 13, 0.65)",
      }}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AuroraMobileMenu profile={profile} locale={locale} />
          <Link
            href="/"
            className="flex items-center gap-2.5 whitespace-nowrap"
            aria-label={siteName}
          >
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
              <span className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 text-white text-xs font-bold">
                {(siteName || "S").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="text-base font-semibold text-white tracking-tight">
              {siteName}
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
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
            <div className="hidden sm:flex items-center gap-2">
              <AuroraButton asChild size="md" variant="ghost">
                <Link href="/login">{tc("login")}</Link>
              </AuroraButton>
              <AuroraButton asChild size="md" variant="primary">
                <Link href="/register">{tc("register")}</Link>
              </AuroraButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm text-white/65 hover:text-white rounded-md transition-colors"
    >
      {children}
    </Link>
  );
}
