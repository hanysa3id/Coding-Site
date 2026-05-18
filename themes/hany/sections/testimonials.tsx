import { Star, Quote } from "lucide-react";
import { HanySection, HanySectionHeading } from "../ui/section";

export type HanyReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  service_name: string | null;
};

export function HanyTestimonials({
  locale,
  reviews,
}: {
  locale: string;
  reviews: HanyReviewItem[];
}) {
  const isAr = locale === "ar";
  const items: HanyReviewItem[] =
    reviews.length > 0
      ? reviews
      : [
          {
            id: "f1",
            rating: 5,
            comment: isAr
              ? "فريق محترف جداً، التزموا بالمواعيد وقدّموا أكثر مما توقّعنا."
              : "Truly professional team. Met every deadline and delivered beyond expectations.",
            customer_name: isAr ? "أحمد م." : "Ahmad M.",
            service_name: isAr ? "تطوير ويب" : "Web development",
          },
          {
            id: "f2",
            rating: 5,
            comment: isAr
              ? "التواصل ممتاز والتسليم سريع. أنصح بهم بشدة لأي مشروع رقمي."
              : "Great communication and fast delivery. Highly recommend for any digital project.",
            customer_name: isAr ? "سارة ع." : "Sarah A.",
            service_name: isAr ? "تصميم هوية" : "Brand design",
          },
          {
            id: "f3",
            rating: 5,
            comment: isAr
              ? "الدعم بعد الإطلاق هو ما صنع الفارق — شعرنا أنهم جزء من فريقنا."
              : "Post-launch support made the difference — they felt like part of our team.",
            customer_name: isAr ? "محمد ك." : "Mohamed K.",
            service_name: isAr ? "تسويق رقمي" : "Digital marketing",
          },
        ];

  return (
    <HanySection id="testimonials">
      <HanySectionHeading
        kicker={isAr ? "آراء العملاء" : "Testimonials"}
        title={isAr ? "ماذا يقول عنّا عملاؤنا" : "What our clients say"}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((r, i) => (
          <figure
            key={r.id}
            className="hany-card p-6 relative hany-reveal"
            style={{ ["--delay" as string]: `${i * 70}ms` }}
          >
            <Quote className="absolute top-4 end-4 h-6 w-6 text-[color:var(--hany-brand)]/15" />
            <div className="flex items-center gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star
                  key={k}
                  className={
                    k < r.rating
                      ? "h-4 w-4 fill-yellow-400 text-yellow-400"
                      : "h-4 w-4 text-slate-200"
                  }
                />
              ))}
            </div>
            <blockquote className="text-sm text-[color:var(--hany-fg)] leading-relaxed mb-5">
              "{r.comment}"
            </blockquote>
            <figcaption className="flex items-center gap-3 pt-4 border-t border-[color:var(--hany-border-soft)]">
              <span className="grid place-items-center h-10 w-10 rounded-full bg-[var(--hany-grad)] text-white font-bold text-sm">
                {(r.customer_name ?? "?").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {r.customer_name ?? (isAr ? "عميل" : "Client")}
                </div>
                {r.service_name && (
                  <div className="text-xs text-[color:var(--hany-fg-subtle)] truncate">
                    {r.service_name}
                  </div>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </HanySection>
  );
}
