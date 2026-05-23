import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getLandingSettings } from "@/lib/settings/get";
import { PortfolioEditor } from "./editor";

export default async function PortfolioSectionAdminPage() {
  await requireAdmin();
  const locale = await getLocale();
  const landingData = (await getLandingSettings()) || ({ hero: {}, hero_slides: [], logos: [], stats: [], faqs: [], section_overrides: {} } as unknown as import("@/lib/validators/settings").LandingSettings);

  return <PortfolioEditor initialData={landingData} locale={locale} />;
}
