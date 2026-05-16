"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Rocket,
  TrendingUp,
  Headphones,
  Star,
  Code2,
  Cpu,
} from "lucide-react";
import { SkyButton } from "../ui/sky-button";
import { Typewriter } from "../ui/typewriter";
import { cn } from "@/lib/utils";
import type { LandingSettings } from "@/lib/validators/settings";

type HeroOverride = {
  badge: string | null;
  title: string | null;
  subtitle: string | null;
  primaryLabel: string | null;
  primaryHref: string | null;
  secondaryLabel: string | null;
  secondaryHref: string | null;
};

type Slide = {
  id: string;
  bgClass: string;
  render: (locale: string, override?: HeroOverride) => React.ReactNode;
};

export function HeroSlider({
  locale,
  landing,
}: {
  locale: string;
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  const [index, setIndex] = useState(0);
  // Optional admin overrides — only slide 1 (the lead slide) consumes them.
  const h = landing?.hero;
  const heroOverride = {
    badge: (isAr ? h?.badge_ar : h?.badge_en)?.trim() || null,
    title: (isAr ? h?.title_ar : h?.title_en)?.trim() || null,
    subtitle: (isAr ? h?.subtitle_ar : h?.subtitle_en)?.trim() || null,
    primaryLabel: (isAr ? h?.primary_cta_label_ar : h?.primary_cta_label_en)?.trim() || null,
    primaryHref: h?.primary_cta_href?.trim() || null,
    secondaryLabel: (isAr ? h?.secondary_cta_label_ar : h?.secondary_cta_label_en)?.trim() || null,
    secondaryHref: h?.secondary_cta_href?.trim() || null,
  };

  // Auto-advance every 7 seconds (paused if user prefers reduced motion)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);

  function go(i: number) {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }

  return (
    <section className="relative overflow-hidden pt-8 md:pt-12 pb-20 md:pb-28">
      {/* Slides container */}
      <div className="container">
        <div className="relative h-[34rem] md:h-[36rem] rounded-3xl overflow-hidden border border-white/40 bg-white/30 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.20)] backdrop-blur-sm">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={cn("sky-slide", s.bgClass)}
              data-active={i === index || undefined}
              aria-hidden={i !== index}
            >
              {/* Re-mount the slide content when it becomes active so animations replay.
                  Slide 0 consumes admin hero overrides; others ignore them. */}
              {i === index && s.render(locale, i === 0 ? heroOverride : undefined)}
            </div>
          ))}

          {/* Arrows */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={isAr ? "السابق" : "Previous"}
            className="absolute start-4 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-white/85 border border-white/60 text-slate-700 hover:bg-white shadow-md transition"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={isAr ? "التالي" : "Next"}
            className="absolute end-4 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-white/85 border border-white/60 text-slate-700 hover:bg-white shadow-md transition"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${isAr ? "الشريحة" : "Slide"} ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-8 bg-slate-900" : "w-2 bg-slate-400 hover:bg-slate-600"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4 distinct slide compositions ─────────────────────────────────────────

const SLIDES: Slide[] = [
  // SLIDE 1 — TYPEWRITER + FLOATING CARDS
  {
    id: "slide-1",
    bgClass: "sky-slide-bg sky-slide-bg-1",
    render: (locale, override) => {
      const isAr = locale === "ar";
      const badgeText = override?.badge ?? (isAr ? "ابدأ مشروعك في 24 ساعة" : "Start in 24 hours");
      const subtitle = override?.subtitle ?? (isAr
        ? "فريق متخصص من المطورين والمصممين يحوّل أفكارك إلى منتجات رقمية تعمل بكفاءة وتحب جمهورك."
        : "A specialized team of engineers and designers turning your ideas into delightful, reliable products.");
      const primaryLabel = override?.primaryLabel ?? (isAr ? "اعرض الخدمات" : "Browse services");
      const primaryHref = override?.primaryHref ?? "/services";
      const secondaryLabel = override?.secondaryLabel ?? (isAr ? "محادثة مجانية" : "Free consult");
      const secondaryHref = override?.secondaryHref ?? "/contact";
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-2 gap-6 px-8 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-xl space-y-6">
            <span className="sky-pill sky-fade-in inline-flex items-center gap-2 px-3 py-1 text-xs w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              {badgeText}
            </span>
            <h1 className="sky-display text-4xl md:text-6xl text-slate-900">
              {override?.title ? (
                // Custom title from admin — typewriter still emphasizes verbs
                <>
                  <span className="sky-grad-text">{override.title}</span>
                </>
              ) : (
                <>
                  {isAr ? "نُطلق" : "We launch"}{" "}
                  <span className="sky-grad-text">
                    <Typewriter
                      words={
                        isAr
                          ? ["مواقع متكاملة", "تطبيقات جوال", "متاجر إلكترونية", "حلولاً مخصصة"]
                          : ["full websites", "mobile apps", "online stores", "custom solutions"]
                      }
                    />
                  </span>
                  <br />
                  {isAr ? "بسرعة و إبداع." : "with speed and craft."}
                </>
              )}
            </h1>
            <p
              className="sky-fade-up text-base md:text-lg text-slate-600 leading-relaxed"
              style={{ "--sky-delay": "200ms" } as React.CSSProperties}
            >
              {subtitle}
            </p>
            <div
              className="sky-fade-up flex flex-wrap gap-3"
              style={{ "--sky-delay": "400ms" } as React.CSSProperties}
            >
              <SkyButton asChild size="lg" variant="primary">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </SkyButton>
              <SkyButton asChild size="lg" variant="secondary">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </SkyButton>
            </div>
          </div>

          {/* Floating cards */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div
              className="sky-card sky-float p-4 w-44 absolute top-6 start-8 shadow-lg"
              style={{ animationDelay: "0s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-sky-100 text-sky-700">
                  <Code2 className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-slate-700">{isAr ? "تطوير" : "Build"}</span>
              </div>
              <p className="text-xs text-slate-500">{isAr ? "كود نظيف" : "Clean code"}</p>
            </div>
            <div
              className="sky-card sky-float p-4 w-44 absolute top-32 end-4 shadow-lg"
              style={{ animationDelay: "-3s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700">
                  <Rocket className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-slate-700">{isAr ? "إطلاق" : "Launch"}</span>
              </div>
              <p className="text-xs text-slate-500">{isAr ? "نشر سريع" : "Fast deploy"}</p>
            </div>
            <div
              className="sky-card sky-float p-4 w-44 absolute bottom-12 start-20 shadow-lg sky-card-glow is-active"
              style={{ animationDelay: "-5s" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-slate-700">{isAr ? "نمو" : "Grow"}</span>
              </div>
              <p className="text-xs text-slate-500">{isAr ? "+ نتائج قابلة للقياس" : "+ measurable results"}</p>
            </div>
          </div>
        </div>
      );
    },
  },

  // SLIDE 2 — BIG CENTERED FADE-IN + PERFORMANCE
  {
    id: "slide-2",
    bgClass: "sky-slide-bg sky-slide-bg-2",
    render: (locale) => {
      const isAr = locale === "ar";
      return (
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-14 py-12">
          <span
            className="sky-pill sky-fade-in inline-flex items-center gap-2 px-3 py-1 text-xs"
            style={{ "--sky-delay": "0ms" } as React.CSSProperties}
          >
            <Cpu className="h-3.5 w-3.5" />
            {isAr ? "تقنيات حديثة" : "Modern stack"}
          </span>
          <h1
            className="sky-fade-up sky-display text-4xl md:text-7xl text-slate-900 mt-5 max-w-3xl"
            style={{ "--sky-delay": "150ms" } as React.CSSProperties}
          >
            {isAr ? "أداء " : "Performance "}
            <span className="sky-grad-text">{isAr ? "خرافي" : "that flies."}</span>
          </h1>
          <p
            className="sky-fade-up text-base md:text-xl text-slate-600 max-w-2xl mt-6 leading-relaxed"
            style={{ "--sky-delay": "350ms" } as React.CSSProperties}
          >
            {isAr
              ? "نبني بـ Next.js، PostgreSQL، CDN عالمي، وتحسينات تجعل موقعك يحقق 95+ في Lighthouse من أول إطلاق."
              : "Built with Next.js, PostgreSQL, global CDN, and tuning that ships 95+ Lighthouse from day one."}
          </p>

          {/* Mini bar chart */}
          <div
            className="sky-fade-up grid grid-cols-3 gap-4 mt-10 w-full max-w-md"
            style={{ "--sky-delay": "500ms" } as React.CSSProperties}
          >
            {[
              { label: "LCP", v: 96 },
              { label: "FID", v: 99 },
              { label: "CLS", v: 94 },
            ].map((m) => (
              <div key={m.label} className="sky-card p-4 text-start">
                <p className="text-xs text-slate-500 sky-mono">{m.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{m.v}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="sky-bar h-full rounded-full" style={{ width: `${m.v}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div
            className="sky-fade-up flex flex-wrap gap-3 mt-8 justify-center"
            style={{ "--sky-delay": "700ms" } as React.CSSProperties}
          >
            <SkyButton asChild size="lg" variant="primary">
              <Link href="/portfolio">
                {isAr ? "شاهد أعمالنا" : "See our work"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </SkyButton>
          </div>
        </div>
      );
    },
  },

  // SLIDE 3 — LEFT TEXT + REVIEW CARD
  {
    id: "slide-3",
    bgClass: "sky-slide-bg sky-slide-bg-3",
    render: (locale) => {
      const isAr = locale === "ar";
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-2 gap-8 px-8 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-xl space-y-6">
            <span
              className="sky-pill sky-fade-in inline-flex items-center gap-2 px-3 py-1 text-xs w-fit"
              style={{ "--sky-delay": "0ms" } as React.CSSProperties}
            >
              <Headphones className="h-3.5 w-3.5" />
              {isAr ? "دعم على مدار الساعة" : "24/7 support"}
            </span>
            <h1
              className="sky-fade-up sky-display text-4xl md:text-6xl text-slate-900"
              style={{ "--sky-delay": "150ms" } as React.CSSProperties}
            >
              {isAr ? "علاقة طويلة الأمد، " : "A long-term partnership, "}
              <span className="sky-grad-text">{isAr ? "ليست عقداً مؤقتاً." : "not a one-off."}</span>
            </h1>
            <p
              className="sky-fade-up text-base md:text-lg text-slate-600 leading-relaxed"
              style={{ "--sky-delay": "350ms" } as React.CSSProperties}
            >
              {isAr
                ? "بعد الإطلاق نبقى معك — مراقبة، تحديثات أمنية، إصلاح فوري للمشاكل، واستجابة خلال دقائق."
                : "After launch we stay with you — monitoring, security patches, instant fixes, response within minutes."}
            </p>
            <div
              className="sky-fade-up flex flex-wrap gap-3"
              style={{ "--sky-delay": "500ms" } as React.CSSProperties}
            >
              <SkyButton asChild size="lg" variant="primary">
                <Link href="/contact">{isAr ? "تواصل معنا" : "Talk to us"}</Link>
              </SkyButton>
            </div>
          </div>

          {/* Big quote card */}
          <div
            className="hidden lg:flex items-center justify-center"
            style={{ "--sky-delay": "300ms" } as React.CSSProperties}
          >
            <div className="sky-fade-up sky-card p-8 max-w-md shadow-xl">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                &ldquo;
                {isAr
                  ? "أفضل تعاقد قمنا به هذا العام. الفريق متفهم، النتائج فاقت التوقعات، والدعم بعد الإطلاق رائع."
                  : "The best engagement we did this year. They understood us, exceeded expectations, and the post-launch support is excellent."}
                &rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100">
                <span className="grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-semibold">
                  AM
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {isAr ? "أحمد المنصوري" : "Ahmed Al-Mansouri"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isAr ? "مدير منتج، نورث ويند" : "Product Manager, Northwind"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },

  // SLIDE 4 — BIG STAT / TRUSTED BY
  {
    id: "slide-4",
    bgClass: "sky-slide-bg sky-slide-bg-4",
    render: (locale) => {
      const isAr = locale === "ar";
      const stats = [
        { v: "100+", l: isAr ? "مشروع" : "Projects" },
        { v: "7", l: isAr ? "سنوات" : "Years" },
        { v: "98%", l: isAr ? "رضا" : "Satisfaction" },
      ];
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-[1fr_1.2fr] gap-6 px-8 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-md space-y-6">
            <span
              className="sky-pill sky-fade-in inline-flex items-center gap-2 px-3 py-1 text-xs w-fit"
              style={{ "--sky-delay": "0ms" } as React.CSSProperties}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {isAr ? "أرقام بدلاً من وعود" : "Numbers over promises"}
            </span>
            <h1
              className="sky-fade-up sky-display text-4xl md:text-6xl text-slate-900"
              style={{ "--sky-delay": "150ms" } as React.CSSProperties}
            >
              {isAr ? "يثق بنا " : "Trusted by "}
              <span className="sky-grad-text">{isAr ? "100+ فريق." : "100+ teams."}</span>
            </h1>
            <p
              className="sky-fade-up text-base md:text-lg text-slate-600 leading-relaxed"
              style={{ "--sky-delay": "350ms" } as React.CSSProperties}
            >
              {isAr
                ? "من شركات ناشئة في رحلتها الأولى إلى مؤسسات كبيرة — كلهم اختاروا التعاون معنا."
                : "From early-stage startups to established enterprises — they all chose us."}
            </p>
            <SkyButton
              asChild
              size="lg"
              variant="primary"
              className="sky-fade-up w-fit"
              style={{ "--sky-delay": "500ms" } as React.CSSProperties}
            >
              <Link href="/about">
                {isAr ? "اعرف القصة" : "Read our story"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </SkyButton>
          </div>

          {/* Big stats */}
          <div className="hidden lg:grid grid-cols-2 gap-4 items-center">
            {stats.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "sky-stat sky-card p-8 sky-fade-up",
                  i === 0 && "col-span-2"
                )}
                style={{ "--sky-delay": `${200 + i * 150}ms` } as React.CSSProperties}
              >
                <p className={cn("sky-grad-text sky-display", i === 0 ? "text-7xl" : "text-5xl")}>
                  {s.v}
                </p>
                <p className="text-sm text-slate-600 mt-2 sky-mono uppercase tracking-wider">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
];
