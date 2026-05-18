import { Zap, ShieldCheck, Award, Headphones, Clock, Sparkles } from "lucide-react";
import { HanySection, HanySectionHeading } from "../ui/section";

export function HanyFeatures({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const items: { icon: React.ComponentType<{ className?: string }>; ar: string; en: string; descAr: string; descEn: string }[] = [
    {
      icon: Zap,
      ar: "تسليم سريع",
      en: "Fast delivery",
      descAr: "أول إصدار يعمل بين يديك في أسبوعين.",
      descEn: "A working first release in your hands within two weeks.",
    },
    {
      icon: Award,
      ar: "جودة احترافية",
      en: "Premium quality",
      descAr: "كود نظيف ومراجعات داخلية على كل تسليم.",
      descEn: "Clean code and internal reviews on every release.",
    },
    {
      icon: Headphones,
      ar: "دعم مستمر",
      en: "Ongoing support",
      descAr: "نبقى معك بعد الإطلاق — تحديثات، تحسينات، ومتابعة.",
      descEn: "We stay with you after launch — updates and improvements.",
    },
    {
      icon: ShieldCheck,
      ar: "أمان أولاً",
      en: "Security first",
      descAr: "أفضل ممارسات الحماية ومراجعات أمنية دورية.",
      descEn: "Best-practice protection and periodic security audits.",
    },
    {
      icon: Clock,
      ar: "شفافية كاملة",
      en: "Full transparency",
      descAr: "تقارير أسبوعية واضحة، بدون مفاجآت في الفاتورة.",
      descEn: "Clear weekly reports — no surprises on the invoice.",
    },
    {
      icon: Sparkles,
      ar: "خبرة متنوعة",
      en: "Diverse expertise",
      descAr: "فريق يجمع بين البرمجة، التصميم، التسويق، والـ QA.",
      descEn: "A team combining development, design, marketing, and QA.",
    },
  ];

  return (
    <HanySection id="features" className="bg-white/40">
      <HanySectionHeading
        kicker={isAr ? "لماذا نحن" : "Why us"}
        title={isAr ? "أسباب تختارنا فيها" : "Reasons clients choose us"}
        description={
          isAr
            ? "ركّزنا على الأشياء التي تصنع الفرق الحقيقي بين موقع جيد ومنتج ناجح."
            : "We focus on the things that actually separate a good site from a successful product."
        }
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, ar, en, descAr, descEn }, i) => (
          <div
            key={en}
            className="hany-card p-6 hany-reveal"
            style={{ ["--delay" as string]: `${i * 60}ms` }}
          >
            <div className="hany-icon-tile mb-4">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg mb-1">{isAr ? ar : en}</h3>
            <p className="text-sm text-[color:var(--hany-fg-muted)] leading-relaxed">
              {isAr ? descAr : descEn}
            </p>
          </div>
        ))}
      </div>
    </HanySection>
  );
}
