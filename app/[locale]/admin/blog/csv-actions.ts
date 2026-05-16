"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serializeCsv } from "@/lib/csv/serialize";
import { parseCsv, rowsToObjects } from "@/lib/csv/parse";
import type { ImportResult, ExportResult } from "@/lib/csv/types";
import { revalidatePath } from "next/cache";

const COLUMNS = [
  "slug",
  "title_ar",
  "title_en",
  "excerpt_ar",
  "excerpt_en",
  "content_ar",
  "content_en",
  "cover_image",
  "status",
  "seo_title_ar",
  "seo_title_en",
  "seo_description_ar",
  "seo_description_en",
  "published_at",
];

export async function exportBlogAction(): Promise<ExportResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    csv: serializeCsv((data ?? []) as Record<string, unknown>[], COLUMNS),
    filename: `blog-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export async function templateBlogAction(): Promise<ExportResult> {
  await requireAdmin();
  const sample = [
    {
      slug: "welcome-post",
      title_ar: "مرحباً بكم في مدونتنا",
      title_en: "Welcome to our blog",
      excerpt_ar: "مقتطف قصير من المقالة",
      excerpt_en: "A short excerpt",
      content_ar: "محتوى المقالة بالكامل بصيغة نص أو Markdown.",
      content_en: "Full article content in plain text or Markdown.",
      cover_image: "",
      status: "draft",
      seo_title_ar: "",
      seo_title_en: "",
      seo_description_ar: "",
      seo_description_en: "",
      published_at: "",
    },
  ];
  return {
    success: true,
    csv: serializeCsv(sample, COLUMNS),
    filename: "blog-template.csv",
  };
}

export async function importBlogAction(csv: string): Promise<ImportResult> {
  const me = await requireAdmin();
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
  const { data: existing } = await supabase.from("blog_posts").select("id, slug, status");
  const slugMap = new Map(
    ((existing as Array<{ id: string; slug: string; status: string }>) ?? []).map((p) => [
      p.slug,
      { id: p.id, status: p.status },
    ])
  );

  const seenSlugs = new Set<string>();
  for (const [idx, row] of rows.entries()) {
    const rowNum = idx + 2;

    if (!row.slug || !/^[a-z0-9-]+$/.test(row.slug)) {
      result.errors.push({ row: rowNum, message: `Invalid or missing slug "${row.slug}"` });
      result.skipped++;
      continue;
    }
    if (seenSlugs.has(row.slug)) {
      result.errors.push({ row: rowNum, message: `Duplicate slug "${row.slug}" in CSV` });
      result.skipped++;
      continue;
    }
    seenSlugs.add(row.slug);

    if (!row.title_ar || !row.title_en) {
      result.errors.push({ row: rowNum, message: "title_ar and title_en are required" });
      result.skipped++;
      continue;
    }

    const status = row.status === "published" ? "published" : "draft";
    const existingRow = slugMap.get(row.slug);

    const payload: Record<string, unknown> = {
      slug: row.slug,
      title_ar: row.title_ar,
      title_en: row.title_en,
      excerpt_ar: row.excerpt_ar || null,
      excerpt_en: row.excerpt_en || null,
      content_ar: row.content_ar || null,
      content_en: row.content_en || null,
      cover_image: row.cover_image || null,
      status,
      seo_title_ar: row.seo_title_ar || null,
      seo_title_en: row.seo_title_en || null,
      seo_description_ar: row.seo_description_ar || null,
      seo_description_en: row.seo_description_en || null,
      published_at: row.published_at || null,
    };

    // Auto-set published_at if newly published and field empty
    if (status === "published" && !payload.published_at && existingRow?.status !== "published") {
      payload.published_at = new Date().toISOString();
    }

    if (existingRow) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", existingRow.id);
      if (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.skipped++;
      } else {
        result.updated++;
      }
    } else {
      payload.author_id = me.id;
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.skipped++;
      } else {
        result.inserted++;
      }
    }
  }

  result.success = result.errors.length === 0;
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return result;
}
