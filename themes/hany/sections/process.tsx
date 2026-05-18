import { Compass, PencilRuler, Code2, Rocket } from "lucide-react";
import { HanySection, HanySectionHeading } from "../ui/section";

export function HanyProcess({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const steps = [
    {
      icon: Compass,
      ar: "التخطيط",
      en: "Planning",
      descAr: "نفهم هدفك، جمهورك، ومتطلباتك بدقة قبل البدء.",
      descEn: "We deeply understand your goals, audience, and requirements first.",
    },
    {
      icon: PencilRuler,
      ar: "التصميم",
      en: "Design",
      descAr: "نصمم واجهات وتجربة استخدام تحوّل الزوار لعملاء.",
      descEn: "We design UX & UI that convert visitors into customers.",
    },
    {
      icon: Code2,
      ar: "التطوير",
      en: "Development",
      descAr: "نبني المنتج بكود نظيف وقابل للتوسع، باختبارات على كل خطوة.",
      descEn: "We build clean, scalable code with tests at every step.",
    },
    {
      icon: Rocket,
      ar: "الإطلاق",
      en: "Launch",
      descAr: "ننشر المنتج، نتابع الأداء، ونحسّن باستمرار.",
      descEn: "We deploy, monitor performance, and iterate continuously.",
    },
  ];

  return (
    <HanySection id="process">
      <HanySectionHeading
        kicker={isAr ? "كيف نعمل" : "How we work"}
        title={isAr ? "أربع خطوات بسيطة لمنتج ناجح" : "Four simple steps to a winning product"}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-4 relative">
        <div className="hidden md:block absolute top-7 start-[12.5%] end-[12.5%] h-px hany-step-line" aria-hidden />
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.en}
              className="relative text-center hany-reveal"
              style={{ ["--delay" as string]: `${i * 90}ms` }}
            >
              <div className="relative inline-grid place-items-center mx-auto mb-4">
                <div className="absolute inset-0 rounded-full blur-xl opacity-50 bg-[radial-gradient(circle,var(--hany-brand)_0%,transparent_70%)]" aria-hidden />
                <div className="relative grid place-items-center h-14 w-14 rounded-full bg-white border border-[color:var(--hany-border)] shadow-[var(--hany-shadow)]">
                  <Icon className="h-6 w-6 text-[color:var(--hany-brand)]" />
                </div>
                <span className="absolute -top-2 -end-2 grid place-items-center h-6 w-6 rounded-full text-[10px] font-bold text-white bg-[var(--hany-grad)] shadow-md">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold mb-1">{isAr ? s.ar : s.en}</h3>
              <p className="text-sm text-[color:var(--hany-fg-muted)] leading-relaxed max-w-xs mx-auto">
                {isAr ? s.descAr : s.descEn}
              </p>
            </div>
          );
        })}
      </div>
    </HanySection>
  );
}
