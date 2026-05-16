import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { SectionHeading } from "../ui/section-heading";
import { Section } from "../ui/section";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types/database";

export function AuroraServicesGrid({
  locale,
  services,
}: {
  locale: string;
  services: Service[];
}) {
  const isAr = locale === "ar";
  if (services.length === 0) return null;

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
        <SectionHeading
          kicker={isAr ? "ما نقدمه" : "What we do"}
          title={isAr ? "خدمات مختارة" : "Featured services"}
          description={
            isAr
              ? "خدماتنا الأكثر طلباً، مع أسعار شفافة ومُدد تنفيذ واقعية."
              : "Our most-requested offerings, with transparent pricing and realistic timelines."
          }
        />
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          {isAr ? "كل الخدمات" : "View all"}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Link key={s.id} href={`/services/${s.slug}`} className="group">
            <GlassCard asLink className="h-full p-0 overflow-hidden">
              {s.cover_image ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={s.cover_image}
                    alt={isAr ? s.name_ar : s.name_en}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-violet-500/20 to-cyan-500/10" />
              )}
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-white leading-tight">{isAr ? s.name_ar : s.name_en}</h3>
                <p className="text-sm text-white/55 line-clamp-2">
                  {isAr ? s.short_description_ar : s.short_description_en}
                </p>
                <div className="flex items-center justify-between pt-2">
                  {s.estimated_price_min ? (
                    <span className="aurora-mono text-xs text-white/70">
                      {isAr ? "من " : "from "}
                      {formatCurrency(s.estimated_price_min, s.currency, isAr ? "ar-EG" : "en-US")}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-violet-300 group-hover:text-violet-200">
                    {isAr ? "اعرف المزيد" : "Learn more"}
                    <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                  </span>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </Section>
  );
}
