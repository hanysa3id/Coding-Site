"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ComboButton } from "../ui/combo-button";
import { CubeCluster } from "../ui/cube-cluster";
import { cn } from "@/lib/utils";
import type { LandingSettings } from "@/lib/validators/settings";

const POSTER =
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=2400&q=80";

export function ComboHero({
  locale,
  landing,
}: {
  locale: string;
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";

  type Resolved = {
    badge: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  const defaults: Resolved = {
    badge: isAr ? "استوديو هندسي متكامل" : "Full-stack engineering studio",
    titleA: isAr ? "نبني منتجات " : "We build products ",
    titleB: isAr ? "تستحق الإطلاق." : "worth launching.",
    subtitle: isAr
      ? "فريق هندسي يجمع بين البرمجة الدقيقة و التصميم الجريء و التسويق القابل للقياس. من الفكرة الأولى إلى الإصدار الذي يعشقه المستخدمون."
      : "An engineering team that pairs precise code with bold design and measurable marketing. From day-one sketch to the version users love.",
    primaryLabel: isAr ? "ابدأ مشروعك" : "Start a project",
    primaryHref: "/contact",
    secondaryLabel: isAr ? "شاهد أعمالنا" : "See our work",
    secondaryHref: "/portfolio",
  };

  const slides: Resolved[] = useMemo(() => {
    const pick = (
      ar: string | null | undefined,
      en: string | null | undefined,
      fb: string
    ) => {
      const v = (isAr ? ar : en)?.trim();
      return v && v.length > 0 ? v : fb;
    };
    const adminSlides = landing?.hero_slides ?? [];
    if (adminSlides.length > 0) {
      return adminSlides.map((s) => {
        const fullTitle = pick(s.title_ar, s.title_en, defaults.titleA + defaults.titleB);
        const half = Math.ceil(fullTitle.length / 2);
        return {
          badge: pick(s.badge_ar, s.badge_en, defaults.badge),
          titleA: fullTitle.slice(0, half),
          titleB: fullTitle.slice(half),
          subtitle: pick(s.subtitle_ar, s.subtitle_en, defaults.subtitle),
          primaryLabel: pick(s.primary_cta_label_ar, s.primary_cta_label_en, defaults.primaryLabel),
          primaryHref: s.primary_cta_href?.trim() || defaults.primaryHref,
          secondaryLabel: pick(
            s.secondary_cta_label_ar,
            s.secondary_cta_label_en,
            defaults.secondaryLabel
          ),
          secondaryHref: s.secondary_cta_href?.trim() || defaults.secondaryHref,
        };
      });
    }
    const h = landing?.hero;
    return [
      {
        badge: pick(h?.badge_ar, h?.badge_en, defaults.badge),
        titleA: pick(h?.title_ar, h?.title_en, defaults.titleA),
        titleB: defaults.titleB,
        subtitle: pick(h?.subtitle_ar, h?.subtitle_en, defaults.subtitle),
        primaryLabel: pick(h?.primary_cta_label_ar, h?.primary_cta_label_en, defaults.primaryLabel),
        primaryHref: h?.primary_cta_href?.trim() || defaults.primaryHref,
        secondaryLabel: pick(h?.secondary_cta_label_ar, h?.secondary_cta_label_en, defaults.secondaryLabel),
        secondaryHref: h?.secondary_cta_href?.trim() || defaults.secondaryHref,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAr, landing]);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 9000);
    return () => clearInterval(t);
  }, [slides.length]);
  const active = slides[index] ?? slides[0];

  return (
    <section id="hero" className="relative w-full overflow-hidden">
      <div className="combo-stars" aria-hidden />
      {/* Drifting accent orbs */}
      <span
        className="combo-orb"
        aria-hidden
        style={{
          top: "-8rem",
          insetInlineStart: "-6rem",
          width: "30rem",
          height: "30rem",
          background: "radial-gradient(closest-side, rgba(139,92,246,0.55), transparent)",
        }}
      />
      <span
        className="combo-orb"
        aria-hidden
        style={{
          top: "30%",
          insetInlineEnd: "-8rem",
          width: "26rem",
          height: "26rem",
          background: "radial-gradient(closest-side, rgba(236,72,153,0.45), transparent)",
          animationDelay: "-6s",
        }}
      />
      <span
        className="combo-orb"
        aria-hidden
        style={{
          bottom: "-10rem",
          insetInlineStart: "30%",
          width: "22rem",
          height: "22rem",
          background: "radial-gradient(closest-side, rgba(6,182,212,0.40), transparent)",
          animationDelay: "-12s",
        }}
      />

      <div className="container relative pt-20 md:pt-28 pb-24 md:pb-32">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
          {/* ── Text column ────────────────────────────────────────── */}
          <div className="max-w-3xl space-y-6">
            <span className="combo-pill combo-fade-in inline-flex items-center gap-2 px-3 py-1.5 text-xs w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              {active.badge}
            </span>
            <h1
              className="combo-display combo-fade-up text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.02] text-white"
              style={{ ["--combo-delay" as string]: "120ms" }}
            >
              <span>{active.titleA}</span>
              <br />
              <span className="combo-grad-text">{active.titleB}</span>
            </h1>
            <p
              className="combo-fade-up text-base md:text-lg text-white/75 leading-relaxed max-w-2xl"
              style={{ ["--combo-delay" as string]: "260ms" }}
            >
              {active.subtitle}
            </p>
            <div
              className="combo-fade-up flex flex-wrap gap-3 pt-2"
              style={{ ["--combo-delay" as string]: "400ms" }}
            >
              <ComboButton asChild size="lg" variant="primary">
                <Link href={active.primaryHref}>
                  {active.primaryLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </ComboButton>
              <ComboButton asChild size="lg" variant="secondary">
                <Link href={active.secondaryHref}>
                  <PlayCircle className="h-4 w-4" />
                  {active.secondaryLabel}
                </Link>
              </ComboButton>
            </div>

            {/* Trust strip */}
            <div
              className="combo-fade-up pt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/55"
              style={{ ["--combo-delay" as string]: "540ms" }}
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                {isAr ? "كود نظيف بشهادة فريقنا" : "Clean code, code-reviewed"}
              </span>
              <span className="hidden sm:block h-4 w-px bg-white/15" />
              <span className="combo-mono text-xs">
                {isAr ? "120+ مشروع منجز" : "120+ projects shipped"}
              </span>
              <span className="hidden sm:block h-4 w-px bg-white/15" />
              <span className="combo-mono text-xs">98% {isAr ? "رضا" : "satisfaction"}</span>
            </div>
          </div>

          {/* ── 3D scene column ───────────────────────────────────── */}
          <div className="relative flex items-center justify-center min-h-[400px] lg:min-h-[520px]">
            <CubeCluster />
            {/* Floating metric badges around the scene */}
            <FloatingBadge
              top="6%"
              start="0%"
              label={isAr ? "أداء" : "Performance"}
              value="96"
              accent="from-violet-500 to-fuchsia-500"
              delay="700ms"
            />
            <FloatingBadge
              top="18%"
              end="2%"
              label={isAr ? "وقت التحميل" : "LCP"}
              value="1.1s"
              accent="from-cyan-400 to-violet-500"
              delay="850ms"
            />
            <FloatingBadge
              bottom="6%"
              start="6%"
              label={isAr ? "دعم" : "Uptime"}
              value="99.9%"
              accent="from-emerald-400 to-cyan-400"
              delay="1000ms"
            />
          </div>
        </div>
      </div>

      {/* Slide controls (when admin has > 1 slide) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            aria-label={isAr ? "السابق" : "Previous"}
            className="absolute start-4 md:start-8 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-12 w-12 rounded-full bg-white/[0.06] border border-white/15 text-white hover:bg-white/[0.14] backdrop-blur-md transition"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            aria-label={isAr ? "التالي" : "Next"}
            className="absolute end-4 md:end-8 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-12 w-12 rounded-full bg-white/[0.06] border border-white/15 text-white hover:bg-white/[0.14] backdrop-blur-md transition"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>
          <div className="absolute bottom-7 inset-x-0 z-20 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${isAr ? "الشريحة" : "Slide"} ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-12 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300"
                    : "w-2 bg-white/30 hover:bg-white/55"
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Hidden image to ensure the priority image hint exists */}
      <Image src={POSTER} alt="" width={1} height={1} priority className="hidden" />
    </section>
  );
}

function FloatingBadge({
  top,
  bottom,
  start,
  end,
  label,
  value,
  accent,
  delay,
}: {
  top?: string;
  bottom?: string;
  start?: string;
  end?: string;
  label: string;
  value: string;
  accent: string;
  delay: string;
}) {
  return (
    <div
      className="absolute combo-card combo-card-glow is-active combo-fade-up px-4 py-3 flex items-center gap-3 backdrop-blur-md"
      style={{
        top,
        bottom,
        insetInlineStart: start,
        insetInlineEnd: end,
        ["--combo-delay" as string]: delay,
      }}
    >
      <span
        className={cn(
          "h-9 w-9 rounded-xl bg-gradient-to-br grid place-items-center text-white text-xs font-bold shadow-lg",
          accent
        )}
      >
        ✦
      </span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/55 combo-mono">{label}</p>
        <p className="text-base text-white font-bold combo-mono">{value}</p>
      </div>
    </div>
  );
}
