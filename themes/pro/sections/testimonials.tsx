"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

export type ProReviewItem = {
  id: string;
  rating: number;
  comment: string;
  customer_name: string | null;
  service_name: string | null;
  avatar_url?: string | null;
};


export function ProTestimonials({
  locale,
  reviews,
  landing,
}: {
  locale: string;
  reviews: ProReviewItem[];
  landing: LandingSettings | null;
}) {
  const isAr = locale === "ar";

  const defaultReviews: ProReviewItem[] = [
    {
      id: "dr-1",
      rating: 5,
      comment: isAr
        ? "تعاملنا مع فريق العمل لبناء تطبيقنا السحابي، وكانت النتيجة ممتازة من حيث الكود النظيف، السرعة الفائقة والأمان العالي. نوصي بهم بشدة."
        : "Excellent engineering! They migrated our backend dashboard architecture into a robust Next.js environment. Speed increased by 3x.",
      customer_name: isAr ? "م. خالد عبد الرحمن" : "Khalid A. (CTO)",
      service_name: isAr ? "برمجة وتطوير الأنظمة" : "Backend Engineering",
    },
    {
      id: "dr-2",
      rating: 5,
      comment: isAr
        ? "حملات التسويق الرقمي وإعلانات السوشيال ميديا ضاعفت مبيعاتنا خلال أشهر قليلة. التقارير الأسبوعية كانت واضحة وشفافة للغاية."
        : "Outstanding marketing campaigns and lead scaling strategy. Our sales targets doubled inside 3 months with transparent feedback dashboards.",
      customer_name: isAr ? "أ. سارة الحربي" : "Sarah H. (Product Lead)",
      service_name: isAr ? "التسويق الرقمي" : "Growth Marketing",
    },
    {
      id: "dr-3",
      rating: 5,
      comment: isAr
        ? "السيرفرات والخدمات السحابية لديهم فائقة الاستقرار والدعم الفني متواجد طوال اليوم لحل أي مشكلة فوراً. استضافة يعتمد عليها بحق."
        : "Their server infrastructure setups are extremely secure. We experienced zero downtime since deploying on their edge CDN network.",
      customer_name: isAr ? "أ. عمر فاروق" : "Omar F. (SaaS Founder)",
      service_name: isAr ? "الاستضافة والبنية التحتية" : "Cloud Hosting Support",
    },
    {
      id: "dr-4",
      rating: 5,
      comment: isAr
        ? "السرعة الفائقة لخدمات الاستضافة ونظام إدارة المحتوى الجديد ضاعفت سرعة التصفح لدينا. فريق هندسي محترف يهتم بأدق تفاصيل الكود النظيف."
        : "The engineering speed of their custom CMS setup is unbelievable. Highly optimized Next.js pages with clean code standards and solid SEO indexing.",
      customer_name: isAr ? "د. أحمد السالم" : "Dr. Ahmad S. (VP of Product)",
      service_name: isAr ? "برمجة وتطوير المواقع" : "Web App Development",
    },
    {
      id: "dr-5",
      rating: 5,
      comment: isAr
        ? "حققنا عائداً استثمارياً ROI يتجاوز 3x بفضل استشارات النمو وإعادة هيكلة الواجهات البرمجية. نعتبرهم شريكاً استراتيجياً حقيقياً لأعمالنا الرقمية."
        : "We achieved a solid 3x ROI increase after restructuring our user funnel design. They are a true strategic partner in product growth and design.",
      customer_name: isAr ? "أ. ليلى القحطاني" : "Lina Q. (Marketing Director)",
      service_name: isAr ? "استشارات نمو وتجربة المستخدم" : "Product Growth & UI/UX",
    },
    {
      id: "dr-6",
      rating: 5,
      comment: isAr
        ? "البنية التحتية السحابية لديهم استثنائية. قمنا بترحيل خوادمنا بالكامل وبلا انقطاع zero downtime وبأعلى معدلات الأمان والحماية."
        : "Exceptional cloud infrastructure! They migrated our microservices with zero downtime, upgrading our overall security and scaling limits.",
      customer_name: isAr ? "أ. يوسف علوان" : "Yousef A. (Infrastructure Lead)",
      service_name: isAr ? "إدارة السيرفرات والبنية السحابية" : "DevOps & Cloud Orchestration",
    },
  ];

  // Merge database reviews + default reviews to ensure always visible
  let displayReviews = reviews.length > 0
    ? [...reviews, ...defaultReviews.slice(3)]
    : defaultReviews;

  // Override with marketing testimonials if they exist
  if (landing?.testimonials && landing.testimonials.length > 0) {
    const marketingReviews = landing.testimonials.map((t) => ({
      id: t.id,
      rating: t.rating,
      comment: isAr ? t.comment_ar : t.comment_en,
      customer_name: isAr ? t.customer_name_ar : t.customer_name_en,
      service_name: (isAr ? t.customer_role_ar : t.customer_role_en) ?? null,
      avatar_url: t.avatar_url,
    }));
    displayReviews = [...marketingReviews, ...defaultReviews.slice(3)];
  }

  const content = resolveSectionContent(landing, "testimonials", locale, {
    title_ar: "ماذا يقول عملاؤنا عن تجربتهم معنا؟",
    title_en: "What Teams Say About Our Delivery",
    subtitle_ar: "آراء شركاء النجاح",
    subtitle_en: "Client Success Stories",
    description_ar: "نعتز بثقة عملائنا ونسعى جاهدين لتقديم أفضل الحلول البرمجية والتسويقية لتوسيع نشاطهم الرقمي.",
    description_en: "We establish long-term engineering and marketing partnerships centered around reliable business growth.",
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const goTo = (idx: number) => {
    setActiveIndex(idx);
    setAnimKey((k) => k + 1);
  };

  const prevSlide = () => goTo(activeIndex === 0 ? displayReviews.length - 1 : activeIndex - 1);
  const nextSlide = () => goTo(activeIndex === displayReviews.length - 1 ? 0 : activeIndex + 1);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [displayReviews.length, isPaused, activeIndex]);

  const currentReview = displayReviews[activeIndex];

  return (
    <section id="testimonials" className="relative py-20 bg-[var(--pro-bg-mute)] overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 relative">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="pro-section-label justify-center">
            {content.subtitle}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight pro-heading-glow">
            {content.title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Fade Carousel */}
        <div
          className="relative w-full max-w-4xl mx-auto px-4 md:px-12 py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Single card with fade-up animation keyed on animKey */}
          <div
            key={`${animKey}-${activeIndex}`}
            className="pro-card pro-glass-panel p-8 md:p-10 flex flex-col justify-between relative group text-start min-h-[300px] pro-testimonial-entering"
          >
            {/* Gradient quote mark */}
            <div className="absolute top-5 end-5 pointer-events-none" aria-hidden>
              <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
                <text x="0" y="26" fontSize="40" fontFamily="Georgia, serif" fill="url(#qg2)">"</text>
                <defs>
                  <linearGradient id="qg2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--pro-primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--pro-secondary)" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="space-y-5">
              {/* Stars with stagger animation */}
              <div className="flex gap-1">
                {Array.from({ length: currentReview.rating }).map((_, starIdx) => (
                  <Star
                    key={`${animKey}-star-${starIdx}`}
                    className="h-4 w-4 fill-amber-400 text-amber-400 pro-star-animated"
                    style={{ animationDelay: `${starIdx * 80}ms` }}
                  />
                ))}
              </div>

              <p className="text-base text-slate-200 leading-relaxed font-medium">
                "{currentReview.comment}"
              </p>
            </div>

            {/* Customer info */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
              {currentReview.avatar_url ? (
                <div className="pro-avatar-ring h-10 w-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <img
                    src={currentReview.avatar_url}
                    alt={currentReview.customer_name || ""}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="pro-avatar-ring h-10 w-10 rounded-full bg-gradient-to-br from-[color:var(--pro-primary)]/20 to-[color:var(--pro-secondary)]/20 flex items-center justify-center font-bold text-sm text-[color:var(--pro-primary)] border border-[color:var(--pro-primary)]/20 select-none shrink-0">
                  {(currentReview.customer_name || "C").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="text-start">
                <div
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: "var(--font-ui, 'Almarai', sans-serif)" }}
                >
                  {currentReview.customer_name || (isAr ? "عميل موثق" : "Verified Client")}
                </div>
                {currentReview.service_name && (
                  <div className="text-[10px] text-[color:var(--pro-primary)]/70 font-semibold tracking-wider uppercase mt-0.5">
                    {currentReview.service_name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Previous Button */}
          <button
            onClick={isAr ? nextSlide : prevSlide}
            className="absolute top-1/2 left-0 -translate-y-1/2 h-10 w-10 rounded-full border border-white/10 bg-slate-950/80 hover:bg-[color:var(--pro-primary)]/10 hover:border-[color:var(--pro-primary)] text-white flex items-center justify-center transition-all z-10 focus:outline-none"
            aria-label="Previous slide"
          >
            {isAr ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>

          {/* Next Button */}
          <button
            onClick={isAr ? prevSlide : nextSlide}
            className="absolute top-1/2 right-0 -translate-y-1/2 h-10 w-10 rounded-full border border-white/10 bg-slate-950/80 hover:bg-[color:var(--pro-primary)]/10 hover:border-[color:var(--pro-primary)] text-white flex items-center justify-center transition-all z-10 focus:outline-none"
            aria-label="Next slide"
          >
            {isAr ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>

          {/* Dots + Progress bar */}
          <div className="flex flex-col items-center gap-3 mt-6">
            <div className="flex justify-center gap-2">
              {displayReviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                    activeIndex === idx ? "w-6 bg-[color:var(--pro-primary)]" : "w-1.5 bg-white/20"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            {/* Thin progress bar */}
            <div className="pro-testimonial-progress w-40">
              <div
                className="pro-testimonial-progress-fill"
                style={{ width: `${((activeIndex + 1) / displayReviews.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
