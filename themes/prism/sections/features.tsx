import { PrismSection, PrismHeading } from "../ui/section";
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
    ar: "تطوير ويب وتطبيقات",
    en: "Web & app engineering",
    arDesc: "Next.js, React Native, APIs قوية، اختبارات تلقائية وCI/CD.",
    enDesc: "Next.js, React Native, robust APIs, automated testing and CI/CD.",
    accent: "magenta",
    big: true,
  },
  {
    icon: Palette,
    ar: "هوية بصرية وتصميم",
    en: "Identity & design",
    arDesc: "هوية كاملة، UI/UX، موشن جرافيك.",
    enDesc: "Identity systems, UI/UX, motion graphics.",
    accent: "cyan",
  },
  {
    icon: Megaphone,
    ar: "تسويق رقمي وأداء",
    en: "Performance marketing",
    arDesc: "إعلانات، SEO، محتوى يحوّل.",
    enDesc: "Paid ads, SEO, conversion-grade content.",
    accent: "lime",
  },
  {
    icon: Smartphone,
    ar: "تطبيقات موبايل",
    en: "Mobile apps",
    arDesc: "iOS و Android من كود واحد، تجربة أصلية.",
    enDesc: "iOS + Android from one codebase, native feel.",
    accent: "amber",
  },
  {
    icon: TrendingUp,
    ar: "نمو وتحليلات",
    en: "Growth & analytics",
    arDesc: "Dashboards، attribution، اختبارات A/B.",
    enDesc: "Dashboards, attribution, A/B experimentation.",
    accent: "violet",
  },
  {
    icon: ShieldCheck,
    ar: "أمان ودعم 24/7",
    en: "Security & 24/7 support",
    arDesc: "مراقبة، تصحيحات أمنية، استجابة بالدقائق.",
    enDesc: "Monitoring, security patches, response within minutes.",
    accent: "cyan",
  },
];

export function PrismFeatures({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <PrismSection size="lg" id="features">
      <PrismHeading
        align="center"
        sticker={<span className="prism-sticker is-magenta">{isAr ? "مميزاتنا" : "What we do"}</span>}
        eyebrow={isAr ? "خدمات متكاملة" : "Full-stack agency"}
        title={
          <>
            {isAr ? "كل ما يحتاجه مشروعك " : "Everything your brand needs "}
            <span className="prism-grad-text">
              {isAr ? "تحت سقف واحد." : "in one studio."}
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
          const accentClass =
            f.accent === "magenta"
              ? "is-magenta"
              : f.accent === "cyan"
              ? "is-cyan"
              : f.accent === "lime"
              ? ""
              : f.accent === "amber"
              ? "is-amber"
              : "is-violet";
          return (
            <div
              key={i}
              className={`prism-card prism-spot prism-fade-up p-6 md:p-7 ${
                f.big ? "lg:col-span-2 lg:row-span-2" : ""
              }`}
              style={{ ["--prism-delay" as string]: `${i * 70}ms` }}
            >
              <div className="flex items-start justify-between mb-5">
                <span className={`prism-sticker ${accentClass}`}>
                  <Icon className="h-3.5 w-3.5" />
                  0{i + 1}
                </span>
                {f.big && (
                  <span className="prism-sticker is-cyan is-rotate-r">
                    <Sparkles className="h-3 w-3" />
                    {isAr ? "الأكثر طلباً" : "Most requested"}
                  </span>
                )}
              </div>
              <h3
                className={`prism-display text-white ${
                  f.big ? "text-3xl md:text-5xl" : "text-2xl"
                }`}
              >
                {isAr ? f.ar : f.en}
              </h3>
              <p className={`text-white/65 mt-3 leading-relaxed ${f.big ? "text-base md:text-lg max-w-md" : "text-sm"}`}>
                {isAr ? f.arDesc : f.enDesc}
              </p>
              {f.big && (
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {["Next.js", "React", "Tailwind"].map((t) => (
                    <span key={t} className="prism-pill text-center justify-center">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PrismSection>
  );
}
