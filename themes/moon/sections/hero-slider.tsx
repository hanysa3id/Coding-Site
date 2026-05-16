"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cpu,
  Rocket,
  ShieldCheck,
  Star,
} from "lucide-react";
import { MoonButton } from "../ui/moon-button";
import { MoonOrbs, MoonDisc } from "../ui/moon-orbs";
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

export function MoonHero({
  locale,
  landing,
}: {
  locale: string;
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  const [index, setIndex] = useState(0);

  const h = landing?.hero;
  const heroOverride: HeroOverride = {
    badge: (isAr ? h?.badge_ar : h?.badge_en)?.trim() || null,
    title: (isAr ? h?.title_ar : h?.title_en)?.trim() || null,
    subtitle: (isAr ? h?.subtitle_ar : h?.subtitle_en)?.trim() || null,
    primaryLabel: (isAr ? h?.primary_cta_label_ar : h?.primary_cta_label_en)?.trim() || null,
    primaryHref: h?.primary_cta_href?.trim() || null,
    secondaryLabel: (isAr ? h?.secondary_cta_label_ar : h?.secondary_cta_label_en)?.trim() || null,
    secondaryHref: h?.secondary_cta_href?.trim() || null,
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 8000);
    return () => clearInterval(t);
  }, []);

  function go(i: number) {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }

  return (
    <section className="relative overflow-hidden pt-12 md:pt-16 pb-24 md:pb-32">
      {/* Background mesh + starfield */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <MoonOrbs />
      </div>
      <div className="moon-stars" aria-hidden />

      <div className="container relative">
        <div className="relative h-[36rem] md:h-[38rem] rounded-3xl overflow-hidden border border-white/[0.07] bg-white/[0.02] shadow-[0_30px_80px_-40px_rgba(96,165,250,0.40)] backdrop-blur-sm">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={cn("moon-slide", s.bgClass)}
              data-active={i === index || undefined}
              aria-hidden={i !== index}
            >
              {i === index && s.render(locale, i === 0 ? heroOverride : undefined)}
            </div>
          ))}

          {/* Controls */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={isAr ? "السابق" : "Previous"}
            className="absolute start-4 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-white/[0.08] border border-white/15 text-white/85 hover:bg-white/[0.14] backdrop-blur transition"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={isAr ? "التالي" : "Next"}
            className="absolute end-4 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 rounded-full bg-white/[0.08] border border-white/15 text-white/85 hover:bg-white/[0.14] backdrop-blur transition"
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
                  i === index ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/55"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4 distinct slides ──────────────────────────────────────────────────────

const SLIDES: Slide[] = [
  // SLIDE 1 — Moon disc + headline + dual CTAs
  {
    id: "moon-1",
    bgClass: "moon-slide-bg-1",
    render: (locale, override) => {
      const isAr = locale === "ar";
      const badge = override?.badge ?? (isAr ? "نحن نرسم بالنور" : "We paint with light");
      const title = override?.title ?? (isAr ? "تصميمات " : "Digital experiences ");
      const titleEm = isAr ? "تتجاوز الخيال." : "beyond imagination.";
      const subtitle = override?.subtitle ?? (isAr
        ? "نطلق منتجات رقمية لامعة مثل ضوء القمر — هادئة، أنيقة، ومذهلة بكل تفصيلة."
        : "We ship digital products that shine like moonlight — calm, refined, and breathtaking in every detail.");
      const primaryLabel = override?.primaryLabel ?? (isAr ? "تصفح الخدمات" : "Browse services");
      const primaryHref = override?.primaryHref ?? "/services";
      const secondaryLabel = override?.secondaryLabel ?? (isAr ? "محادثة مجانية" : "Free consult");
      const secondaryHref = override?.secondaryHref ?? "/contact";
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-[1.2fr_1fr] gap-6 px-8 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-2xl space-y-6">
            <span className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1 text-xs w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              {badge}
            </span>
            <h1
              className="moon-display moon-fade-up text-5xl md:text-7xl text-white"
              style={{ "--moon-delay": "100ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">{title}</span>
              <br />
              <span className="moon-grad-text">{titleEm}</span>
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed"
              style={{ "--moon-delay": "250ms" } as React.CSSProperties}
            >
              {subtitle}
            </p>
            <div
              className="moon-fade-up flex flex-wrap gap-3"
              style={{ "--moon-delay": "400ms" } as React.CSSProperties}
            >
              <MoonButton asChild size="lg" variant="primary">
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </MoonButton>
              <MoonButton asChild size="lg" variant="secondary">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </MoonButton>
            </div>
          </div>

          {/* Floating moon disc */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div
              className="moon-fade-in"
              style={{ "--moon-delay": "200ms" } as React.CSSProperties}
            >
              <div className="relative moon-orb-static" style={{ filter: "drop-shadow(0 0 60px rgba(96,165,250,0.30))" }}>
                <MoonDisc size={320} className="moon-orb" />
              </div>
            </div>
          </div>
        </div>
      );
    },
  },

  // SLIDE 2 — Big centered "Performance & quality" with mini metrics
  {
    id: "moon-2",
    bgClass: "moon-slide-bg-2",
    render: (locale) => {
      const isAr = locale === "ar";
      return (
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 md:px-14 py-12">
          <span
            className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1 text-xs"
            style={{ "--moon-delay": "0ms" } as React.CSSProperties}
          >
            <Cpu className="h-3.5 w-3.5" />
            {isAr ? "تقنيات حديثة" : "Modern stack"}
          </span>
          <h1
            className="moon-display moon-fade-up text-4xl md:text-7xl text-white mt-5 max-w-3xl"
            style={{ "--moon-delay": "150ms" } as React.CSSProperties}
          >
            <span className="moon-grad-silver">{isAr ? "أداء " : "Performance "}</span>
            <span className="moon-grad-text">{isAr ? "خرافي." : "that flies."}</span>
          </h1>
          <p
            className="moon-fade-up text-base md:text-xl text-white/65 max-w-2xl mt-5 leading-relaxed"
            style={{ "--moon-delay": "300ms" } as React.CSSProperties}
          >
            {isAr
              ? "Next.js + PostgreSQL + CDN عالمي. كود نظيف، اختبارات تلقائية، ونتائج Lighthouse 95+."
              : "Next.js + PostgreSQL + global CDN. Clean code, automated tests, and 95+ Lighthouse scores."}
          </p>
          <div
            className="moon-fade-up grid grid-cols-3 gap-4 mt-10 w-full max-w-md"
            style={{ "--moon-delay": "450ms" } as React.CSSProperties}
          >
            {[
              { label: "LCP", v: 96 },
              { label: "FID", v: 99 },
              { label: "CLS", v: 94 },
            ].map((m) => (
              <div key={m.label} className="moon-card moon-stat p-4 text-start relative">
                <p className="text-[10px] text-white/45 moon-mono uppercase tracking-wider">
                  {m.label}
                </p>
                <p className="text-2xl font-bold text-white mt-1">{m.v}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="moon-bar h-full rounded-full" style={{ width: `${m.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },

  // SLIDE 3 — Quote + trust
  {
    id: "moon-3",
    bgClass: "moon-slide-bg-3",
    render: (locale) => {
      const isAr = locale === "ar";
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-2 gap-8 px-8 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-xl space-y-6">
            <span
              className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1 text-xs w-fit"
              style={{ "--moon-delay": "0ms" } as React.CSSProperties}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {isAr ? "موثوق + متعاون" : "Trusted + collaborative"}
            </span>
            <h1
              className="moon-display moon-fade-up text-4xl md:text-6xl text-white"
              style={{ "--moon-delay": "150ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">
                {isAr ? "شراكة طويلة الأمد، " : "Long-term partnership, "}
              </span>
              <span className="moon-grad-text">
                {isAr ? "ليست عقد عبور." : "not a hand-off."}
              </span>
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed"
              style={{ "--moon-delay": "300ms" } as React.CSSProperties}
            >
              {isAr
                ? "بعد الإطلاق نبقى معك — مراقبة، تحديثات أمنية، إصلاح فوري للمشاكل، واستجابة خلال دقائق."
                : "After launch we stick around — monitoring, security patches, instant fixes, response within minutes."}
            </p>
            <div
              className="moon-fade-up flex flex-wrap gap-3"
              style={{ "--moon-delay": "450ms" } as React.CSSProperties}
            >
              <MoonButton asChild size="lg" variant="primary">
                <Link href="/contact">{isAr ? "تواصل معنا" : "Talk to us"}</Link>
              </MoonButton>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div
              className="moon-card moon-card-glow is-active moon-fade-up p-8 max-w-md"
              style={{ "--moon-delay": "300ms" } as React.CSSProperties}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
                ))}
              </div>
              <p className="text-base md:text-lg text-white/85 leading-relaxed">
                &ldquo;
                {isAr
                  ? "أفضل تعاقد قمنا به هذا العام. الفريق متفهم، النتائج فاقت التوقعات، والدعم بعد الإطلاق ممتاز."
                  : "The best engagement we did this year. They understood us, exceeded expectations, and the post-launch support is excellent."}
                &rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <span className="grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-semibold">
                  AM
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {isAr ? "أحمد المنصوري" : "Ahmed Al-Mansouri"}
                  </p>
                  <p className="text-xs text-white/50 moon-mono">
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

  // SLIDE 4 — Big trust stats
  {
    id: "moon-4",
    bgClass: "moon-slide-bg-4",
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
              className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1 text-xs w-fit"
              style={{ "--moon-delay": "0ms" } as React.CSSProperties}
            >
              <Rocket className="h-3.5 w-3.5" />
              {isAr ? "نتائج بدلاً من وعود" : "Results over promises"}
            </span>
            <h1
              className="moon-display moon-fade-up text-4xl md:text-6xl text-white"
              style={{ "--moon-delay": "150ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">{isAr ? "يثق بنا " : "Trusted by "}</span>
              <span className="moon-grad-text">{isAr ? "100+ فريق." : "100+ teams."}</span>
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed"
              style={{ "--moon-delay": "300ms" } as React.CSSProperties}
            >
              {isAr
                ? "من شركات ناشئة في رحلتها الأولى إلى مؤسسات كبيرة — كلهم اختاروا التعاون معنا."
                : "From early-stage startups to established enterprises — they all chose us."}
            </p>
            <MoonButton
              asChild
              size="lg"
              variant="primary"
              className="moon-fade-up w-fit"
              style={{ "--moon-delay": "450ms" } as React.CSSProperties}
            >
              <Link href="/about">
                {isAr ? "اعرف القصة" : "Read our story"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </MoonButton>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4 items-center">
            {stats.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "moon-card moon-stat moon-fade-up p-8 relative",
                  i === 0 && "col-span-2"
                )}
                style={{ "--moon-delay": `${200 + i * 150}ms` } as React.CSSProperties}
              >
                <p className={cn("moon-grad-text moon-display", i === 0 ? "text-7xl" : "text-5xl")}>
                  {s.v}
                </p>
                <p className="text-sm text-white/55 mt-2 moon-mono uppercase tracking-wider">
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

