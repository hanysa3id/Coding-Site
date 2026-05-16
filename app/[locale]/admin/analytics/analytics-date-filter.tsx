"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Preset = "7d" | "30d" | "90d" | "12m" | "all";

const PRESETS: { key: Preset; ar: string; en: string }[] = [
  { key: "7d", ar: "آخر 7 أيام", en: "Last 7 days" },
  { key: "30d", ar: "آخر 30 يوم", en: "Last 30 days" },
  { key: "90d", ar: "آخر 3 أشهر", en: "Last 3 months" },
  { key: "12m", ar: "آخر 12 شهر", en: "Last 12 months" },
  { key: "all", ar: "كل الوقت", en: "All time" },
];

export function AnalyticsDateFilter({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [, startTransition] = useTransition();

  const current = (search.get("period") ?? "12m") as Preset;

  function onChange(v: string) {
    const params = new URLSearchParams(search.toString());
    if (v === "12m") params.delete("period");
    else params.set("period", v);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRESETS.map((p) => (
          <SelectItem key={p.key} value={p.key}>
            {isAr ? p.ar : p.en}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
