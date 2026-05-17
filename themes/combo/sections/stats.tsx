import { ComboSection } from "../ui/section";
import type { LandingSettings } from "@/lib/validators/settings";

const DEFAULTS = [
  { v: "120+", ar: "مشروع منجز", en: "Projects shipped" },
  { v: "98%", ar: "رضا العملاء", en: "Client satisfaction" },
  { v: "8", ar: "سنوات خبرة", en: "Years of craft" },
  { v: "24/7", ar: "دعم فني", en: "Support coverage" },
];

export function ComboStats({
  locale,
  customStats,
}: {
  locale: string;
  customStats: NonNullable<LandingSettings["stats"]>;
}) {
  const isAr = locale === "ar";
  const items =
    customStats.length > 0
      ? customStats.map((s) => ({ v: s.value, ar: s.label_ar, en: s.label_en }))
      : DEFAULTS;

  return (
    <ComboSection size="md" id="stats">
      <div className="combo-card p-8 md:p-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 rtl:divide-x-reverse">
          {items.slice(0, 4).map((s, i) => (
            <div key={i} className="p-6 text-center first:ps-0 last:pe-0">
              <p className="combo-display text-5xl md:text-6xl combo-grad-text leading-none">
                {s.v}
              </p>
              <p className="combo-mono text-[11px] uppercase tracking-wider text-white/65 mt-3">
                {isAr ? s.ar : s.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ComboSection>
  );
}
