import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Sparkles, Briefcase } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types/database";

/**
 * Compact service card showing the small thumbnail beside the name.
 * Used in the hierarchical /services listing where many cards stack
 * under each sub-category.
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
      className="group flex gap-3 p-3 transition pro-card pro-card-highlight border-0 h-full w-full bg-transparent overflow-hidden"
    >
      {/* Thumbnail — uses thumbnail_url, falls back to cover_image, then to an icon */}
      <div className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted/20 border-0" style={{ border: "1px solid var(--pro-border-soft)" }}>
        {service.thumbnail_url || service.cover_image ? (
          <Image
            src={(service.thumbnail_url || service.cover_image) as string}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Briefcase className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-semibold truncate group-hover:text-primary transition-colors" style={{ color: "var(--pro-fg, #f8fafc)" }}>{name}</h4>
              {service.is_featured && (
                <Badge className="gap-1 h-5 px-1.5 text-[10px] border-0 text-black" style={{ background: "var(--pro-accent, #fbbf24)" }}>
                  <Sparkles className="h-2.5 w-2.5" />
                  {isAr ? "مميزة" : "Featured"}
                </Badge>
              )}
            </div>
            {desc && (
              <p className="text-xs line-clamp-2 mt-0.5" style={{ color: "var(--pro-fg-muted, #94a3b8)" }}>{desc}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              {service.estimated_price_min && (
                <span className="font-medium" style={{ color: "var(--pro-primary, #06b6d4)" }}>
                  {isAr ? "من " : "From "}
                  {formatCurrency(
                    service.estimated_price_min,
                    service.currency,
                    isAr ? "ar-EG" : "en-US"
                  )}
                </span>
              )}
              {service.estimated_duration_days && (
                <span className="inline-flex items-center gap-0.5" style={{ color: "var(--pro-fg-subtle, #64748b)" }}>
                  <Clock className="h-3 w-3" />
                  {service.estimated_duration_days} {isAr ? "يوم" : "d"}
                </span>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 rtl:rotate-180 transition" />
        </div>
      </div>
    </Link>
  );
}
