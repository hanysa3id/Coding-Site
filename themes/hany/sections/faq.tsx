"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LandingFaqItem } from "@/lib/validators/settings";
import { HanySection, HanySectionHeading } from "../ui/section";

export function HanyFaq({
  locale,
  faqs,
}: {
  locale: string;
  faqs: LandingFaqItem[];
}) {
  const isAr = locale === "ar";
  const items: LandingFaqItem[] =
    faqs.length > 0
      ? faqs
      : [
          {
            q_ar: "كم يستغرق المشروع التقليدي لديكم؟",
            q_en: "How long does a typical project take?",
            a_ar: "بين أسبوعين و٨ أسابيع حسب الحجم. نشاركك جدولاً زمنياً واضحاً قبل البدء.",
            a_en: "Between 2 and 8 weeks depending on scope. We share a clear timeline before starting.",
          },
          {
            q_ar: "هل تقدمون دعم بعد الإطلاق؟",
            q_en: "Do you provide post-launch support?",
            a_ar: "نعم، الدعم لمدة شهر مجاناً في كل الباقات، ويمكن تمديده باشتراك شهري.",
            a_en: "Yes, 1 month of free support on every package, with optional monthly retainers.",
          },
          {
            q_ar: "هل أملك كامل الحقوق على الكود والتصميم؟",
            q_en: "Do I fully own the code and design?",
            a_ar: "بالتأكيد. كل ما نسلّمه يصبح ملكاً لك بالكامل بعد إتمام الدفع.",
            a_en: "Absolutely. Everything we deliver becomes 100% yours after final payment.",
          },
          {
            q_ar: "كيف تتعاملون مع التغييرات أثناء المشروع؟",
            q_en: "How do you handle changes mid-project?",
            a_ar: "نخصص جلستين مراجعة مجانيتين في كل مرحلة. التغييرات الكبرى تُسعّر بشفافية.",
            a_en: "Two free review rounds per phase. Larger scope changes are quoted transparently.",
          },
        ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <HanySection id="faq">
      <HanySectionHeading
        kicker={isAr ? "الأسئلة الشائعة" : "FAQ"}
        title={isAr ? "إجابات على ما يدور في ذهنك" : "Answers to what you're wondering"}
      />

      <div className="mt-10 max-w-3xl mx-auto space-y-3">
        {items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="hany-faq-item overflow-hidden"
              data-open={isOpen}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-start px-5 py-4"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-base">
                  {isAr ? f.q_ar : f.q_en}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-[color:var(--hany-brand)] transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm text-[color:var(--hany-fg-muted)] leading-relaxed">
                    {isAr ? f.a_ar : f.a_en}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </HanySection>
  );
}
