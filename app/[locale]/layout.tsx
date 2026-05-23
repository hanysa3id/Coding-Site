import "../globals.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "sonner";
import { SiteAnalytics, VerificationMetaTags } from "@/components/analytics/site-analytics";
import { getSiteSettings, getSeoSettings } from "@/lib/settings/get";
import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic, Inter, Poppins } from "next/font/google";

/**
 * PRIMARY — Cairo: bilingual hero font covering Arabic + Latin.
 * Used for headings, body, UI labels everywhere in both locales.
 */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

/**
 * SECONDARY Arabic — IBM Plex Sans Arabic: clean modern Arabic companion.
 * Used for body paragraphs in Arabic locale for long-form readability.
 */
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/**
 * SECONDARY Latin — Inter: neutral, highly legible for UI & admin panels.
 * Used for English body text, labels, data tables, and navigation.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/**
 * ACCENT Latin — Poppins: premium geometric for marketing headings in LTR.
 */
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  const [site, seo] = await Promise.all([getSiteSettings(), getSeoSettings()]);

  const fallbackName = isAr ? "منصة الشركة" : "Company Platform";
  const fallbackDescription = isAr
    ? "منصة متكاملة لخدمات البرمجة والتصميم — اطلب خدمتك، تابع التنفيذ، واستلم مشروعك باحترافية."
    : "A complete platform for programming and design services.";

  const name = site ? (isAr ? site.name_ar : site.name_en) : fallbackName;
  const defaultTitle = (isAr ? seo?.default_title_ar : seo?.default_title_en) || name;
  const defaultDescription =
    (isAr ? seo?.default_description_ar : seo?.default_description_en) ||
    (isAr ? site?.description_ar : site?.description_en) ||
    fallbackDescription;

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${name}`,
    },
    description: defaultDescription,
    icons: site?.favicon_url ? { icon: site.favicon_url } : undefined,
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      locale: isAr ? "ar_EG" : "en_US",
      siteName: name,
      images: seo?.og_image ? [seo.og_image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      site: seo?.twitter_handle ?? undefined,
      images: seo?.og_image ? [seo.og_image] : undefined,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${cairo.variable} ${ibmPlexArabic.variable} ${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        <VerificationMetaTags />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <Toaster position={direction === "rtl" ? "top-left" : "top-right"} richColors closeButton />
        </NextIntlClientProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
