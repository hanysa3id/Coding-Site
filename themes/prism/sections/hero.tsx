"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  Palette,
  Megaphone,
  Sparkles,
  Play,
  Star,
} from "lucide-react";
import { PrismButton } from "../ui/prism-button";
import { PrismMarqueeStrip } from "../ui/prism-marquee";
import { cn } from "@/lib/utils";
import type { LandingSettings } from "@/lib/validators/settings";

const HERO_VIDEO =
  "https://cdn.pixabay.com/video/2024/03/04/202519-919039262_large.mp4";
const HERO_VIDEO_FALLBACK =
  "https://cdn.pixabay.com/video/2020/02/24/32604-394753636_large.mp4";
const HERO_POSTER =
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=2400&q=80";

const FLOATING_THUMBS = [
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=600&q=80",
];

export function PrismHero({
  locale,
  landing,
}: {
  locale: string;
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  const rootRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ x: 50, y: 50 });

  // Update CSS vars for spotlight cursor (only on pointer-fine devices)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    let raf = 0;
    function onMove(e: PointerEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el!.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        el!.style.setProperty("--px", `${x}%`);
        el!.style.setProperty("--py", `${y}%`);
        setCursor({ x, y });
      });
    }
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Build the rendered slide list. Admin-curated `hero_slides` take priority;
  // otherwise the legacy single `hero` block + theme defaults are used as the
  // sole slide.
  type Resolved = {
    badge: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    image: string;
    video?: string;
  };
  const defaults: Resolved = {
    badge: isAr ? "استوديو رقمي شامل" : "Full-stack digital studio",
    titleA: isAr ? "نحن نصمم، نبرمج، " : "We design, we code, ",
    titleB: isAr ? "ونرفع علامتك التجارية." : "we grow brands.",
    subtitle: isAr
      ? "استوديو متكامل من المبرمجين والمصممين والمسوقين. من فكرة على ورق إلى منتج رقمي يحبه آلاف المستخدمين."
      : "A full crew of engineers, designers, and marketers. From sketch to product loved by thousands of users.",
    primaryLabel: isAr ? "ابدأ مشروعك" : "Start a project",
    primaryHref: "/contact",
    secondaryLabel: isAr ? "شاهد أعمالنا" : "See our work",
    secondaryHref: "/portfolio",
    image: HERO_POSTER,
    video: HERO_VIDEO,
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
          // Split user title roughly in half so the second half receives the
          // brand gradient. Themes that want a hard split can put a newline.
          titleA: fullTitle.includes("\n")
            ? fullTitle.split("\n")[0]
            : fullTitle.slice(0, half),
          titleB: fullTitle.includes("\n")
            ? fullTitle.split("\n").slice(1).join(" ")
            : fullTitle.slice(half),
          subtitle: pick(s.subtitle_ar, s.subtitle_en, defaults.subtitle),
          primaryLabel: pick(s.primary_cta_label_ar, s.primary_cta_label_en, defaults.primaryLabel),
          primaryHref: s.primary_cta_href?.trim() || defaults.primaryHref,
          secondaryLabel: pick(
            s.secondary_cta_label_ar,
            s.secondary_cta_label_en,
            defaults.secondaryLabel
          ),
          secondaryHref: s.secondary_cta_href?.trim() || defaults.secondaryHref,
          image: s.image_url?.trim() || defaults.image,
          video: s.video_url?.trim() || undefined,
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
        primaryLabel: pick(
          h?.primary_cta_label_ar,
          h?.primary_cta_label_en,
          defaults.primaryLabel
        ),
        primaryHref: h?.primary_cta_href?.trim() || defaults.primaryHref,
        secondaryLabel: pick(
          h?.secondary_cta_label_ar,
          h?.secondary_cta_label_en,
          defaults.secondaryLabel
        ),
        secondaryHref: h?.secondary_cta_href?.trim() || defaults.secondaryHref,
        image: defaults.image,
        video: defaults.video,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAr, landing]);

  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 8500);
    return () => clearInterval(t);
  }, [slides.length]);

  const active = slides[slideIndex] ?? slides[0];
  const titleA = Array.from(active.titleA);
  const titleB = Array.from(active.titleB);
  const badge = active.badge;
  const subtitle = active.subtitle;
  const primaryLabel = active.primaryLabel;
  const primaryHref = active.primaryHref;
  const secondaryLabel = active.secondaryLabel;
  const secondaryHref = active.secondaryHref;

  return (
    <section
      ref={rootRef}
      className="relative w-full overflow-hidden"
      aria-roledescription="hero"
    >
      <div className="relative h-[760px] md:h-[860px] lg:h-[920px]">
        {/* Background — video when the active slide has one, otherwise image. */}
        {active.video ? (
          <video
            key={`v-${slideIndex}-${active.video}`}
            src={active.video}
            poster={active.image}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover scale-[1.06]"
            onError={(e) => {
              const v = e.currentTarget;
              if (v.src !== HERO_VIDEO_FALLBACK) v.src = HERO_VIDEO_FALLBACK;
            }}
          />
        ) : (
          <Image
            key={`img-${slideIndex}-${active.image}`}
            src={active.image}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            className="object-cover scale-[1.06]"
          />
        )}

        {/* Color washes */}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, rgba(11,11,20,0.55) 0%, rgba(11,11,20,0.78) 60%, rgba(11,11,20,0.98) 100%)",
          }}
        />
        <div
          className="absolute inset-0 mix-blend-color"
          aria-hidden
          style={{
            background:
              "linear-gradient(135deg, rgba(255,43,181,0.55), rgba(124,58,237,0.45) 40%, rgba(0,229,255,0.45) 100%)",
          }}
        />

        {/* Floating colored blobs */}
        <span
          className="prism-blob"
          aria-hidden
          style={{ top: "-6rem", insetInlineStart: "-8rem", width: "28rem", height: "28rem", background: "var(--p-magenta)" }}
        />
        <span
          className="prism-blob"
          aria-hidden
          style={{ top: "30%", insetInlineEnd: "-6rem", width: "24rem", height: "24rem", background: "var(--p-cyan)", animationDelay: "-6s" }}
        />
        <span
          className="prism-blob"
          aria-hidden
          style={{ bottom: "-8rem", insetInlineStart: "30%", width: "22rem", height: "22rem", background: "var(--p-lime)", animationDelay: "-10s" }}
        />

        {/* Spotlight that follows the cursor */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          aria-hidden
          style={{
            background: `radial-gradient(420px 420px at ${cursor.x}% ${cursor.y}%, rgba(255,255,255,0.18), transparent 60%)`,
            mixBlendMode: "overlay",
          }}
        />

        {/* Rising particles */}
        <div className="prism-particles" aria-hidden>
          {Array.from({ length: 22 }).map((_, i) => {
            const left = (i * 47) % 100;
            const dur = 14 + ((i * 5) % 18);
            const delay = (i * 1.7) % 12;
            return (
              <span
                key={i}
                style={{
                  left: `${left}%`,
                  animationDuration: `${dur}s`,
                  animationDelay: `-${delay}s`,
                }}
              />
            );
          })}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full">
          <div className="container h-full grid lg:grid-cols-[1.15fr_1fr] gap-8 items-center py-24 md:py-28">
            <div className="space-y-7 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 prism-fade-in">
                <span className="prism-sticker">
                  <Sparkles className="h-3.5 w-3.5" />
                  {badge}
                </span>
                <span className="prism-sticker is-cyan is-rotate-r">
                  <Star className="h-3.5 w-3.5" />
                  {isAr ? "تقييم 4.9" : "4.9/5 rated"}
                </span>
              </div>

              <h1 className="prism-display text-5xl md:text-7xl lg:text-8xl text-white">
                <span className="block">
                  {titleA.map((c, i) => (
                    <span
                      key={`a-${i}`}
                      className="prism-letter"
                      style={{ ["--i" as string]: i }}
                      aria-hidden
                    >
                      {c === " " ? " " : c}
                    </span>
                  ))}
                </span>
                <span className="block prism-grad-text">
                  {titleB.map((c, i) => (
                    <span
                      key={`b-${i}`}
                      className="prism-letter"
                      style={{ ["--i" as string]: titleA.length + i }}
                      aria-hidden
                    >
                      {c === " " ? " " : c}
                    </span>
                  ))}
                </span>
                <span className="sr-only">
                  {active.titleA}
                  {active.titleB}
                </span>
              </h1>

              <p
                className="prism-fade-up text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed"
                style={{ ["--prism-delay" as string]: "600ms" }}
              >
                {subtitle}
              </p>

              <div
                className="prism-fade-up flex flex-wrap items-center gap-3 pt-2"
                style={{ ["--prism-delay" as string]: "780ms" }}
              >
                <PrismButton asChild size="lg" variant="primary">
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </PrismButton>
                <PrismButton asChild size="lg" variant="secondary">
                  <Link href={secondaryHref}>
                    <Play className="h-4 w-4" />
                    {secondaryLabel}
                  </Link>
                </PrismButton>
              </div>

              {/* Stat row */}
              <div
                className="prism-fade-up flex flex-wrap items-center gap-6 pt-4"
                style={{ ["--prism-delay" as string]: "920ms" }}
              >
                <Stat top="120+" label={isAr ? "مشروع منجز" : "Projects shipped"} />
                <span className="hidden sm:block h-10 w-px bg-white/15" />
                <Stat top="98%" label={isAr ? "رضا العملاء" : "Client satisfaction"} />
                <span className="hidden sm:block h-10 w-px bg-white/15" />
                <Stat top="8" label={isAr ? "سنوات خبرة" : "Years of craft"} />
              </div>
            </div>

            {/* Right column — disciplines cards stacked diagonally */}
            <div
              className="hidden lg:block relative h-[520px] prism-fade-up"
              style={{ ["--prism-delay" as string]: "500ms" }}
            >
              <DisciplineCard
                title={isAr ? "كود" : "Code"}
                desc={isAr ? "Next.js · TypeScript · APIs" : "Next.js · TypeScript · APIs"}
                icon={Code2}
                accent="magenta"
                rotate={-6}
                top="2%"
                start="6%"
                img={FLOATING_THUMBS[0]}
              />
              <DisciplineCard
                title={isAr ? "تصميم" : "Design"}
                desc={isAr ? "هوية · UX · Motion" : "Brand · UX · Motion"}
                icon={Palette}
                accent="cyan"
                rotate={4}
                top="30%"
                start="42%"
                img={FLOATING_THUMBS[1]}
              />
              <DisciplineCard
                title={isAr ? "تسويق" : "Marketing"}
                desc={isAr ? "أداء · محتوى · سوشيال" : "Performance · Content · Social"}
                icon={Megaphone}
                accent="lime"
                rotate={-3}
                top="62%"
                start="12%"
                img={FLOATING_THUMBS[2]}
              />
            </div>
          </div>
        </div>

        {/* Slide controls — only shown when admin provided multiple slides */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setSlideIndex((i) => (i - 1 + slides.length) % slides.length)
              }
              aria-label={isAr ? "السابق" : "Previous"}
              className="absolute start-4 md:start-8 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-12 w-12 rounded-full bg-white/[0.08] border border-white/20 text-white hover:bg-white/[0.18] hover:border-cyan-300/60 backdrop-blur-md transition"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setSlideIndex((i) => (i + 1) % slides.length)}
              aria-label={isAr ? "التالي" : "Next"}
              className="absolute end-4 md:end-8 top-1/2 -translate-y-1/2 z-20 grid place-items-center h-12 w-12 rounded-full bg-white/[0.08] border border-white/20 text-white hover:bg-white/[0.18] hover:border-cyan-300/60 backdrop-blur-md transition"
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
            <div className="absolute bottom-7 inset-x-0 z-20 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlideIndex(i)}
                  aria-label={`${isAr ? "الشريحة" : "Slide"} ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === slideIndex
                      ? "w-12 bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300"
                      : "w-2 bg-white/30 hover:bg-white/55"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Marquee strip pinned under hero */}
      <PrismMarqueeStrip
        items={
          isAr
            ? ["كود نظيف", "تصميم بصري", "تسويق رقمي", "هوية بصرية", "تطبيقات", "نمو"]
            : ["CLEAN CODE", "BOLD DESIGN", "DIGITAL MARKETING", "BRANDING", "APPS", "GROWTH"]
        }
        tone="light"
      />
    </section>
  );
}

function Stat({ top, label }: { top: string; label: string }) {
  return (
    <div>
      <p className="prism-display text-3xl text-white">{top}</p>
      <p className="text-[11px] uppercase tracking-wider text-white/55 prism-mono mt-0.5">{label}</p>
    </div>
  );
}

function DisciplineCard({
  title,
  desc,
  icon: Icon,
  accent,
  rotate,
  top,
  start,
  img,
}: {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "magenta" | "cyan" | "lime";
  rotate: number;
  top: string;
  start: string;
  img: string;
}) {
  const accentClass =
    accent === "magenta"
      ? "is-magenta"
      : accent === "cyan"
      ? "is-cyan"
      : "is-cyan";
  return (
    <div
      className="absolute prism-card-outline w-72 overflow-hidden"
      style={{
        top,
        insetInlineStart: start,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div className="relative h-32 w-full overflow-hidden">
        <Image src={img} alt="" fill sizes="288px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b14] to-transparent" />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className={cn("prism-sticker", accentClass)}>
            <Icon className="h-3.5 w-3.5" />
            {title}
          </span>
          <ArrowUpRight className="h-4 w-4 text-white/55" />
        </div>
        <p className="text-sm text-white/75">{desc}</p>
      </div>
    </div>
  );
}
