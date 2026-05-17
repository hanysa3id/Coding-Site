import { unstable_noStore as noStore } from "next/cache";
import { getLocale } from "next-intl/server";
import { getActiveTheme, getActiveThemeId } from "@/themes";
import { WhatsAppFloatingButton } from "@/components/shared/whatsapp-floating";
import { getThemeCustomizationsRaw } from "@/lib/settings/get";
import {
  themeCustomizationSchema,
  toCssVariables,
  type ThemeCustomization,
} from "@/lib/validators/theme-builder";
import { ThemeBuilderRuntime } from "@/components/shared/theme-builder-runtime";

/**
 * Safely resolve the active theme's Theme-Builder customization without ever
 * letting a malformed setting throw the whole page. Errors are swallowed and
 * the page falls back to the base theme defaults.
 */
async function resolveCustomization(
  themeId: string
): Promise<ThemeCustomization | null> {
  try {
    const bag = await getThemeCustomizationsRaw();
    if (!bag || typeof bag !== "object" || Array.isArray(bag)) return null;
    const raw = (bag as Record<string, unknown>)[themeId];
    if (!raw || typeof raw !== "object") return null;
    const parsed = themeCustomizationSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The public layout depends on live settings (theme + customization), so
  // opt this segment out of full-route caching. Without this, saves from
  // /admin/themes don't reflect on the next page load until the cache TTL
  // elapses or the process restarts.
  noStore();

  const locale = await getLocale();
  const [theme, themeId] = await Promise.all([getActiveTheme(), getActiveThemeId()]);
  const customization = await resolveCustomization(themeId);
  const { SiteHeader, SiteFooter, config } = theme;

  // Build CSS-var block + Google Fonts link from the customization.
  const vars = customization ? toCssVariables(customization) : {};
  const customizationCss =
    Object.keys(vars).length > 0
      ? `:root, .${config.body_class} { ${Object.entries(vars)
          .map(([k, v]) => `${k}: ${v};`)
          .join(" ")} }`
      : null;

  const fontFams = [
    customization?.typography.heading_font,
    customization?.typography.body_font,
  ]
    .filter((f): f is string => typeof f === "string" && f.trim().length > 0)
    .map((f) => f.trim().replace(/\s+/g, "+"));
  const googleFontsHref =
    fontFams.length > 0
      ? `https://fonts.googleapis.com/css2?${fontFams
          .map((f) => `family=${f}:wght@400;500;600;700;800`)
          .join("&")}&display=swap`
      : null;

  return (
    <div
      className={`${config.body_class} relative min-h-screen flex flex-col`}
      data-theme-customized={customization ? "true" : undefined}
    >
      {/* Per-theme background art */}
      {themeId === "aurora" && <div className="aurora-mesh" aria-hidden />}
      {themeId === "nova" && <div className="nova-mesh" aria-hidden />}
      {themeId === "sky" && <div className="sky-mesh" aria-hidden />}
      {themeId === "moon" && (
        <>
          <div className="moon-mesh" aria-hidden />
          <div className="moon-stars" aria-hidden />
        </>
      )}
      {themeId === "prism" && (
        <>
          <div className="prism-mesh" aria-hidden />
          <div className="prism-grain" aria-hidden />
        </>
      )}
      {themeId === "combo" && (
        <>
          <div className="combo-mesh" aria-hidden />
          <div className="combo-grid" aria-hidden />
        </>
      )}

      {/* Extra effects opted-in via the Theme Builder */}
      {customization?.effects.spotlight_cursor && (
        <div id="app-spotlight" aria-hidden />
      )}
      {customization?.effects.grain && themeId !== "prism" && (
        <div className="app-grain" aria-hidden />
      )}
      {customization?.effects.blobs && <div className="app-blobs" aria-hidden />}

      {/* Google Fonts — auto-hoisted to <head> by Next.js. */}
      {googleFontsHref && <link rel="stylesheet" href={googleFontsHref} />}
      {/* Theme-Builder CSS variables — auto-hoisted as well. */}
      {customizationCss && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: customizationCss }}
        />
      )}

      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloatingButton locale={locale} />

      {/* Runtime: applies per-section animations, plays UI sounds, drives the
          spotlight cursor, and listens for the Theme-Builder live preview. */}
      <ThemeBuilderRuntime customization={customization} />
    </div>
  );
}
