import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLandingSettings } from "@/lib/settings/get";
import { defaultPricingPlans } from "@/lib/landing/defaults";
import type { LandingSettings } from "@/lib/validators/settings";
import { PricingEditor } from "./editor";

export default async function PricingSectionAdminPage() {
  await requireAdmin();
  const locale = await getLocale();
  const landingData =
    (await getLandingSettings()) ||
    ({
      hero: {},
      hero_slides: [],
      logos: [],
      stats: [],
      faqs: [],
      section_overrides: {},
    } as unknown as LandingSettings);

  // Seed editor with currently-visible plans so admin can edit them in place.
  const seeded: LandingSettings = {
    ...landingData,
    pricing_plans:
      landingData.pricing_plans && landingData.pricing_plans.length > 0
        ? landingData.pricing_plans
        : defaultPricingPlans,
  };

  return <PricingEditor initialData={seeded} locale={locale} />;
}
