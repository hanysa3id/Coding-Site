"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { ComboSection, ComboHeading } from "../ui/section";
import type { LandingSettings } from "@/lib/validators/settings";

const DEFAULTS = [
  {
    ar: "كم يستغرق المشروع عادةً؟",
    en: "How long does a typical project take?",
    aAr: "الموقع التعريفي: 2-3 أسابيع. التطبيق الكامل: 6-12 أسبوع حسب التعقيد.",
    aEn: "Brochure site: 2-3 weeks. Full app: 6-12 weeks depending on scope.",
  },
  {
    ar: "هل تقدمون دعماً بعد الإطلاق؟",
    en: "Do you offer post-launch support?",
    aAr: "نعم — كل الباقات تشمل فترة دعم مجانية، ويمكنك التمديد بعقد شهري أو سنوي.",
    aEn: "Yes — every plan includes a free support period, extendable monthly or yearly.",
  },
  {
    ar: "هل أملك الكود والتصاميم؟",
    en: "Do I own the code and designs?",
    aAr: "بالكامل. تستلم مستودع كود نظيف، ملفات تصميم مفتوحة، وحقوق كاملة.",
    aEn: "Completely. You receive a clean code repo, open design files, and full IP rights.",
  },
  {
    ar: "هل تعملون مع شركات خارج بلدكم؟",
    en: "Do you work with international clients?",
    aAr: "نعم — نخدم عملاء في 12 دولة، نتواصل بالعربية والإنجليزية.",
    aEn: "Yes — we serve clients in 12 countries, fluent in Arabic and English.",
  },
  {
    ar: "كيف يتم احتساب التسعير؟",
    en: "How is pricing determined?",
    aAr: "تسعير ثابت بعد محادثة استكشاف مجانية وتقييم النطاق — لا مفاجآت.",
    aEn: "Fixed pricing after a free scoping call and scope review — no surprises.",
  },
  {
    ar: "هل تستخدمون أدوات الذكاء الاصطناعي؟",
    en: "Do you use AI tools?",
    aAr: "نوظفها لتسريع الإنتاج، لكن كل قرار تصميم وكود يمر بمراجعة بشرية.",
    aEn: "We use them to accelerate output, but every design/code decision gets human review.",
  },
];

export function ComboFaq({
  locale,
  faqs,
}: {
  locale: string;
  faqs: NonNullable<LandingSettings["faqs"]>;
}) {
  const isAr = locale === "ar";
  const items =
    faqs.length > 0
      ? faqs.map((f) => ({
          q: isAr ? f.q_ar : f.q_en,
          a: isAr ? f.a_ar : f.a_en,
        }))
      : DEFAULTS.map((d) => ({ q: isAr ? d.ar : d.en, a: isAr ? d.aAr : d.aEn }));
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ComboSection size="lg" id="faq">
      <ComboHeading
        align="center"
        eyebrow={isAr ? "إجابات سريعة" : "Quick answers"}
        title={
          <>
            {isAr ? "أسئلة " : "Things people "}
            <span className="combo-grad-text">
              {isAr ? "نسمعها كثيراً." : "always ask."}
            </span>
          </>
        }
      />

      <div className="max-w-3xl mx-auto mt-14 space-y-3">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={`combo-card combo-fade-up ${
                isOpen ? "border-violet-400/40" : ""
              }`}
              style={{ ["--combo-delay" as string]: `${i * 50}ms` }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-4 p-5 text-start"
                aria-expanded={isOpen}
              >
                <span className="combo-mono text-[11px] text-violet-300 w-8 shrink-0">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-semibold text-white text-base md:text-lg">
                  {it.q}
                </span>
                <span className="grid place-items-center h-9 w-9 rounded-full border border-white/20 shrink-0 text-white">
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 ps-[3.6rem] text-white/75 leading-relaxed">
                    {it.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ComboSection>
  );
}
