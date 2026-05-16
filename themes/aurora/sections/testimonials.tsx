import { Section } from "../ui/section";
import { SectionHeading } from "../ui/section-heading";
import { GlassCard } from "../ui/glass-card";
import { Mono } from "../ui/typography";
import { Quote } from "lucide-react";

// Three quoted testimonials. Author photos use deterministic gradient
// initials so the section never depends on stock imagery to look good.
const QUOTES = [
  {
    ar: "تعاملنا مع فرق كثيرة، لكن جودة التسليم والاهتمام بالتفاصيل هنا في مستوى آخر تماماً.",
    en: "We have worked with many teams, but the delivery quality and attention to detail here is in another league.",
    nameAr: "أحمد المنصوري",
    nameEn: "Ahmed Al-Mansouri",
    roleAr: "مدير منتج، نورث ويند",
    roleEn: "Product Manager, Northwind",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    ar: "مشروع متجرنا الإلكتروني انتهى في 6 أسابيع. مبيعاتنا تضاعفت في أول شهر بعد الإطلاق.",
    en: "Our e-commerce build finished in 6 weeks. Sales doubled in our first month after launch.",
    nameAr: "سارة الخطيب",
    nameEn: "Sarah Al-Khatib",
    roleAr: "مؤسس، أتلاس ستور",
    roleEn: "Founder, Atlas Store",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    ar: "فريق محترف ومنظم. التواصل اليومي والشفافية في التقدم جعلتنا نشعر أن المشروع لنا حقاً.",
    en: "A professional, well-organized team. Daily communication and progress transparency made the project feel truly ours.",
    nameAr: "عمر الراشد",
    nameEn: "Omar Al-Rashed",
    roleAr: "الرئيس التنفيذي، فيرتيكس",
    roleEn: "CEO, Vertex",
    gradient: "from-cyan-500 to-violet-500",
  },
];

export function AuroraTestimonials({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <Section>
      <SectionHeading
        kicker={isAr ? "ماذا يقول العملاء" : "What clients say"}
        title={isAr ? "نجاح عملائنا هو مقياسنا الوحيد" : "Our only metric is our clients success"}
        description={
          isAr
            ? "كل مشروع نسلّمه هو علاقة طويلة الأمد — نقيس أداءنا بنمو عملائنا، لا بعدد العقود."
            : "Every project we deliver is a long-term relationship — we measure ourselves by client growth, not contract count."
        }
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {QUOTES.map((q, i) => {
          const name = isAr ? q.nameAr : q.nameEn;
          const role = isAr ? q.roleAr : q.roleEn;
          const initials = name
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("");
          return (
            <GlassCard key={i} className="p-6 space-y-5">
              <Quote className="h-6 w-6 text-white/30" aria-hidden />
              <p className="text-base md:text-lg text-white/85 leading-relaxed">
                {isAr ? q.ar : q.en}
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white bg-gradient-to-br ${q.gradient}`}
                  aria-hidden
                >
                  {initials}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-white">{name}</p>
                  <Mono>{role}</Mono>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </Section>
  );
}
