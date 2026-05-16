"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, RotateCcw, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = { locale: string; totalShowing: number; total: number };

const VISIBILITY = [
  { key: "all", ar: "الكل", en: "All" },
  { key: "visible", ar: "مرئي", en: "Visible" },
  { key: "hidden", ar: "مخفي", en: "Hidden" },
] as const;

const REPLY_STATUS = [
  { key: "all", ar: "الكل", en: "All" },
  { key: "replied", ar: "مُجاب", en: "Replied" },
  { key: "pending", ar: "بانتظار الرد", en: "Pending reply" },
] as const;

export function ReviewsFilters({ locale, totalShowing, total }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(search.get("q") ?? "");
  const currentRating = search.get("rating") ?? "all";
  const currentVisibility = search.get("visibility") ?? "all";
  const currentReply = search.get("reply") ?? "all";

  useEffect(() => {
    const id = setTimeout(() => {
      if (q !== (search.get("q") ?? "")) pushUrl({ q: q || undefined });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function pushUrl(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v || v === "all") params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  function reset() {
    setQ("");
    startTransition(() => router.replace(pathname));
  }

  const hasActive =
    !!q ||
    currentRating !== "all" ||
    currentVisibility !== "all" ||
    currentReply !== "all";

  return (
    <div className="space-y-3">
      {/* Search row */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              isAr ? "بحث باسم العميل..." : "Search by customer name..."
            }
            className="ps-10 pe-9"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-xs">
        {/* Rating filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground shrink-0">
            {isAr ? "التقييم:" : "Rating:"}
          </span>
          {["all", "5", "4", "3", "2", "1"].map((r) => {
            const active = currentRating === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => pushUrl({ rating: r === "all" ? undefined : r })}
                className={`rounded-full border px-2.5 py-0.5 transition inline-flex items-center gap-1 ${
                  active
                    ? "bg-amber-500 text-white border-amber-500"
                    : "hover:bg-muted"
                }`}
              >
                {r === "all" ? (isAr ? "الكل" : "All") : (
                  <>
                    {r}
                    <Star className="h-3 w-3 fill-current" />
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Visibility filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground shrink-0">
            {isAr ? "الظهور:" : "Visibility:"}
          </span>
          {VISIBILITY.map((f) => {
            const active = currentVisibility === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => pushUrl({ visibility: f.key === "all" ? undefined : f.key })}
                className={`rounded-full border px-2.5 py-0.5 transition ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                }`}
              >
                {isAr ? f.ar : f.en}
              </button>
            );
          })}
        </div>

        {/* Reply status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground shrink-0">
            {isAr ? "الرد:" : "Reply:"}
          </span>
          {REPLY_STATUS.map((f) => {
            const active = currentReply === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => pushUrl({ reply: f.key === "all" ? undefined : f.key })}
                className={`rounded-full border px-2.5 py-0.5 transition ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                }`}
              >
                {isAr ? f.ar : f.en}
              </button>
            );
          })}
        </div>

        <p className="ms-auto text-muted-foreground tabular-nums">
          {isAr
            ? `عرض ${totalShowing} من ${total}`
            : `Showing ${totalShowing} of ${total}`}
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            {isAr ? "إعادة تعيين" : "Reset"}
          </button>
        )}
      </div>
    </div>
  );
}
