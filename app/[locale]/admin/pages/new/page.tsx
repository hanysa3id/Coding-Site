import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { CmsPageForm } from "../cms-page-form";

export default async function NewCmsPage() {
  await requireAdmin();
  const locale = await getLocale();
  const isAr = locale === "ar";
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">{isAr ? "صفحة جديدة" : "New page"}</h1>
      <CmsPageForm locale={locale} />
    </div>
  );
}
