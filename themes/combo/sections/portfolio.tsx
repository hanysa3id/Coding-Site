import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { ComboSection, ComboHeading } from "../ui/section";
import { ComboButton } from "../ui/combo-button";
import type { PortfolioProject } from "@/types/database";

export function ComboPortfolio({
  locale,
  projects,
}: {
  locale: string;
  projects: PortfolioProject[];
}) {
  const isAr = locale === "ar";
  if (projects.length === 0) return null;
  const items = projects.slice(0, 6);
  const useBento = items.length >= 5;

  return (
    <ComboSection size="lg" id="portfolio">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <ComboHeading
          eyebrow={isAr ? "أعمالنا" : "Selected work"}
          title={
            <>
              {isAr ? "مشاريع " : "Work we're "}
              <span className="combo-grad-text">
                {isAr ? "نفخر بإطلاقها." : "proud of."}
              </span>
            </>
          }
        />
        <ComboButton asChild size="md" variant="secondary">
          <Link href="/portfolio">
            {isAr ? "كل المشاريع" : "All projects"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </ComboButton>
      </div>

      <div
        className={
          useBento
            ? "grid gap-4 md:grid-cols-3 lg:grid-cols-4"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {items.map((p, i) => {
          const featured = useBento && i === 0;
          const name = isAr ? p.title_ar : p.title_en;
          return (
            <Link
              key={p.id}
              href={`/portfolio/${p.slug}`}
              className={`group combo-tile combo-fade-up block ${
                featured ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""
              }`}
              style={{ ["--combo-delay" as string]: `${i * 70}ms` }}
            >
              <div
                className={`relative ${
                  featured ? "aspect-[16/10] lg:aspect-[8/9]" : "aspect-[4/3]"
                }`}
              >
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={name}
                    fill
                    sizes={
                      featured
                        ? "(max-width:1024px) 100vw, 50vw"
                        : "(max-width:1024px) 100vw, 25vw"
                    }
                    className="object-cover combo-img-zoom"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(139,92,246,0.55), rgba(6,182,212,0.55))",
                    }}
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-5 z-10">
                  {p.client_name && (
                    <span className="combo-mono text-[10px] uppercase tracking-wider text-violet-200">
                      {p.client_name}
                    </span>
                  )}
                  <h3
                    className={`combo-display text-white leading-tight mt-1 ${
                      featured ? "text-2xl md:text-4xl" : "text-lg"
                    }`}
                  >
                    {name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition">
                    {isAr ? "اعرف القصة" : "See the case"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <span className="absolute top-4 end-4 grid place-items-center h-9 w-9 rounded-full bg-white text-[#0a0418] opacity-0 group-hover:opacity-100 transition z-10">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </ComboSection>
  );
}
