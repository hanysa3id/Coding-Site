import { Link } from "@/i18n/routing";
import { Check, Sparkles } from "lucide-react";
import { PrismSection, PrismHeading } from "../ui/section";
import { PrismButton } from "../ui/prism-button";

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
  sticker: { ar: string; en: string; cls: string };
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
    sticker: { ar: "بداية سريعة", en: "Quick start", cls: "is-cyan" },
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
    sticker: { ar: "الأكثر اختياراً", en: "Most popular", cls: "is-magenta" },
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
    sticker: { ar: "مؤسسات", en: "Enterprise", cls: "is-amber" },
  },
];

export function PrismPricing({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <PrismSection size="lg" id="pricing">
      <PrismHeading
        align="center"
        sticker={<span className="prism-sticker">{isAr ? "أسعار شفافة" : "Pricing"}</span>}
        eyebrow={isAr ? "بدون رسوم خفية" : "Transparent"}
        title={
          <>
            {isAr ? "اختر الباقة " : "Pick a plan "}
            <span className="prism-grad-text">
              {isAr ? "التي تناسب طموحك." : "that fits your ambition."}
            </span>
          </>
        }
        description={
          isAr
            ? "كل باقة قابلة للتخصيص. لا رسوم خفية، لا التزامات لا ترغبها."
            : "Every plan is customizable. No hidden fees, no commitments you don&apos;t want."
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
              className={`prism-fade-up relative p-7 space-y-5 ${
                t.highlighted ? "prism-card-outline" : "prism-card"
              }`}
              style={{ ["--prism-delay" as string]: `${i * 90}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className={`prism-sticker ${t.sticker.cls}`}>
                  {t.highlighted && <Sparkles className="h-3 w-3" />}
                  {isAr ? t.sticker.ar : t.sticker.en}
                </span>
                <p className="prism-outline-text text-3xl">{String(i + 1).padStart(2, "0")}</p>
              </div>
              <div className="space-y-1.5">
                <p className="prism-display text-xl text-white">{name}</p>
                <p className="prism-display text-4xl md:text-5xl text-white">{price}</p>
                <p className="text-sm text-white/60">{tagline}</p>
              </div>
              <ul className="space-y-2.5">
                {features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/80">
                    <span className="mt-0.5 grid place-items-center h-5 w-5 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <PrismButton
                asChild
                variant={t.highlighted ? "primary" : "secondary"}
                size="md"
                className="w-full"
              >
                <Link href={t.cta.href}>{ctaLabel}</Link>
              </PrismButton>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-white/45 mt-8">
        {isAr
          ? "* الأسعار تقديرية. عرض السعر النهائي بعد محادثة استكشافية مجانية."
          : "* Prices are estimates. Final quote follows a free scoping call."}
      </p>
    </PrismSection>
  );
}
