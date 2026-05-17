import { Link } from "@/i18n/routing";
import { Check, Sparkles } from "lucide-react";
import { ComboSection, ComboHeading } from "../ui/section";
import { ComboButton } from "../ui/combo-button";

type Tier = {
  nameAr: string;
  nameEn: string;
  priceAr: string;
  priceEn: string;
  taglineAr: string;
  taglineEn: string;
  featuresAr: string[];
  featuresEn: string[];
  cta: { labelAr: string; labelEn: string; href: string };
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    nameAr: "البداية",
    nameEn: "Starter",
    priceAr: "من 8,000 ج.م",
    priceEn: "From $300",
    taglineAr: "للمشاريع البسيطة والمواقع التعريفية.",
    taglineEn: "Simple sites and quick MVPs.",
    featuresAr: ["موقع تعريفي حتى 5 صفحات", "تصميم متجاوب", "نشر على نطاقك", "30 يوم دعم"],
    featuresEn: ["Up to 5-page brochure site", "Responsive design", "Deployed to your domain", "30 days of support"],
    cta: { labelAr: "ابدأ مشروعاً", labelEn: "Start a project", href: "/contact" },
  },
  {
    nameAr: "الاحترافي",
    nameEn: "Professional",
    priceAr: "من 25,000 ج.م",
    priceEn: "From $950",
    taglineAr: "الأنسب لمعظم الشركات.",
    taglineEn: "Best fit for most businesses.",
    featuresAr: [
      "موقع كامل أو تطبيق ويب",
      "لوحة تحكم محتوى",
      "SEO تقني",
      "تكامل مدفوعات",
      "تدريب لفريقك",
      "60 يوم دعم",
    ],
    featuresEn: [
      "Full website or web app",
      "Content dashboard",
      "Technical SEO",
      "Payment gateway integration",
      "Team training",
      "60 days of support",
    ],
    cta: { labelAr: "احجز مكالمة", labelEn: "Book a call", href: "/contact" },
    highlighted: true,
  },
  {
    nameAr: "المؤسسات",
    nameEn: "Enterprise",
    priceAr: "حسب النطاق",
    priceEn: "Custom scope",
    taglineAr: "لمنتجات متقدمة ومتعددة المنصات.",
    taglineEn: "Advanced multi-platform builds.",
    featuresAr: ["تطبيقات ويب وموبايل", "بنية سحابية", "اختبارات وأمان مكثف", "فريق مخصص", "SLA"],
    featuresEn: ["Integrated web + mobile", "Cloud-native infra", "Deep testing + security", "Dedicated team", "SLA"],
    cta: { labelAr: "تحدّث مع المبيعات", labelEn: "Talk to sales", href: "/contact" },
  },
];

export function ComboPricing({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <ComboSection size="lg" id="pricing">
      <ComboHeading
        align="center"
        eyebrow={isAr ? "أسعار شفافة" : "Pricing"}
        title={
          <>
            {isAr ? "اختر " : "Pick "}
            <span className="combo-grad-text">
              {isAr ? "الباقة المناسبة." : "the right plan."}
            </span>
          </>
        }
        description={
          isAr
            ? "كل باقة قابلة للتخصيص. لا رسوم خفية، لا التزامات لا ترغبها."
            : "Every plan is customizable. No hidden fees, no commitments you don't want."
        }
      />

      <div className="grid gap-5 md:grid-cols-3 mt-14">
        {TIERS.map((t, i) => {
          const name = isAr ? t.nameAr : t.nameEn;
          const price = isAr ? t.priceAr : t.priceEn;
          const tagline = isAr ? t.taglineAr : t.taglineEn;
          const features = isAr ? t.featuresAr : t.featuresEn;
          const ctaLabel = isAr ? t.cta.labelAr : t.cta.labelEn;
          return (
            <div
              key={i}
              className={`combo-card combo-fade-up p-7 space-y-5 relative ${
                t.highlighted ? "combo-card-glow is-active" : ""
              }`}
              style={{ ["--combo-delay" as string]: `${i * 90}ms` }}
            >
              {t.highlighted && (
                <span
                  className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)",
                    boxShadow: "0 12px 28px -10px rgba(139,92,246,0.65)",
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  {isAr ? "الأكثر اختياراً" : "Most popular"}
                </span>
              )}
              <div className="space-y-1.5">
                <p className="combo-mono text-xs text-violet-300 uppercase tracking-wider">
                  {name}
                </p>
                <p className="combo-display text-4xl md:text-5xl text-white">
                  {price}
                </p>
                <p className="text-sm text-white/60">{tagline}</p>
              </div>
              <ul className="space-y-2.5">
                {features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/80">
                    <span
                      className="mt-0.5 grid place-items-center h-5 w-5 rounded-full shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                      }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <ComboButton
                asChild
                variant={t.highlighted ? "primary" : "secondary"}
                size="md"
                className="w-full"
              >
                <Link href={t.cta.href}>{ctaLabel}</Link>
              </ComboButton>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-white/45 mt-8">
        {isAr
          ? "* الأسعار تقديرية. عرض السعر النهائي بعد محادثة استكشافية مجانية."
          : "* Prices are estimates. Final quote follows a free scoping call."}
      </p>
    </ComboSection>
  );
}
