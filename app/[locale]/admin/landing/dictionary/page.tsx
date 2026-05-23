import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLandingSettings } from "@/lib/settings/get";
import { DictionaryEditor } from "./editor";

export default async function DictionaryAdminPage() {
  await requireAdmin();
  const locale = await getLocale();
  const landingData = (await getLandingSettings()) || ({ hero: {}, hero_slides: [], logos: [], stats: [], faqs: [], section_overrides: {}, dictionary_overrides_ar: {}, dictionary_overrides_en: {} } as unknown as import("@/lib/validators/settings").LandingSettings);

  return <DictionaryEditor initialData={landingData} locale={locale} />;
}
