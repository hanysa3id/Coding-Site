export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth/guards";
import { getActiveTheme, getActiveThemeId } from "@/themes";
import { getThemeCustomizationsRaw } from "@/lib/settings/get";
import {
  themeCustomizationSchema,
  toCssVariables,
  type ThemeCustomization,
} from "@/lib/validators/theme-builder";
import { WhatsAppFloatingButton } from "@/components/shared/whatsapp-floating";
import { ThemeBuilderRuntime } from "@/components/shared/theme-builder-runtime";
import { getLocale } from "next-intl/server";

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

export default async function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  const locale = await getLocale();
  const [theme, themeId] = await Promise.all([getActiveTheme(), getActiveThemeId()]);
  const customization = await resolveCustomization(themeId);
  const { SiteHeader, SiteFooter, config } = theme;

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
    .filter((f) => f.trim().toLowerCase() !== "cairo")
    .map((f) => f.trim().replace(/\s+/g, "+"))
    .filter((f, i, arr) => arr.indexOf(f) === i);

  const googleFontsHref =
    fontFams.length > 0
      ? `https://fonts.googleapis.com/css2?${fontFams
          .map((f) => `family=${f}:wght@300;400;500;600;700;800;900`)
          .join("&")}&display=swap`
      : null;

  return (
    <div
      className={`${config.body_class} relative min-h-screen flex flex-col`}
      data-theme-customized={customization ? "true" : undefined}
    >
      {/* Per-theme background art */}
      <div className="pro-mesh" aria-hidden />
      <div className="pro-grid" aria-hidden />

      {/* Google Fonts */}
      {googleFontsHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={googleFontsHref} />
        </>
      )}
      {customizationCss && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: customizationCss }}
        />
      )}

      <SiteHeader />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
      <WhatsAppFloatingButton locale={locale} />
      <ThemeBuilderRuntime customization={customization} />
    </div>
  );
}
