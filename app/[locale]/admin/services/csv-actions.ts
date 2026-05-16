"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import {
  serializeCsv,
  parseBool,
  parseInteger,
  parseNumeric,
} from "@/lib/csv/serialize";
import { parseCsv, rowsToObjects } from "@/lib/csv/parse";
import type { ImportResult, ExportResult } from "@/lib/csv/types";
import { revalidatePath } from "next/cache";

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
  "video_url",
  "seo_title_ar",
  "seo_title_en",
  "seo_description_ar",
  "seo_description_en",
  "seo_keywords",
  "sort_order",
  "is_visible",
  "is_featured",
];

export async function exportServicesAction(): Promise<ExportResult> {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: services, error }, { data: categories }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("categories").select("id, slug"),
  ]);
  if (error) return { success: false, error: error.message };

  const catMap = new Map(
    ((categories as Array<{ id: string; slug: string }>) ?? []).map((c) => [c.id, c.slug])
  );

  const csvRows = (services ?? []).map((s) => {
    const svc = s as Record<string, unknown>;
    return {
      slug: svc.slug,
      category_slug: catMap.get(svc.category_id as string) ?? "",
      name_ar: svc.name_ar,
      name_en: svc.name_en,
      short_description_ar: svc.short_description_ar,
      short_description_en: svc.short_description_en,
      full_description_ar: svc.full_description_ar,
      full_description_en: svc.full_description_en,
      estimated_price_min: svc.estimated_price_min,
      estimated_price_max: svc.estimated_price_max,
      currency: svc.currency,
      estimated_duration_days: svc.estimated_duration_days,
      cover_image: svc.cover_image,
      video_url: svc.video_url,
      seo_title_ar: svc.seo_title_ar,
      seo_title_en: svc.seo_title_en,
      seo_description_ar: svc.seo_description_ar,
      seo_description_en: svc.seo_description_en,
      seo_keywords: svc.seo_keywords,
      sort_order: svc.sort_order,
      is_visible: svc.is_visible,
      is_featured: svc.is_featured,
    };
  });

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
      short_description_ar: "موقع متجاوب احترافي",
      short_description_en: "Professional responsive website",
      full_description_ar: "تطوير موقع إلكتروني متكامل مع لوحة تحكم",
      full_description_en: "Full-featured website with admin dashboard",
      estimated_price_min: 5000,
      estimated_price_max: 15000,
      currency: "EGP",
      estimated_duration_days: 30,
      cover_image: "",
      video_url: "",
      seo_title_ar: "تطوير مواقع احترافية",
      seo_title_en: "Professional web development",
      seo_description_ar: "نطور لك موقعاً احترافياً متجاوباً",
      seo_description_en: "We build you a professional, responsive website",
      seo_keywords: "تطوير, مواقع, web, development",
      sort_order: 1,
      is_visible: true,
      is_featured: false,
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

    const categoryId = catSlugToId.get(row.category_slug);
    if (!categoryId) {
      result.errors.push({
        row: rowNum,
        message: `category_slug "${row.category_slug}" not found — create the category first`,
      });
      result.skipped++;
      continue;
    }

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
      video_url: row.video_url || null,
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
    if (existingId) {
      const { error } = await supabase.from("services").update(payload).eq("id", existingId);
      if (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.skipped++;
      } else {
        result.updated++;
      }
    } else {
      const { error } = await supabase.from("services").insert(payload);
      if (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.skipped++;
      } else {
        result.inserted++;
      }
    }
  }

  result.success = result.errors.length === 0;
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return result;
}
