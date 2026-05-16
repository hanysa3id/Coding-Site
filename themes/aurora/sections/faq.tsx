import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { Plus } from "lucide-react";
import type { LandingFaqItem } from "@/lib/validators/settings";

type Faq = {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
};

const DEFAULT_FAQS: Faq[] = [
  {
    qAr: "كم مدة تنفيذ المشروع عادةً؟",
    qEn: "How long does a typical project take?",
    aAr: "تختلف المدة حسب الحجم: موقع تعريفي 2-3 أسابيع، تطبيق ويب 4-8 أسابيع، تطبيق جوال 6-12 أسبوع. نحدد جدولاً واضحاً في المحادثة الأولى.",
    aEn: "It depends on scope: a brochure site 2-3 weeks, a web app 4-8 weeks, a mobile app 6-12 weeks. We agree on a clear timeline in the first call.",
  },
  {
    qAr: "هل أحصل على ملكية كاملة للكود؟",
    qEn: "Do I get full ownership of the code?",
    aAr: "نعم، 100%. نسلّمك مستودع كود نظيف، حسابات النشر، وكل التوثيق الفني. لا اعتماد على فريقنا إن لم ترغب.",
    aEn: "Yes, 100%. You get a clean code repo, deployment accounts, and all technical docs. No lock-in to our team unless you want it.",
  },
  {
    qAr: "هل تدعمون بعد التسليم؟",
    qEn: "Do you support the project after launch?",
    aAr: "كل باقة تشمل فترة دعم مجانية (30-60 يوم). بعدها يمكنك الاشتراك بعقد صيانة شهري — تحديثات أمنية، نسخ احتياطي، وإصلاحات صغيرة.",
    aEn: "Every package includes free post-launch support (30-60 days). After that you can subscribe to a monthly maintenance contract — security updates, backups, and small fixes.",
  },
  {
    qAr: "هل أستطيع البدء بمشروع صغير ثم التوسع؟",
    qEn: "Can I start small and scale up?",
    aAr: "بالتأكيد — معظم عملائنا يبدأون بـ MVP خلال 6 أسابيع، ثم نضيف ميزات بناءً على تحليل سلوك المستخدمين.",
    aEn: "Absolutely — most clients start with a 6-week MVP, then we add features driven by real usage data.",
  },
  {
    qAr: "كيف نتواصل أثناء التنفيذ؟",
    qEn: "How do we communicate during the build?",
    aAr: "اجتماع أسبوعي ثابت (Zoom/Meet) + قناة Slack أو WhatsApp للأسئلة اليومية + لوحة Trello/Linear شفافة للتقدم.",
    aEn: "A weekly call (Zoom/Meet) + Slack or WhatsApp for daily questions + a transparent Trello/Linear board for progress.",
  },
  {
    qAr: "ماذا لو لم أكن راضياً؟",
    qEn: "What if I am not happy with the work?",
    aAr: "نعمل بمراحل قابلة للمراجعة كل أسبوع. يمكنك إيقاف المشروع في أي مرحلة وأخذ ما أُنجز حتى تلك النقطة بدون التزام مالي إضافي.",
    aEn: "We work in weekly reviewable milestones. You can stop the project at any milestone and keep what was delivered — no further commitment.",
  },
];

export function AuroraFaq({
  locale,
  faqs = [],
}: {
  locale: string;
  faqs?: LandingFaqItem[];
}) {
  const isAr = locale === "ar";
  const items: Faq[] =
    faqs.length > 0
      ? faqs.map((f) => ({ qAr: f.q_ar, qEn: f.q_en, aAr: f.a_ar, aEn: f.a_en }))
      : DEFAULT_FAQS;

  return (
    <Section>
      <SectionHeading
        align="center"
        kicker={isAr ? "أسئلة شائعة" : "Frequently asked"}
        title={isAr ? "كل ما تريد معرفته قبل البدء" : "Everything you want to know first"}
      />

      <div className="mt-12 max-w-3xl mx-auto space-y-3">
        {items.map((f, i) => (
          <details
            key={i}
            className="aurora-glass rounded-2xl group open:shadow-lg transition-shadow"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:p-6 text-start">
              <span className="text-base md:text-lg font-medium text-white">
                {isAr ? f.qAr : f.qEn}
              </span>
              <span className="grid place-items-center h-8 w-8 rounded-full border border-white/15 text-white/70 group-open:rotate-45 transition-transform shrink-0">
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <div className="px-5 md:px-6 pb-5 md:pb-6">
              <p className="text-sm md:text-base text-white/65 leading-relaxed">
                {isAr ? f.aAr : f.aEn}
              </p>
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
