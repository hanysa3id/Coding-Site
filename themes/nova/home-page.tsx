import { setRequestLocale, getTranslations } from "next-intl/server";
import { getSiteSettings, getWhatsappNumber, getLandingSettings } from "@/lib/settings/get";
import { isSectionVisible } from "@/lib/landing/helpers";
import type { LandingSectionId } from "@/lib/validators/settings";

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

  const [site, waNumber, landing] = await Promise.all([
    getSiteSettings().catch(() => null),
    getWhatsappNumber().catch(() => null),
    getLandingSettings().catch(() => null),
  ]);

  const siteName = site ? (isAr ? site.name_ar : site.name_en) : isAr ? "موقعك" : "Nova";
  const show = (id: LandingSectionId) => isSectionVisible(landing, id);

  return (
    <>
      {show("hero") && <NovaHero locale={locale} siteName={siteName} whatsappNumber={waNumber} />}
      {show("logo_cloud") && <NovaLogoCloud locale={locale} />}
      {show("features") && <NovaCodeFeature locale={locale} />}
      {show("features") && <NovaBentoFeatures locale={locale} />}
      {show("services") && <NovaChannelsGrid locale={locale} />}
      {show("features") && <NovaEmailPreview locale={locale} />}
      {show("features") && <NovaStackOrbit locale={locale} />}
      {show("testimonials") && <NovaTestimonials locale={locale} />}
      {show("cta") && <NovaCtaBand locale={locale} whatsappNumber={waNumber} />}
    </>
  );
}
