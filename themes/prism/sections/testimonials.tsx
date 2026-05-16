import { Star } from "lucide-react";
import { PrismSection, PrismHeading } from "../ui/section";

export type PrismReviewItem = {
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
    accent: "is-magenta",
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
    accent: "is-cyan",
  },
  {
    rating: 5,
    nameAr: "كريم نصار",
    nameEn: "Kareem Nassar",
    titleAr: "CTO، Helix Labs",
    titleEn: "CTO, Helix Labs",
    quoteAr:
      "كود نظيف وموثّق. فريقنا الداخلي قدر يكمل التطوير من غير أي مشاكل.",
    quoteEn:
      "Clean, well-documented code. Our internal team picked it up with zero friction.",
    accent: "is-amber",
  },
];

export function PrismTestimonials({
  locale,
  reviews,
}: {
  locale: string;
  reviews: PrismReviewItem[];
}) {
  const isAr = locale === "ar";
  const items =
    reviews.length > 0
      ? reviews.slice(0, 6).map((r, i) => ({
          rating: r.rating,
          name: r.customer_name || (isAr ? "عميل" : "Client"),
          title: r.service_name || "",
          quote: r.comment || "",
          accent:
            ["is-magenta", "is-cyan", "is-amber", "is-violet", "", "is-magenta"][i] || "",
        }))
      : FALLBACK.map((f) => ({
          rating: f.rating,
          name: isAr ? f.nameAr : f.nameEn,
          title: isAr ? f.titleAr : f.titleEn,
          quote: isAr ? f.quoteAr : f.quoteEn,
          accent: f.accent,
        }));

  return (
    <PrismSection size="lg" id="testimonials">
      <PrismHeading
        align="center"
        sticker={<span className="prism-sticker is-violet">{isAr ? "آراء العملاء" : "Reviews"}</span>}
        eyebrow={isAr ? "ما يقولونه" : "What they say"}
        title={
          <>
            {isAr ? "آراء صريحة " : "Honest words "}
            <span className="prism-grad-text-2">
              {isAr ? "من عملائنا." : "from our clients."}
            </span>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mt-14">
        {items.map((r, i) => (
          <figure
            key={i}
            className="prism-card prism-spot prism-fade-up p-7"
            style={{ ["--prism-delay" as string]: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`prism-sticker ${r.accent || ""}`}>
                {isAr ? "تقييم" : "Review"}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-300 text-amber-300" />
                ))}
              </div>
            </div>
            <blockquote className="text-base md:text-lg text-white/90 leading-relaxed">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-3">
              <span className="grid place-items-center h-11 w-11 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-white font-black">
                {r.name.slice(0, 1)}
              </span>
              <div>
                <p className="font-bold text-white">{r.name}</p>
                {r.title && (
                  <p className="prism-mono text-[11px] text-white/55">{r.title}</p>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </PrismSection>
  );
}
