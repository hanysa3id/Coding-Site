import { Eyebrow } from "../ui/eyebrow";

// A horizontal band of large statistics — visually striking, low text density.
export function AuroraStatsBand({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const stats = [
    { value: "100+", label: isAr ? "مشروع منجز" : "Projects shipped" },
    { value: "7", label: isAr ? "سنوات خبرة" : "Years of experience" },
    { value: "98%", label: isAr ? "رضا العملاء" : "Customer satisfaction" },
    { value: "24/7", label: isAr ? "دعم متواصل" : "Always-on support" },
  ];

  return (
    <section className="border-y border-white/5 bg-white/[0.015]">
      <div className="container py-12 md:py-16">
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
      </div>
    </section>
  );
}
