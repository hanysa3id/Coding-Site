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
      className="group flex gap-3 rounded-lg border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm"
    >
      {/* Thumbnail — uses thumbnail_url, falls back to cover_image, then to an icon */}
      <div className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted border">
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
              <h4 className="font-semibold truncate group-hover:text-primary">{name}</h4>
              {service.is_featured && (
                <Badge variant="default" className="gap-1 h-5 px-1.5 text-[10px]">
                  <Sparkles className="h-2.5 w-2.5" />
                  {isAr ? "مميزة" : "Featured"}
                </Badge>
              )}
            </div>
            {desc && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{desc}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              {service.estimated_price_min && (
                <span className="font-medium text-primary">
                  {isAr ? "من " : "From "}
                  {formatCurrency(
                    service.estimated_price_min,
                    service.currency,
                    isAr ? "ar-EG" : "en-US"
                  )}
                </span>
              )}
              {service.estimated_duration_days && (
                <span className="inline-flex items-center gap-0.5 text-muted-foreground">
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
