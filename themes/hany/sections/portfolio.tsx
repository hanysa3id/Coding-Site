import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/types/database";
import { HanySection, HanySectionHeading } from "../ui/section";
import { HanyButton } from "../ui/hany-button";

export function HanyPortfolio({
  locale,
  projects,
}: {
  locale: string;
  projects: PortfolioProject[];
}) {
  const isAr = locale === "ar";
  if (projects.length === 0) return null;
  const visible = projects.slice(0, 6);

  return (
    <HanySection id="portfolio">
      <HanySectionHeading
        kicker={isAr ? "أعمالنا" : "Portfolio"}
        title={
          isAr ? (
            <>مشاريع نفخر بـ<span className="hany-gradient-text"> تسليمها</span></>
          ) : (
            <>Projects we're <span className="hany-gradient-text">proud of</span></>
          )
        }
        description={
          isAr
            ? "اختيارات من أحدث ما أنجزناه لعملائنا في قطاعات مختلفة."
            : "A selection of our most recent client work across industries."
        }
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <Link
            key={p.id}
            href={`/portfolio/${p.slug}`}
            className="group block hany-reveal"
            style={{ ["--delay" as string]: `${i * 60}ms` }}
          >
            <div className="hany-card overflow-hidden">
              <div className="relative aspect-[16/10] bg-[color:var(--hany-bg-mute)] overflow-hidden">
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={isAr ? p.title_ar : p.title_en}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-3xl text-[color:var(--hany-fg-subtle)]">
                    {(isAr ? p.title_ar : p.title_en).slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 end-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white text-[color:var(--hany-fg)] text-xs font-semibold px-3 py-1.5 shadow">
                    {isAr ? "اطّلع" : "View"} <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
              <div className="p-5">
                {p.client_name && (
                  <div className="text-xs uppercase tracking-wider text-[color:var(--hany-fg-subtle)] font-semibold mb-1">
                    {p.client_name}
                  </div>
                )}
                <h3 className="font-bold text-lg line-clamp-1">{isAr ? p.title_ar : p.title_en}</h3>
                {(p.technologies?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.technologies.slice(0, 4).map((t) => (
                      <span key={t} className="hany-chip !text-[10px] !py-0.5">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <HanyButton asChild size="md" variant="secondary">
          <Link href="/portfolio">{isAr ? "كل المشاريع" : "All projects"}</Link>
        </HanyButton>
      </div>
    </HanySection>
  );
}
