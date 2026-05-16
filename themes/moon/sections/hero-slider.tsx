"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
  PlayCircle,
} from "lucide-react";
import { MoonButton } from "../ui/moon-button";
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
  imageUrl?: string | null;
  videoUrl?: string | null;
};

function pickOverride(
  isAr: boolean,
  src:
    | NonNullable<LandingSettings["hero"]>
    | NonNullable<LandingSettings["hero_slides"]>[number]
    | undefined
): HeroOverride {
  if (!src) {
    return {
      badge: null,
      title: null,
      subtitle: null,
      primaryLabel: null,
      primaryHref: null,
      secondaryLabel: null,
      secondaryHref: null,
    };
  }
  return {
    badge: (isAr ? src.badge_ar : src.badge_en)?.trim() || null,
    title: (isAr ? src.title_ar : src.title_en)?.trim() || null,
    subtitle: (isAr ? src.subtitle_ar : src.subtitle_en)?.trim() || null,
    primaryLabel:
      (isAr ? src.primary_cta_label_ar : src.primary_cta_label_en)?.trim() || null,
    primaryHref: src.primary_cta_href?.trim() || null,
    secondaryLabel:
      (isAr ? src.secondary_cta_label_ar : src.secondary_cta_label_en)?.trim() || null,
    secondaryHref: src.secondary_cta_href?.trim() || null,
    imageUrl: "image_url" in src ? src.image_url?.trim() || null : null,
    videoUrl: "video_url" in src ? src.video_url?.trim() || null : null,
  };
}

type Slide = {
  id: string;
  image: string;
  /** Optional looping background video — auto-played only when the slide is active. */
  video?: string;
  /** Visual motion preset for the non-image overlay layers. */
  motion?: "aurora" | "particles" | "grid" | "aurora-particles";
  imageAlt: { ar: string; en: string };
  accent: string;
  render: (locale: string, override?: HeroOverride) => React.ReactNode;
};

/** Tiny floating-particles layer — 18 dots with randomized speed/position. */
function ParticleField() {
  const dots = Array.from({ length: 18 });
  return (
    <div className="moon-particles" aria-hidden>
      {dots.map((_, i) => {
        const left = (i * 53) % 100;
        const dur = 12 + ((i * 7) % 16); // 12..28s
        const delay = (i * 1.3) % 10;
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${dur}s`,
              animationDelay: `-${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export function MoonHero({
  locale,
  landing,
}: {
  locale: string;
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  const [index, setIndex] = useState(0);

  // Build the actual slide list: when admin provides `hero_slides`, each one
  // takes the next built-in visual template as its scaffold + overrides badge/
  // title/subtitle/CTAs/backdrop. When no admin slides, legacy single `hero`
  // override applies only to slide 0.
  const renderedSlides = useMemo(() => {
    const adminSlides = landing?.hero_slides ?? [];
    if (adminSlides.length > 0) {
      return adminSlides.map((s, i) => ({
        template: SLIDES[i % SLIDES.length],
        override: pickOverride(isAr, s),
      }));
    }
    return SLIDES.map((tpl, i) => ({
      template: tpl,
      override: i === 0 ? pickOverride(isAr, landing?.hero) : pickOverride(isAr, undefined),
    }));
  }, [isAr, landing]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % renderedSlides.length),
      9000
    );
    return () => clearInterval(t);
  }, [renderedSlides.length]);

  function go(i: number) {
    setIndex((i + renderedSlides.length) % renderedSlides.length);
  }

  return (
    <section className="relative w-full overflow-hidden -mt-px" aria-roledescription="carousel">
      {/* Layered slide stack */}
      <div className="relative h-[640px] md:h-[760px] lg:h-[820px]">
        {renderedSlides.map(({ template: s, override }, i) => {
          const active = i === index;
          const slideImage = override.imageUrl || s.image;
          const slideVideo = override.videoUrl || s.video;
          return (
            <div
              key={`${s.id}-${i}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1100ms] ease-out",
                active ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-hidden={!active}
            >
              {/* Backdrop: video when present (active only), otherwise image */}
              <div className="absolute inset-0 overflow-hidden">
                {slideVideo && active ? (
                  <video
                    key={`v-${s.id}-${i}`}
                    src={slideVideo}
                    poster={slideImage}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover scale-[1.06]"
                  />
                ) : (
                  <Image
                    src={slideImage}
                    alt={isAr ? s.imageAlt.ar : s.imageAlt.en}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className={cn(
                      "object-cover transition-transform duration-[12000ms] ease-out",
                      active ? "scale-110" : "scale-100"
                    )}
                  />
                )}
              </div>

              {/* Animated overlay layers per slide */}
              {active && (s.motion === "aurora" || s.motion === "aurora-particles") && (
                <>
                  <span className="moon-aurora" aria-hidden />
                  <span className="moon-aurora is-soft" aria-hidden />
                </>
              )}
              {active && s.motion === "grid" && <span className="moon-grid-anim" aria-hidden />}
              {active && (s.motion === "particles" || s.motion === "aurora-particles") && (
                <ParticleField />
              )}

              {/* Cool-tone color wash + readability gradients */}
              <div
                className="absolute inset-0"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(180deg, rgba(6,10,22,0.55) 0%, rgba(6,10,22,0.78) 60%, rgba(6,10,22,0.96) 100%)",
                }}
              />
              <div
                className="absolute inset-0 mix-blend-color"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.55), rgba(99,102,241,0.40) 45%, rgba(20,184,166,0.35) 100%)",
                }}
              />
              {/* Side fade for content side (LTR: left, RTL flips via dir) */}
              <div
                className="absolute inset-y-0 start-0 w-full md:w-[68%]"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(90deg, rgba(6,10,22,0.92) 0%, rgba(6,10,22,0.78) 35%, rgba(6,10,22,0.30) 70%, transparent 100%)",
                }}
              />
              {/* Floating colored glows */}
              <span
                className="absolute -top-24 -end-24 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(96,165,250,0.55), transparent)",
                }}
                aria-hidden
              />
              <span
                className="absolute -bottom-24 start-1/3 h-[22rem] w-[22rem] rounded-full opacity-40 blur-3xl"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(45,212,191,0.40), transparent)",
                }}
                aria-hidden
              />
              {/* Star dots */}
              <div className="moon-stars absolute inset-0" aria-hidden />
              {/* Light beam sweep on active */}
              {active && <span className="moon-beam" aria-hidden />}

              {/* Slide content */}
              {active && (
                <div className="relative z-10 h-full">
                  <div className="container h-full">
                    {s.render(locale, override)}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ─── Persistent overlay UI ─────────────────────────────────────── */}

        {/* Top bar: counter + progress thumbs */}
        <div className="absolute top-6 inset-x-0 z-30 pointer-events-none">
          <div className="container flex items-center justify-between">
            <div className="moon-pill px-3 py-1.5 text-[11px] moon-mono pointer-events-auto">
              <span className="text-white">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-white/40">
                {" "}/ {String(renderedSlides.length).padStart(2, "0")}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 pointer-events-auto">
              {renderedSlides.map(({ template: s, override }, i) => (
                <button
                  key={`${s.id}-${i}`}
                  type="button"
                  onClick={() => go(i)}
                  className={cn(
                    "relative h-12 w-16 rounded-lg overflow-hidden border transition-all",
                    i === index
                      ? "border-sky-400/70 ring-1 ring-sky-400/50 scale-105"
                      : "border-white/15 opacity-55 hover:opacity-100"
                  )}
                  aria-label={`${isAr ? "الشريحة" : "Slide"} ${i + 1}`}
                >
                  <Image
                    src={override.imageUrl || s.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(6,10,22,0.20), rgba(6,10,22,0.65))",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prev / Next */}
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label={isAr ? "السابق" : "Previous"}
          className="absolute start-4 md:start-8 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-12 w-12 rounded-full bg-white/[0.08] border border-white/20 text-white hover:bg-white/[0.18] hover:border-sky-400/60 backdrop-blur-md transition"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label={isAr ? "التالي" : "Next"}
          className="absolute end-4 md:end-8 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-12 w-12 rounded-full bg-white/[0.08] border border-white/20 text-white hover:bg-white/[0.18] hover:border-sky-400/60 backdrop-blur-md transition"
        >
          <ChevronRight className="h-5 w-5 rtl:rotate-180" />
        </button>

        {/* Bottom dots */}
        <div className="absolute bottom-7 inset-x-0 z-20 flex items-center justify-center gap-2">
          {renderedSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`${isAr ? "الشريحة" : "Slide"} ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-12 bg-gradient-to-r from-sky-400 to-indigo-400"
                  : "w-2 bg-white/30 hover:bg-white/55"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 6 distinct premium slides ───────────────────────────────────────────────

// Reusable scaffold for the content side (gives every slide the same layout discipline)
function SlideContent({
  badge,
  badgeIcon: BadgeIcon,
  title,
  titleEm,
  subtitle,
  primary,
  secondary,
  side,
}: {
  badge: string;
  badgeIcon: React.ComponentType<{ className?: string }>;
  title: string;
  titleEm: string;
  subtitle: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  side: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center h-full py-20 md:py-24">
      <div className="max-w-2xl space-y-6 relative">
        <span className="moon-pill moon-fade-in moon-pulse inline-flex items-center gap-2 px-3 py-1.5 text-xs w-fit">
          <BadgeIcon className="h-3.5 w-3.5 text-sky-300" />
          {badge}
        </span>
        <h1
          className="moon-display moon-fade-up text-5xl md:text-7xl leading-[1.04] text-white"
          style={{ "--moon-delay": "120ms" } as React.CSSProperties}
        >
          <span className="moon-grad-silver">{title}</span>
          <br />
          <span className="moon-grad-text">{titleEm}</span>
        </h1>
        <p
          className="moon-fade-up text-base md:text-lg text-white/75 leading-relaxed max-w-xl"
          style={{ "--moon-delay": "280ms" } as React.CSSProperties}
        >
          {subtitle}
        </p>
        {(primary || secondary) && (
          <div
            className="moon-fade-up flex flex-wrap gap-3 pt-2"
            style={{ "--moon-delay": "420ms" } as React.CSSProperties}
          >
            {primary && (
              <MoonButton asChild size="lg" variant="primary">
                <Link href={primary.href}>
                  {primary.label}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </MoonButton>
            )}
            {secondary && (
              <MoonButton asChild size="lg" variant="secondary">
                <Link href={secondary.href}>{secondary.label}</Link>
              </MoonButton>
            )}
          </div>
        )}
      </div>

      <div
        className="hidden lg:flex items-center justify-center moon-fade-up"
        style={{ "--moon-delay": "320ms" } as React.CSSProperties}
      >
        {side}
      </div>
    </div>
  );
}

const SLIDES: Slide[] = [
  // ─── SLIDE 1 — Cinematic launch (looping starfield video) ──────────────────
  {
    id: "moon-cinematic",
    image:
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=2400&q=80",
    video:
      "https://cdn.pixabay.com/video/2019/10/05/27514-365890423_large.mp4",
    motion: "aurora-particles",
    imageAlt: { ar: "سماء ليلية بالنجوم", en: "Starry night sky" },
    accent: "from-sky-400 to-indigo-500",
    render: (locale, override) => {
      const isAr = locale === "ar";
      const chips = isAr
        ? ["Next.js 16", "تصميم متجاوب", "SEO", "Lighthouse 95+"]
        : ["Next.js 16", "Responsive", "SEO", "Lighthouse 95+"];
      return (
        <SlideContent
          badge={override?.badge ?? (isAr ? "نصمم تجارب من نور القمر" : "Crafted in moonlight")}
          badgeIcon={Sparkles}
          title={override?.title ?? (isAr ? "تجارب رقمية " : "Digital experiences ")}
          titleEm={isAr ? "تتجاوز الخيال." : "beyond imagination."}
          subtitle={
            override?.subtitle ??
            (isAr
              ? "نطلق منتجات لامعة، سريعة، وأنيقة بكل تفصيلة — من فكرة على ورق إلى منصّة يعشقها عملاؤك."
              : "We launch radiant, blazing-fast products refined to the last pixel — from sketch to platform your users love.")
          }
          primary={{
            label: override?.primaryLabel ?? (isAr ? "ابدأ مشروعك" : "Start a project"),
            href: override?.primaryHref ?? "/contact",
          }}
          secondary={{
            label: override?.secondaryLabel ?? (isAr ? "تصفّح الخدمات" : "Browse services"),
            href: override?.secondaryHref ?? "/services",
          }}
          side={
            <div className="relative w-full max-w-md aspect-[4/5]">
              {/* Featured image card */}
              <div className="moon-card moon-card-premium absolute inset-0 p-3">
                <div className="relative h-full w-full moon-image-frame">
                  <Image
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80"
                    alt=""
                    fill
                    sizes="(min-width:1024px) 28rem, 100vw"
                    className="object-cover moon-img-zoom"
                  />
                </div>
                {/* Floating chips */}
                <div className="absolute bottom-6 inset-x-6 flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <span
                      key={c}
                      className="moon-pill px-2.5 py-1 text-[11px] moon-mono backdrop-blur-md bg-black/40"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {/* Floating stat tile */}
              <div className="absolute -bottom-6 -start-6 moon-card moon-card-premium px-4 py-3 flex items-center gap-3 shadow-2xl">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
                  <Rocket className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <p className="moon-grad-text text-xl font-bold">120+</p>
                  <p className="text-[10px] text-white/55 moon-mono uppercase tracking-wider">
                    {isAr ? "مشاريع مُسلَّمة" : "Projects shipped"}
                  </p>
                </div>
              </div>
              {/* Floating play card */}
              <div className="absolute -top-4 -end-4 moon-card moon-card-premium px-3 py-2 flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-sky-300" />
                <p className="text-[11px] text-white/80">
                  {isAr ? "شاهد قصصنا" : "Watch our story"}
                </p>
              </div>
            </div>
          }
        />
      );
    },
  },

  // ─── SLIDE 2 — Performance dashboard (animated grid overlay) ───────────────
  {
    id: "moon-performance",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=2400&q=80",
    motion: "grid",
    imageAlt: { ar: "كود برمجي على شاشة", en: "Source code on a screen" },
    accent: "from-teal-400 to-sky-500",
    render: (locale) => {
      const isAr = locale === "ar";
      const metrics = [
        { label: "LCP", v: 96, hint: "1.1s" },
        { label: "FID", v: 99, hint: "12ms" },
        { label: "CLS", v: 94, hint: "0.02" },
      ];
      return (
        <SlideContent
          badge={isAr ? "أداء يُقاس بالأرقام" : "Performance, measured"}
          badgeIcon={Gauge}
          title={isAr ? "سرعة " : "Speed "}
          titleEm={isAr ? "تشعر بها." : "you can feel."}
          subtitle={
            isAr
              ? "موقعك يفتح فوراً، يتنقّل بسلاسة، ويظهر متّقن على كل جهاز. أداء Lighthouse 95+ من أول إطلاق."
              : "Your site opens instantly, navigates smoothly, looks refined on every device. 95+ Lighthouse scores from day one."
          }
          primary={{ label: isAr ? "اعرف كيف" : "See how", href: "/services" }}
          secondary={{ label: isAr ? "أمثلة حية" : "Live examples", href: "/portfolio" }}
          side={
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="moon-card moon-card-premium p-5 col-span-2 flex items-center gap-5">
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.07)" strokeWidth="8" fill="none" />
                    <circle
                      cx="50" cy="50" r="42"
                      stroke="url(#mhg1)"
                      strokeWidth="8" fill="none" strokeLinecap="round"
                      strokeDasharray={`${(96 / 100) * (2 * Math.PI * 42)} 999`}
                    />
                    <defs>
                      <linearGradient id="mhg1" x1="0" y1="0" x2="1" y2="1">
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
                  <p className="text-[10px] moon-mono uppercase tracking-wider text-white/45">Lighthouse</p>
                  <p className="text-white font-semibold text-lg mt-0.5">
                    {isAr ? "تقييم ممتاز" : "Excellent score"}
                  </p>
                  <p className="text-xs text-white/55 mt-1">
                    {isAr ? "كل المشاريع المُسلَّمة 2025" : "All shipped projects, 2025"}
                  </p>
                </div>
              </div>
              {metrics.map((m) => (
                <div key={m.label} className="moon-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] moon-mono uppercase tracking-wider text-white/45">{m.label}</p>
                    <span className="text-[10px] moon-mono text-emerald-300/90">{m.hint}</span>
                  </div>
                  <p className="moon-num-pop text-2xl font-bold text-white mt-1.5">{m.v}</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="moon-bar h-full rounded-full" style={{ width: `${m.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          }
        />
      );
    },
  },

  // ─── SLIDE 3 — Code craft (live code-rain video) ───────────────────────────
  {
    id: "moon-craft",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=2400&q=80",
    video:
      "https://cdn.pixabay.com/video/2017/12/14/13402-247446677_large.mp4",
    motion: "grid",
    imageAlt: { ar: "محرر كود مظلم", en: "Dark code editor" },
    accent: "from-indigo-400 to-fuchsia-500",
    render: (locale) => {
      const isAr = locale === "ar";
      return (
        <SlideContent
          badge={isAr ? "كود نظيف، صنعة دقيقة" : "Clean code, real craft"}
          badgeIcon={Code2}
          title={isAr ? "ليس مجرد موقع — " : "Not just a site — "}
          titleEm={isAr ? "بنية تدوم." : "an architecture that lasts."}
          subtitle={
            isAr
              ? "TypeScript ، اختبارات تلقائية، CI/CD، ومراجعة كود حقيقية — تستلم منتجاً يسهل تطويره لسنوات قادمة."
              : "TypeScript, automated tests, CI/CD, and real code review — you receive a product you can grow for years."
          }
          primary={{ label: isAr ? "تحدّث مع المهندسين" : "Talk to engineers", href: "/contact" }}
          side={
            <div className="moon-code w-full max-w-lg shadow-[0_30px_60px_-30px_rgba(96,165,250,0.55)]">
              <div className="moon-code-titlebar">
                <span className="moon-code-dot" style={{ background: "#f87171" }} />
                <span className="moon-code-dot" style={{ background: "#fbbf24" }} />
                <span className="moon-code-dot" style={{ background: "#34d399" }} />
                <span className="ms-3 text-[11px] moon-mono text-white/45">~/launch.ts</span>
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
                  {"\n  "}
                  <span className="text-sky-300">const</span>{" "}
                  <span className="text-white">product</span>{" "}
                  <span className="text-white/60">=</span>{" "}
                  <span className="text-sky-300">await</span>{" "}
                  <span className="text-emerald-300">ship</span>
                  <span className="text-white/60">({`{`}</span>
                  {"\n    "}
                  <span className="text-white/85">stack</span>
                  <span className="text-white/60">:</span>{" "}
                  <span className="text-amber-200">&apos;Next.js + PG&apos;</span>
                  <span className="text-white/60">,</span>
                  {"\n    "}
                  <span className="text-white/85">tests</span>
                  <span className="text-white/60">:</span>{" "}
                  <span className="text-pink-300">true</span>
                  <span className="text-white/60">,</span>
                  {"\n    "}
                  <span className="text-white/85">support</span>
                  <span className="text-white/60">:</span>{" "}
                  <span className="text-amber-200">&apos;24/7&apos;</span>
                  <span className="text-white/60">,</span>
                  {"\n  "}
                  <span className="text-white/60">{`});`}</span>
                  {"\n\n  "}
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
          }
        />
      );
    },
  },

  // ─── SLIDE 4 — Trust / testimonial (soft aurora) ───────────────────────────
  {
    id: "moon-trust",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2400&q=80",
    motion: "aurora",
    imageAlt: { ar: "فريق يعمل معاً", en: "Team working together" },
    accent: "from-emerald-400 to-teal-500",
    render: (locale) => {
      const isAr = locale === "ar";
      return (
        <SlideContent
          badge={isAr ? "موثوق من فرق حقيقية" : "Trusted by real teams"}
          badgeIcon={ShieldCheck}
          title={isAr ? "شراكة طويلة، " : "Partnership for the long run, "}
          titleEm={isAr ? "ليست تسليم وانتهى." : "not a drop-and-go."}
          subtitle={
            isAr
              ? "بعد الإطلاق نبقى معك — مراقبة 24/7، تحديثات أمنية فورية، واستجابة خلال دقائق."
              : "After launch we stay with you — 24/7 monitoring, instant security patches, response within minutes."
          }
          primary={{ label: isAr ? "اقرأ آراء العملاء" : "Read client reviews", href: "/contact" }}
          side={
            <div className="moon-card moon-card-premium p-8 max-w-md relative">
              <span className="absolute -top-4 start-6 moon-pill px-2.5 py-1 text-[10px] moon-mono">
                {isAr ? "تقييم العميل" : "Client review"}
              </span>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
                ))}
              </div>
              <p className="text-base md:text-lg text-white/95 leading-relaxed">
                &ldquo;
                {isAr
                  ? "أفضل تعاقد قمنا به هذا العام. الفريق متفهم، النتائج فاقت التوقعات، والدعم بعد الإطلاق ممتاز."
                  : "The best engagement we did this year. They understood us, exceeded expectations, and post-launch support is excellent."}
                &rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className="relative h-11 w-11 rounded-full overflow-hidden ring-2 ring-sky-400/40">
                  <Image
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
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
          }
        />
      );
    },
  },

  // ─── SLIDE 5 — Process steps (rising particles) ────────────────────────────
  {
    id: "moon-process",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2400&q=80",
    motion: "particles",
    imageAlt: { ar: "تخطيط مشروع على لوحة", en: "Project planning on a board" },
    accent: "from-sky-400 to-purple-500",
    render: (locale) => {
      const isAr = locale === "ar";
      const steps = [
        { icon: Sparkles, ar: "اكتشاف", en: "Discover", arDesc: "ورشة استكشاف مجانية", enDesc: "Free scoping workshop" },
        { icon: Layers, ar: "تصميم", en: "Design", arDesc: "نماذج تفاعلية قابلة للنقر", enDesc: "Clickable interactive mockups" },
        { icon: Code2, ar: "تطوير", en: "Build", arDesc: "كود نظيف + اختبارات", enDesc: "Clean code + automated tests" },
        { icon: Rocket, ar: "إطلاق", en: "Launch", arDesc: "دعم 24/7 بعد التسليم", enDesc: "24/7 post-launch support" },
      ];
      return (
        <SlideContent
          badge={isAr ? "عملية واضحة كالقمر" : "Clear as moonlight"}
          badgeIcon={Workflow}
          title={isAr ? "أربع خطوات " : "Four steps "}
          titleEm={isAr ? "من الفكرة للإطلاق." : "from idea to launch."}
          subtitle={
            isAr
              ? "تعرف بالضبط أين نحن في كل لحظة. اجتماعات أسبوعية، عرض تجريبي مباشر، ولا مفاجآت."
              : "You know exactly where we are at any moment. Weekly demos, live previews, no surprises."
          }
          primary={{ label: isAr ? "ابدأ الخطوة 1" : "Start step 1", href: "/contact" }}
          side={
            <div className="w-full max-w-md space-y-3.5">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.en} className="moon-card p-4 flex items-center gap-4 relative">
                    <span className="relative grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-400/30 text-sky-300 shrink-0">
                      <Icon className="h-5 w-5" />
                      <span className="absolute -top-2 -end-2 grid place-items-center h-5 w-5 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-[10px] font-bold text-white shadow">
                        {i + 1}
                      </span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{isAr ? s.ar : s.en}</p>
                      <p className="text-xs text-white/55 mt-0.5">{isAr ? s.arDesc : s.enDesc}</p>
                    </div>
                    <span className="text-[10px] moon-mono text-white/40">0{i + 1}</span>
                  </div>
                );
              })}
            </div>
          }
        />
      );
    },
  },

  // ─── SLIDE 6 — Big stats showcase (earth-from-space loop) ──────────────────
  {
    id: "moon-stats",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=2400&q=80",
    video:
      "https://cdn.pixabay.com/video/2020/02/24/32604-394753636_large.mp4",
    motion: "aurora-particles",
    imageAlt: { ar: "قمر مكتمل في الفضاء", en: "Full moon in space" },
    accent: "from-indigo-400 to-fuchsia-500",
    render: (locale) => {
      const isAr = locale === "ar";
      const stats = [
        { v: "120+", l: isAr ? "مشروع مُسلَّم" : "Projects shipped", icon: Rocket },
        { v: "8", l: isAr ? "سنوات خبرة" : "Years of craft", icon: TrendingUp },
        { v: "98%", l: isAr ? "رضا العملاء" : "Client satisfaction", icon: Star },
        { v: "24/7", l: isAr ? "دعم متاح" : "Support coverage", icon: Zap },
        { v: "12", l: isAr ? "دولة" : "Countries", icon: Globe2 },
      ];
      return (
        <SlideContent
          badge={isAr ? "نتائج تتحدث عنّا" : "Numbers speak"}
          badgeIcon={Cpu}
          title={isAr ? "ثقة بُنيت " : "Trust earned "}
          titleEm={isAr ? "بالأرقام، لا الوعود." : "in numbers, not promises."}
          subtitle={
            isAr
              ? "من شركات ناشئة في بداياتها إلى مؤسسات راسخة — كلهم اختاروا الاستمرار معنا."
              : "From early-stage startups to enterprise leaders — they all chose to keep working with us."
          }
          primary={{ label: isAr ? "اقرأ قصتنا" : "Read our story", href: "/about" }}
          side={
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className={cn(
                      "moon-card moon-card-premium p-5 relative overflow-hidden",
                      i === 0 && "col-span-2"
                    )}
                  >
                    <Icon className="h-4 w-4 text-sky-300" />
                    <p
                      className={cn(
                        "moon-num-pop moon-display moon-grad-text mt-2",
                        i === 0 ? "text-5xl md:text-6xl" : "text-3xl"
                      )}
                    >
                      {s.v}
                    </p>
                    <p className="text-[11px] md:text-xs text-white/60 mt-1.5 moon-mono uppercase tracking-wider">
                      {s.l}
                    </p>
                  </div>
                );
              })}
            </div>
          }
        />
      );
    },
  },
];
