import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight, Clock } from "lucide-react";
import { PrismSection, PrismHeading } from "../ui/section";
import { PrismButton } from "../ui/prism-button";
import type { BlogPost } from "@/types/database";

export function PrismBlog({
  locale,
  posts,
}: {
  locale: string;
  posts: BlogPost[];
}) {
  const isAr = locale === "ar";
  if (posts.length === 0) return null;

  return (
    <PrismSection size="lg" id="blog">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <PrismHeading
          sticker={<span className="prism-sticker is-violet">{isAr ? "المدونة" : "Journal"}</span>}
          eyebrow={isAr ? "نشارك ما نتعلمه" : "We share what we learn"}
          title={
            <>
              {isAr ? "أحدث " : "Latest "}
              <span className="prism-grad-text-2">
                {isAr ? "المقالات." : "stories."}
              </span>
            </>
          }
        />
        <PrismButton asChild size="md" variant="secondary">
          <Link href="/blog">
            {isAr ? "كل المقالات" : "All posts"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </PrismButton>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {posts.slice(0, 3).map((p, i) => {
          const title = isAr ? p.title_ar : p.title_en;
          const excerpt = isAr ? p.excerpt_ar : p.excerpt_en;
          return (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="prism-tile prism-fade-up block group"
              style={{ ["--prism-delay" as string]: `${i * 80}ms` }}
            >
              <div className="relative aspect-[4/3]">
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={title}
                    fill
                    sizes="(min-width:768px) 33vw, 100vw"
                    className="object-cover prism-img-zoom"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(124,58,237,0.55), rgba(255,43,181,0.55))",
                    }}
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                  <h3 className="prism-display text-xl md:text-2xl text-white leading-tight line-clamp-2">
                    {title}
                  </h3>
                  {excerpt && (
                    <p className="text-sm text-white/70 mt-2 line-clamp-2">{excerpt}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-white/60 prism-mono">
                    {p.published_at && (
                      <span>
                        {new Date(p.published_at).toLocaleDateString(
                          isAr ? "ar-EG" : "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    )}
                    {p.reading_time_minutes && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {p.reading_time_minutes} {isAr ? "دقيقة" : "min"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PrismSection>
  );
}
