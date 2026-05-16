import { MoonSection, MoonSectionHeading } from "../ui/section";

export function MoonProcess({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const steps = [
    { n: "01", title: isAr ? "اكتشاف" : "Discover", desc: isAr ? "نتعمق في عملك وأهدافك وعملائك." : "Deep dive into business, goals, customers." },
    { n: "02", title: isAr ? "تصميم" : "Design", desc: isAr ? "تجربة المستخدم قبل أي خط كود." : "UX before any line of code." },
    { n: "03", title: isAr ? "تطوير" : "Build", desc: isAr ? "إصدارات قابلة للمراجعة كل أسبوع." : "Reviewable weekly increments." },
    { n: "04", title: isAr ? "إطلاق" : "Launch", desc: isAr ? "نطلق ونراقب ونحسن بناءً على البيانات." : "Launch, monitor, iterate from data." },
  ];

  return (
    <MoonSection size="lg">
      <MoonSectionHeading
        kicker={isAr ? "كيف نعمل" : "How we work"}
        title={isAr ? "أربع مراحل واضحة من البداية للنهاية" : "Four clear stages, start to finish"}
        description={
          isAr
            ? "عملية شفافة، خطوات قابلة للقياس، وتسليمات في كل مرحلة."
            : "Transparent process, measurable milestones, deliverables at every stage."
        }
      />

      <div className="relative mt-16 grid gap-6 md:grid-cols-4">
        {/* Connector line */}
        <div
          className="hidden md:block absolute top-8 start-[12%] end-[12%] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(96,165,250,0.45), rgba(129,140,248,0.50), rgba(45,212,191,0.45), transparent)",
          }}
          aria-hidden
        />

        {steps.map((s, i) => (
          <div
            key={i}
            className="moon-fade-up relative space-y-3 text-center md:text-start"
            style={{ "--moon-delay": `${i * 100}ms` } as React.CSSProperties}
          >
            <div className="relative inline-flex items-center justify-center mx-auto md:mx-0">
              <span className="moon-card h-16 w-16 grid place-items-center moon-mono text-base text-white relative">
                {s.n}
              </span>
              {i === 0 && (
                <span
                  className="absolute inset-0 rounded-full ring-2 ring-sky-400/40 animate-pulse pointer-events-none"
                  aria-hidden
                />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white">{s.title}</h3>
            <p className="text-sm text-white/55 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </MoonSection>
  );
}
