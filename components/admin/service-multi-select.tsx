"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

type ServiceOption = { id: string; name_ar: string; name_en: string };

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  options: ServiceOption[];
  locale: string;
};

export function ServiceMultiSelect({ value, onChange, options, locale }: Props) {
  const isAr = locale === "ar";
  const [search, setSearch] = useState("");

  const optionsMap = useMemo(
    () => new Map(options.map((o) => [o.id, o])),
    [options]
  );

  const selected = value
    .map((id) => optionsMap.get(id))
    .filter((s): s is ServiceOption => !!s);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return options.filter((o) => {
      if (value.includes(o.id)) return false;
      if (!q) return true;
      return (
        o.name_ar.toLowerCase().includes(q) ||
        o.name_en.toLowerCase().includes(q)
      );
    });
  }, [options, value, search]);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <Badge key={s.id} variant="secondary" className="pe-1 gap-1">
              <span>{isAr ? s.name_ar : s.name_en}</span>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="rounded-full hover:bg-background/50 p-0.5"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isAr ? "ابحث عن خدمة..." : "Search services..."}
          className="ps-9"
        />
      </div>

      <div className="border rounded-md max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground text-center">
            {isAr ? "لا توجد نتائج" : "No results"}
          </p>
        ) : (
          <ul className="divide-y">
            {filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => toggle(o.id)}
                  className="block w-full text-start p-2.5 hover:bg-muted text-sm"
                >
                  {isAr ? o.name_ar : o.name_en}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
