import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { MoonSection, MoonSectionHeading } from "../ui/section";
import { MoonButton } from "../ui/moon-button";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types/database";

export function MoonBlog({
  locale,
  posts,
}: {
  locale: string;
  posts: BlogPost[];
}) {
  const isAr = locale === "ar";
  if (posts.length === 0) return null;

  return (
    <MoonSection size="lg">
      <MoonSectionHeading
        kicker={isAr ? "من المدونة" : "From the blog"}
        title={
          <>
            {isAr ? "أفكار و " : "Ideas and "}
            <span className="moon-grad-text">{isAr ? "تجارب عملية" : "field notes"}</span>
          </>
        }
        description={
          isAr
            ? "ندوّن ما نتعلّمه من المشاريع — أفكار يمكنك تطبيقها مباشرة في عملك."
            : "We document what we learn — actionable ideas you can use immediately."
        }
      />

      <div className="grid gap-5 md:grid-cols-3 mt-14">
        {posts.slice(0, 3).map((p, i) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="moon-card moon-card-glow moon-fade-up group block overflow-hidden"
            style={{ "--moon-delay": `${i * 100}ms` } as React.CSSProperties}
          >
            <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
              {p.cover_image && (
                <Image
                  src={p.cover_image}
                  alt={isAr ? p.title_ar : p.title_en}
                  fill
                  sizes="(max-width:768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 text-xs text-white/45">
                {p.published_at && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(p.published_at, isAr ? "ar-EG" : "en-US")}
                  </span>
                )}
                {p.reading_time_minutes && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.reading_time_minutes} {isAr ? "د" : "min"}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 leading-snug line-clamp-2 transition-colors">
                {isAr ? p.title_ar : p.title_en}
              </h3>
              <p className="text-sm text-white/55 line-clamp-2">
                {isAr ? p.excerpt_ar : p.excerpt_en}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <MoonButton asChild size="lg" variant="secondary">
          <Link href="/blog">
            {isAr ? "كل المقالات" : "All articles"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </MoonButton>
      </div>
    </MoonSection>
  );
}
