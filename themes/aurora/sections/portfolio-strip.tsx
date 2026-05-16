import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { SectionHeading } from "../ui/section-heading";
import { Section } from "../ui/section";
import type { PortfolioProject } from "@/types/database";

export function AuroraPortfolioStrip({
  locale,
  projects,
}: {
  locale: string;
  projects: PortfolioProject[];
}) {
  const isAr = locale === "ar";
  if (projects.length === 0) return null;

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
        <SectionHeading
          kicker={isAr ? "أعمالنا" : "Selected work"}
          title={isAr ? "مشاريع نفخر بها" : "Work we are proud of"}
          description={
            isAr
              ? "نماذج من المشاريع التي أطلقناها مع عملائنا — من فكرة على ورقة إلى منتج يستخدمه آلاف."
              : "A glimpse at projects shipped with our clients — from napkin sketch to products used by thousands."
          }
        />
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          {isAr ? "كل الأعمال" : "View all"}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 6).map((p, i) => (
          <Link key={p.id} href={`/portfolio/${p.slug}`} className="group">
            <GlassCard asLink className={`h-full p-0 overflow-hidden ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}>
              <div className={`relative ${i === 0 ? "aspect-[16/10] lg:aspect-[16/12]" : "aspect-[16/10]"} overflow-hidden`}>
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={isAr ? p.title_ar : p.title_en}
                    fill
                    sizes={i === 0 ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 1024px) 100vw, 33vw"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 space-y-1">
                  <h3 className={`font-semibold text-white leading-tight ${i === 0 ? "text-2xl md:text-3xl" : "text-base md:text-lg"}`}>
                    {isAr ? p.title_ar : p.title_en}
                  </h3>
                  {p.client_name && (
                    <p className="text-xs text-white/55 aurora-mono">{p.client_name}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </Section>
  );
}
