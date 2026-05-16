import { MoonSection, MoonSectionHeading } from "../ui/section";
import { Sparkles, Globe, Zap, Layers, ShieldCheck, Clock4 } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    titleAr: "تسليم متكامل من البداية للنهاية",
    titleEn: "End-to-end delivery",
    bodyAr: "نأخذ مشروعك من فكرة على ورق إلى منتج منشور — بحث، تصميم، تطوير، اختبار، نشر، ومراقبة بعد الإطلاق.",
    bodyEn: "We take your project from idea to launch — research, design, development, QA, deployment, and post-launch monitoring.",
    span: "md:col-span-2 lg:col-span-2 lg:row-span-2",
    featured: true,
  },
  {
    icon: Globe,
    titleAr: "عربي وإنجليزي بشكل أصلي",
    titleEn: "Native AR and EN",
    bodyAr: "RTL مدروس بعناية في كل تفصيلة — لا إضافات، بل تصميم أصلي للغتين.",
    bodyEn: "Carefully crafted RTL at every layer — not bolted on, native by design.",
    span: "",
  },
  {
    icon: Zap,
    titleAr: "أداء فائق",
    titleEn: "Performance-first",
    bodyAr: "Lighthouse 95+ من أول إطلاق.",
    bodyEn: "95+ Lighthouse from day one.",
    span: "",
  },
  {
    icon: Layers,
    titleAr: "مصمم للنمو",
    titleEn: "Built to scale",
    bodyAr: "من 10 إلى 10,000 مستخدم بدون إعادة كتابة.",
    bodyEn: "From 10 to 10K users without a rewrite.",
    span: "",
  },
  {
    icon: ShieldCheck,
    titleAr: "أمان من اليوم الأول",
    titleEn: "Secure by design",
    bodyAr: "تشفير، حماية ضد OWASP Top 10، مراجعات أمنية دورية.",
    bodyEn: "Encryption, OWASP Top 10 protection, regular security reviews.",
    span: "",
  },
  {
    icon: Clock4,
    titleAr: "دعم 24/7",
    titleEn: "24/7 support",
    bodyAr: "استجابة خلال دقائق لكل العملاء على الباقات السنوية.",
    bodyEn: "Minute-level response for all annual-plan clients.",
    span: "",
  },
];

export function MoonFeatures({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <MoonSection size="lg">
      <MoonSectionHeading
        kicker={isAr ? "لماذا تختارنا" : "Why work with us"}
        title={isAr ? "كل ما تحتاجه لإطلاق منتجك" : "Everything you need to ship"}
        description={
          isAr
            ? "تطوير، تصميم، DevOps، وتسويق تحت سقف واحد — لتركز على نمو عملك."
            : "Engineering, design, DevOps, and growth under one roof."
        }
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3 lg:grid-cols-3 lg:grid-rows-2 [&>*]:min-h-[180px]">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className={`moon-card moon-fade-up p-6 space-y-3 relative ${f.span} ${
                f.featured ? "moon-card-glow is-active overflow-hidden" : ""
              }`}
              style={{ "--moon-delay": `${i * 70}ms` } as React.CSSProperties}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/25 to-indigo-500/15 border border-sky-400/20">
                <Icon className="h-5 w-5 text-sky-200" />
              </span>
              <h3 className={`font-semibold text-white leading-tight ${f.featured ? "text-2xl md:text-3xl mt-2" : "text-lg"}`}>
                {isAr ? f.titleAr : f.titleEn}
              </h3>
              <p className={`text-white/60 leading-relaxed ${f.featured ? "text-base" : "text-sm"}`}>
                {isAr ? f.bodyAr : f.bodyEn}
              </p>

              {/* Decorative bento illustration for featured cell */}
              {f.featured && (
                <div className="pointer-events-none absolute end-6 bottom-4 grid grid-cols-3 gap-2 opacity-90">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <span
                      key={j}
                      className="h-12 w-12 rounded-lg border border-white/[0.08]"
                      style={{
                        background:
                          j === 4
                            ? "linear-gradient(135deg, rgba(96,165,250,0.7), rgba(45,212,191,0.55))"
                            : j % 3 === 0
                            ? "rgba(129,140,248,0.16)"
                            : j % 4 === 0
                            ? "rgba(45,212,191,0.14)"
                            : "rgba(255,255,255,0.03)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MoonSection>
  );
}
