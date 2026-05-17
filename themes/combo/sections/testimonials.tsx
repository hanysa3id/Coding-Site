import { Star, Quote } from "lucide-react";
import { ComboSection, ComboHeading } from "../ui/section";

export type ComboReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  service_name: string | null;
};

const FALLBACK = [
  {
    rating: 5,
    nameAr: "أحمد المنصوري",
    nameEn: "Ahmed Al-Mansouri",
    titleAr: "مدير منتج، نورث ويند",
    titleEn: "Product Manager, Northwind",
    quoteAr:
      "أفضل تعاقد قمنا به هذا العام. الفريق متفهم، النتائج فاقت التوقعات، والدعم بعد الإطلاق ممتاز.",
    quoteEn:
      "The best engagement we did this year. They understood us, exceeded expectations, post-launch support is excellent.",
  },
  {
    rating: 5,
    nameAr: "ليلى الحمراني",
    nameEn: "Layla Al-Hamrani",
    titleAr: "مؤسس، Verdant",
    titleEn: "Founder, Verdant",
    quoteAr:
      "تصميم فاتن وسرعة في التنفيذ — موقعنا قفز في تصنيف Google خلال شهر فقط.",
    quoteEn:
      "Stunning design and lightning fast execution — our site jumped in Google rankings within a month.",
  },
  {
    rating: 5,
    nameAr: "كريم نصار",
    nameEn: "Kareem Nassar",
    titleAr: "CTO، Helix Labs",
    titleEn: "CTO, Helix Labs",
    quoteAr: "كود نظيف وموثّق. فريقنا الداخلي قدر يكمل التطوير من غير أي مشاكل.",
    quoteEn:
      "Clean, well-documented code. Our internal team picked it up with zero friction.",
  },
];

export function ComboTestimonials({
  locale,
  reviews,
}: {
  locale: string;
  reviews: ComboReviewItem[];
}) {
  const isAr = locale === "ar";
  const items =
    reviews.length > 0
      ? reviews.slice(0, 6).map((r) => ({
          rating: r.rating,
          name: r.customer_name || (isAr ? "عميل" : "Client"),
          title: r.service_name || "",
          quote: r.comment || "",
        }))
      : FALLBACK.map((f) => ({
          rating: f.rating,
          name: isAr ? f.nameAr : f.nameEn,
          title: isAr ? f.titleAr : f.titleEn,
          quote: isAr ? f.quoteAr : f.quoteEn,
        }));

  return (
    <ComboSection size="lg" id="testimonials">
      <ComboHeading
        align="center"
        eyebrow={isAr ? "ما يقولونه" : "What they say"}
        title={
          <>
            {isAr ? "آراء صريحة " : "Honest words "}
            <span className="combo-grad-text-2">
              {isAr ? "من عملائنا." : "from our clients."}
            </span>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mt-14">
        {items.map((r, i) => (
          <figure
            key={i}
            className="combo-card combo-fade-up p-7 relative"
            style={{ ["--combo-delay" as string]: `${i * 80}ms` }}
          >
            <Quote className="absolute top-5 end-5 h-8 w-8 text-violet-400/25" aria-hidden />
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: r.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <blockquote className="text-base md:text-lg text-white/90 leading-relaxed">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-3">
              <span
                className="grid place-items-center h-11 w-11 rounded-full text-white font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)",
                }}
              >
                {r.name.slice(0, 1)}
              </span>
              <div>
                <p className="font-semibold text-white">{r.name}</p>
                {r.title && (
                  <p className="combo-mono text-[11px] text-white/55">{r.title}</p>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </ComboSection>
  );
}
