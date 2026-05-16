import "./globals.css";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings/get";

/**
 * Root metadata is only used by pages that fall outside `[locale]` (rare
 * fallback). We still read the live site name from settings so the browser
 * tab and OG defaults reflect whatever the admin configured rather than a
 * hardcoded brand. The per-locale layout overrides this with bilingual data.
 */
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings().catch(() => null);
  const name = site?.name_en || site?.name_ar || "Company Platform";
  const description =
    site?.description_en || site?.description_ar || "A complete platform for programming and design services.";
  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description,
    icons: site?.favicon_url ? { icon: site.favicon_url } : undefined,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
