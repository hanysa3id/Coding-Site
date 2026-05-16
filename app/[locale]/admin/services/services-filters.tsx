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

type Option = { id: string; name: string };
type Props = { locale: string; categories: Option[]; totalShowing: number; total: number };

const VISIBILITY_OPTS = [
  { key: "all", ar: "الكل", en: "All" },
  { key: "visible", ar: "مرئي", en: "Visible" },
  { key: "hidden", ar: "مخفي", en: "Hidden" },
] as const;

const FEATURED_OPTS = [
  { key: "all", ar: "الكل", en: "All" },
  { key: "yes", ar: "مميز", en: "Featured" },
  { key: "no", ar: "عادي", en: "Not featured" },
] as const;

export function ServicesFilters({ locale, categories, totalShowing, total }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(search.get("q") ?? "");
  const currentCat = search.get("cat") ?? "all";
  const currentVisibility = search.get("visibility") ?? "all";
  const currentFeatured = search.get("featured") ?? "all";

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
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  function reset() {
    setQ("");
    startTransition(() => router.replace(pathname));
  }

  const hasActive =
    !!q || currentCat !== "all" || currentVisibility !== "all" || currentFeatured !== "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isAr ? "بحث بالاسم..." : "Search by name..."}
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
          value={currentCat}
          onValueChange={(v) => pushUrl({ cat: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-full md:w-52">
            <SelectValue placeholder={isAr ? "كل الأقسام" : "All categories"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "كل الأقسام" : "All categories"}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentVisibility}
          onValueChange={(v) => pushUrl({ visibility: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTS.map((o) => (
              <SelectItem key={o.key} value={o.key}>{isAr ? o.ar : o.en}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFeatured}
          onValueChange={(v) => pushUrl({ featured: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FEATURED_OPTS.map((o) => (
              <SelectItem key={o.key} value={o.key}>{isAr ? o.ar : o.en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <p className="tabular-nums">
          {isAr ? `عرض ${totalShowing} من ${total}` : `Showing ${totalShowing} of ${total}`}
        </p>
        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            {isAr ? "إعادة تعيين" : "Reset"}
          </button>
        )}
      </div>
    </div>
  );
}
