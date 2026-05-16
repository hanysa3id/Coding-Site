import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Star, AlertCircle } from "lucide-react";
import { ReviewRow } from "./review-row";
import { ReviewsFilters } from "./reviews-filters";
import { CsvPanel } from "@/components/admin/csv-panel";
import { AdminPagination } from "@/components/admin/pagination";
import { parsePage, pageRange, totalPages } from "@/lib/pagination";
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

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const range = pageRange(page);

  const filterRating =
    sp.rating && sp.rating !== "all" ? Number(sp.rating) : null;
  const filterVisibility =
    sp.visibility && sp.visibility !== "all" ? sp.visibility : null;
  const filterReply = sp.reply && sp.reply !== "all" ? sp.reply : null;
  const q = sp.q ?? "";

  const supabase = await createClient();

  // Build paginated filtered query
  let filteredQuery = supabase
    .from("reviews")
    .select(
      "*, services(name_ar, name_en), customer:profiles!reviews_customer_id_fkey(full_name, email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filterRating) filteredQuery = filteredQuery.eq("rating", filterRating);
  if (filterVisibility === "visible")
    filteredQuery = filteredQuery.eq("is_visible", true);
  if (filterVisibility === "hidden")
    filteredQuery = filteredQuery.eq("is_visible", false);
  if (filterReply === "replied")
    filteredQuery = filteredQuery.not("admin_reply", "is", null);
  if (filterReply === "pending")
    filteredQuery = filteredQuery.is("admin_reply", null);

  filteredQuery = filteredQuery.range(range.from, range.to);

  const [{ data: ratingsForStats }, { data, count }] = await Promise.all([
    supabase.from("reviews").select("rating"),
    filteredQuery,
  ]);

  let reviews = (data as unknown as FullReview[]) ?? [];

  // JS-side search by customer name (join-column filtering is limited in Supabase REST)
  if (q) {
    const qLow = q.toLowerCase();
    reviews = reviews.filter(
      (r) =>
        (r.customer?.full_name ?? "").toLowerCase().includes(qLow) ||
        (r.customer?.email ?? "").toLowerCase().includes(qLow)
    );
  }

  const displayTotal = q ? reviews.length : (count ?? 0);

  const allRatings = (
    (ratingsForStats as { rating: number }[] | null) ?? []
  ).map((r) => r.rating);

  const avg =
    allRatings.length
      ? (allRatings.reduce((a, r) => a + r, 0) / allRatings.length).toFixed(1)
      : null;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allRatings.filter((r) => r === star).length,
  }));
  const maxDist = Math.max(...dist.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? "التقييمات" : "Reviews"}</h1>
          <p className="text-muted-foreground text-sm">
            {isAr
              ? `${allRatings.length} تقييم إجمالاً`
              : `${allRatings.length} total reviews`}
          </p>
        </div>
        {avg && (
          <div className="text-end shrink-0">
            <p className="text-xs text-muted-foreground mb-1">
              {isAr ? "المتوسط العام" : "Overall average"}
            </p>
            <p className="text-3xl font-bold inline-flex items-center gap-2">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              {avg}
            </p>
          </div>
        )}
      </header>

      {/* Rating distribution bar chart */}
      {allRatings.length > 0 && (
        <Card className="p-4">
          <div className="space-y-2">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 w-8 shrink-0 text-muted-foreground">
                  {d.star}
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(d.count / maxDist) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-end tabular-nums text-muted-foreground">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ReviewsFilters locale={locale} totalShowing={reviews.length} total={displayTotal} />

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
          <CardContent className="py-16 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>
              {isAr
                ? "لا توجد تقييمات تطابق الفلاتر"
                : "No reviews match the current filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} locale={locale} />
          ))}
        </div>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages(count ?? 0)}
        totalItems={displayTotal}
        basePath="/admin/reviews"
        preserveParams={{
          rating: sp.rating,
          visibility: sp.visibility,
          reply: sp.reply,
          q: sp.q,
        }}
        locale={locale}
      />
    </div>
  );
}
