"use client";

import { useEffect, useMemo, useState } from "react";
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
  Code2,
  Workflow,
  Gauge,
  Globe2,
  Layers,
  Zap,
  CheckCircle2,
  TrendingUp,
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
  const heroOverride: HeroOverride = useMemo(
    () => ({
      badge: (isAr ? h?.badge_ar : h?.badge_en)?.trim() || null,
      title: (isAr ? h?.title_ar : h?.title_en)?.trim() || null,
      subtitle: (isAr ? h?.subtitle_ar : h?.subtitle_en)?.trim() || null,
      primaryLabel: (isAr ? h?.primary_cta_label_ar : h?.primary_cta_label_en)?.trim() || null,
      primaryHref: h?.primary_cta_href?.trim() || null,
      secondaryLabel:
        (isAr ? h?.secondary_cta_label_ar : h?.secondary_cta_label_en)?.trim() || null,
      secondaryHref: h?.secondary_cta_href?.trim() || null,
    }),
    [isAr, h]
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 9000);
    return () => clearInterval(t);
  }, []);

  function go(i: number) {
    setIndex((i + SLIDES.length) % SLIDES.length);
  }

  return (
    <section className="relative overflow-hidden pt-10 md:pt-14 pb-24 md:pb-32">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <MoonOrbs />
      </div>
      <div className="moon-stars" aria-hidden />

      <div className="container relative">
        <div className="relative h-[40rem] md:h-[42rem] rounded-3xl overflow-hidden border border-white/[0.07] bg-white/[0.02] shadow-[0_40px_100px_-40px_rgba(96,165,250,0.45)] backdrop-blur-sm">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={cn("moon-slide", s.bgClass)}
              data-active={i === index || undefined}
              aria-hidden={i !== index}
            >
              {i === index && (
                <>
                  <span className="moon-beam" aria-hidden />
                  {s.render(locale, i === 0 ? heroOverride : undefined)}
                </>
              )}
            </div>
          ))}

          {/* Slide counter chip */}
          <div className="absolute top-5 end-5 z-20 moon-pill px-3 py-1 text-[11px] moon-mono">
            {String(index + 1).padStart(2, "0")}{" "}
            <span className="text-white/40">/ {String(SLIDES.length).padStart(2, "0")}</span>
          </div>

          {/* Controls */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={isAr ? "السابق" : "Previous"}
            className="absolute start-4 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-11 w-11 rounded-full bg-white/[0.08] border border-white/15 text-white/85 hover:bg-white/[0.16] hover:border-white/30 backdrop-blur transition"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={isAr ? "التالي" : "Next"}
            className="absolute end-4 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-11 w-11 rounded-full bg-white/[0.08] border border-white/15 text-white/85 hover:bg-white/[0.16] hover:border-white/30 backdrop-blur transition"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 inset-x-0 z-20 flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${isAr ? "الشريحة" : "Slide"} ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-10 bg-white" : "w-2 bg-white/30 hover:bg-white/55"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 6 distinct premium slides ───────────────────────────────────────────────

const SLIDES: Slide[] = [
  // ─── SLIDE 1 — Cinematic launch (moon disc + orbiting rings + typewriter) ───
  {
    id: "moon-cinematic",
    bgClass: "moon-slide-bg-1",
    render: (locale, override) => {
      const isAr = locale === "ar";
      const badge = override?.badge ?? (isAr ? "نصمم تجارب من نور القمر" : "Crafted in moonlight");
      const title = override?.title ?? (isAr ? "تجارب رقمية " : "Digital experiences ");
      const titleEm = isAr ? "تتجاوز الخيال." : "beyond imagination.";
      const subtitle =
        override?.subtitle ??
        (isAr
          ? "نطلق منتجات لامعة، سريعة، وأنيقة بكل تفصيلة — من فكرة على ورق إلى منصّة يعشقها عملاؤك."
          : "We launch radiant, blazing-fast products refined to the last pixel — from napkin sketch to platform your users love.");
      const primaryLabel = override?.primaryLabel ?? (isAr ? "ابدأ مشروعك" : "Start a project");
      const primaryHref = override?.primaryHref ?? "/contact";
      const secondaryLabel = override?.secondaryLabel ?? (isAr ? "تصفّح الخدمات" : "Browse services");
      const secondaryHref = override?.secondaryHref ?? "/services";

      const chips = isAr
        ? ["Next.js", "تصميم متجاوب", "SEO", "أداء 95+"]
        : ["Next.js", "Responsive", "SEO", "95+ Lighthouse"];

      return (
        <div className="relative z-10 h-full grid lg:grid-cols-[1.15fr_1fr] gap-6 px-6 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-2xl space-y-6">
            <span className="moon-pill moon-fade-in moon-pulse inline-flex items-center gap-2 px-3 py-1.5 text-xs w-fit">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              {badge}
            </span>
            <h1
              className="moon-display moon-fade-up text-5xl md:text-7xl leading-[1.05] text-white"
              style={{ "--moon-delay": "120ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">{title}</span>
              <br />
              <span className="moon-grad-text">{titleEm}</span>
              <span className="moon-caret" aria-hidden />
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed max-w-xl"
              style={{ "--moon-delay": "280ms" } as React.CSSProperties}
            >
              {subtitle}
            </p>
            <div
              className="moon-fade-up flex flex-wrap items-center gap-2"
              style={{ "--moon-delay": "380ms" } as React.CSSProperties}
            >
              {chips.map((c) => (
                <span
                  key={c}
                  className="moon-pill px-2.5 py-1 text-[11px] moon-mono text-white/65"
                >
                  {c}
                </span>
              ))}
            </div>
            <div
              className="moon-fade-up flex flex-wrap gap-3 pt-1"
              style={{ "--moon-delay": "500ms" } as React.CSSProperties}
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

          {/* Floating moon disc with orbit rings */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div
              className="relative w-[320px] h-[320px] moon-fade-in"
              style={{ "--moon-delay": "200ms" } as React.CSSProperties}
            >
              <span className="moon-orbit-ring moon-orbit-ring-3" aria-hidden>
                <span className="moon-orbit-dot" style={{ background: "linear-gradient(135deg,#2dd4bf,#60a5fa)" }} />
              </span>
              <span className="moon-orbit-ring moon-orbit-ring-2" aria-hidden>
                <span className="moon-orbit-dot" />
              </span>
              <span className="moon-orbit-ring" aria-hidden />
              <div
                className="absolute inset-0 grid place-items-center"
                style={{ filter: "drop-shadow(0 0 80px rgba(96,165,250,0.40))" }}
              >
                <MoonDisc size={300} className="moon-orb" />
              </div>
            </div>
          </div>
        </div>
      );
    },
  },

  // ─── SLIDE 2 — Performance dashboard (live-metric cards + score ring) ───────
  {
    id: "moon-performance",
    bgClass: "moon-slide-bg-2",
    render: (locale) => {
      const isAr = locale === "ar";
      const metrics = [
        { label: "LCP", v: 96, hint: "1.1s" },
        { label: "FID", v: 99, hint: "12ms" },
        { label: "CLS", v: 94, hint: "0.02" },
      ];
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-[1fr_1fr] gap-8 px-6 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-xl space-y-6">
            <span
              className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1.5 text-xs w-fit"
              style={{ "--moon-delay": "0ms" } as React.CSSProperties}
            >
              <Gauge className="h-3.5 w-3.5 text-sky-300" />
              {isAr ? "أداء يُقاس بالأرقام" : "Performance, measured"}
            </span>
            <h1
              className="moon-display moon-fade-up text-4xl md:text-6xl leading-[1.05] text-white"
              style={{ "--moon-delay": "150ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">{isAr ? "سرعة " : "Speed "}</span>
              <span className="moon-grad-text">{isAr ? "تشعر بها." : "you can feel."}</span>
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed"
              style={{ "--moon-delay": "300ms" } as React.CSSProperties}
            >
              {isAr
                ? "موقعك يفتح فوراً، يتنقّل بسلاسة، ويظهر متّقن على كل جهاز. أداء Lighthouse 95+ من أول إطلاق."
                : "Your site opens instantly, navigates smoothly, looks refined on every device. 95+ Lighthouse scores from day one."}
            </p>
            <div
              className="moon-fade-up flex flex-wrap gap-3 pt-1"
              style={{ "--moon-delay": "450ms" } as React.CSSProperties}
            >
              <MoonButton asChild size="lg" variant="primary">
                <Link href="/services">
                  {isAr ? "اعرف كيف" : "See how"}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </MoonButton>
              <MoonButton asChild size="lg" variant="ghost">
                <Link href="/portfolio">{isAr ? "أمثلة حية" : "Live examples"}</Link>
              </MoonButton>
            </div>
          </div>

          {/* Right: score ring + metrics */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {/* Big circular score */}
              <div
                className="moon-card moon-fade-up p-5 col-span-2 flex items-center gap-5 relative overflow-hidden"
                style={{ "--moon-delay": "200ms" } as React.CSSProperties}
              >
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="rgba(255,255,255,0.07)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="url(#moonScoreG)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(96 / 100) * (2 * Math.PI * 42)} 999`}
                    />
                    <defs>
                      <linearGradient id="moonScoreG" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#2dd4bf" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <p className="moon-grad-text moon-display text-2xl">96</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] moon-mono uppercase tracking-wider text-white/45">
                    Lighthouse
                  </p>
                  <p className="text-white font-semibold text-lg mt-0.5">
                    {isAr ? "تقييم ممتاز" : "Excellent score"}
                  </p>
                  <p className="text-xs text-white/55 mt-1">
                    {isAr ? "كل المشاريع المُسلَّمة 2025" : "All shipped projects, 2025"}
                  </p>
                </div>
              </div>

              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  className="moon-card moon-stat moon-fade-up p-4 relative"
                  style={{ "--moon-delay": `${300 + i * 100}ms` } as React.CSSProperties}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] moon-mono uppercase tracking-wider text-white/45">
                      {m.label}
                    </p>
                    <span className="text-[10px] moon-mono text-emerald-300/90">
                      {m.hint}
                    </span>
                  </div>
                  <p className="moon-num-pop text-2xl font-bold text-white mt-1.5">{m.v}</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="moon-bar h-full rounded-full" style={{ width: `${m.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    },
  },

  // ─── SLIDE 3 — Code window mockup + headline ───────────────────────────────
  {
    id: "moon-craft",
    bgClass: "moon-slide-bg-3",
    render: (locale) => {
      const isAr = locale === "ar";
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-[1fr_1.15fr] gap-8 px-6 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-xl space-y-6">
            <span
              className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1.5 text-xs w-fit"
              style={{ "--moon-delay": "0ms" } as React.CSSProperties}
            >
              <Code2 className="h-3.5 w-3.5 text-sky-300" />
              {isAr ? "كود نظيف، صنعة دقيقة" : "Clean code, real craft"}
            </span>
            <h1
              className="moon-display moon-fade-up text-4xl md:text-6xl leading-[1.05] text-white"
              style={{ "--moon-delay": "150ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">
                {isAr ? "ليس مجرد موقع — " : "Not just a site — "}
              </span>
              <span className="moon-grad-text">
                {isAr ? "بنية تدوم." : "an architecture that lasts."}
              </span>
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed"
              style={{ "--moon-delay": "300ms" } as React.CSSProperties}
            >
              {isAr
                ? "TypeScript ، اختبارات تلقائية، CI/CD، ومراجعة كود حقيقية — تستلم منتجاً يسهل تطويره لسنوات قادمة."
                : "TypeScript, automated tests, CI/CD, and real code review — you receive a product you can grow for years."}
            </p>
            <div
              className="moon-fade-up flex flex-wrap gap-3 pt-1"
              style={{ "--moon-delay": "450ms" } as React.CSSProperties}
            >
              <MoonButton asChild size="lg" variant="primary">
                <Link href="/contact">
                  {isAr ? "تحدّث مع المهندسين" : "Talk to engineers"}
                </Link>
              </MoonButton>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div
              className="moon-code moon-fade-up w-full max-w-lg shadow-[0_30px_60px_-30px_rgba(96,165,250,0.45)]"
              style={{ "--moon-delay": "250ms" } as React.CSSProperties}
            >
              <div className="moon-code-titlebar">
                <span className="moon-code-dot" style={{ background: "#f87171" }} />
                <span className="moon-code-dot" style={{ background: "#fbbf24" }} />
                <span className="moon-code-dot" style={{ background: "#34d399" }} />
                <span className="ms-3 text-[11px] moon-mono text-white/45">
                  ~/launch.ts
                </span>
              </div>
              <pre className="p-5 text-[12.5px] leading-relaxed moon-mono overflow-x-auto">
                <code className="block">
                  <span className="text-sky-300">import</span>{" "}
                  <span className="text-white/85">{`{ ship }`}</span>{" "}
                  <span className="text-sky-300">from</span>{" "}
                  <span className="text-emerald-300">&apos;@moon/core&apos;</span>
                  <span className="text-white/40">;</span>
                  {"\n\n"}
                  <span className="text-indigo-300">export async function</span>{" "}
                  <span className="text-white">launch</span>
                  <span className="text-white/60">() {`{`}</span>
                  {"\n"}
                  {"  "}
                  <span className="text-sky-300">const</span>{" "}
                  <span className="text-white">product</span>{" "}
                  <span className="text-white/60">=</span>{" "}
                  <span className="text-sky-300">await</span>{" "}
                  <span className="text-emerald-300">ship</span>
                  <span className="text-white/60">({`{`}</span>
                  {"\n"}
                  {"    "}
                  <span className="text-white/85">stack</span>
                  <span className="text-white/60">:</span>{" "}
                  <span className="text-amber-200">&apos;Next.js + PG&apos;</span>
                  <span className="text-white/60">,</span>
                  {"\n"}
                  {"    "}
                  <span className="text-white/85">tests</span>
                  <span className="text-white/60">:</span>{" "}
                  <span className="text-pink-300">true</span>
                  <span className="text-white/60">,</span>
                  {"\n"}
                  {"    "}
                  <span className="text-white/85">support</span>
                  <span className="text-white/60">:</span>{" "}
                  <span className="text-amber-200">&apos;24/7&apos;</span>
                  <span className="text-white/60">,</span>
                  {"\n"}
                  {"  "}
                  <span className="text-white/60">{`});`}</span>
                  {"\n\n"}
                  {"  "}
                  <span className="text-sky-300">return</span>{" "}
                  <span className="text-white">product</span>
                  <span className="text-white/40">.</span>
                  <span className="text-emerald-300">delight</span>
                  <span className="text-white/60">();</span>
                  {"\n"}
                  <span className="text-white/60">{`}`}</span>
                </code>
              </pre>
              <div className="border-t border-white/[0.06] px-4 py-2.5 flex items-center justify-between bg-white/[0.02]">
                <span className="inline-flex items-center gap-1.5 text-[11px] moon-mono text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  {isAr ? "نجح البناء — 0 أخطاء" : "Build passed — 0 errors"}
                </span>
                <span className="text-[11px] moon-mono text-white/40">1.2s</span>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },

  // ─── SLIDE 4 — Featured testimonial + trust marks ──────────────────────────
  {
    id: "moon-trust",
    bgClass: "moon-slide-bg-4",
    render: (locale) => {
      const isAr = locale === "ar";
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-[1fr_1.1fr] gap-8 px-6 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-xl space-y-6">
            <span
              className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1.5 text-xs w-fit"
              style={{ "--moon-delay": "0ms" } as React.CSSProperties}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              {isAr ? "موثوق من فرق حقيقية" : "Trusted by real teams"}
            </span>
            <h1
              className="moon-display moon-fade-up text-4xl md:text-6xl leading-[1.05] text-white"
              style={{ "--moon-delay": "150ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">
                {isAr ? "شراكة طويلة، " : "Partnership for the long run, "}
              </span>
              <span className="moon-grad-text">
                {isAr ? "ليست تسليم وانتهى." : "not a drop-and-go."}
              </span>
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed"
              style={{ "--moon-delay": "280ms" } as React.CSSProperties}
            >
              {isAr
                ? "بعد الإطلاق نبقى معك — مراقبة 24/7، تحديثات أمنية فورية، واستجابة خلال دقائق."
                : "After launch we stay with you — 24/7 monitoring, instant security patches, response within minutes."}
            </p>
            <div
              className="moon-fade-up grid grid-cols-3 gap-2 max-w-sm pt-1"
              style={{ "--moon-delay": "400ms" } as React.CSSProperties}
            >
              {["Northwind", "Aerolux", "Verdant"].map((b) => (
                <div
                  key={b}
                  className="moon-pill px-2 py-1.5 text-center text-[11px] moon-mono text-white/55"
                >
                  {b}
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div
              className="moon-card moon-card-glow is-active moon-fade-up p-8 max-w-md relative"
              style={{ "--moon-delay": "260ms" } as React.CSSProperties}
            >
              <span className="absolute -top-4 start-6 moon-pill px-2.5 py-1 text-[10px] moon-mono">
                {isAr ? "تقييم العميل" : "Client review"}
              </span>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
                ))}
              </div>
              <p className="text-base md:text-lg text-white/90 leading-relaxed">
                &ldquo;
                {isAr
                  ? "أفضل تعاقد قمنا به هذا العام. الفريق متفهم، النتائج فاقت التوقعات، والدعم بعد الإطلاق ممتاز."
                  : "The best engagement we did this year. They understood us, exceeded expectations, and post-launch support is excellent."}
                &rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <span className="grid place-items-center h-11 w-11 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-semibold">
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
                <span className="ms-auto inline-flex items-center gap-1 text-[10px] moon-mono text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  {isAr ? "موثّق" : "Verified"}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },

  // ─── SLIDE 5 — Process: 4 steps with traveling line ────────────────────────
  {
    id: "moon-process",
    bgClass: "moon-slide-bg-5",
    render: (locale) => {
      const isAr = locale === "ar";
      const steps = [
        {
          icon: Sparkles,
          ar: "اكتشاف",
          en: "Discover",
          arDesc: "ورشة استكشاف",
          enDesc: "Scoping workshop",
        },
        {
          icon: Layers,
          ar: "تصميم",
          en: "Design",
          arDesc: "نماذج تفاعلية",
          enDesc: "Interactive mockups",
        },
        {
          icon: Code2,
          ar: "تطوير",
          en: "Build",
          arDesc: "كود نظيف",
          enDesc: "Clean code",
        },
        {
          icon: Rocket,
          ar: "إطلاق",
          en: "Launch",
          arDesc: "مع دعم 24/7",
          enDesc: "24/7 support",
        },
      ];
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-[1fr_1.2fr] gap-8 px-6 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-xl space-y-6">
            <span
              className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1.5 text-xs w-fit"
              style={{ "--moon-delay": "0ms" } as React.CSSProperties}
            >
              <Workflow className="h-3.5 w-3.5 text-sky-300" />
              {isAr ? "عملية واضحة كالقمر" : "Clear as moonlight"}
            </span>
            <h1
              className="moon-display moon-fade-up text-4xl md:text-6xl leading-[1.05] text-white"
              style={{ "--moon-delay": "150ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">{isAr ? "أربع خطوات " : "Four steps "}</span>
              <span className="moon-grad-text">
                {isAr ? "من الفكرة للإطلاق." : "from idea to launch."}
              </span>
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed"
              style={{ "--moon-delay": "300ms" } as React.CSSProperties}
            >
              {isAr
                ? "تعرف بالضبط أين نحن في كل لحظة. اجتماعات أسبوعية، عرض تجريبي مباشر، ولا مفاجآت."
                : "You know exactly where we are at any moment. Weekly demos, live previews, no surprises."}
            </p>
            <MoonButton
              asChild
              size="lg"
              variant="primary"
              className="moon-fade-up w-fit"
              style={{ "--moon-delay": "450ms" } as React.CSSProperties}
            >
              <Link href="/contact">
                {isAr ? "ابدأ الخطوة 1" : "Start step 1"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </MoonButton>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full max-w-lg space-y-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.en}
                    className="moon-card moon-fade-up p-4 flex items-center gap-4 relative"
                    style={{ "--moon-delay": `${200 + i * 120}ms` } as React.CSSProperties}
                  >
                    <span className="relative grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-400/30 text-sky-300 shrink-0">
                      <Icon className="h-5 w-5" />
                      <span className="absolute -top-2 -end-2 grid place-items-center h-5 w-5 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{isAr ? s.ar : s.en}</p>
                      <p className="text-xs text-white/55 mt-0.5">
                        {isAr ? s.arDesc : s.enDesc}
                      </p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="absolute start-[2.65rem] -bottom-4 h-4 w-px bg-gradient-to-b from-sky-400/50 to-transparent" />
                    )}
                    <span className="text-[10px] moon-mono text-white/40">
                      0{i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    },
  },

  // ─── SLIDE 6 — Big stats showcase ──────────────────────────────────────────
  {
    id: "moon-stats",
    bgClass: "moon-slide-bg-6",
    render: (locale) => {
      const isAr = locale === "ar";
      const stats = [
        {
          v: "120+",
          l: isAr ? "مشروع مُسلَّم" : "Projects shipped",
          icon: Rocket,
          accent: "from-sky-400 to-indigo-500",
        },
        {
          v: "8",
          l: isAr ? "سنوات خبرة" : "Years of craft",
          icon: TrendingUp,
          accent: "from-teal-400 to-sky-500",
        },
        {
          v: "98%",
          l: isAr ? "رضا العملاء" : "Client satisfaction",
          icon: Star,
          accent: "from-amber-300 to-orange-400",
        },
        {
          v: "24/7",
          l: isAr ? "دعم متاح" : "Support coverage",
          icon: Zap,
          accent: "from-indigo-400 to-fuchsia-500",
        },
        {
          v: "12",
          l: isAr ? "دولة نخدمها" : "Countries served",
          icon: Globe2,
          accent: "from-emerald-400 to-teal-500",
        },
      ];
      return (
        <div className="relative z-10 h-full grid lg:grid-cols-[0.9fr_1.3fr] gap-8 px-6 md:px-14 py-12">
          <div className="flex flex-col justify-center max-w-md space-y-6">
            <span
              className="moon-pill moon-fade-in inline-flex items-center gap-2 px-3 py-1.5 text-xs w-fit"
              style={{ "--moon-delay": "0ms" } as React.CSSProperties}
            >
              <Cpu className="h-3.5 w-3.5 text-sky-300" />
              {isAr ? "نتائج تتحدث عنّا" : "Numbers speak"}
            </span>
            <h1
              className="moon-display moon-fade-up text-4xl md:text-6xl leading-[1.05] text-white"
              style={{ "--moon-delay": "150ms" } as React.CSSProperties}
            >
              <span className="moon-grad-silver">
                {isAr ? "ثقة بُنيت " : "Trust earned "}
              </span>
              <span className="moon-grad-text">
                {isAr ? "بالأرقام، لا الوعود." : "in numbers, not promises."}
              </span>
            </h1>
            <p
              className="moon-fade-up text-base md:text-lg text-white/65 leading-relaxed"
              style={{ "--moon-delay": "300ms" } as React.CSSProperties}
            >
              {isAr
                ? "من شركات ناشئة في بداياتها إلى مؤسسات راسخة — كلهم اختاروا الاستمرار معنا."
                : "From early-stage startups to enterprise leaders — they all chose to keep working with us."}
            </p>
            <MoonButton
              asChild
              size="lg"
              variant="primary"
              className="moon-fade-up w-fit"
              style={{ "--moon-delay": "440ms" } as React.CSSProperties}
            >
              <Link href="/about">
                {isAr ? "اقرأ قصتنا" : "Read our story"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </MoonButton>
          </div>

          <div className="hidden lg:grid grid-cols-6 grid-rows-2 gap-4 items-stretch">
            {stats.map((s, i) => {
              const Icon = s.icon;
              const span =
                i === 0
                  ? "col-span-4 row-span-1"
                  : i === 1
                  ? "col-span-2 row-span-1"
                  : i === 2
                  ? "col-span-2 row-span-1"
                  : i === 3
                  ? "col-span-2 row-span-1"
                  : "col-span-2 row-span-1";
              return (
                <div
                  key={i}
                  className={cn(
                    "moon-card moon-fade-up p-6 relative overflow-hidden",
                    span
                  )}
                  style={{ "--moon-delay": `${200 + i * 110}ms` } as React.CSSProperties}
                >
                  <span
                    className={cn(
                      "absolute -top-8 -end-8 h-24 w-24 rounded-full opacity-20 blur-2xl bg-gradient-to-br",
                      s.accent
                    )}
                    aria-hidden
                  />
                  <Icon className="h-4 w-4 text-white/55" />
                  <p
                    className={cn(
                      "moon-num-pop moon-display moon-grad-text mt-3",
                      i === 0 ? "text-6xl md:text-7xl" : "text-4xl"
                    )}
                  >
                    {s.v}
                  </p>
                  <p className="text-xs md:text-sm text-white/60 mt-2 moon-mono uppercase tracking-wider">
                    {s.l}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  },
];
