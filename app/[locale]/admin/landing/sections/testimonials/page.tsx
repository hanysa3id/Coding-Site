import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLandingSettings } from "@/lib/settings/get";
import { TestimonialsEditor } from "./editor";

export default async function TestimonialsSectionAdminPage() {
  await requireAdmin();
  const locale = await getLocale();
  const landingData = (await getLandingSettings()) || ({ hero: {}, hero_slides: [], logos: [], stats: [], faqs: [], section_overrides: {} } as unknown as import("@/lib/validators/settings").LandingSettings);

  return <TestimonialsEditor initialData={landingData} locale={locale} />;
}
