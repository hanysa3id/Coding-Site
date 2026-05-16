"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import {
  serializeCsv,
  parseBool,
  parseInteger,
  parseNumeric,
  parseArray,
  parseJson,
} from "@/lib/csv/serialize";
import { parseCsv, rowsToObjects } from "@/lib/csv/parse";
import type { ImportResult, ExportResult } from "@/lib/csv/types";
import type { Service, TimelineStep } from "@/types/database";
import { revalidatePath } from "next/cache";

/**
 * Service CSV format — full coverage of every field stored on `services`
 * plus the related `service_gallery` rows.
 *
 *   - text[] columns (features/deliverables) are serialized pipe-separated:
 *       "feature 1|feature 2"
 *   - jsonb timeline_* are serialized as JSON strings:
 *       [{"title":"...","description":"...","date":"YYYY-MM-DD"}]
 *   - the related gallery is serialized as a JSON string in a single column:
 *       [{"url":"...","media_type":"image","alt_text":"..."}]
 *   - the category FK is referenced by `category_slug` instead of UUID so
 *     CSVs travel between environments.
 */
const COLUMNS = [
  "slug",
  "category_slug",
  "name_ar",
  "name_en",
  "short_description_ar",
  "short_description_en",
  "full_description_ar",
  "full_description_en",
  "estimated_price_min",
  "estimated_price_max",
  "currency",
  "estimated_duration_days",
  "cover_image",
  "thumbnail_url",
  "video_url",
  "features_ar",          // pipe-separated
  "features_en",
  "deliverables_ar",      // pipe-separated
  "deliverables_en",
  "timeline_ar",          // JSON array
  "timeline_en",
  "gallery",              // JSON array of {url, media_type, alt_text}
  "seo_title_ar",
  "seo_title_en",
  "seo_description_ar",
  "seo_description_en",
  "seo_keywords",
  "sort_order",
  "is_visible",
  "is_featured",
];

type GalleryCsvItem = {
  url: string;
  media_type: "image" | "video";
  alt_text?: string | null;
};

export async function exportServicesAction(): Promise<ExportResult> {
  await requireAdmin();
  const supabase = await createClient();
  const [
    { data: services, error },
    { data: categories },
    { data: galleries },
  ] = await Promise.all([
    supabase.from("services").select("*").order("sort_order", { ascending: true }),
    supabase.from("categories").select("id, slug"),
    supabase
      .from("service_gallery")
      .select("service_id, image_url, alt_text, media_type, sort_order")
      .order("sort_order", { ascending: true }),
  ]);
  if (error) return { success: false, error: error.message };

  const catSlugById = new Map(
    ((categories as Array<{ id: string; slug: string }>) ?? []).map((c) => [c.id, c.slug])
  );
  const galleryByService = new Map<string, GalleryCsvItem[]>();
  for (const g of (galleries as Array<{
    service_id: string;
    image_url: string;
    alt_text: string | null;
    media_type: "image" | "video";
  }>) ?? []) {
    const arr = galleryByService.get(g.service_id) ?? [];
    arr.push({ url: g.image_url, media_type: g.media_type, alt_text: g.alt_text });
    galleryByService.set(g.service_id, arr);
  }

  const csvRows = ((services as Service[]) ?? []).map((s) => ({
    slug: s.slug,
    category_slug: s.category_id ? (catSlugById.get(s.category_id) ?? "") : "",
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
    cover_image: s.cover_image,
    thumbnail_url: s.thumbnail_url,
    video_url: s.video_url,
    features_ar: s.features_ar,
    features_en: s.features_en,
    deliverables_ar: s.deliverables_ar,
    deliverables_en: s.deliverables_en,
    timeline_ar: s.timeline_ar,
    timeline_en: s.timeline_en,
    gallery: galleryByService.get(s.id) ?? [],
    seo_title_ar: s.seo_title_ar,
    seo_title_en: s.seo_title_en,
    seo_description_ar: s.seo_description_ar,
    seo_description_en: s.seo_description_en,
    seo_keywords: s.seo_keywords,
    sort_order: s.sort_order,
    is_visible: s.is_visible,
    is_featured: s.is_featured,
  }));

  return {
    success: true,
    csv: serializeCsv(csvRows, COLUMNS),
    filename: `services-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export async function templateServicesAction(): Promise<ExportResult> {
  await requireAdmin();
  const sample = [
    {
      slug: "website-development",
      category_slug: "web-apps",
      name_ar: "تطوير موقع إلكتروني",
      name_en: "Website development",
      short_description_ar: "موقع متجاوب احترافي مع لوحة تحكم",
      short_description_en: "Professional responsive website with admin dashboard",
      full_description_ar:
        "تطوير موقع إلكتروني كامل: تصميم، برمجة، نشر، تدريب. يشمل لوحة تحكم لإدارة المحتوى.",
      full_description_en:
        "Full website build: design, development, deployment, training. Includes admin dashboard.",
      estimated_price_min: 5000,
      estimated_price_max: 15000,
      currency: "EGP",
      estimated_duration_days: 30,
      cover_image: "",
      thumbnail_url: "",
      video_url: "",
      features_ar: ["تصميم متجاوب", "لوحة تحكم متطورة", "SEO أساسي", "سرعة عالية"],
      features_en: ["Responsive design", "Advanced admin dashboard", "Basic SEO", "High performance"],
      deliverables_ar: ["كود المشروع", "دومين سنة مجانية", "استضافة سنة", "3 جلسات تدريب"],
      deliverables_en: ["Source code", "1 free domain", "1 year hosting", "3 training sessions"],
      timeline_ar: [
        { title: "تحليل المتطلبات", description: "اجتماعات وتوثيق", date: "2026-06-01" },
        { title: "التصميم", description: "Figma mockups", date: "2026-06-10" },
        { title: "التطوير", description: "Frontend + Backend", date: "2026-06-25" },
        { title: "الاختبار والإطلاق", description: "QA + نشر", date: "2026-06-30" },
      ],
      timeline_en: [
        { title: "Requirements analysis", description: "Meetings & docs", date: "2026-06-01" },
        { title: "Design", description: "Figma mockups", date: "2026-06-10" },
        { title: "Development", description: "Frontend + Backend", date: "2026-06-25" },
        { title: "QA & Launch", description: "Testing + deploy", date: "2026-06-30" },
      ],
      gallery: [
        { url: "https://example.com/screenshot-1.png", media_type: "image", alt_text: "Dashboard" },
        { url: "https://www.youtube.com/watch?v=ABCDEFG", media_type: "video", alt_text: "Demo" },
      ],
      seo_title_ar: "تطوير مواقع احترافية متجاوبة",
      seo_title_en: "Professional responsive web development",
      seo_description_ar: "نطور لك موقعاً احترافياً مع لوحة تحكم وSEO",
      seo_description_en: "Professional website with admin dashboard and SEO",
      seo_keywords: "تطوير, مواقع, web, development, responsive, seo",
      sort_order: 1,
      is_visible: true,
      is_featured: true,
    },
  ];
  return {
    success: true,
    csv: serializeCsv(sample, COLUMNS),
    filename: "services-template.csv",
  };
}

export async function importServicesAction(csv: string): Promise<ImportResult> {
  await requireAdmin();
  const result: ImportResult = {
    success: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const rows = rowsToObjects(parseCsv(csv));
  if (rows.length === 0) {
    return { ...result, success: false, errors: [{ row: 0, message: "Empty CSV" }] };
  }

  const supabase = await createClient();
  const [{ data: existingSvcs }, { data: categories }] = await Promise.all([
    supabase.from("services").select("id, slug"),
    supabase.from("categories").select("id, slug"),
  ]);

  const svcSlugToId = new Map(
    ((existingSvcs as Array<{ id: string; slug: string }>) ?? []).map((s) => [s.slug, s.id])
  );
  const catSlugToId = new Map(
    ((categories as Array<{ id: string; slug: string }>) ?? []).map((c) => [c.slug, c.id])
  );

  const seenSlugs = new Set<string>();
  for (const [idx, row] of rows.entries()) {
    const rowNum = idx + 2;

    if (!row.slug) {
      result.errors.push({ row: rowNum, message: "Missing slug" });
      result.skipped++;
      continue;
    }
    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      result.errors.push({ row: rowNum, message: `Invalid slug "${row.slug}"` });
      result.skipped++;
      continue;
    }
    if (seenSlugs.has(row.slug)) {
      result.errors.push({ row: rowNum, message: `Duplicate slug "${row.slug}" in CSV` });
      result.skipped++;
      continue;
    }
    seenSlugs.add(row.slug);

    if (!row.name_ar || !row.name_en) {
      result.errors.push({ row: rowNum, message: "name_ar and name_en are required" });
      result.skipped++;
      continue;
    }

    // Empty category_slug → uncategorized (category_id = null) is allowed.
    // Non-empty but unknown slug → error.
    let categoryId: string | null = null;
    if (row.category_slug && row.category_slug.trim()) {
      const found = catSlugToId.get(row.category_slug);
      if (!found) {
        result.errors.push({
          row: rowNum,
          message: `category_slug "${row.category_slug}" not found — create the category first or leave the column empty`,
        });
        result.skipped++;
        continue;
      }
      categoryId = found;
    }

    const timelineAr = parseJson<TimelineStep[]>(row.timeline_ar) ?? [];
    const timelineEn = parseJson<TimelineStep[]>(row.timeline_en) ?? [];
    const gallery = parseJson<GalleryCsvItem[]>(row.gallery) ?? [];

    const payload = {
      slug: row.slug,
      category_id: categoryId,
      name_ar: row.name_ar,
      name_en: row.name_en,
      short_description_ar: row.short_description_ar || null,
      short_description_en: row.short_description_en || null,
      full_description_ar: row.full_description_ar || null,
      full_description_en: row.full_description_en || null,
      estimated_price_min: parseNumeric(row.estimated_price_min),
      estimated_price_max: parseNumeric(row.estimated_price_max),
      currency: row.currency || "EGP",
      estimated_duration_days: parseInteger(row.estimated_duration_days),
      cover_image: row.cover_image || null,
      thumbnail_url: row.thumbnail_url || null,
      video_url: row.video_url || null,
      features_ar: parseArray(row.features_ar),
      features_en: parseArray(row.features_en),
      deliverables_ar: parseArray(row.deliverables_ar),
      deliverables_en: parseArray(row.deliverables_en),
      timeline_ar: timelineAr,
      timeline_en: timelineEn,
      seo_title_ar: row.seo_title_ar || null,
      seo_title_en: row.seo_title_en || null,
      seo_description_ar: row.seo_description_ar || null,
      seo_description_en: row.seo_description_en || null,
      seo_keywords: row.seo_keywords || null,
      sort_order: parseInteger(row.sort_order) ?? 0,
      is_visible: parseBool(row.is_visible) ?? true,
      is_featured: parseBool(row.is_featured) ?? false,
    };

    const existingId = svcSlugToId.get(row.slug);
    let serviceId: string;
    if (existingId) {
      const { error } = await supabase.from("services").update(payload).eq("id", existingId);
      if (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.skipped++;
        continue;
      }
      serviceId = existingId;
      result.updated++;
    } else {
      const { data, error } = await supabase
        .from("services")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        result.errors.push({ row: rowNum, message: error?.message ?? "Insert failed" });
        result.skipped++;
        continue;
      }
      serviceId = data.id;
      svcSlugToId.set(row.slug, serviceId);
      result.inserted++;
    }

    // Sync gallery — replace strategy
    await supabase.from("service_gallery").delete().eq("service_id", serviceId);
    if (gallery.length > 0) {
      const validItems = gallery
        .filter((g) => g.url && (g.media_type === "image" || g.media_type === "video"))
        .map((g, i) => ({
          service_id: serviceId,
          image_url: g.url,
          alt_text: g.alt_text ?? null,
          sort_order: i,
          media_type: g.media_type,
        }));
      if (validItems.length > 0) {
        const { error: galleryErr } = await supabase.from("service_gallery").insert(validItems);
        if (galleryErr) {
          result.errors.push({
            row: rowNum,
            message: `Gallery insert failed: ${galleryErr.message}`,
          });
        }
      }
      const invalidCount = gallery.length - validItems.length;
      if (invalidCount > 0) {
        result.errors.push({
          row: rowNum,
          message: `Skipped ${invalidCount} invalid gallery item(s) (missing url or bad media_type)`,
        });
      }
    }
  }

  result.success = result.errors.length === 0;
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return result;
}
