import { ComboSection, ComboHeading } from "../ui/section";
import { Sparkles, Layers, Code2, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    ar: "اكتشاف",
    en: "Discover",
    arDesc: "ورشة استكشاف، تحليل منافسين، خارطة طريق.",
    enDesc: "Discovery workshop, competitor analysis, roadmap.",
  },
  {
    icon: Layers,
    ar: "تصميم",
    en: "Design",
    arDesc: "هوية، نماذج تفاعلية قابلة للنقر، نظام تصميم.",
    enDesc: "Identity, clickable interactive mockups, design system.",
  },
  {
    icon: Code2,
    ar: "تطوير",
    en: "Build",
    arDesc: "كود نظيف، اختبارات، CI/CD، عرض أسبوعي.",
    enDesc: "Clean code, tests, CI/CD, weekly demos.",
  },
  {
    icon: Rocket,
    ar: "إطلاق ونمو",
    en: "Launch & grow",
    arDesc: "نشر، مراقبة، حملات تسويق، تحسين مستمر.",
    enDesc: "Deploy, monitor, marketing campaigns, iterate.",
  },
];

export function ComboProcess({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <ComboSection size="lg" id="process">
      <ComboHeading
        eyebrow={isAr ? "كيف نعمل" : "How we work"}
        title={
          <>
            {isAr ? "أربع خطوات " : "Four steps "}
            <span className="combo-grad-text">
              {isAr ? "من الفكرة إلى النمو." : "from idea to growth."}
            </span>
          </>
        }
        description={
          isAr
            ? "تعرف بالضبط أين نحن في كل لحظة. اجتماعات أسبوعية، عرض تجريبي مباشر، ولا مفاجآت."
            : "You know exactly where we are at any moment. Weekly demos, live previews, zero surprises."
        }
      />

      <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-14">
        <div
          className="hidden lg:block absolute top-12 inset-x-0 h-0.5 z-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(167,139,250,0.30) 0, rgba(167,139,250,0.30) 8px, transparent 8px, transparent 16px)",
          }}
          aria-hidden
        />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="relative combo-card combo-fade-up p-6 z-10"
              style={{ ["--combo-delay" as string]: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="combo-icon-tile">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="combo-outline-text text-5xl">{i + 1}</span>
              </div>
              <h3 className="combo-display text-2xl text-white">{isAr ? s.ar : s.en}</h3>
              <p className="text-sm text-white/65 mt-2 leading-relaxed">
                {isAr ? s.arDesc : s.enDesc}
              </p>
            </div>
          );
        })}
      </div>
    </ComboSection>
  );
}
