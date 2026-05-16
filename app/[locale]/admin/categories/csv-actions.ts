"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serializeCsv, parseBool, parseInteger } from "@/lib/csv/serialize";
import { parseCsv, rowsToObjects } from "@/lib/csv/parse";
import type { ImportResult, ExportResult } from "@/lib/csv/types";
import { revalidatePath } from "next/cache";

const COLUMNS = [
  "slug",
  "parent_slug",
  "name_ar",
  "name_en",
  "description_ar",
  "description_en",
  "image_url",
  "sort_order",
  "is_visible",
];

export async function exportCategoriesAction(): Promise<ExportResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, parent_id, name_ar, name_en, description_ar, description_en, image_url, sort_order, is_visible")
    .order("sort_order", { ascending: true });
  if (error) return { success: false, error: error.message };

  const rows = (data ?? []) as Array<{
    id: string;
    slug: string;
    parent_id: string | null;
    name_ar: string;
    name_en: string;
    description_ar: string | null;
    description_en: string | null;
    image_url: string | null;
    sort_order: number;
    is_visible: boolean;
  }>;
  const idToSlug = new Map(rows.map((r) => [r.id, r.slug]));

  const csvRows = rows.map((r) => ({
    slug: r.slug,
    parent_slug: r.parent_id ? idToSlug.get(r.parent_id) ?? "" : "",
    name_ar: r.name_ar,
    name_en: r.name_en,
    description_ar: r.description_ar,
    description_en: r.description_en,
    image_url: r.image_url,
    sort_order: r.sort_order,
    is_visible: r.is_visible,
  }));

  return {
    success: true,
    csv: serializeCsv(csvRows, COLUMNS),
    filename: `categories-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export async function templateCategoriesAction(): Promise<ExportResult> {
  await requireAdmin();
  const sample = [
    {
      slug: "programming",
      parent_slug: "",
      name_ar: "خدمات البرمجة",
      name_en: "Programming",
      description_ar: "تطوير تطبيقات الويب والموبايل",
      description_en: "Web and mobile development",
      image_url: "",
      sort_order: 1,
      is_visible: true,
    },
    {
      slug: "web-apps",
      parent_slug: "programming",
      name_ar: "تطبيقات الويب",
      name_en: "Web applications",
      description_ar: "",
      description_en: "",
      image_url: "",
      sort_order: 1,
      is_visible: true,
    },
  ];
  return {
    success: true,
    csv: serializeCsv(sample, COLUMNS),
    filename: "categories-template.csv",
  };
}

export async function importCategoriesAction(csv: string): Promise<ImportResult> {
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

  // Two-pass approach: first insert/update rows without parent, then resolve parents.
  // Easier: fetch all existing categories first to map slug → id, then upsert.

  const { data: existing } = await supabase.from("categories").select("id, slug");
  const slugToId = new Map(
    ((existing as Array<{ id: string; slug: string }>) ?? []).map((c) => [c.slug, c.id])
  );

  // Pre-validate slugs
  const seenSlugs = new Set<string>();
  for (const [idx, row] of rows.entries()) {
    const rowNum = idx + 2; // +2 because header is row 1 and we're 0-indexed
    if (!row.slug) {
      result.errors.push({ row: rowNum, message: "Missing slug" });
      continue;
    }
    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      result.errors.push({ row: rowNum, message: `Invalid slug "${row.slug}" (lowercase + hyphens only)` });
      continue;
    }
    if (seenSlugs.has(row.slug)) {
      result.errors.push({ row: rowNum, message: `Duplicate slug "${row.slug}" in CSV` });
      continue;
    }
    seenSlugs.add(row.slug);
    if (!row.name_ar || !row.name_en) {
      result.errors.push({ row: rowNum, message: "name_ar and name_en are required" });
      continue;
    }
  }

  // First pass: upsert without parent_id (so all slugs exist for FK resolution)
  for (const [idx, row] of rows.entries()) {
    const rowNum = idx + 2;
    if (result.errors.some((e) => e.row === rowNum)) {
      result.skipped++;
      continue;
    }

    const payload = {
      slug: row.slug,
      name_ar: row.name_ar,
      name_en: row.name_en,
      description_ar: row.description_ar || null,
      description_en: row.description_en || null,
      image_url: row.image_url || null,
      sort_order: parseInteger(row.sort_order) ?? 0,
      is_visible: parseBool(row.is_visible) ?? true,
      parent_id: null as string | null,
    };

    const existingId = slugToId.get(row.slug);
    if (existingId) {
      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", existingId);
      if (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.skipped++;
      } else {
        result.updated++;
      }
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        result.errors.push({ row: rowNum, message: error?.message ?? "Insert failed" });
        result.skipped++;
      } else {
        slugToId.set(row.slug, data.id);
        result.inserted++;
      }
    }
  }

  // Second pass: resolve parent_slug → parent_id
  for (const [idx, row] of rows.entries()) {
    const rowNum = idx + 2;
    if (!row.parent_slug || result.errors.some((e) => e.row === rowNum)) continue;
    if (row.parent_slug === row.slug) {
      result.errors.push({ row: rowNum, message: "A category cannot be its own parent" });
      continue;
    }
    const parentId = slugToId.get(row.parent_slug);
    const childId = slugToId.get(row.slug);
    if (!parentId) {
      result.errors.push({ row: rowNum, message: `parent_slug "${row.parent_slug}" not found` });
      continue;
    }
    if (!childId) continue;
    await supabase.from("categories").update({ parent_id: parentId }).eq("id", childId);
  }

  result.success = result.errors.length === 0;
  revalidatePath("/admin/categories");
  revalidatePath("/services");
  return result;
}
