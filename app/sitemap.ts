import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const locales = ["ar", "en"];

  const staticPaths = ["", "/services", "/portfolio", "/blog", "/about", "/contact"];
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((p) => ({
      url: `${baseUrl}/${locale}${p}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    }))
  );

  try {
    const supabase = createAdminClient();
    const [{ data: services }, { data: portfolios }, { data: posts }] = await Promise.all([
      supabase
        .from("services")
        .select("slug, updated_at")
        .eq("is_visible", true),
      supabase
        .from("portfolio_projects")
        .select("slug, updated_at")
        .eq("is_visible", true),
      supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at")
        .eq("status", "published"),
    ]);

    const dynamic: MetadataRoute.Sitemap = locales.flatMap((locale) => [
      ...((services ?? []) as { slug: string; updated_at: string }[]).map((s) => ({
        url: `${baseUrl}/${locale}/services/${s.slug}`,
        lastModified: new Date(s.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...((portfolios ?? []) as { slug: string; updated_at: string }[]).map((p) => ({
        url: `${baseUrl}/${locale}/portfolio/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...(
        (posts ?? []) as { slug: string; updated_at: string; published_at: string | null }[]
      ).map((p) => ({
        url: `${baseUrl}/${locale}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ]);

    return [...staticEntries, ...dynamic];
  } catch {
    return staticEntries;
  }
}
