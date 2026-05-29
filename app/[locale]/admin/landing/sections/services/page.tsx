import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLandingSettings } from "@/lib/settings/get";
import { defaultServicePillars } from "@/lib/landing/defaults";
import type { LandingSettings } from "@/lib/validators/settings";
import { ServicesEditor } from "./editor";

export default async function ServicesSectionAdminPage() {
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

  const seeded: LandingSettings = {
    ...landingData,
    services_pillars:
      landingData.services_pillars && landingData.services_pillars.length > 0
        ? landingData.services_pillars
        : defaultServicePillars,
  };

  return <ServicesEditor initialData={seeded} locale={locale} />;
}
