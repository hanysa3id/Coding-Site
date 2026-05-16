"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = [
  { key: "all", ar: "الكل", en: "All" },
  { key: "customer", ar: "عملاء", en: "Customers" },
  { key: "sales", ar: "مبيعات", en: "Sales" },
  { key: "staff", ar: "فريق", en: "Staff" },
  { key: "admin", ar: "إدارة", en: "Admins" },
] as const;

type Props = { locale: string; totalShowing: number; total: number };

export function CustomersFilters({ locale, totalShowing, total }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(search.get("q") ?? "");
  const currentRole = search.get("role") ?? "all";
  const currentSort = search.get("sort") ?? "newest";

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
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  function reset() {
    setQ("");
    startTransition(() => router.replace(pathname));
  }

  const hasActive = !!q || currentRole !== "all" || currentSort !== "newest";

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              isAr
                ? "بحث بالاسم أو البريد أو الهاتف..."
                : "Search by name, email or phone..."
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

        <Select
          value={currentSort}
          onValueChange={(v) => pushUrl({ sort: v === "newest" ? undefined : v })}
        >
          <SelectTrigger className="w-full md:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{isAr ? "الأحدث أولاً" : "Newest first"}</SelectItem>
            <SelectItem value="oldest">{isAr ? "الأقدم أولاً" : "Oldest first"}</SelectItem>
            <SelectItem value="most_orders">{isAr ? "الأكثر طلبات" : "Most orders"}</SelectItem>
            <SelectItem value="highest_spend">{isAr ? "الأعلى إنفاقاً" : "Highest spend"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {ROLES.map((f) => {
          const active = currentRole === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() =>
                pushUrl({ role: f.key === "all" ? undefined : f.key })
              }
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted"
              }`}
            >
              {isAr ? f.ar : f.en}
            </button>
          );
        })}
        <p className="ms-auto text-xs text-muted-foreground tabular-nums">
          {isAr
            ? `عرض ${totalShowing} من ${total}`
            : `Showing ${totalShowing} of ${total}`}
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            {isAr ? "إعادة تعيين" : "Reset"}
          </button>
        )}
      </div>
    </div>
  );
}
