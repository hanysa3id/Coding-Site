"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { LandingFaqItem, LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

export function ProFaq({
  locale,
  customFaqs,
  landing,
}: {
  locale: string;
  customFaqs: LandingFaqItem[];
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  const [activeId, setActiveId] = useState<number | null>(null);

  const content = resolveSectionContent(landing, "faq", locale, {
    title_ar: "لديك أسئلة؟ نحن نوفر لك الإجابات",
    title_en: "Everything You Need to Get Started",
    subtitle_ar: "الأسئلة الشائعة",
    subtitle_en: "Common Inquiries",
    description_ar: "جمعنا لك أهم الأسئلة الشائعة حول منهجية عملنا، حقوق الكود، الاستضافات السحابية وطرق الدفع.",
    description_en: "Clear answers to resolve details regarding licensing, server maintenance, scheduling, and billing.",
  });

  const defaultFaqs = [
    {
      question_ar: "ما هي الفترات الزمنية المتوقعة لتسليم المشاريع؟",
      question_en: "What are the average delivery times?",
      answer_ar: "تتراوح فترات التسليم حسب حجم المتطلبات؛ صفحات الهبوط البسيطة تحتاج 7-14 يوماً، بينما الأنظمة والمنصات المعقدة قد تحتاج 4-8 أسابيع عمل.",
      answer_en: "Standard landing pages take 7-14 days. Custom software applications and complex web systems require 4-8 weeks depending on specifications.",
    },
    {
      question_ar: "هل تقدمون خدمات الدعم الفني والصيانة بعد الإطلاق؟",
      question_en: "Do you offer post-launch maintenance & support?",
      answer_ar: "نعم، نقدم فترة ضمان وصيانة مجانية تبدأ من شهر إلى 3 أشهر حسب الباقة المختارة، مع إمكانية توقيع عقود صيانة سنوية مخصصة.",
      answer_en: "Yes, every build includes 30 to 90 days of free bug-fixing support. We also provide yearly maintenance contracts.",
    },
    {
      question_ar: "هل أحصل على ملكية الكود البرمجي للموقع بالكامل؟",
      question_en: "Do I get full ownership of the source code?",
      answer_ar: "بالتأكيد، بمجرد الانتهاء من العمل وتسوية المستحقات، تنتقل ملكية الكود البرمجي وملفات المشروع بالكامل إليك مع توفير كافة الصلاحيات.",
      answer_en: "Absolutely. Upon completion and final settlement, all intellectual property rights and repository access are transferred to your team.",
    },
    {
      question_ar: "كيف تضمنون أمان وحماية موقعي وبيانات عملائي؟",
      question_en: "How do you ensure data security and compliance?",
      answer_ar: "نتبع أعلى بروتوكولات الأمان العالمية مثل تشفير البيانات، فحوصات الاختراق الدورية، حماية DDoS، واستخدام منصات استضافة مؤمنة للغاية.",
      answer_en: "We deploy standard data encryption, conduct regular security scanning, configure server firewalls, and use top-tier cloud CDNs.",
    },
    {
      question_ar: "هل تدعمون ربط بوابات الدفع المحلية والعالمية؟",
      question_en: "Do you integrate local and global payment gateways?",
      answer_ar: "نعم، ندعم تكامل جميع بوابات الدفع مثل فيزا، ماستركارد، مدى، فوري، سترايب، باي بال، وغيرها لتوفير تجربة تسوق سهلة لعملائك.",
      answer_en: "Yes, we integrate with Stripe, PayPal, Authorize.net, and local regional payment processors to enable seamless card checkout pipelines.",
    },
  ];

  const displayFaqs = customFaqs.length > 0 
    ? customFaqs.map(f => ({
        question_ar: f.q_ar,
        question_en: f.q_en,
        answer_ar: f.a_ar,
        answer_en: f.a_en
      }))
    : defaultFaqs;

  const toggle = (idx: number) => {
    setActiveId(prev => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="relative py-20 overflow-hidden">
      <div className="container mx-auto max-w-4xl px-6 relative">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-xs font-bold tracking-widest text-[color:var(--pro-primary)] uppercase">
            {content.subtitle}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {content.title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* FAQ Accordion list */}
        <div className="space-y-4">
          {displayFaqs.map((faq, i) => {
            const isOpen = activeId === i;
            const q = isAr ? faq.question_ar : faq.question_en;
            const a = isAr ? faq.answer_ar : faq.answer_en;

            return (
              <div
                key={i}
                className="pro-card overflow-hidden bg-slate-950/40 hover:border-white/10 text-start"
              >
                <button
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="pro-faq-trigger flex items-center justify-between w-full p-6 text-start font-bold text-white text-base gap-4"
                >
                  <span>{q}</span>
                  <span className="shrink-0 h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                    <Plus className={`h-4 w-4 pro-faq-icon ${isOpen ? "rotate-45 text-[color:var(--pro-primary)]" : ""}`} />
                  </span>
                </button>

                {/* Animated Answer panel */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 border-t border-white/5 text-xs text-slate-400 leading-relaxed">
                      {a}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
