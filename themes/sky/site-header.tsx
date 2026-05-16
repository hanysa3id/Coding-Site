import Image from "next/image";
import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getSiteSettings } from "@/lib/settings/get";
import { listVisibleCategories } from "@/lib/queries/services";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { UserMenu } from "@/components/shared/user-menu";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { SkyButton } from "./ui/sky-button";
import { SkyMobileMenu } from "./sky-mobile-menu";
import { NavCategoriesDropdown } from "./nav-categories-dropdown";

export async function SiteHeader() {
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const isAr = locale === "ar";
  const [profile, site, categories] = await Promise.all([
    getCurrentProfile(),
    getSiteSettings(),
    listVisibleCategories(),
  ]);

  const siteName = site ? (isAr ? site.name_ar : site.name_en) : tc("siteName");

  // Show only root categories in the nav dropdown.
  const rootCategories = categories
    .filter((c) => !c.parent_id)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: isAr ? c.name_ar : c.name_en,
      description: isAr ? c.description_ar : c.description_en,
    }));

  return (
    <header className="sticky top-0 z-50 pt-3 px-3 md:px-4">
      <div className="container">
        <div className="sky-glass rounded-2xl border-white/40 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)]">
          <div className="flex h-14 items-center justify-between gap-3 px-3 md:px-4">
            {/* Left: logo */}
            <div className="flex items-center gap-2">
              <SkyMobileMenu
                profile={profile}
                locale={locale}
                categories={rootCategories}
              />
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
                    {(siteName || "S").slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  {siteName}
                </span>
              </Link>
            </div>

            {/* Center: nav */}
            <nav className="hidden md:flex items-center">
              <NavCategoriesDropdown
                label={tc("services")}
                categories={rootCategories}
                locale={locale}
              />
              <Link href="/portfolio" className="sky-nav-link">
                {tc("portfolio")}
              </Link>
              <Link href="/blog" className="sky-nav-link">
                {tc("blog")}
              </Link>
              <Link href="/about" className="sky-nav-link">
                {tc("about")}
              </Link>
              <Link href="/contact" className="sky-nav-link">
                {tc("contact")}
              </Link>
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
                  <SkyButton asChild size="sm" variant="ghost">
                    <Link href="/login">{tc("login")}</Link>
                  </SkyButton>
                  <SkyButton asChild size="sm" variant="primary">
                    <Link href="/register">{tc("register")}</Link>
                  </SkyButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
