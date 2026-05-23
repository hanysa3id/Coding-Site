import Image from "next/image";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/public/search-bar";
import { ExternalLink, FolderOpen, Layers2 } from "lucide-react";
import type { PortfolioProject } from "@/types/database";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "معرض الأعمال" : "Portfolio",
  };
}

export default async function PortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const tc = await getTranslations("common");

  const query = q?.trim() ?? "";
  const isSearching = query.length > 0;

  const supabase = await createClient();
  let dbQuery = supabase
    .from("portfolio_projects")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (isSearching) {
    dbQuery = dbQuery.or(
      `title_ar.ilike.%${query}%,title_en.ilike.%${query}%,description_ar.ilike.%${query}%,description_en.ilike.%${query}%,client_name.ilike.%${query}%`
    );
  }

  const { data: projects } = await dbQuery;

  return (
    <div className="container py-16">
      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <header className="mb-14 text-center relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 flex justify-center"
        >
          <div
            className="h-48 w-96 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, var(--pro-secondary, #10b981), transparent 70%)",
            }}
          />
        </div>

        <div className="inline-flex items-center gap-2 pro-badge pro-badge-glow mb-4">
          <Layers2 className="h-3.5 w-3.5" />
          {isAr ? "أعمالنا" : "Our Work"}
        </div>

        <h1 className="pro-heading-glow pro-text-gradient-animate mb-4">
          {tc("portfolio")}
        </h1>

        <p
          className="mt-3 max-w-2xl mx-auto text-lg"
          style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
        >
          {isAr ? "نماذج من أعمالنا السابقة" : "Samples of our previous work"}
        </p>
      </header>

      {/* Search bar */}
      <div className="mb-10 max-w-md mx-auto">
        <SearchBar
          placeholder={isAr ? "ابحث في المشاريع..." : "Search projects..."}
        />
      </div>

      {isSearching && (
        <p
          className="text-sm mb-6 text-center"
          style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
        >
          {isAr
            ? `${projects?.length ?? 0} نتيجة لـ "${query}"`
            : `${projects?.length ?? 0} result${(projects?.length ?? 0) !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      {!projects || projects.length === 0 ? (
        <div className="text-center py-24">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
            style={{
              background:
                "color-mix(in srgb, var(--pro-secondary, #10b981) 8%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--pro-secondary, #10b981) 20%, transparent)",
            }}
          >
            <FolderOpen
              className="h-9 w-9"
              style={{ color: "var(--pro-secondary, #10b981)" }}
            />
          </div>
          <p
            className="text-lg"
            style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
          >
            {isSearching
              ? isAr
                ? "لا توجد مشاريع تطابق بحثك"
                : "No projects match your search"
              : isAr
              ? "لا توجد مشاريع معروضة حالياً"
              : "No projects to display yet"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(projects as PortfolioProject[]).map((p, index) => (
            <Link
              key={p.id}
              href={`/${locale}/portfolio/${p.slug}`}
              prefetch={true}
              className="group block pro-card pro-card-highlight rounded-2xl overflow-hidden transition-all duration-500"
              style={{
                animationDelay: `${index * 60}ms`,
                background: "rgba(8, 13, 22, 0.65)",
              }}
            >
              {/* Cover image */}
              <div className="relative aspect-video overflow-hidden">
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={isAr ? p.title_ar : p.title_en}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--pro-primary, #06b6d4) 8%, transparent), color-mix(in srgb, var(--pro-secondary, #10b981) 8%, transparent))",
                    }}
                  >
                    <FolderOpen
                      className="h-12 w-12 opacity-30"
                      style={{ color: "var(--pro-primary, #06b6d4)" }}
                    />
                  </div>
                )}
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "rgba(2, 4, 10, 0.6)" }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      background: "var(--pro-grad, linear-gradient(135deg, #06b6d4, #10b981))",
                      color: "#fff",
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isAr ? "عرض المشروع" : "View Project"}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <h3
                  className="font-bold text-lg leading-snug mb-1 group-hover:transition-colors duration-300"
                  style={{ color: "var(--pro-fg, #f8fafc)" }}
                >
                  {isAr ? p.title_ar : p.title_en}
                </h3>
                {p.client_name && (
                  <p
                    className="text-sm"
                    style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
                  >
                    {p.client_name}
                  </p>
                )}
                {/* Gradient accent line */}
                <div
                  className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{
                    background:
                      "var(--pro-grad, linear-gradient(135deg, #06b6d4, #10b981))",
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
