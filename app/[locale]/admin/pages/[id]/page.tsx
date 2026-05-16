import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { CmsPageForm } from "../cms-page-form";
import type { CmsPage } from "@/types/database";

export default async function EditCmsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("id", id)
    .single();

  const page = data as CmsPage | null;
  if (!page) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">
        {isAr ? "تعديل: " : "Edit: "}
        {isAr ? page.title_ar : page.title_en}
      </h1>
      <CmsPageForm initial={page} locale={locale} />
    </div>
  );
}
