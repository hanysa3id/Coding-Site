import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PortfolioForm } from "../portfolio-form";
import type { PortfolioProject, PortfolioGalleryItem } from "@/types/database";
import type { PortfolioExtendedInput } from "@/lib/validators/portfolio";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const [{ data: project }, { data: services }, { data: links }, { data: gallery }] =
    await Promise.all([
      supabase.from("portfolio_projects").select("*").eq("id", id).single(),
      supabase
        .from("services")
        .select("id, name_ar, name_en")
        .order("sort_order", { ascending: true }),
      supabase.from("portfolio_services").select("service_id").eq("portfolio_id", id),
      supabase
        .from("portfolio_gallery")
        .select("*")
        .eq("portfolio_id", id)
        .order("sort_order", { ascending: true }),
    ]);

  if (!project) notFound();

  const p = project as PortfolioProject;
  const galleryItems = (gallery as PortfolioGalleryItem[]) ?? [];

  // Map the DB row to the form's input shape
  const initial: Partial<PortfolioExtendedInput> & { id: string } = {
    id: p.id,
    slug: p.slug,
    title_ar: p.title_ar,
    title_en: p.title_en,
    description_ar: p.description_ar,
    description_en: p.description_en,
    client_name: p.client_name,
    delivery_date: p.delivery_date,
    cover_image: p.cover_image ?? "",
    project_url: p.project_url ?? "",
    features_ar: p.features_ar ?? [],
    features_en: p.features_en ?? [],
    problems_solved_ar: p.problems_solved_ar ?? [],
    problems_solved_en: p.problems_solved_en ?? [],
    technologies: p.technologies ?? [],
    timeline_ar: p.timeline_ar ?? [],
    timeline_en: p.timeline_en ?? [],
    seo_title_ar: p.seo_title_ar,
    seo_title_en: p.seo_title_en,
    seo_description_ar: p.seo_description_ar,
    seo_description_en: p.seo_description_en,
    seo_keywords: p.seo_keywords,
    is_featured: p.is_featured,
    is_visible: p.is_visible,
    sort_order: p.sort_order,
    service_ids: ((links as { service_id: string }[]) ?? []).map((l) => l.service_id),
    gallery: galleryItems.map((g) => ({
      id: g.id,
      url: g.image_url,
      alt_text: g.alt_text,
      media_type: g.media_type,
      sort_order: g.sort_order,
    })),
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "تعديل مشروع" : "Edit project"}</h1>
        <p className="text-muted-foreground font-mono text-sm">{p.slug}</p>
      </div>
      <PortfolioForm
        initial={initial}
        services={(services as { id: string; name_ar: string; name_en: string }[]) ?? []}
        locale={locale}
      />
    </div>
  );
}
