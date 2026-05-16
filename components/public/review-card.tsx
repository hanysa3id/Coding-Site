import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, Shield } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

/**
 * The minimal customer info we expose publicly on a review card. Email,
 * phone, and id are intentionally NOT included.
 */
type CustomerInfo = {
  full_name: string | null;
  avatar_url: string | null;
};

type ReviewForCard = {
  id: string;
  rating: number;
  comment: string | null;
  admin_reply: string | null;
  created_at: string;
  customer: CustomerInfo | null;
};

type Props = {
  review: ReviewForCard;
  locale: string;
  /** Site/business name shown on the admin reply badge. */
  brandName?: string;
};

export function ReviewCard({ review, locale, brandName }: Props) {
  const isAr = locale === "ar";
  const customerName =
    review.customer?.full_name?.trim() ||
    (isAr ? "عميل" : "Customer");
  const initials = customerName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <CardContent className="pt-6 pb-5 space-y-4">
        {/* Header: avatar + name + date + rating */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-11 w-11 ring-2 ring-primary/10">
              {review.customer?.avatar_url ? (
                <AvatarImage
                  src={review.customer.avatar_url}
                  alt={customerName}
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold truncate">{customerName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.created_at, isAr ? "ar-EG" : "en-US")}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="inline-flex gap-0.5" aria-label={`${review.rating} / 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4 transition-colors",
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <span className="ms-1 text-sm font-semibold text-amber-600">
              {review.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Comment */}
        {review.comment && (
          <blockquote className="relative ps-6 ps-7 pe-3 py-2 text-sm text-foreground/90 leading-relaxed">
            <Quote
              aria-hidden
              className="absolute start-0 top-0 h-4 w-4 text-primary/30 -scale-x-100 rtl:scale-x-100"
            />
            <p className="whitespace-pre-line">{review.comment}</p>
          </blockquote>
        )}

        {/* Admin reply — styled like a thread reply */}
        {review.admin_reply && (
          <div className="relative rounded-lg bg-primary/5 border border-primary/15 p-4 ms-4 sm:ms-8 mt-3">
            {/* Connector dot/line decoration */}
            <span
              aria-hidden
              className="absolute -top-3 -start-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
            >
              <Shield className="h-3 w-3" />
            </span>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-primary inline-flex items-center gap-1.5">
                {isAr ? "رد" : "Reply from"}{" "}
                <span className="font-bold">
                  {brandName ?? (isAr ? "الإدارة" : "the team")}
                </span>
              </p>
              <p className="text-sm whitespace-pre-line text-foreground/90 leading-relaxed">
                {review.admin_reply}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
