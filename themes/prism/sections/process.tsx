import { PrismSection, PrismHeading } from "../ui/section";
import { Sparkles, Layers, Code2, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    ar: "اكتشاف",
    en: "Discover",
    arDesc: "ورشة استكشاف، تحليل المنافسين، خارطة طريق.",
    enDesc: "Discovery workshop, competitor analysis, roadmap.",
    accent: "is-magenta",
  },
  {
    icon: Layers,
    ar: "تصميم",
    en: "Design",
    arDesc: "هوية، نماذج تفاعلية قابلة للنقر، نظام تصميم.",
    enDesc: "Identity, clickable interactive mockups, design system.",
    accent: "is-cyan",
  },
  {
    icon: Code2,
    ar: "تطوير",
    en: "Build",
    arDesc: "كود نظيف، اختبارات، CI/CD، عرض أسبوعي.",
    enDesc: "Clean code, tests, CI/CD, weekly demos.",
    accent: "",
  },
  {
    icon: Rocket,
    ar: "إطلاق ونمو",
    en: "Launch & grow",
    arDesc: "نشر، مراقبة، حملات تسويق، تحسين مستمر.",
    enDesc: "Deploy, monitor, marketing campaigns, iterate.",
    accent: "is-amber",
  },
];

export function PrismProcess({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <PrismSection size="lg" id="process">
      <PrismHeading
        sticker={<span className="prism-sticker is-cyan">{isAr ? "كيف نعمل" : "How we work"}</span>}
        eyebrow={isAr ? "العملية" : "Process"}
        title={
          <>
            {isAr ? "أربع خطوات " : "Four steps "}
            <span className="prism-grad-text">
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
        {/* connecting line */}
        <div
          className="hidden lg:block absolute top-12 inset-x-0 h-0.5 z-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 8px, transparent 8px, transparent 16px)",
          }}
          aria-hidden
        />
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="relative prism-card prism-fade-up p-6 z-10"
              style={{ ["--prism-delay" as string]: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className={`prism-sticker ${s.accent}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="prism-outline-text text-5xl">{i + 1}</span>
              </div>
              <h3 className="prism-display text-2xl text-white">{isAr ? s.ar : s.en}</h3>
              <p className="text-sm text-white/65 mt-2 leading-relaxed">
                {isAr ? s.arDesc : s.enDesc}
              </p>
            </div>
          );
        })}
      </div>
    </PrismSection>
  );
}
