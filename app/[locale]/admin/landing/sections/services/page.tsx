import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLandingSettings } from "@/lib/settings/get";
import { defaultServicePillars } from "@/lib/landing/defaults";
import type { LandingSettings } from "@/lib/validators/settings";
import { ServicesEditor } from "./editor";
import { createClient } from "@/lib/supabase/server";

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

  let seededPillars =
      landingData.services_pillars && landingData.services_pillars.length > 0
        ? landingData.services_pillars
        : defaultServicePillars;

  const supabase = await createClient();
  const { data: dbServices } = await supabase
    .from("services")
    .select("id, pillar_bucket, name_ar, name_en, short_description_ar, short_description_en")
    .eq("is_visible", true)
    .order("sort_order");

  seededPillars = seededPillars.map((pillar) => {
    if (!pillar.items || pillar.items.length === 0) {
      const bucketServices = (dbServices || [])
        .filter((s) => s.pillar_bucket === pillar.bucket)
        .slice(0, 20);
      
      return {
        ...pillar,
        items: bucketServices.map((s) => ({
          id: s.id,
          name_ar: s.name_ar,
          name_en: s.name_en,
          desc_ar: s.short_description_ar || "",
          desc_en: s.short_description_en || "",
        })),
      };
    }
    return pillar;
  });

  const seeded: LandingSettings = {
    ...landingData,
    services_pillars: seededPillars,
  };

  return <ServicesEditor initialData={seeded} locale={locale} />;
}
