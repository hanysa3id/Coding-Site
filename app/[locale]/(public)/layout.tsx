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

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const [theme, themeId, bag] = await Promise.all([
    getActiveTheme(),
    getActiveThemeId(),
    getThemeCustomizationsRaw(),
  ]);
  const { SiteHeader, SiteFooter, config } = theme;

  // Apply Theme Builder customizations if any exist for the active theme
  const raw = (bag as Record<string, unknown> | null)?.[themeId];
  const parsed = raw ? themeCustomizationSchema.safeParse(raw) : null;
  const customization: ThemeCustomization | null = parsed?.success ? parsed.data : null;
  const vars = customization ? toCssVariables(customization) : {};
  const customizationCss =
    Object.keys(vars).length > 0
      ? `:root, .${config.body_class} { ${Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join(" ")} }`
      : null;

  // Build a Google Fonts URL if custom fonts are picked.
  const fontFams = [
    customization?.typography.heading_font,
    customization?.typography.body_font,
  ]
    .filter((f): f is string => typeof f === "string" && f.length > 0)
    .map((f) => f.replace(/\s+/g, "+"));
  const googleFontsHref =
    fontFams.length > 0
      ? `https://fonts.googleapis.com/css2?${fontFams
          .map((f) => `family=${f}:wght@400;500;600;700;800`)
          .join("&")}&display=swap`
      : null;

  return (
    <>
      {googleFontsHref && (
        <link rel="stylesheet" href={googleFontsHref} crossOrigin="anonymous" />
      )}
      {customizationCss && (
        <style
          id="app-theme-vars"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: customizationCss }}
        />
      )}
      <div
        className={`${config.body_class} relative min-h-screen flex flex-col`}
        data-theme-customized={customization ? "true" : undefined}
      >
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
        {/* Extra effects opted-in by the Theme Builder */}
        {customization?.effects.spotlight_cursor && (
          <div id="app-spotlight" aria-hidden />
        )}
        {customization?.effects.grain && !["prism"].includes(themeId) && (
          <div className="app-grain" aria-hidden />
        )}
        {customization?.effects.blobs && <div className="app-blobs" aria-hidden />}

        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppFloatingButton locale={locale} />

        {/* Runtime: applies per-section animations, plays sounds, listens for
            live preview postMessage from the Theme Builder. */}
        <ThemeBuilderRuntime customization={customization} />
      </div>
    </>
  );
}
