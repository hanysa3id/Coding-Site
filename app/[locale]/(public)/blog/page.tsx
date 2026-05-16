import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/public/search-bar";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types/database";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "المدونة" : "Blog" };
}

export default async function BlogIndexPage({
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
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (isSearching) {
    dbQuery = dbQuery.or(
      `title_ar.ilike.%${query}%,title_en.ilike.%${query}%,excerpt_ar.ilike.%${query}%,excerpt_en.ilike.%${query}%`
    );
  }

  const { data: posts } = await dbQuery;

  return (
    <div className="container py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold">{tc("blog")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {isAr ? "مقالات تقنية وأفكار من فريقنا" : "Tech articles and insights from our team"}
        </p>
      </header>

      {/* Search bar */}
      <div className="mb-10 max-w-md mx-auto">
        <SearchBar
          placeholder={isAr ? "ابحث في المقالات..." : "Search articles..."}
        />
      </div>

      {isSearching && (
        <p className="text-sm text-muted-foreground mb-6 text-center">
          {isAr
            ? `${posts?.length ?? 0} نتيجة لـ "${query}"`
            : `${posts?.length ?? 0} result${(posts?.length ?? 0) !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      {!posts || posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {isSearching
            ? isAr
              ? "لا توجد مقالات تطابق بحثك"
              : "No articles match your search"
            : isAr
            ? "لا توجد مقالات منشورة حالياً"
            : "No posts published yet"}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(posts as BlogPost[]).map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`}>
              <Card className="h-full overflow-hidden transition hover:shadow-md">
                {p.cover_image && (
                  <div className="relative aspect-video">
                    <Image
                      src={p.cover_image}
                      alt={isAr ? p.title_ar : p.title_en}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isAr ? p.title_ar : p.title_en}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {p.published_at && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.published_at, isAr ? "ar-EG" : "en-US")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {isAr ? p.excerpt_ar : p.excerpt_en}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
