import { Link } from "@/i18n/routing";
import { Check, Sparkles } from "lucide-react";
import { HanySection, HanySectionHeading } from "../ui/section";
import { HanyButton } from "../ui/hany-button";

export function HanyPricing({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const tiers = [
    {
      ar: "البداية",
      en: "Starter",
      priceAr: "ابتداءً من ٢٥٠٠$",
      priceEn: "From $2,500",
      descAr: "للشركات الناشئة التي تبحث عن إطلاق سريع.",
      descEn: "For startups that want to launch fast.",
      features: [
        { ar: "موقع/تطبيق صفحات هبوط", en: "Website / landing pages" },
        { ar: "تصميم عصري متجاوب", en: "Modern responsive design" },
        { ar: "تحسين أساسي لـ SEO", en: "Basic SEO setup" },
        { ar: "دعم شهر مجاناً", en: "1 month free support" },
      ],
      popular: false,
    },
    {
      ar: "النمو",
      en: "Growth",
      priceAr: "ابتداءً من ٧٥٠٠$",
      priceEn: "From $7,500",
      descAr: "الأكثر شعبية — للأعمال الجاهزة للتوسع.",
      descEn: "Most popular — for businesses ready to scale.",
      features: [
        { ar: "كل ما في باقة البداية", en: "Everything in Starter" },
        { ar: "تطبيق ويب متكامل بلوحة تحكم", en: "Full web app + dashboard" },
        { ar: "إدارة حملات تسويقية", en: "Marketing campaigns" },
        { ar: "دعم وتحسينات لمدة 3 شهور", en: "3 months support & iteration" },
      ],
      popular: true,
    },
    {
      ar: "المؤسسات",
      en: "Enterprise",
      priceAr: isAr ? "حسب الطلب" : "On request",
      priceEn: "On request",
      descAr: "حلول مخصصة، تكاملات، وفريق متفرّغ.",
      descEn: "Tailored solutions, integrations, and a dedicated team.",
      features: [
        { ar: "كل ما في باقة النمو", en: "Everything in Growth" },
        { ar: "تكاملات مخصصة وأنظمة داخلية", en: "Custom integrations & internal tools" },
        { ar: "SLA و دعم 24/7", en: "SLA & 24/7 support" },
        { ar: "مدير حساب مختص", en: "Dedicated account manager" },
      ],
      popular: false,
    },
  ];

  return (
    <HanySection id="pricing" className="bg-white/40">
      <HanySectionHeading
        kicker={isAr ? "الأسعار" : "Pricing"}
        title={isAr ? "باقات شفافة تناسب كل مرحلة" : "Transparent packages for every stage"}
        description={
          isAr
            ? "ادفع مقابل ما تحتاجه فقط — كل الباقات قابلة للتخصيص."
            : "Pay only for what you need — every package is customizable."
        }
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3 items-stretch">
        {tiers.map((t, i) => (
          <div
            key={t.en}
            className={`p-7 rounded-2xl flex flex-col hany-reveal ${
              t.popular ? "hany-price-popular shadow-[var(--hany-shadow-lg)]" : "hany-card"
            }`}
            style={{ ["--delay" as string]: `${i * 80}ms` }}
          >
            {t.popular && (
              <span className="absolute -top-3 start-1/2 -translate-x-1/2 hany-chip !bg-[var(--hany-grad)] !text-white !border-transparent">
                <Sparkles className="h-3 w-3" />
                {isAr ? "الأكثر شعبية" : "Most popular"}
              </span>
            )}
            <h3 className="text-lg font-bold">{isAr ? t.ar : t.en}</h3>
            <p className="text-sm text-[color:var(--hany-fg-muted)] mt-1">
              {isAr ? t.descAr : t.descEn}
            </p>
            <div className="mt-5 text-3xl font-extrabold hany-gradient-text">
              {isAr ? t.priceAr : t.priceEn}
            </div>
            <ul className="mt-6 space-y-2.5 flex-1">
              {t.features.map((f) => (
                <li key={f.en} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                  <span>{isAr ? f.ar : f.en}</span>
                </li>
              ))}
            </ul>
            <HanyButton
              asChild
              size="md"
              variant={t.popular ? "primary" : "secondary"}
              className="mt-7 w-full"
            >
              <Link href="/contact">{isAr ? "اطلب عرض سعر" : "Request a quote"}</Link>
            </HanyButton>
          </div>
        ))}
      </div>
    </HanySection>
  );
}
