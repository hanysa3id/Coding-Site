import { MoonSection, MoonSectionHeading } from "../ui/section";
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
    aAr: "موقع تعريفي: 2-3 أسابيع. متجر إلكتروني: 4-6 أسابيع. تطبيق جوال: 6-12 أسبوع.",
    aEn: "Brochure site: 2-3 weeks. E-commerce: 4-6 weeks. Mobile app: 6-12 weeks.",
  },
  {
    qAr: "هل أحصل على ملكية كاملة للكود؟",
    qEn: "Do I get full code ownership?",
    aAr: "نعم 100%. تحصل على repository نظيف، حسابات النشر، وكل التوثيق الفني.",
    aEn: "Yes, 100%. You get a clean repo, deployment accounts, and all technical docs.",
  },
  {
    qAr: "هل تقدمون دعم بعد التسليم؟",
    qEn: "Is there post-launch support?",
    aAr: "كل مشروع يشمل 30-60 يوم دعم مجاني. بعدها يمكنك الاشتراك في عقد صيانة شهري.",
    aEn: "Every project includes 30-60 days of free support. After that, optional monthly maintenance.",
  },
  {
    qAr: "ما التقنيات التي تستخدمونها؟",
    qEn: "What tech stack do you use?",
    aAr: "Next.js + React, Node.js + PostgreSQL, Supabase، Vercel/AWS. نختار التقنية المناسبة لكل مشروع.",
    aEn: "Next.js + React, Node.js + PostgreSQL, Supabase, Vercel/AWS. We pick what fits each project.",
  },
  {
    qAr: "كيف نتواصل أثناء التنفيذ؟",
    qEn: "How do we communicate?",
    aAr: "اجتماع أسبوعي + قناة Slack/WhatsApp + لوحة Trello شفافة للتقدم.",
    aEn: "Weekly call + Slack/WhatsApp + transparent Trello board for progress.",
  },
];

export function MoonFaq({
  locale,
  faqs = [],
}: {
  locale: string;
  faqs?: LandingFaqItem[];
}) {
  const isAr = locale === "ar";
  const items =
    faqs.length > 0
      ? faqs.map((f) => ({ qAr: f.q_ar, qEn: f.q_en, aAr: f.a_ar, aEn: f.a_en }))
      : DEFAULT_FAQS;

  return (
    <MoonSection size="lg">
      <MoonSectionHeading
        kicker={isAr ? "أسئلة شائعة" : "FAQ"}
        title={
          <>
            {isAr ? "كل ما تريد معرفته " : "Everything you want to know "}
            <span className="moon-grad-text">{isAr ? "قبل البدء" : "before starting"}</span>
          </>
        }
      />

      <div className="max-w-3xl mx-auto mt-12 space-y-3">
        {items.map((f, i) => (
          <details
            key={i}
            className="moon-card moon-fade-up group"
            style={{ "--moon-delay": `${i * 60}ms` } as React.CSSProperties}
          >
            <summary className="flex items-center gap-4 cursor-pointer list-none p-5 md:p-6 text-start">
              <span className="grid place-items-center h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-400/20">
                <HelpCircle className="h-4 w-4" />
              </span>
              <span className="flex-1 text-base md:text-lg font-semibold text-white">
                {isAr ? f.qAr : f.qEn}
              </span>
              <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full border border-white/15 text-white/65 group-open:rotate-45 group-open:bg-sky-500/10 group-open:text-sky-300 transition-all">
                <Plus className="h-4 w-4" />
              </span>
            </summary>
            <div className="px-5 md:px-6 pb-5 md:pb-6 ps-[4.75rem]">
              <p className="text-sm md:text-base text-white/65 leading-relaxed">
                {isAr ? f.aAr : f.aEn}
              </p>
            </div>
          </details>
        ))}
      </div>
    </MoonSection>
  );
}
