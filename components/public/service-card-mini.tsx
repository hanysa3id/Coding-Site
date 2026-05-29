import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, ArrowRight, Sparkles, Briefcase } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types/database";

/**
 * Premium service card — visually engaging, theme-consistent.
 * Features: gradient top-border on hover, subtle glow, clear price/duration,
 * animated arrow direction-aware, featured badge with shimmer.
 */
export function ServiceCardMini({
  service,
  locale,
}: {
  service: Service;
  locale: string;
}) {
  const isAr = locale === "ar";
  const name = isAr ? service.name_ar : service.name_en;
  const desc = isAr ? service.short_description_ar : service.short_description_en;

  return (
    <Link
      href={`/services/${service.slug}`}
      prefetch={true}
      className="group relative flex flex-col gap-0 overflow-hidden rounded-2xl transition-all duration-500 h-full w-full hover:-translate-y-1"
      style={{
        background: "linear-gradient(145deg, rgba(8,13,22,0.85) 0%, rgba(13,21,34,0.7) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.02)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Top gradient line — appears on hover */}
      <span
        className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: service.is_featured
            ? "linear-gradient(90deg, var(--pro-accent, #fbbf24), var(--pro-primary, #06b6d4))"
            : "linear-gradient(90deg, var(--pro-primary, #06b6d4), var(--pro-secondary, #10b981))",
          boxShadow: "0 2px 10px var(--pro-primary, #06b6d4)",
        }}
        aria-hidden
      />

      {/* Subtle hover glow */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.15), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="flex gap-4 p-5 relative z-10">
        {/* Thumbnail */}
        <div
          className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(16,185,129,0.05))",
          }}
        >
          {service.thumbnail_url || service.cover_image ? (
            <Image
              src={(service.thumbnail_url || service.cover_image) as string}
              alt=""
              fill
              sizes="80px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Briefcase
                className="h-7 w-7 transition-colors duration-300"
                style={{ color: "var(--pro-primary, #06b6d4)" }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
          {/* Name + Featured badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4
                  className="font-bold text-base leading-tight transition-colors duration-300 group-hover:text-[var(--pro-primary,#06b6d4)]"
                  style={{ color: "var(--pro-fg, #f8fafc)" }}
                >
                  {name}
                </h4>
                {service.is_featured && (
                  <Badge
                    className="gap-1 px-2 py-0.5 text-[10px] border-0 text-black shrink-0 font-bold tracking-wide shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                    style={{ background: "var(--pro-accent, #fbbf24)" }}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {isAr ? "مميزة" : "Featured"}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {desc && (
                <p
                  className="text-[0.82rem] line-clamp-2 leading-relaxed"
                  style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
                >
                  {desc}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div
              className="shrink-0 mt-1 opacity-0 -translate-x-2 rtl:translate-x-2 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 rtl:group-hover:translate-x-0"
              style={{ color: "var(--pro-primary, #06b6d4)" }}
            >
              {isAr ? (
                <ArrowLeft className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </div>
          </div>

          {/* Price + Duration row */}
          <div className="flex items-center gap-3 flex-wrap mt-1">
            {service.estimated_price_min && (
              <span
                className="inline-flex items-center gap-1 text-[0.85rem] font-bold px-2 py-0.5 rounded-md"
                style={{ 
                  color: "var(--pro-primary, #06b6d4)",
                  background: "color-mix(in srgb, var(--pro-primary, #06b6d4) 10%, transparent)",
                }}
              >
                {isAr ? "يبدأ من " : "Starts at "}
                {formatCurrency(
                  service.estimated_price_min,
                  service.currency,
                  isAr ? "ar-EG" : "en-US"
                )}
              </span>
            )}
            {service.estimated_duration_days && (
              <span
                className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium px-2 py-0.5 rounded-md"
                style={{
                  color: "var(--pro-fg-subtle, #64748b)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Clock className="h-3 w-3" style={{ color: "var(--pro-secondary, #10b981)" }} />
                {service.estimated_duration_days} {isAr ? "يوم عمل" : "days"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
