import type { LandingStatItem } from "@/lib/validators/settings";

export function HanyStats({
  locale,
  customStats,
}: {
  locale: string;
  customStats: LandingStatItem[];
}) {
  const isAr = locale === "ar";
  const fallback: LandingStatItem[] =
    customStats.length > 0
      ? customStats
      : [
          { value: "200+", label_ar: "مشروع منجز", label_en: "Projects delivered" },
          { value: "98%", label_ar: "رضا العملاء", label_en: "Client satisfaction" },
          { value: "7+", label_ar: "سنوات خبرة", label_en: "Years of experience" },
          { value: "24/7", label_ar: "دعم فني", label_en: "Technical support" },
        ];

  return (
    <section id="stats" className="py-14 md:py-16">
      <div className="container">
        <div className="rounded-3xl border border-[color:var(--hany-border-soft)] bg-white/70 backdrop-blur-sm p-8 md:p-10 shadow-[var(--hany-shadow-sm)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 text-center">
            {fallback.map((s, i) => (
              <div
                key={`${s.value}-${i}`}
                className="hany-reveal"
                style={{ ["--delay" as string]: `${i * 70}ms` }}
              >
                <div className="text-3xl md:text-5xl font-extrabold hany-gradient-text tracking-tight">
                  {s.value}
                </div>
                <div className="mt-2 text-xs md:text-sm text-[color:var(--hany-fg-muted)] font-medium">
                  {isAr ? s.label_ar : s.label_en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
