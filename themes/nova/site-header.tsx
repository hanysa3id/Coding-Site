import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings } from "@/lib/settings/get";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { NovaButton } from "./ui/nova-button";
import { NovaMobileMenu } from "./nova-mobile-menu";
import { Github } from "lucide-react";

export async function SiteHeader() {
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const [profile, site] = await Promise.all([getCurrentProfile(), getSiteSettings()]);

  const isAr = locale === "ar";
  const siteName = site ? (isAr ? site.name_ar : site.name_en) : tc("siteName");

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        backgroundColor: "rgba(6, 6, 10, 0.70)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <NovaMobileMenu profile={profile} locale={locale} />
          <Link href="/" className="flex items-center gap-2.5">
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
              <span className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-white text-xs font-bold">
                {(siteName || "N").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="text-sm font-semibold text-white tracking-tight">
              {siteName}
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/services">{tc("services")}</NavLink>
          <NavLink href="/portfolio">{tc("portfolio")}</NavLink>
          <NavLink href="/blog">{tc("blog")}</NavLink>
          <NavLink href="/about">{tc("about")}</NavLink>
          <NavLink href="/contact">{tc("contact")}</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 h-8 text-xs text-white/75 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="nova-mono">7.2k</span>
          </a>
          <LocaleSwitcher currentLocale={locale} />
          {profile ? (
            <>
              <NotificationsBell userId={profile.id} />
              <UserMenu profile={profile} />
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <NovaButton asChild size="sm" variant="ghost">
                <Link href="/login">{tc("login")}</Link>
              </NovaButton>
              <NovaButton asChild size="sm" variant="primary">
                <Link href="/register">{tc("register")}</Link>
              </NovaButton>
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
      className="px-3 py-1.5 text-xs text-white/65 hover:text-white rounded-md transition-colors nova-mono uppercase tracking-wider"
    >
      {children}
    </Link>
  );
}
