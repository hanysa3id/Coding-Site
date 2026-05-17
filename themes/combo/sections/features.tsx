import { ComboSection, ComboHeading } from "../ui/section";
import {
  Code2,
  Palette,
  Megaphone,
  Smartphone,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Code2,
    ar: "هندسة برمجيات",
    en: "Software engineering",
    arDesc: "Next.js · TypeScript · APIs · اختبارات تلقائية · CI/CD.",
    enDesc: "Next.js · TypeScript · APIs · automated tests · CI/CD.",
    big: true,
  },
  {
    icon: Palette,
    ar: "تصميم بصري",
    en: "Visual design",
    arDesc: "هوية، UX/UI، motion، نظام تصميم متّسق.",
    enDesc: "Identity, UX/UI, motion, coherent design system.",
  },
  {
    icon: Megaphone,
    ar: "تسويق رقمي",
    en: "Digital marketing",
    arDesc: "حملات أداء، SEO، محتوى يحوّل.",
    enDesc: "Performance ads, SEO, conversion-grade content.",
  },
  {
    icon: Smartphone,
    ar: "تطبيقات موبايل",
    en: "Mobile apps",
    arDesc: "iOS و Android من قاعدة كود واحدة.",
    enDesc: "iOS + Android from one codebase.",
  },
  {
    icon: TrendingUp,
    ar: "نمو + تحليلات",
    en: "Growth + analytics",
    arDesc: "Attribution، Dashboards، A/B.",
    enDesc: "Attribution, dashboards, A/B testing.",
  },
  {
    icon: ShieldCheck,
    ar: "أمان ودعم 24/7",
    en: "Security & 24/7 support",
    arDesc: "مراقبة، تصحيحات، استجابة بالدقائق.",
    enDesc: "Monitoring, patches, response within minutes.",
  },
];

export function ComboFeatures({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <ComboSection size="lg" id="features">
      <ComboHeading
        align="center"
        eyebrow={isAr ? "ما الذي نفعله" : "What we do"}
        title={
          <>
            {isAr ? "كل ما يحتاجه منتجك " : "Everything your product needs "}
            <span className="combo-grad-text">
              {isAr ? "تحت سقف واحد." : "under one roof."}
            </span>
          </>
        }
        description={
          isAr
            ? "كود + تصميم + تسويق + موشن — فريق واحد متناسق، رؤية واحدة، نتائج تتجاوز التوقعات."
            : "Code + design + marketing + motion — one cohesive team, one vision, results that exceed expectations."
        }
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mt-14 lg:grid-rows-2">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className={`combo-card combo-fade-up p-6 md:p-7 ${
                f.big ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
              style={{ ["--combo-delay" as string]: `${i * 70}ms` }}
            >
              <div className="flex items-start justify-between mb-5">
                <span className="combo-icon-tile">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="combo-outline-text text-3xl">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className={`combo-display text-white ${f.big ? "text-3xl md:text-5xl" : "text-2xl"}`}>
                {isAr ? f.ar : f.en}
              </h3>
              <p
                className={`text-white/65 mt-3 leading-relaxed ${
                  f.big ? "text-base md:text-lg max-w-md" : "text-sm"
                }`}
              >
                {isAr ? f.arDesc : f.enDesc}
              </p>
              {f.big && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Next.js", "TypeScript", "PostgreSQL", "Tailwind"].map((t) => (
                    <span key={t} className="combo-pill-soft px-3 py-1 text-[11px] combo-mono">
                      {t}
                    </span>
                  ))}
                  <span className="combo-pill inline-flex items-center gap-1.5 px-3 py-1 text-[11px] combo-mono">
                    <Sparkles className="h-3 w-3" />
                    {isAr ? "الأكثر طلباً" : "Most requested"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ComboSection>
  );
}
