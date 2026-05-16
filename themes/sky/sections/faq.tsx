import { SkySection, SkySectionHeading } from "../ui/section";
import { Plus, HelpCircle } from "lucide-react";
import type { LandingFaqItem } from "@/lib/validators/settings";

const DEFAULT_FAQS = [
  {
    qAr: "كم تكلفة المشروع؟",
    qEn: "How much does a project cost?",
    aAr: "التكلفة تختلف حسب نطاق المشروع. موقع تعريفي: 8,000-15,000 ج.م. تطبيق جوال: 25,000-150,000. نقدم عرض سعر مفصّلاً بعد محادثة استكشاف مجانية.",
    aEn: "Price depends on scope. Brochure site: $300-700. Mobile app: $1,000-7,500. We provide a detailed quote after a free scoping call.",
  },
  {
    qAr: "كم تستغرق المدة لتنفيذ المشروع؟",
    qEn: "How long does it take?",
    aAr: "موقع تعريفي: 2-3 أسابيع. متجر إلكتروني: 4-6 أسابيع. تطبيق جوال: 6-12 أسبوع. نحدد جدولاً واضحاً بعد فهم متطلباتك بالتفصيل.",
    aEn: "Brochure site: 2-3 weeks. E-commerce: 4-6 weeks. Mobile app: 6-12 weeks. We set a clear timeline after a thorough requirements review.",
  },
  {
    qAr: "هل أحصل على ملكية كاملة للكود؟",
    qEn: "Do I get full code ownership?",
    aAr: "نعم 100%. تحصل على repository نظيف، حسابات النشر، وكل التوثيق الفني. لا اعتماد علينا إلا إذا أردت.",
    aEn: "Yes, 100%. You get a clean repo, deployment accounts, and all technical docs. No lock-in unless you want one.",
  },
  {
    qAr: "هل تقدمون دعم بعد التسليم؟",
    qEn: "Is there post-launch support?",
    aAr: "كل مشروع يشمل 30-60 يوم دعم مجاني بعد الإطلاق. بعدها يمكنك الاشتراك في عقد صيانة شهري.",
    aEn: "Every project includes 30-60 days of free support post-launch. After that, an optional monthly maintenance contract.",
  },
  {
    qAr: "ما التقنيات التي تستخدمونها؟",
    qEn: "What tech stack do you use?",
    aAr: "Next.js + React للواجهة، Node.js + PostgreSQL للخلفية، Supabase للـ Auth والـ DB، Vercel/AWS للنشر. نختار التقنية المناسبة لكل مشروع.",
    aEn: "Next.js + React on frontend, Node.js + PostgreSQL on backend, Supabase for auth/DB, Vercel/AWS for deployment. We pick what fits each project.",
  },
  {
    qAr: "كيف نتواصل أثناء التنفيذ؟",
    qEn: "How do we communicate?",
    aAr: "اجتماع أسبوعي ثابت + قناة Slack/WhatsApp للأسئلة اليومية + لوحة Trello شفافة للتقدم.",
    aEn: "Weekly call + Slack/WhatsApp for daily questions + a transparent Trello board for progress.",
  },
];

export function SkyFaq({
  locale,
  faqs = [],
}: {
  locale: string;
  faqs?: LandingFaqItem[];
}) {
  const isAr = locale === "ar";
  // Normalize admin-curated FAQs to the same shape as defaults so the render
  // loop below treats them identically.
  const items =
    faqs.length > 0
      ? faqs.map((f) => ({ qAr: f.q_ar, qEn: f.q_en, aAr: f.a_ar, aEn: f.a_en }))
      : DEFAULT_FAQS;

  return (
    <SkySection size="lg">
      <SkySectionHeading
        kicker={isAr ? "أسئلة شائعة" : "FAQ"}
        title={
          <>
            {isAr ? "كل ما تريد معرفته " : "Everything you want to know "}
            <span className="sky-grad-text">{isAr ? "قبل البدء" : "before starting"}</span>
          </>
        }
      />

      <div className="max-w-3xl mx-auto mt-12 space-y-3">
        {items.map((f, i) => (
          <details
            key={i}
            className="sky-card sky-fade-up group"
            style={{ "--sky-delay": `${i * 60}ms` } as React.CSSProperties}
          >
            <summary className="flex items-center gap-4 cursor-pointer list-none p-5 md:p-6">
              <span className="grid place-items-center h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-700">
                <HelpCircle className="h-4 w-4" />
              </span>
              <span className="flex-1 text-base md:text-lg font-semibold text-slate-900">
                {isAr ? f.qAr : f.qEn}
              </span>
              <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full border border-slate-200 text-slate-500 group-open:rotate-45 group-open:bg-sky-50 group-open:text-sky-600 transition-all">
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <div className="px-5 md:px-6 pb-5 md:pb-6 ps-[4.75rem]">
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                {isAr ? f.aAr : f.aEn}
              </p>
            </div>
          </details>
        ))}
      </div>
    </SkySection>
  );
}
