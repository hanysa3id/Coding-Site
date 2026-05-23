import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/public/search-bar";
import { Star, Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost, BlogCategory } from "@/types/database";
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
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { q, category: categorySlug } = await searchParams;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const tc = await getTranslations("common");

  const query = q?.trim() ?? "";
  const isSearching = query.length > 0;
  const now = new Date().toISOString();
  const supabase = await createClient();

  // ── Fetch categories (root-level for the filter chips) ─────────────────────
  const { data: allCategories } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order");
  const categories = ((allCategories as BlogCategory[] | null) ?? []);

  // Resolve active category by slug (if any)
  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug) ?? null
    : null;

  // ── If filtering by category, get post IDs in that category (+ descendants)
  let categoryPostIds: string[] | null = null;
  if (activeCategory) {
    const descendantIds = collectDescendantIds(categories, activeCategory.id);
    const allCatIds = [activeCategory.id, ...descendantIds];
    const { data: joins } = await supabase
      .from("blog_post_categories")
      .select("post_id")
      .in("category_id", allCatIds);
    categoryPostIds = Array.from(
      new Set(((joins as { post_id: string }[] | null) ?? []).map((r) => r.post_id))
    );
  }

  // ── Fetch posts with the visibility rule ────────────────────────────────────
  let dbQuery = supabase
    .from("blog_posts")
    .select("*")
    .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
    .order("published_at", { ascending: false });

  if (isSearching) {
    dbQuery = dbQuery.or(
      `title_ar.ilike.%${query}%,title_en.ilike.%${query}%,excerpt_ar.ilike.%${query}%,excerpt_en.ilike.%${query}%`
    );
  }
  if (categoryPostIds !== null) {
    if (categoryPostIds.length === 0) {
      // No posts in this category — short-circuit by filtering to empty
      dbQuery = dbQuery.in("id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      dbQuery = dbQuery.in("id", categoryPostIds);
    }
  }

  const { data: posts } = await dbQuery;
  const allPosts = ((posts as BlogPost[] | null) ?? []);

  // Featured strip (only when not searching/filtering)
  const showFeatured = !isSearching && !activeCategory;
  const featured = showFeatured ? allPosts.filter((p) => p.is_featured).slice(0, 3) : [];
  const rest = showFeatured ? allPosts.filter((p) => !p.is_featured) : allPosts;

  return (
    <div className="container py-12">
      <header className="mb-12 text-center relative">
        <div className="inline-flex items-center gap-2 pro-badge pro-badge-glow mb-4">
          <Star className="h-3.5 w-3.5" />
          {isAr ? "المدونة" : "Our Blog"}
        </div>
        <h1 className="pro-heading-glow pro-text-gradient-animate text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          {tc("blog")}
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-lg">
          {isAr ? "مقالات تقنية وأفكار من فريقنا" : "Tech articles and insights from our team"}
        </p>
      </header>

      {/* Search bar */}
      <div className="mb-6 max-w-md mx-auto">
        <SearchBar placeholder={isAr ? "ابحث في المقالات..." : "Search articles..."} />
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <nav className="mb-10 flex flex-wrap justify-center gap-1.5">
          <Link
            href="/blog"
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              !activeCategory
                ? "pro-badge-glow"
                : "bg-card hover:bg-muted text-muted-foreground"
            }`}
            style={!activeCategory ? { border: "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 30%, transparent)" } : { border: "1px solid var(--pro-border-soft)" }}
          >
            {isAr ? "كل الأقسام" : "All"}
          </Link>
          {categories
            .filter((c) => !c.parent_id)
            .map((c) => (
              <Link
                key={c.id}
                href={`/blog?category=${c.slug}`}
                className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                  activeCategory?.id === c.id
                    ? "pro-badge-glow"
                    : "bg-card hover:bg-muted text-muted-foreground"
                }`}
                style={activeCategory?.id === c.id ? { border: "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 30%, transparent)" } : { border: "1px solid var(--pro-border-soft)" }}
              >
                {isAr ? c.name_ar : c.name_en}
              </Link>
            ))}
        </nav>
      )}

      {(isSearching || activeCategory) && (
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {isSearching && (
            <>
              {isAr
                ? `${allPosts.length} نتيجة لـ "${query}"`
                : `${allPosts.length} result${allPosts.length !== 1 ? "s" : ""} for "${query}"`}
            </>
          )}
          {activeCategory && !isSearching && (
            <>
              {isAr ? "قسم: " : "Category: "}
              <span className="font-semibold text-foreground">
                {isAr ? activeCategory.name_ar : activeCategory.name_en}
              </span>
              {" · "}
              {allPosts.length}
              {isAr ? " مقالة" : ` post${allPosts.length !== 1 ? "s" : ""}`}
            </>
          )}
        </p>
      )}

      {allPosts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {isSearching || activeCategory
            ? isAr
              ? "لا توجد مقالات تطابق هذا الاختيار"
              : "No articles match this selection"
            : isAr
            ? "لا توجد مقالات منشورة حالياً"
            : "No posts published yet"}
        </p>
      ) : (
        <>
          {/* Featured strip */}
          {featured.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-lg font-semibold inline-flex items-center gap-2" style={{ color: "var(--pro-accent, #fbbf24)" }}>
                <Star className="h-4 w-4" style={{ fill: "var(--pro-accent, #fbbf24)", color: "var(--pro-accent, #fbbf24)" }} />
                {isAr ? "مقالات مميزة" : "Featured"}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {featured.map((p) => (
                  <PostCard key={p.id} post={p} locale={locale} featured />
                ))}
              </div>
            </section>
          )}

          {/* All posts */}
          {rest.length > 0 && (
            <section>
              {featured.length > 0 && (
                <h2 className="mb-4 text-lg font-semibold">
                  {isAr ? "كل المقالات" : "All articles"}
                </h2>
              )}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <PostCard key={p.id} post={p} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function PostCard({
  post,
  locale,
  featured,
}: {
  post: BlogPost;
  locale: string;
  featured?: boolean;
}) {
  const isAr = locale === "ar";
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="pro-card pro-card-highlight border-0 bg-transparent h-full overflow-hidden transition group">
        {post.cover_image ? (
          <div className="relative aspect-video bg-muted overflow-hidden">
            <Image
              src={post.cover_image}
              alt={isAr ? post.title_ar : post.title_en}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {featured && (
              <Badge className="absolute top-3 start-3 gap-1 border-0 text-black" style={{ background: "var(--pro-accent, #fbbf24)" }}>
                <Star className="h-3 w-3 fill-current" />
                {isAr ? "مميز" : "Featured"}
              </Badge>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-muted" />
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg leading-snug line-clamp-2" style={{ color: "var(--pro-fg, #f8fafc)" }}>
            {isAr ? post.title_ar : post.title_en}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {post.published_at && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(post.published_at, isAr ? "ar-EG" : "en-US")}
              </span>
            )}
            {post.reading_time_minutes && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.reading_time_minutes} {isAr ? "د" : "min"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {isAr ? post.excerpt_ar : post.excerpt_en}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function collectDescendantIds(all: BlogCategory[], parentId: string): string[] {
  const direct = all.filter((c) => c.parent_id === parentId).map((c) => c.id);
  return direct.flatMap((id) => [id, ...collectDescendantIds(all, id)]);
}
