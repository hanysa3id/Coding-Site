import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight, Clock } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { SectionHeading } from "../ui/section-heading";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types/database";

export function AuroraBlogHighlight({
  locale,
  posts,
}: {
  locale: string;
  posts: BlogPost[];
}) {
  const isAr = locale === "ar";
  if (posts.length === 0) return null;

  return (
    <section className="container py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
        <SectionHeading
          kicker={isAr ? "من المدونة" : "From the blog"}
          title={isAr ? "أحدث المقالات" : "Latest writing"}
          description={
            isAr
              ? "أفكار وتجارب عملية من فريقنا حول التطوير والتصميم والتسويق."
              : "Field notes and practical takes from our team on development, design, and growth."
          }
        />
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          {isAr ? "كل المقالات" : "All posts"}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {posts.slice(0, 3).map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="group">
            <GlassCard asLink className="h-full p-0 overflow-hidden">
              {p.cover_image && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={p.cover_image}
                    alt={isAr ? p.title_ar : p.title_en}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="text-lg font-semibold text-white leading-snug line-clamp-2">
                  {isAr ? p.title_ar : p.title_en}
                </h3>
                <p className="text-sm text-white/55 line-clamp-2">
                  {isAr ? p.excerpt_ar : p.excerpt_en}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-white/40 aurora-mono">
                  {p.published_at && (
                    <span>{formatDate(p.published_at, isAr ? "ar-EG" : "en-US")}</span>
                  )}
                  {p.reading_time_minutes && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {p.reading_time_minutes} {isAr ? "د" : "min"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
