"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight, Sparkles, Clock, Layers } from "lucide-react";
import { MoonButton } from "../ui/moon-button";
import { formatCurrency, cn } from "@/lib/utils";
import type { Service, Category } from "@/types/database";

export function MoonServices({
  locale,
  services,
  categories,
}: {
  locale: string;
  services: Service[];
  categories: Category[];
}) {
  const isAr = locale === "ar";

  const { rootCats, rootOfService } = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c]));
    function rootIdOf(id: string | null | undefined): string | null {
      let cur = id ? byId.get(id) : undefined;
      while (cur?.parent_id) cur = byId.get(cur.parent_id);
      return cur?.id ?? null;
    }
    const rootOfService = new Map<string, string | null>();
    services.forEach((s) => rootOfService.set(s.id, rootIdOf(s.category_id)));

    const counts = new Map<string, number>();
    rootOfService.forEach((rid) => {
      if (rid) counts.set(rid, (counts.get(rid) ?? 0) + 1);
    });

    const rootCats = categories
      .filter((c) => !c.parent_id && c.is_visible)
      .map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.sort_order - b.sort_order);

    return { rootCats, rootOfService };
  }, [services, categories]);

  const [activeRoot, setActiveRoot] = useState<string>("all");

  const filtered = useMemo(() => {
    if (activeRoot === "all") return services;
    return services.filter((s) => rootOfService.get(s.id) === activeRoot);
  }, [services, rootOfService, activeRoot]);

  return (
    <section className="relative py-20 md:py-28">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <span className="moon-eyebrow inline-block">
            {isAr ? "ما نقدمه" : "What we do"}
          </span>
          <h2 className="moon-display text-3xl md:text-5xl">
            <span className="moon-grad-silver">{isAr ? "خدمات " : "Services "}</span>
            <span className="moon-grad-text">
              {isAr ? "تنقل مشروعك للأمام" : "that move you forward"}
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/60 leading-relaxed">
            {isAr
              ? "اختر التصنيف لاستكشاف الخدمات. كل خدمة تشمل عرضاً واضحاً للنطاق والسعر والمدة."
              : "Browse by category. Every service ships with clear scope, price, and timeline."}
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            type="button"
            className="moon-pill-tab"
            data-active={activeRoot === "all" || undefined}
            onClick={() => setActiveRoot("all")}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "الكل" : "All"}
            <span className="text-xs opacity-75 moon-mono">({services.length})</span>
          </button>
          {rootCats.map((c) => (
            <button
              key={c.id}
              type="button"
              className="moon-pill-tab"
              data-active={activeRoot === c.id || undefined}
              onClick={() => setActiveRoot(c.id)}
            >
              <Layers className="h-3.5 w-3.5" />
              {isAr ? c.name_ar : c.name_en}
              <span className="text-xs opacity-75 moon-mono">({c.count})</span>
            </button>
          ))}
        </div>

        {/* Service grid */}
        <div key={activeRoot} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, 9).map((s, i) => {
            const name = isAr ? s.name_ar : s.name_en;
            const desc = isAr ? s.short_description_ar : s.short_description_en;
            return (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className={cn(
                  "moon-card moon-card-glow moon-fade-up group block overflow-hidden",
                  s.is_featured && "ring-1 ring-sky-400/30"
                )}
                style={{ "--moon-delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                  {s.cover_image ? (
                    <Image
                      src={s.cover_image}
                      alt={name}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-white/15">
                      <Layers className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  {s.is_featured && (
                    <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-amber-400/95 text-amber-950 text-[10px] font-bold px-2 py-0.5 shadow-md">
                      <Sparkles className="h-3 w-3" />
                      {isAr ? "مميز" : "Featured"}
                    </span>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-sky-300 leading-tight line-clamp-1 transition-colors">
                    {name}
                  </h3>
                  {desc && <p className="text-sm text-white/55 line-clamp-2">{desc}</p>}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 text-xs text-white/45">
                      {s.estimated_price_min ? (
                        <span className="moon-mono font-medium text-white/70">
                          {isAr ? "من " : "from "}
                          {formatCurrency(s.estimated_price_min, s.currency, isAr ? "ar-EG" : "en-US")}
                        </span>
                      ) : (
                        <span />
                      )}
                      {s.estimated_duration_days && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {s.estimated_duration_days} {isAr ? "يوم" : "days"}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-sky-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length > 9 && (
          <div className="text-center mt-12">
            <MoonButton asChild size="lg" variant="primary">
              <Link
                href={
                  activeRoot === "all"
                    ? "/services"
                    : `/services?category=${rootCats.find((c) => c.id === activeRoot)?.slug}`
                }
              >
                {isAr ? "اعرض المزيد" : "Show more"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </MoonButton>
          </div>
        )}

        {filtered.length === 0 && (
          <p className="text-center text-white/45 py-10">
            {isAr ? "لا توجد خدمات في هذا القسم بعد" : "No services in this category yet"}
          </p>
        )}
      </div>
    </section>
  );
}
