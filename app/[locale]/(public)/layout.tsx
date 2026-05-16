import { getLocale } from "next-intl/server";
import { getActiveTheme, getActiveThemeId } from "@/themes";
import { WhatsAppFloatingButton } from "@/components/shared/whatsapp-floating";

// The public layout applies the active theme's body class to a wrapper so
// theme styles never leak into /admin, /orders, /login, etc. The "aurora"
// theme renders a fixed gradient mesh as the page backdrop.
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const [theme, themeId] = await Promise.all([getActiveTheme(), getActiveThemeId()]);
  const { SiteHeader, SiteFooter, config } = theme;

  return (
    <div className={`${config.body_class} relative min-h-screen flex flex-col`}>
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
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloatingButton locale={locale} />
    </div>
  );
}
