import { setRequestLocale, getTranslations } from "next-intl/server";
import { getSiteSettings, getWhatsappNumber } from "@/lib/settings/get";

import { NovaHero } from "./sections/hero";
import { NovaLogoCloud } from "./sections/logo-cloud";
import { NovaCodeFeature } from "./sections/code-feature";
import { NovaBentoFeatures } from "./sections/bento-features";
import { NovaChannelsGrid } from "./sections/channels-grid";
import { NovaEmailPreview } from "./sections/email-preview";
import { NovaStackOrbit } from "./sections/stack-orbit";
import { NovaTestimonials } from "./sections/testimonials";
import { NovaCtaBand } from "./sections/cta-band";

export async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations("home"); // ensure namespace is loaded (used by header/footer)
  const isAr = locale === "ar";

  const [site, waNumber] = await Promise.all([
    getSiteSettings().catch(() => null),
    getWhatsappNumber().catch(() => null),
  ]);

  const siteName = site ? (isAr ? site.name_ar : site.name_en) : isAr ? "موقعك" : "Nova";

  return (
    <>
      <NovaHero locale={locale} siteName={siteName} whatsappNumber={waNumber} />
      <NovaLogoCloud locale={locale} />
      <NovaCodeFeature locale={locale} />
      <NovaBentoFeatures locale={locale} />
      <NovaChannelsGrid locale={locale} />
      <NovaEmailPreview locale={locale} />
      <NovaStackOrbit locale={locale} />
      <NovaTestimonials locale={locale} />
      <NovaCtaBand locale={locale} whatsappNumber={waNumber} />
    </>
  );
}
