import { Link } from "@/i18n/routing";
import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { GlassCard } from "../ui/glass-card";
import { Mono, H3 } from "../ui/typography";
import { AuroraButton } from "../ui/aurora-button";
import { Check, Sparkles } from "lucide-react";

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
    taglineAr: "للمشاريع البسيطة والمواقع التعريفية",
    taglineEn: "For simple sites and quick MVPs",
    featuresAr: [
      "موقع تعريفي يصل إلى 5 صفحات",
      "تصميم متجاوب على كل الأجهزة",
      "نشر على نطاقك",
      "30 يوم دعم بعد التسليم",
    ],
    featuresEn: [
      "Up to 5-page brochure site",
      "Fully responsive on every device",
      "Deployed to your domain",
      "30 days of post-launch support",
    ],
    cta: { labelAr: "ابدأ مشروعاً", labelEn: "Start a project", href: "/contact" },
  },
  {
    nameAr: "الاحترافي",
    nameEn: "Professional",
    priceAr: "من 25,000 ج.م",
    priceEn: "From $950",
    taglineAr: "الأنسب لمعظم الشركات",
    taglineEn: "Best fit for most businesses",
    featuresAr: [
      "موقع كامل أو تطبيق ويب",
      "لوحة تحكم محتوى (CMS)",
      "تحسين SEO تقني",
      "تكامل مع بوابات الدفع",
      "تدريب لفريقك",
      "دعم 60 يوم",
    ],
    featuresEn: [
      "Full website or web app",
      "Content management dashboard",
      "Technical SEO",
      "Payment-gateway integration",
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
    taglineAr: "لمنتجات متقدمة وتطبيقات متعددة",
    taglineEn: "For advanced products and multi-platform builds",
    featuresAr: [
      "تطبيقات ويب وموبايل متكاملة",
      "بنية تحتية على السحابة",
      "اختبارات وأمان مكثف",
      "فريق تطوير مخصص",
      "اتفاقية مستوى خدمة SLA",
    ],
    featuresEn: [
      "Integrated web and mobile apps",
      "Cloud-native infrastructure",
      "Deep testing and security",
      "Dedicated engineering team",
      "SLA-backed support",
    ],
    cta: { labelAr: "تحدّث مع فريق المبيعات", labelEn: "Talk to sales", href: "/contact" },
  },
];

export function AuroraPricingTeaser({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <Section>
      <SectionHeading
        align="center"
        kicker={isAr ? "أسعار شفافة" : "Transparent pricing"}
        title={isAr ? "اختر الباقة الأنسب لمشروعك" : "Pick the plan that fits"}
        description={
          isAr
            ? "كل باقة مفصّلة قابلة للتخصيص. لا رسوم خفية، لا التزامات لا ترغبها."
            : "Every package is customizable. No hidden fees, no commitments you do not want."
        }
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {TIERS.map((tier, i) => {
          const name = isAr ? tier.nameAr : tier.nameEn;
          const price = isAr ? tier.priceAr : tier.priceEn;
          const tagline = isAr ? tier.taglineAr : tier.taglineEn;
          const features = isAr ? tier.featuresAr : tier.featuresEn;
          const ctaLabel = isAr ? tier.cta.labelAr : tier.cta.labelEn;
          return (
            <GlassCard
              key={i}
              className={`p-7 space-y-6 relative ${tier.highlighted ? "ring-1 ring-violet-400/40" : ""}`}
            >
              {tier.highlighted && (
                <>
                  <div className="absolute inset-0 aurora-stripes rounded-2xl pointer-events-none" aria-hidden />
                  <span className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-1 text-[11px] font-medium text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    {isAr ? "الأكثر اختياراً" : "Most popular"}
                  </span>
                </>
              )}
              <div className="relative space-y-2">
                <Mono>{name}</Mono>
                <H3>{price}</H3>
                <p className="text-sm text-white/55">{tagline}</p>
              </div>
              <ul className="relative space-y-2.5">
                {features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/75">
                    <span className="mt-0.5 grid place-items-center h-4 w-4 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 shrink-0">
                      <Check className="h-2.5 w-2.5 text-violet-300" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <AuroraButton
                asChild
                variant={tier.highlighted ? "primary" : "secondary"}
                size="md"
                className="w-full relative"
              >
                <Link href={tier.cta.href}>{ctaLabel}</Link>
              </AuroraButton>
            </GlassCard>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-white/40">
        {isAr
          ? "* الأسعار تقديرية. عرض السعر النهائي بعد محادثة استكشافية مجانية."
          : "* Prices are estimates. Final quote follows a free scoping call."}
      </p>
    </Section>
  );
}
