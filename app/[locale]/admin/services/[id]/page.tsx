import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listAllCategoriesForAdmin } from "@/lib/queries/services";
import { ServiceForm } from "../service-form";
import { notFound } from "next/navigation";
import type { Service, ServiceGalleryMedia } from "@/types/database";
import type { ServiceExtendedInput } from "@/lib/validators/service";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const [{ data: service }, categories, { data: gallery }] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).single(),
    listAllCategoriesForAdmin(),
    supabase
      .from("service_gallery")
      .select("*")
      .eq("service_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  if (!service) notFound();
  const s = service as Service;
  const galleryItems = (gallery as ServiceGalleryMedia[]) ?? [];

  const initial: Partial<ServiceExtendedInput> & { id: string } = {
    id: s.id,
    category_id: s.category_id,
    slug: s.slug,
    name_ar: s.name_ar,
    name_en: s.name_en,
    short_description_ar: s.short_description_ar,
    short_description_en: s.short_description_en,
    full_description_ar: s.full_description_ar,
    full_description_en: s.full_description_en,
    estimated_price_min: s.estimated_price_min,
    estimated_price_max: s.estimated_price_max,
    currency: s.currency,
    estimated_duration_days: s.estimated_duration_days,
    cover_image: s.cover_image ?? "",
    thumbnail_url: s.thumbnail_url ?? "",
    video_url: s.video_url ?? "",
    features_ar: s.features_ar ?? [],
    features_en: s.features_en ?? [],
    deliverables_ar: s.deliverables_ar ?? [],
    deliverables_en: s.deliverables_en ?? [],
    timeline_ar: s.timeline_ar ?? [],
    timeline_en: s.timeline_en ?? [],
    seo_title_ar: s.seo_title_ar,
    seo_title_en: s.seo_title_en,
    seo_description_ar: s.seo_description_ar,
    seo_description_en: s.seo_description_en,
    seo_keywords: s.seo_keywords,
    sort_order: s.sort_order,
    is_visible: s.is_visible,
    is_featured: s.is_featured,
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
        <h1 className="text-3xl font-bold">{isAr ? "تعديل خدمة" : "Edit service"}</h1>
        <p className="text-muted-foreground font-mono text-sm">{s.slug}</p>
      </div>
      <ServiceForm initial={initial} categories={categories} locale={locale} />
    </div>
  );
}
