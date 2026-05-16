import { SkySection, SkySectionHeading } from "../ui/section";
import { Quote, Star } from "lucide-react";

export type SkyReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  service_name: string | null;
  tint?: string;
};

const FALLBACK: SkyReviewItem[] = [
  {
    id: "f1",
    rating: 5,
    comment:
      "تعاملت مع فرق كثيرة، لكن جودة التسليم والاهتمام بالتفاصيل هنا في مستوى آخر. سرعة الاستجابة والمتابعة بعد الإطلاق كانت ممتازة جداً.",
    customer_name: "أحمد المنصوري",
    service_name: "تطوير موقع شركة",
    tint: "from-sky-400 to-indigo-500",
  },
  {
    id: "f2",
    rating: 5,
    comment:
      "Best engagement this year. The team understood our needs from day one. Sales doubled in the first month after launch.",
    customer_name: "Sarah Al-Khatib",
    service_name: "E-commerce build",
    tint: "from-pink-400 to-rose-500",
  },
  {
    id: "f3",
    rating: 5,
    comment:
      "فريق محترف ومنظم. اجتماعات أسبوعية ثابتة، شفافية كاملة في التقدم، وتسليم في الموعد المتفق عليه بالضبط.",
    customer_name: "عمر الراشد",
    service_name: "تطبيق جوال",
    tint: "from-cyan-400 to-sky-500",
  },
];

// Renders 3 testimonials. If real reviews data is provided, uses it
// (filtered to 4-5 stars with comments). Otherwise falls back to curated
// content so the section never looks empty.
export function SkyTestimonials({
  locale,
  reviews,
}: {
  locale: string;
  reviews: SkyReviewItem[];
}) {
  const isAr = locale === "ar";
  const usable = reviews.filter((r) => r.rating >= 4 && (r.comment ?? "").trim().length > 20);
  const items = usable.length >= 3 ? usable.slice(0, 3) : FALLBACK;

  return (
    <SkySection size="lg">
      <SkySectionHeading
        kicker={isAr ? "آراء العملاء" : "What clients say"}
        title={
          <>
            {isAr ? "نجاح عملائنا هو " : "Their success is "}
            <span className="sky-grad-text">{isAr ? "مقياسنا الوحيد" : "our only metric"}</span>
          </>
        }
        description={
          isAr
            ? "كل مشروع نسلّمه هو علاقة طويلة الأمد. هذه شهادات من فرق نعمل معها."
            : "Every project is a long-term relationship. Here is what the teams we work with say."
        }
      />

      <div className="grid gap-5 md:grid-cols-3 mt-14">
        {items.map((r, i) => {
          const name = r.customer_name ?? (isAr ? "عميل" : "Customer");
          const initials = name
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("");
          const tint = r.tint ?? ["from-sky-400 to-indigo-500", "from-pink-400 to-rose-500", "from-cyan-400 to-sky-500"][i % 3];
          return (
            <article
              key={r.id}
              className="sky-card sky-fade-up p-7 space-y-5"
              style={{ "--sky-delay": `${i * 100}ms` } as React.CSSProperties}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${
                        j < r.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-sky-200" />
              </div>
              <p className="text-base text-slate-700 leading-relaxed">
                &ldquo;{r.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <span
                  className={`grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br ${tint} text-white font-semibold text-sm`}
                >
                  {initials.toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{name}</p>
                  {r.service_name && (
                    <p className="text-xs text-slate-500 sky-mono">{r.service_name}</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </SkySection>
  );
}
