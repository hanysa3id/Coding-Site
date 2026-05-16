import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types/database";
import type { Metadata } from "next";

async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as BlogPost | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const isAr = locale === "ar";
  return {
    title: (isAr ? post.seo_title_ar : post.seo_title_en) ?? (isAr ? post.title_ar : post.title_en),
    description:
      (isAr ? post.seo_description_ar : post.seo_description_en) ??
      (isAr ? post.excerpt_ar : post.excerpt_en) ??
      undefined,
    openGraph: { images: post.cover_image ? [post.cover_image] : [] },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container py-12 max-w-3xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {isAr ? "كل المقالات" : "All posts"}
        </Link>
      </Button>

      <header className="space-y-3 mb-8">
        <h1 className="text-4xl font-bold">{isAr ? post.title_ar : post.title_en}</h1>
        {post.published_at && (
          <p className="text-sm text-muted-foreground">
            {formatDate(post.published_at, isAr ? "ar-EG" : "en-US")}
          </p>
        )}
      </header>

      {post.cover_image && (
        <div
          className="aspect-video rounded-lg bg-cover bg-center mb-8 shadow-md"
          style={{ backgroundImage: `url(${post.cover_image})` }}
        />
      )}

      <div className="prose max-w-none">
        <p className="whitespace-pre-line text-muted-foreground leading-relaxed text-lg">
          {isAr ? post.content_ar : post.content_en}
        </p>
      </div>
    </article>
  );
}
