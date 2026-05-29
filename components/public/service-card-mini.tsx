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
      className="group relative flex flex-col gap-0 overflow-hidden rounded-2xl transition-all duration-300 h-full w-full"
      style={{
        background: "linear-gradient(145deg, rgba(8,13,22,0.92) 0%, rgba(13,21,34,0.88) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
    >
      {/* Top gradient line — appears on hover */}
      <span
        className="absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: service.is_featured
            ? "linear-gradient(90deg, var(--pro-accent, #fbbf24), var(--pro-primary, #06b6d4))"
            : "linear-gradient(90deg, var(--pro-primary, #06b6d4), var(--pro-secondary, #10b981))",
        }}
        aria-hidden
      />

      {/* Subtle hover glow */}
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(6,182,212,0.07), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="flex gap-3.5 p-4 relative z-10">
        {/* Thumbnail */}
        <div
          className="relative h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(6,182,212,0.06)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {service.thumbnail_url || service.cover_image ? (
            <Image
              src={(service.thumbnail_url || service.cover_image) as string}
              alt=""
              fill
              sizes="72px"
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(16,185,129,0.08))",
              }}
            >
              <Briefcase
                className="h-6 w-6"
                style={{ color: "var(--pro-primary, #06b6d4)" }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Name + Featured badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4
                  className="font-bold text-[0.9rem] leading-tight truncate transition-colors duration-200 group-hover:text-[var(--pro-primary,#06b6d4)]"
                  style={{ color: "var(--pro-fg, #f8fafc)" }}
                >
                  {name}
                </h4>
                {service.is_featured && (
                  <Badge
                    className="gap-1 h-4.5 px-1.5 text-[9px] border-0 text-black shrink-0"
                    style={{ background: "var(--pro-accent, #fbbf24)" }}
                  >
                    <Sparkles className="h-2 w-2" />
                    {isAr ? "مميزة" : "Featured"}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {desc && (
                <p
                  className="text-[0.78rem] line-clamp-2 mt-0.5 leading-snug"
                  style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
                >
                  {desc}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div
              className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              style={{ color: "var(--pro-primary, #06b6d4)" }}
            >
              {isAr ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </div>
          </div>

          {/* Price + Duration row */}
          <div className="flex items-center gap-3 flex-wrap">
            {service.estimated_price_min && (
              <span
                className="inline-flex items-center gap-0.5 text-[0.8rem] font-bold"
                style={{ color: "var(--pro-primary, #06b6d4)" }}
              >
                {isAr ? "من " : "From "}
                {formatCurrency(
                  service.estimated_price_min,
                  service.currency,
                  isAr ? "ar-EG" : "en-US"
                )}
              </span>
            )}
            {service.estimated_duration_days && (
              <span
                className="inline-flex items-center gap-1 text-[0.75rem] px-2 py-0.5 rounded-full"
                style={{
                  color: "var(--pro-fg-subtle, #64748b)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Clock className="h-3 w-3" />
                {service.estimated_duration_days} {isAr ? "يوم" : "d"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border glow on hover */}
      <span
        className="absolute inset-x-4 bottom-0 h-px opacity-0 group-hover:opacity-60 transition-opacity duration-300"
        style={{
          background: "linear-gradient(90deg, transparent, var(--pro-primary, #06b6d4), transparent)",
        }}
        aria-hidden
      />
    </Link>
  );
}
