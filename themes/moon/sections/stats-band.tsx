import { MoonSection } from "../ui/section";
import type { LandingStatItem } from "@/lib/validators/settings";

const FALLBACK = [
  { value: "100+", label_ar: "مشروع منجز", label_en: "Projects shipped" },
  { value: "7", label_ar: "سنوات خبرة", label_en: "Years of experience" },
  { value: "98%", label_ar: "رضا العملاء", label_en: "Customer satisfaction" },
  { value: "24/7", label_ar: "دعم متواصل", label_en: "Always-on support" },
];

export function MoonStatsBand({
  locale,
  customStats = [],
}: {
  locale: string;
  customStats?: LandingStatItem[];
}) {
  const isAr = locale === "ar";
  const source = customStats.length > 0 ? customStats : FALLBACK;
  const stats = source.slice(0, 4);

  return (
    <MoonSection size="sm" className="border-y border-white/[0.06]">
      <p className="moon-eyebrow text-center mb-8">
        {isAr ? "أرقام بدلاً من وعود" : "Numbers over promises"}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="moon-stat moon-fade-up relative space-y-2 text-center md:text-start rounded-2xl p-4"
            style={{ "--moon-delay": `${i * 80}ms` } as React.CSSProperties}
          >
            <p className="moon-display moon-grad-text text-4xl md:text-5xl">{s.value}</p>
            <p className="text-xs md:text-sm text-white/60 moon-mono uppercase tracking-wider">
              {isAr ? s.label_ar : s.label_en}
            </p>
          </div>
        ))}
      </div>
    </MoonSection>
  );
}
