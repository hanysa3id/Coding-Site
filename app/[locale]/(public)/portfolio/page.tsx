import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/components/public/search-bar";
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
    <div className="container py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold">{tc("portfolio")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
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
        <p className="text-sm text-muted-foreground mb-6 text-center">
          {isAr
            ? `${projects?.length ?? 0} نتيجة لـ "${query}"`
            : `${projects?.length ?? 0} result${(projects?.length ?? 0) !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      {!projects || projects.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {isSearching
            ? isAr
              ? "لا توجد مشاريع تطابق بحثك"
              : "No projects match your search"
            : isAr
            ? "لا توجد مشاريع معروضة حالياً"
            : "No projects to display yet"}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(projects as PortfolioProject[]).map((p) => (
            <Link key={p.id} href={`/portfolio/${p.slug}`} prefetch={true}>
              <Card className="h-full overflow-hidden transition hover:shadow-md">
                {p.cover_image ? (
                  <div className="relative aspect-video">
                    <Image
                      src={p.cover_image}
                      alt={isAr ? p.title_ar : p.title_en}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted" />
                )}
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isAr ? p.title_ar : p.title_en}
                  </CardTitle>
                  {p.client_name && (
                    <p className="text-sm text-muted-foreground">{p.client_name}</p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
