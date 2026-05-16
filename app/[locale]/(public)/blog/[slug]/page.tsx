import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MarkdownPreview } from "@/components/blog/markdown-preview";
import type { BlogPost, BlogCategory } from "@/types/database";
import type { Metadata } from "next";

// Public visibility rule: status='published' OR (status='scheduled' AND scheduled_at <= now()).
// This makes scheduled posts auto-visible at their time without needing a cron.

async function getVisiblePostBySlug(slug: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
    .maybeSingle();
  return data as BlogPost | null;
}

async function getPostCategoriesAndRelated(post: BlogPost) {
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("blog_post_categories")
    .select("category_id, blog_categories(*)")
    .eq("post_id", post.id);

  const categories =
    ((cats as { blog_categories: BlogCategory }[] | null) ?? [])
      .map((r) => r.blog_categories)
      .filter(Boolean);

  // Related: other posts in the same categories (or any recent if no cats)
  const categoryIds = categories.map((c) => c.id);
  const now = new Date().toISOString();
  let relatedQuery = supabase
    .from("blog_posts")
    .select("id, slug, title_ar, title_en, excerpt_ar, excerpt_en, cover_image, published_at")
    .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);

  if (categoryIds.length > 0) {
    const { data: relatedJoins } = await supabase
      .from("blog_post_categories")
      .select("post_id")
      .in("category_id", categoryIds)
      .neq("post_id", post.id);
    const relatedIds = Array.from(
      new Set(((relatedJoins as { post_id: string }[] | null) ?? []).map((r) => r.post_id))
    );
    if (relatedIds.length > 0) relatedQuery = relatedQuery.in("id", relatedIds);
  }

  const { data: related } = await relatedQuery;
  return {
    categories,
    related: ((related as BlogPost[] | null) ?? []) as Pick<
      BlogPost,
      "id" | "slug" | "title_ar" | "title_en" | "excerpt_ar" | "excerpt_en" | "cover_image" | "published_at"
    >[],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getVisiblePostBySlug(slug);
  if (!post) return {};
  const isAr = locale === "ar";
  const title =
    (isAr ? post.seo_title_ar : post.seo_title_en) ?? (isAr ? post.title_ar : post.title_en);
  const description =
    (isAr ? post.seo_description_ar : post.seo_description_en) ??
    (isAr ? post.excerpt_ar : post.excerpt_en) ??
    undefined;
  const keywords = isAr ? post.seo_keywords_ar : post.seo_keywords_en;
  return {
    title,
    description,
    keywords: keywords ?? undefined,
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

  const post = await getVisiblePostBySlug(slug);
  if (!post) notFound();

  const { categories, related } = await getPostCategoriesAndRelated(post);
  const intlLocale = isAr ? "ar-EG" : "en-US";
  const title = isAr ? post.title_ar : post.title_en;
  const content = isAr ? post.content_ar : post.content_en;
  const media = post.media ?? [];
  const faqs = post.faqs ?? [];

  // Schema.org FAQ for SEO
  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: isAr ? f.question_ar : f.question_en,
            acceptedAnswer: {
              "@type": "Answer",
              text: isAr ? f.answer_ar : f.answer_en,
            },
          })),
        }
      : null;

  return (
    <article className="container py-12 max-w-3xl">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {isAr ? "كل المقالات" : "All posts"}
        </Link>
      </Button>

      <header className="space-y-4 mb-8">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog?category=${c.slug}`}
                className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium hover:bg-primary/20 transition"
              >
                {isAr ? c.name_ar : c.name_en}
              </Link>
            ))}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {post.published_at && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.published_at, intlLocale)}
            </span>
          )}
          {post.reading_time_minutes && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time_minutes} {isAr ? "دقيقة قراءة" : "min read"}
            </span>
          )}
        </div>
      </header>

      {post.cover_image && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-10 shadow-md">
          <Image
            src={post.cover_image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div
        className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-img:rounded-xl"
        dir={isAr ? "rtl" : "ltr"}
      >
        {content ? (
          <MarkdownPreview source={content} />
        ) : (
          <p className="text-muted-foreground">
            {isAr ? "لا يوجد محتوى." : "No content."}
          </p>
        )}
      </div>

      {/* Media gallery */}
      {media.length > 0 && (
        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-bold">{isAr ? "معرض الوسائط" : "Gallery"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {media.map((m, i) =>
              m.type === "image" && m.url ? (
                <figure key={i} className="space-y-1">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image src={m.url} alt={(isAr ? m.caption_ar : m.caption_en) ?? ""} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
                  </div>
                  {(isAr ? m.caption_ar : m.caption_en) && (
                    <figcaption className="text-xs text-muted-foreground text-center">
                      {isAr ? m.caption_ar : m.caption_en}
                    </figcaption>
                  )}
                </figure>
              ) : m.type === "video" && m.url ? (
                <figure key={i} className="space-y-1">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <VideoEmbed url={m.url} />
                  </div>
                  {(isAr ? m.caption_ar : m.caption_en) && (
                    <figcaption className="text-xs text-muted-foreground text-center">
                      {isAr ? m.caption_ar : m.caption_en}
                    </figcaption>
                  )}
                </figure>
              ) : null
            )}
          </div>
        </section>
      )}

      {/* FAQ accordion */}
      {faqs.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-bold">
            {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-lg border bg-card open:shadow-sm transition-shadow"
              >
                <summary className="cursor-pointer list-none p-4 font-medium flex items-center justify-between gap-3">
                  <span>{isAr ? f.question_ar : f.question_en}</span>
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform shrink-0">
                    +
                  </span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {isAr ? f.answer_ar : f.answer_en}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <section className="mt-10 pt-6 border-t">
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t space-y-4">
          <h2 className="text-xl font-bold">{isAr ? "مقالات ذات صلة" : "Related posts"}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="group rounded-lg border overflow-hidden hover:shadow-md transition"
              >
                {r.cover_image && (
                  <div className="relative aspect-video bg-muted">
                    <Image
                      src={r.cover_image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <p className="font-medium text-sm line-clamp-2">
                    {isAr ? r.title_ar : r.title_en}
                  </p>
                  {r.published_at && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(r.published_at, intlLocale)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function VideoEmbed({ url }: { url: string }) {
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${yt[1]}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }
  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeo[1]}`}
        title="Vimeo video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }
  // Direct video file
  return (
    <video controls className="absolute inset-0 h-full w-full">
      <source src={url} />
    </video>
  );
}
