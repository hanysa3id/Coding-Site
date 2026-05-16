"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import {
  serializeCsv,
  parseBool,
  parseInteger,
  parseArray,
  parseJson,
} from "@/lib/csv/serialize";
import { parseCsv, rowsToObjects } from "@/lib/csv/parse";
import type { ImportResult, ExportResult } from "@/lib/csv/types";
import type { TimelineStep, PortfolioProject } from "@/types/database";
import { revalidatePath } from "next/cache";

const COLUMNS = [
  "slug",
  "title_ar",
  "title_en",
  "description_ar",
  "description_en",
  "client_name",
  "delivery_date",
  "cover_image",
  "project_url",
  "features_ar",          // pipe-separated: "feature 1|feature 2"
  "features_en",
  "problems_solved_ar",   // pipe-separated
  "problems_solved_en",
  "technologies",         // pipe-separated: "React|Next.js|PostgreSQL"
  "timeline_ar",          // JSON array: [{"title":"...","description":"...","date":"2026-01-15"}]
  "timeline_en",
  "service_slugs",        // pipe-separated slugs
  "seo_title_ar",
  "seo_title_en",
  "seo_description_ar",
  "seo_description_en",
  "seo_keywords",
  "is_featured",
  "is_visible",
  "sort_order",
];

export async function exportPortfolioAction(): Promise<ExportResult> {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data: projects, error }, { data: services }, { data: links }] = await Promise.all([
    supabase.from("portfolio_projects").select("*").order("sort_order", { ascending: true }),
    supabase.from("services").select("id, slug"),
    supabase.from("portfolio_services").select("portfolio_id, service_id"),
  ]);
  if (error) return { success: false, error: error.message };

  const svcSlugById = new Map(
    ((services as Array<{ id: string; slug: string }>) ?? []).map((s) => [s.id, s.slug])
  );
  const linksByProject = new Map<string, string[]>();
  for (const l of (links as Array<{ portfolio_id: string; service_id: string }>) ?? []) {
    const slug = svcSlugById.get(l.service_id);
    if (!slug) continue;
    const arr = linksByProject.get(l.portfolio_id) ?? [];
    arr.push(slug);
    linksByProject.set(l.portfolio_id, arr);
  }

  const csvRows = ((projects as PortfolioProject[]) ?? []).map((p) => ({
    slug: p.slug,
    title_ar: p.title_ar,
    title_en: p.title_en,
    description_ar: p.description_ar,
    description_en: p.description_en,
    client_name: p.client_name,
    delivery_date: p.delivery_date,
    cover_image: p.cover_image,
    project_url: p.project_url,
    features_ar: p.features_ar,
    features_en: p.features_en,
    problems_solved_ar: p.problems_solved_ar,
    problems_solved_en: p.problems_solved_en,
    technologies: p.technologies,
    timeline_ar: p.timeline_ar,
    timeline_en: p.timeline_en,
    service_slugs: linksByProject.get(p.id) ?? [],
    seo_title_ar: p.seo_title_ar,
    seo_title_en: p.seo_title_en,
    seo_description_ar: p.seo_description_ar,
    seo_description_en: p.seo_description_en,
    seo_keywords: p.seo_keywords,
    is_featured: p.is_featured,
    is_visible: p.is_visible,
    sort_order: p.sort_order,
  }));

  return {
    success: true,
    csv: serializeCsv(csvRows, COLUMNS),
    filename: `portfolio-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export async function templatePortfolioAction(): Promise<ExportResult> {
  await requireAdmin();
  const sample = [
    {
      slug: "ecommerce-redesign",
      title_ar: "إعادة تصميم متجر إلكتروني",
      title_en: "E-commerce redesign",
      description_ar: "إعادة تصميم متجر إلكتروني كامل مع رفع الأداء وتجربة المستخدم",
      description_en: "Complete e-commerce redesign with improved UX and performance",
      client_name: "ACME Co.",
      delivery_date: "2026-03-15",
      cover_image: "",
      project_url: "https://example.com",
      features_ar: ["دفع متعدد البوابات", "لوحة تحكم متطورة", "تطبيق موبايل"],
      features_en: ["Multi-gateway payment", "Advanced dashboard", "Mobile app"],
      problems_solved_ar: ["بطء الموقع القديم", "صعوبة إدارة المخزون"],
      problems_solved_en: ["Slow old site", "Difficult inventory management"],
      technologies: ["Next.js", "Supabase", "Stripe", "TailwindCSS"],
      timeline_ar: [
        { title: "تحليل المتطلبات", description: "اجتماعات مع العميل", date: "2026-01-10" },
        { title: "التصميم", description: "Figma mockups", date: "2026-01-25" },
        { title: "التطوير", description: "Frontend + Backend", date: "2026-02-20" },
        { title: "الاختبار والإطلاق", description: "QA + deploy", date: "2026-03-15" },
      ],
      timeline_en: [
        { title: "Requirements analysis", description: "Client meetings", date: "2026-01-10" },
        { title: "Design", description: "Figma mockups", date: "2026-01-25" },
        { title: "Development", description: "Frontend + Backend", date: "2026-02-20" },
        { title: "QA & Launch", description: "Testing + deploy", date: "2026-03-15" },
      ],
      service_slugs: ["website-development", "ui-design"],
      seo_title_ar: "إعادة تصميم متجر — مشروع كامل",
      seo_title_en: "E-commerce redesign — complete case study",
      seo_description_ar: "كيف ضاعفنا أداء متجر إلكتروني وزدنا مبيعاته 3 أضعاف",
      seo_description_en: "How we doubled an e-commerce site's performance and 3x'd sales",
      seo_keywords: "ecommerce, redesign, performance, ux",
      is_featured: true,
      is_visible: true,
      sort_order: 1,
    },
  ];
  return {
    success: true,
    csv: serializeCsv(sample, COLUMNS),
    filename: "portfolio-template.csv",
  };
}

export async function importPortfolioAction(csv: string): Promise<ImportResult> {
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
  const [{ data: existing }, { data: services }] = await Promise.all([
    supabase.from("portfolio_projects").select("id, slug"),
    supabase.from("services").select("id, slug"),
  ]);

  const portfolioSlugToId = new Map(
    ((existing as Array<{ id: string; slug: string }>) ?? []).map((p) => [p.slug, p.id])
  );
  const svcSlugToId = new Map(
    ((services as Array<{ id: string; slug: string }>) ?? []).map((s) => [s.slug, s.id])
  );

  const seen = new Set<string>();
  for (const [idx, row] of rows.entries()) {
    const rowNum = idx + 2;

    if (!row.slug || !/^[a-z0-9-]+$/.test(row.slug)) {
      result.errors.push({ row: rowNum, message: `Invalid or missing slug "${row.slug}"` });
      result.skipped++;
      continue;
    }
    if (seen.has(row.slug)) {
      result.errors.push({ row: rowNum, message: `Duplicate slug "${row.slug}" in CSV` });
      result.skipped++;
      continue;
    }
    seen.add(row.slug);

    if (!row.title_ar || !row.title_en) {
      result.errors.push({ row: rowNum, message: "title_ar and title_en are required" });
      result.skipped++;
      continue;
    }

    const timelineAr = parseJson<TimelineStep[]>(row.timeline_ar) ?? [];
    const timelineEn = parseJson<TimelineStep[]>(row.timeline_en) ?? [];

    const payload = {
      slug: row.slug,
      title_ar: row.title_ar,
      title_en: row.title_en,
      description_ar: row.description_ar || null,
      description_en: row.description_en || null,
      client_name: row.client_name || null,
      delivery_date: row.delivery_date || null,
      cover_image: row.cover_image || null,
      project_url: row.project_url || null,
      features_ar: parseArray(row.features_ar),
      features_en: parseArray(row.features_en),
      problems_solved_ar: parseArray(row.problems_solved_ar),
      problems_solved_en: parseArray(row.problems_solved_en),
      technologies: parseArray(row.technologies),
      timeline_ar: timelineAr,
      timeline_en: timelineEn,
      seo_title_ar: row.seo_title_ar || null,
      seo_title_en: row.seo_title_en || null,
      seo_description_ar: row.seo_description_ar || null,
      seo_description_en: row.seo_description_en || null,
      seo_keywords: row.seo_keywords || null,
      is_featured: parseBool(row.is_featured) ?? false,
      is_visible: parseBool(row.is_visible) ?? true,
      sort_order: parseInteger(row.sort_order) ?? 0,
    };

    const existingId = portfolioSlugToId.get(row.slug);
    let portfolioId: string;

    if (existingId) {
      const { error } = await supabase
        .from("portfolio_projects")
        .update(payload)
        .eq("id", existingId);
      if (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.skipped++;
        continue;
      }
      portfolioId = existingId;
      result.updated++;
    } else {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        result.errors.push({ row: rowNum, message: error?.message ?? "Insert failed" });
        result.skipped++;
        continue;
      }
      portfolioId = data.id;
      portfolioSlugToId.set(row.slug, portfolioId);
      result.inserted++;
    }

    // Sync service links
    const slugs = parseArray(row.service_slugs);
    const validServiceIds: string[] = [];
    for (const slug of slugs) {
      const id = svcSlugToId.get(slug);
      if (!id) {
        result.errors.push({
          row: rowNum,
          message: `service_slug "${slug}" not found — skipping link`,
        });
        continue;
      }
      validServiceIds.push(id);
    }

    await supabase.from("portfolio_services").delete().eq("portfolio_id", portfolioId);
    if (validServiceIds.length > 0) {
      await supabase.from("portfolio_services").insert(
        validServiceIds.map((sid) => ({ portfolio_id: portfolioId, service_id: sid }))
      );
    }
  }

  result.success = result.errors.length === 0;
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  return result;
}
