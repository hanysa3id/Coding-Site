import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { renderMarkdown } from "@/lib/cms/render-markdown";
import { Card, CardContent } from "@/components/ui/card";
import type { CmsPage } from "@/types/database";

export const revalidate = 300;

async function loadPage(slug: string): Promise<CmsPage | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cms_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as CmsPage | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await loadPage(slug);
  if (!page) return { title: "Not found" };
  const isAr = locale === "ar";
  return {
    title: (isAr ? page.seo_title_ar : page.seo_title_en) ?? (isAr ? page.title_ar : page.title_en),
    description:
      (isAr ? page.seo_description_ar : page.seo_description_en) ?? undefined,
  };
}

export default async function CmsPublicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  const page = await loadPage(slug);
  if (!page) notFound();

  const title = isAr ? page.title_ar : page.title_en;
  const content = isAr ? page.content_ar : page.content_en;
  const html = renderMarkdown(content);

  return (
    <div className="container py-10 md:py-14 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
      </header>
      <Card>
        <CardContent
          className="pt-6"
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      </Card>
    </div>
  );
}
