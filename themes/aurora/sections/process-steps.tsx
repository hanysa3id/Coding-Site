import { SectionHeading } from "../ui/section-heading";

// Visual "how it works" — 4 numbered steps with connector line.
// Connector renders as horizontal on md+ and vertical on mobile.
export function AuroraProcessSteps({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const steps = [
    {
      n: "01",
      title: isAr ? "اكتشاف" : "Discover",
      desc: isAr ? "نتعمق في عملك وأهدافك وعملائك." : "We dive into your business, goals, and customers.",
    },
    {
      n: "02",
      title: isAr ? "تصميم" : "Design",
      desc: isAr ? "نرسم تجربة المستخدم والواجهة قبل أي كود." : "We map UX and UI before any line of code.",
    },
    {
      n: "03",
      title: isAr ? "تطوير" : "Build",
      desc: isAr ? "نطور بإصدارات قابلة للمراجعة كل أسبوع." : "We ship in reviewable weekly increments.",
    },
    {
      n: "04",
      title: isAr ? "إطلاق" : "Launch",
      desc: isAr ? "نطلق ونراقب ونحسن بناءً على البيانات." : "We launch, monitor, and iterate from data.",
    },
  ];

  return (
    <section className="container py-24 md:py-32">
      <SectionHeading
        align="center"
        kicker={isAr ? "كيف نعمل" : "How we work"}
        title={isAr ? "أربع مراحل واضحة من البداية للنهاية" : "Four clear stages from start to finish"}
        description={
          isAr
            ? "عملية شفافة، خطوات قابلة للقياس، وتسليمات في كل مرحلة."
            : "Transparent process, measurable milestones, and deliverables at every stage."
        }
      />

      <div className="relative mt-16 grid gap-4 md:grid-cols-4">
        {/* Connector line (decorative) */}
        <div
          className="hidden md:block absolute top-8 start-[12%] end-[12%] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(236,72,153,0.4), rgba(6,182,212,0.4), transparent)",
          }}
          aria-hidden
        />

        {steps.map((s, i) => (
          <div key={i} className="relative space-y-3 text-center md:text-start">
            <div className="relative inline-flex items-center justify-center mx-auto md:mx-0">
              <span className="aurora-glass rounded-full h-16 w-16 grid place-items-center aurora-mono text-base">
                {s.n}
              </span>
              {i === 0 && (
                <span className="absolute inset-0 rounded-full ring-2 ring-violet-400/30 animate-pulse" aria-hidden />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white">{s.title}</h3>
            <p className="text-sm text-white/55 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
