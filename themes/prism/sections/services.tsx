"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { PrismSection, PrismHeading } from "../ui/section";
import { PrismButton } from "../ui/prism-button";
import type { Category, Service } from "@/types/database";
import { cn } from "@/lib/utils";

export function PrismServices({
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
    if (active === "all") return services.slice(0, 9);
    const rootChildIds = categories
      .filter((c) => c.parent_id === active)
      .map((c) => c.id);
    return services
      .filter((s) =>
        s.category_id === active || (s.category_id && rootChildIds.includes(s.category_id))
      )
      .slice(0, 9);
  }, [services, categories, active]);

  if (services.length === 0) return null;

  return (
    <PrismSection size="lg" id="services">
      <PrismHeading
        align="center"
        sticker={<span className="prism-sticker">{isAr ? "خدماتنا" : "Services"}</span>}
        eyebrow={isAr ? "حلول رقمية متكاملة" : "End-to-end digital"}
        title={
          <>
            {isAr ? "خدمات " : "Services that "}
            <span className="prism-grad-text-2">
              {isAr ? "تصنع الفرق." : "actually move things."}
            </span>
          </>
        }
        description={
          isAr
            ? "اختر الخدمة المناسبة، أو ابحث عبر التصنيفات. كل خدمة موثقة بالأسعار والوقت المطلوب."
            : "Pick a service, or browse by category. Every offering is documented with pricing and timeline."
        }
      />

      <div className="mt-10 flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          className="prism-tab"
          data-active={active === "all" || undefined}
          onClick={() => setActive("all")}
        >
          {isAr ? "كل الخدمات" : "All"}
        </button>
        {roots.map((c) => (
          <button
            key={c.id}
            type="button"
            className="prism-tab"
            data-active={active === c.id || undefined}
            onClick={() => setActive(c.id)}
          >
            {isAr ? c.name_ar : c.name_en}
          </button>
        ))}
      </div>

      <div key={active} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
        {filtered.map((s, i) => (
          <Link
            key={s.id}
            href={`/services/${s.slug}`}
            className="prism-card prism-spot prism-fade-up overflow-hidden"
            style={{ ["--prism-delay" as string]: `${i * 60}ms` }}
          >
            <div className="relative h-44 w-full overflow-hidden">
              {(s.cover_image || s.thumbnail_url) ? (
                <Image
                  src={(s.cover_image || s.thumbnail_url)!}
                  alt={isAr ? s.name_ar : s.name_en}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover prism-img-zoom"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,43,181,0.45), rgba(0,229,255,0.45))",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b14]/95 to-transparent" />
              <span className="absolute top-3 start-3 prism-sticker is-cyan">
                #{String(i + 1).padStart(2, "0")}
              </span>
              <span className="absolute top-3 end-3 grid place-items-center h-9 w-9 rounded-full bg-white text-[#0b0b14]">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="prism-display text-xl text-white leading-tight">
                {isAr ? s.name_ar : s.name_en}
              </h3>
              {s.short_description_ar && (
                <p className="text-sm text-white/60 line-clamp-2">
                  {isAr ? s.short_description_ar : s.short_description_en}
                </p>
              )}
              {s.estimated_price_min != null && (
                <p className="prism-mono text-xs text-cyan-300 mt-2">
                  {isAr ? "يبدأ من" : "From"} {s.estimated_price_min} {s.currency}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className={cn("text-center mt-12")}>
        <PrismButton asChild size="lg" variant="secondary">
          <Link href="/services">{isAr ? "كل الخدمات" : "All services"}</Link>
        </PrismButton>
      </div>
    </PrismSection>
  );
}
