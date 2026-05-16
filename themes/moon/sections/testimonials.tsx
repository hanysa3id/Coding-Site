import { MoonSection, MoonSectionHeading } from "../ui/section";
import { Quote, Star } from "lucide-react";

export type MoonReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  service_name: string | null;
  tint?: string;
};

const FALLBACK: MoonReviewItem[] = [
  {
    id: "f1",
    rating: 5,
    comment:
      "تعاملت مع فرق كثيرة، لكن جودة التسليم والاهتمام بالتفاصيل هنا في مستوى آخر. سرعة الاستجابة والمتابعة بعد الإطلاق ممتازة.",
    customer_name: "أحمد المنصوري",
    service_name: "تطوير موقع شركة",
    tint: "from-sky-500 to-indigo-500",
  },
  {
    id: "f2",
    rating: 5,
    comment:
      "Best engagement this year. The team understood our needs from day one. Sales doubled in the first month after launch.",
    customer_name: "Sarah Al-Khatib",
    service_name: "E-commerce build",
    tint: "from-indigo-500 to-purple-500",
  },
  {
    id: "f3",
    rating: 5,
    comment:
      "فريق محترف ومنظم. اجتماعات أسبوعية ثابتة، شفافية كاملة في التقدم، وتسليم في الموعد بالضبط.",
    customer_name: "عمر الراشد",
    service_name: "تطبيق جوال",
    tint: "from-teal-500 to-sky-500",
  },
];

export function MoonTestimonials({
  locale,
  reviews,
}: {
  locale: string;
  reviews: MoonReviewItem[];
}) {
  const isAr = locale === "ar";
  const usable = reviews.filter((r) => r.rating >= 4 && (r.comment ?? "").trim().length > 20);
  const items = usable.length >= 3 ? usable.slice(0, 3) : FALLBACK;

  return (
    <MoonSection size="lg">
      <MoonSectionHeading
        kicker={isAr ? "آراء العملاء" : "What clients say"}
        title={
          <>
            {isAr ? "نجاح عملائنا هو " : "Their success is "}
            <span className="moon-grad-text">{isAr ? "مقياسنا الوحيد" : "our only metric"}</span>
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
          const tint = r.tint ?? ["from-sky-500 to-indigo-500", "from-indigo-500 to-purple-500", "from-teal-500 to-sky-500"][i % 3];
          return (
            <article
              key={r.id}
              className="moon-card moon-fade-up p-7 space-y-5"
              style={{ "--moon-delay": `${i * 100}ms` } as React.CSSProperties}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${
                        j < r.rating ? "fill-amber-300 text-amber-300" : "text-white/15"
                      }`}
                    />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-sky-400/30" />
              </div>
              <p className="text-base text-white/80 leading-relaxed">
                &ldquo;{r.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                <span
                  className={`grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br ${tint} text-white font-semibold text-sm`}
                >
                  {initials.toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{name}</p>
                  {r.service_name && (
                    <p className="text-xs text-white/45 moon-mono">{r.service_name}</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </MoonSection>
  );
}
