import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLandingSettings } from "@/lib/settings/get";
import { defaultProcessSteps } from "@/lib/landing/defaults";
import type { LandingSettings } from "@/lib/validators/settings";
import { ProcessstepsEditor } from "./editor";

export default async function ProcessstepsSectionAdminPage() {
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
    process_steps:
      landingData.process_steps && landingData.process_steps.length > 0
        ? landingData.process_steps
        : defaultProcessSteps,
  };

  return <ProcessstepsEditor initialData={seeded} locale={locale} />;
}
