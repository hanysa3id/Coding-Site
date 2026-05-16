import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  /** Current 1-indexed page */
  page: number;
  /** Total page count */
  totalPages: number;
  /** Base path WITHOUT query string, e.g. "/admin/orders" */
  basePath: string;
  /** Additional query params to preserve (status filter etc.) */
  preserveParams?: Record<string, string | undefined>;
  /** Total items (for the helper text) */
  totalItems?: number;
  locale: string;
};

export function AdminPagination({
  page,
  totalPages,
  basePath,
  preserveParams = {},
  totalItems,
  locale,
}: Props) {
  if (totalPages <= 1) return null;
  const isAr = locale === "ar";

  function hrefFor(p: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(preserveParams)) {
      if (v) params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  // Build a compact list of page numbers: always show 1, current-1, current, current+1, last
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm text-muted-foreground">
        {isAr
          ? `صفحة ${page} من ${totalPages}${totalItems ? ` (${totalItems} إجمالي)` : ""}`
          : `Page ${page} of ${totalPages}${totalItems ? ` (${totalItems} total)` : ""}`}
      </p>
      <div className="flex items-center gap-1">
        <Button
          asChild={page > 1}
          variant="outline"
          size="sm"
          disabled={page === 1}
          aria-label={isAr ? "السابق" : "Previous"}
        >
          {page > 1 ? (
            <Link href={hrefFor(page - 1) as never}>
              <ChevronRight className="h-4 w-4 rtl:hidden" />
              <ChevronLeft className="h-4 w-4 hidden rtl:block" />
              {isAr ? "السابق" : "Previous"}
            </Link>
          ) : (
            <span>
              <ChevronRight className="h-4 w-4 rtl:hidden" />
              <ChevronLeft className="h-4 w-4 hidden rtl:block" />
              {isAr ? "السابق" : "Previous"}
            </span>
          )}
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} className="px-2 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                asChild
                variant={p === page ? "default" : "ghost"}
                size="sm"
                className="min-w-9"
              >
                <Link href={hrefFor(p) as never}>{p}</Link>
              </Button>
            )
          )}
        </div>

        <Button
          asChild={page < totalPages}
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          aria-label={isAr ? "التالي" : "Next"}
        >
          {page < totalPages ? (
            <Link href={hrefFor(page + 1) as never}>
              {isAr ? "التالي" : "Next"}
              <ChevronLeft className="h-4 w-4 rtl:hidden" />
              <ChevronRight className="h-4 w-4 hidden rtl:block" />
            </Link>
          ) : (
            <span>
              {isAr ? "التالي" : "Next"}
              <ChevronLeft className="h-4 w-4 rtl:hidden" />
              <ChevronRight className="h-4 w-4 hidden rtl:block" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
