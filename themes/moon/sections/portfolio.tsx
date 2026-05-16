import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight, ExternalLink } from "lucide-react";
import { MoonSection, MoonSectionHeading } from "../ui/section";
import { MoonButton } from "../ui/moon-button";
import type { PortfolioProject } from "@/types/database";

export function MoonPortfolio({
  locale,
  projects,
}: {
  locale: string;
  projects: PortfolioProject[];
}) {
  const isAr = locale === "ar";
  if (projects.length === 0) return null;

  const useBento = projects.length >= 5;

  return (
    <MoonSection size="lg">
      <MoonSectionHeading
        kicker={isAr ? "أعمالنا" : "Selected work"}
        title={
          <>
            {isAr ? "مشاريع نفخر " : "Work we are "}
            <span className="moon-grad-text">{isAr ? "بإطلاقها" : "proud of"}</span>
          </>
        }
        description={
          isAr
            ? "نماذج من مشاريع نفذناها — من فكرة على ورق إلى منتجات يستخدمها آلاف يومياً."
            : "A look at projects we've shipped — from sketch to products used by thousands daily."
        }
      />

      <div
        className={
          useBento
            ? "grid gap-4 md:grid-cols-3 lg:grid-cols-4 mt-14"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-14"
        }
      >
        {projects.slice(0, 6).map((p, i) => {
          const featured = useBento && i === 0;
          const name = isAr ? p.title_ar : p.title_en;
          return (
            <Link
              key={p.id}
              href={`/portfolio/${p.slug}`}
              className={`group relative moon-card moon-fade-up overflow-hidden ${
                featured ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""
              }`}
              style={{ "--moon-delay": `${i * 70}ms` } as React.CSSProperties}
            >
              <div
                className={`relative ${
                  featured ? "aspect-[16/10] lg:aspect-[8/9]" : "aspect-[4/3]"
                } overflow-hidden`}
              >
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={name}
                    fill
                    sizes={featured ? "(max-width:1024px) 100vw, 50vw" : "(max-width:1024px) 100vw, 25vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-900 to-indigo-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 space-y-1.5">
                  {p.client_name && (
                    <span className="inline-block text-[10px] uppercase tracking-wider text-sky-300/80 moon-mono">
                      {p.client_name}
                    </span>
                  )}
                  <h3
                    className={`font-bold text-white leading-tight ${
                      featured ? "text-xl md:text-2xl lg:text-3xl" : "text-base"
                    }`}
                  >
                    {name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs text-sky-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAr ? "اعرف المزيد" : "View case"}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <MoonButton asChild size="lg" variant="primary">
          <Link href="/portfolio">
            {isAr ? "كل المشاريع" : "All projects"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </MoonButton>
      </div>
    </MoonSection>
  );
}
