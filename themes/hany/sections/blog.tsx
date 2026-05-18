import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/types/database";
import { HanySection, HanySectionHeading } from "../ui/section";
import { HanyButton } from "../ui/hany-button";

export function HanyBlog({
  locale,
  posts,
}: {
  locale: string;
  posts: BlogPost[];
}) {
  const isAr = locale === "ar";
  if (posts.length === 0) return null;

  return (
    <HanySection id="blog">
      <HanySectionHeading
        kicker={isAr ? "المدونة" : "Blog"}
        title={isAr ? "أحدث ما كتبناه" : "Fresh from our blog"}
        description={
          isAr
            ? "أفكار ودروس مستفادة من رحلتنا مع عملائنا."
            : "Ideas and lessons learned from working with our clients."
        }
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.slice(0, 3).map((p, i) => {
          const title = isAr ? p.title_ar : p.title_en;
          const excerpt = isAr ? p.excerpt_ar : p.excerpt_en;
          const date = p.published_at ? new Date(p.published_at).toLocaleDateString(isAr ? "ar-EG" : "en-US", { day: "numeric", month: "short", year: "numeric" }) : null;
          return (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group block hany-reveal"
              style={{ ["--delay" as string]: `${i * 80}ms` }}
            >
              <article className="hany-card overflow-hidden h-full flex flex-col">
                <div className="relative aspect-[16/9] bg-[color:var(--hany-bg-mute)] overflow-hidden">
                  {p.cover_image ? (
                    <Image
                      src={p.cover_image}
                      alt={title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[var(--hany-grad-soft)]" />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-[color:var(--hany-fg-subtle)] mb-3">
                    {date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {date}
                      </span>
                    )}
                    {p.reading_time_minutes && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {p.reading_time_minutes} {isAr ? "د" : "min"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-[color:var(--hany-brand)] transition-colors">
                    {title}
                  </h3>
                  {excerpt && (
                    <p className="mt-2 text-sm text-[color:var(--hany-fg-muted)] line-clamp-2 flex-1">
                      {excerpt}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[color:var(--hany-brand)]">
                    {isAr ? "اقرأ المقال" : "Read article"}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <HanyButton asChild size="md" variant="secondary">
          <Link href="/blog">{isAr ? "كل المقالات" : "All articles"}</Link>
        </HanyButton>
      </div>
    </HanySection>
  );
}
