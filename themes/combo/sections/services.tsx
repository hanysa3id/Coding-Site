"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight, Sparkles, Layers } from "lucide-react";
import { ComboSection, ComboHeading } from "../ui/section";
import { ComboButton } from "../ui/combo-button";
import type { Category, Service } from "@/types/database";
import { cn } from "@/lib/utils";

export function ComboServices({
  locale,
  services,
  categories,
}: {
  locale: string;
  services: Service[];
  categories: Category[];
}) {
  const isAr = locale === "ar";
  const roots = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    if (active === "all") return services;
    const childIds = categories.filter((c) => c.parent_id === active).map((c) => c.id);
    return services.filter(
      (s) => s.category_id === active || (s.category_id && childIds.includes(s.category_id))
    );
  }, [services, categories, active]);

  if (services.length === 0) return null;

  // Featured = first service of the active filter (or list)
  const featured = filtered[0];
  const rest = filtered.slice(1, 7);

  return (
    <ComboSection size="lg" id="services">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
        <ComboHeading
          eyebrow={isAr ? "خدماتنا" : "Services"}
          title={
            <>
              {isAr ? "حلول " : "Solutions "}
              <span className="combo-grad-text-2">
                {isAr ? "هندسية لا تقبل المساومة." : "engineered to ship."}
              </span>
            </>
          }
          description={
            isAr
              ? "كل خدمة موثّقة بالأسعار والوقت المطلوب. اختر التصنيف لتصفية النتائج."
              : "Every offering is documented with pricing & timeline. Pick a category to filter."
          }
        />
        <ComboButton asChild size="md" variant="secondary">
          <Link href="/services">
            {isAr ? "كل الخدمات" : "All services"}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </ComboButton>
      </div>

      {/* Category tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="combo-tab"
          data-active={active === "all" || undefined}
          onClick={() => setActive("all")}
        >
          <Layers className="h-3.5 w-3.5" />
          {isAr ? "كل الخدمات" : "All"}
          <span className="opacity-60">·</span>
          <span className="combo-mono text-[11px]">{services.length}</span>
        </button>
        {roots.map((c) => {
          const count = services.filter(
            (s) =>
              s.category_id === c.id ||
              (s.category_id &&
                categories.filter((x) => x.parent_id === c.id).some((x) => x.id === s.category_id))
          ).length;
          return (
            <button
              key={c.id}
              type="button"
              className="combo-tab"
              data-active={active === c.id || undefined}
              onClick={() => setActive(c.id)}
            >
              {isAr ? c.name_ar : c.name_en}
              <span className="opacity-60">·</span>
              <span className="combo-mono text-[11px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Bento layout — featured 2x2 + rest */}
      <div
        key={active}
        className="mt-10 grid gap-5 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2"
      >
        {featured && (
          <FeaturedServiceCard
            service={featured}
            isAr={isAr}
            delay={0}
          />
        )}
        {rest.map((s, i) => (
          <ServiceCard key={s.id} service={s} isAr={isAr} delay={(i + 1) * 70} />
        ))}
      </div>
    </ComboSection>
  );
}

function FeaturedServiceCard({
  service,
  isAr,
  delay,
}: {
  service: Service;
  isAr: boolean;
  delay: number;
}) {
  const name = isAr ? service.name_ar : service.name_en;
  const desc = isAr ? service.short_description_ar : service.short_description_en;
  const features = isAr ? service.features_ar : service.features_en;
  const cover = service.cover_image || service.thumbnail_url;
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group combo-card combo-card-glow combo-fade-up md:col-span-2 lg:col-span-2 lg:row-span-2 overflow-hidden relative"
      style={{ ["--combo-delay" as string]: `${delay}ms` }}
    >
      <div className="relative aspect-[16/10] lg:aspect-[8/9] overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover combo-img-zoom"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.55), rgba(236,72,153,0.55), rgba(6,182,212,0.55))",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0418]/95 via-[#0a0418]/40 to-transparent" />
        <span className="absolute top-4 start-4 combo-pill px-3 py-1 text-[11px] backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          {isAr ? "خدمة مميزة" : "Featured service"}
        </span>
        <span className="absolute top-4 end-4 grid place-items-center h-10 w-10 rounded-full bg-white text-[#0a0418] shadow-lg">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="p-6 md:p-7 relative">
        <h3 className="combo-display text-2xl md:text-4xl text-white leading-tight">
          {name}
        </h3>
        {desc && (
          <p className="text-sm md:text-base text-white/70 mt-3 max-w-md line-clamp-3">
            {desc}
          </p>
        )}
        {features && features.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {features.slice(0, 4).map((f, i) => (
              <span key={i} className="combo-pill-soft px-3 py-1 text-[11px]">
                {f}
              </span>
            ))}
          </div>
        )}
        {service.estimated_price_min != null && (
          <p className="mt-5 combo-mono text-sm text-violet-300">
            {isAr ? "يبدأ من" : "From"} {service.estimated_price_min} {service.currency}
          </p>
        )}
      </div>
    </Link>
  );
}

function ServiceCard({
  service,
  isAr,
  delay,
}: {
  service: Service;
  isAr: boolean;
  delay: number;
}) {
  const name = isAr ? service.name_ar : service.name_en;
  const desc = isAr ? service.short_description_ar : service.short_description_en;
  const cover = service.cover_image || service.thumbnail_url;
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group combo-card combo-fade-up overflow-hidden"
      )}
      style={{ ["--combo-delay" as string]: `${delay}ms` }}
    >
      <div className="relative h-36 w-full overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
            className="object-cover combo-img-zoom"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.45), rgba(6,182,212,0.45))",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0418]/95 to-transparent" />
        <span className="absolute top-3 end-3 grid place-items-center h-8 w-8 rounded-full bg-white/90 text-[#0a0418] opacity-0 group-hover:opacity-100 transition">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="p-5">
        <h3 className="combo-display text-lg text-white leading-tight line-clamp-1">
          {name}
        </h3>
        {desc && (
          <p className="text-sm text-white/55 mt-2 line-clamp-2">{desc}</p>
        )}
        {service.estimated_price_min != null && (
          <p className="mt-3 combo-mono text-xs text-violet-300">
            {isAr ? "يبدأ من" : "From"} {service.estimated_price_min} {service.currency}
          </p>
        )}
      </div>
    </Link>
  );
}
