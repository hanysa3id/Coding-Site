import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="container py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{tc("blog")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {isAr ? "مقالات تقنية وأفكار من فريقنا" : "Tech articles and insights from our team"}
        </p>
      </header>

      {!posts || posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {isAr ? "لا توجد مقالات منشورة حالياً" : "No posts published yet"}
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
