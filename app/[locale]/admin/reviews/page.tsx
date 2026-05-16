import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { ReviewRow } from "./review-row";
import { CsvPanel } from "@/components/admin/csv-panel";
import {
  exportReviewsAction,
  importReviewsAction,
  templateReviewsAction,
} from "./csv-actions";
import type { Review, Service, Profile } from "@/types/database";

type FullReview = Review & {
  services: Pick<Service, "name_ar" | "name_en"> | null;
  customer: Pick<Profile, "full_name" | "email"> | null;
};

export default async function AdminReviewsPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      "*, services(name_ar, name_en), customer:profiles!reviews_customer_id_fkey(full_name, email)"
    )
    .order("created_at", { ascending: false });

  const reviews = (data as unknown as FullReview[]) ?? [];
  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? "التقييمات" : "Reviews"}</h1>
          <p className="text-muted-foreground">
            {isAr ? `${reviews.length} تقييم` : `${reviews.length} reviews`}
          </p>
        </div>
        <div className="text-end">
          <p className="text-sm text-muted-foreground">{isAr ? "المتوسط" : "Average"}</p>
          <p className="text-3xl font-bold inline-flex items-center gap-2">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
            {avg}
          </p>
        </div>
      </header>

      <CsvPanel
        resourceAr="التقييمات"
        resourceEn="reviews"
        locale={locale}
        exportAction={exportReviewsAction}
        templateAction={templateReviewsAction}
        importAction={importReviewsAction}
      />

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isAr ? "لا توجد تقييمات بعد" : "No reviews yet"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
