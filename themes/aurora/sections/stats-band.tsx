import { Eyebrow } from "../ui/eyebrow";
import { Section } from "../ui/section";
import type { LandingStatItem } from "@/lib/validators/settings";

// A horizontal band of large statistics — visually striking, low text density.
// Accepts admin-curated stats; falls back to a sensible default set.
export function AuroraStatsBand({
  locale,
  customStats = [],
}: {
  locale: string;
  customStats?: LandingStatItem[];
}) {
  const isAr = locale === "ar";
  const defaults = [
    { value: "100+", label_ar: "مشروع منجز", label_en: "Projects shipped" },
    { value: "7", label_ar: "سنوات خبرة", label_en: "Years of experience" },
    { value: "98%", label_ar: "رضا العملاء", label_en: "Customer satisfaction" },
    { value: "24/7", label_ar: "دعم متواصل", label_en: "Always-on support" },
  ];
  const source = customStats.length > 0 ? customStats : defaults;
  const stats = source.slice(0, 4).map((s) => ({
    value: s.value,
    label: isAr ? s.label_ar : s.label_en,
  }));

  return (
    <Section size="sm" bordered band>
      <Eyebrow className="mb-6">
        {isAr ? "أرقام بدلاً من وعود" : "Numbers over promises"}
      </Eyebrow>
      <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="space-y-1">
            <p className="aurora-display text-4xl md:text-5xl text-white aurora-grad-text">
              {s.value}
            </p>
            <p className="text-xs md:text-sm text-white/55">{s.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
