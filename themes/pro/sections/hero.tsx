"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  Sparkles,
  Rocket,
  TrendingUp,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Globe,
} from "lucide-react";
import { resolveHero } from "@/lib/landing/helpers";
import type { LandingSettings } from "@/lib/validators/settings";
import { cn } from "@/lib/utils";

type Slide = {
  badge: string;
  badgeIcon: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  subtitle: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  imageUrl: string;
  techMetrics: { label: string; value: string; color: string; icon?: React.ComponentType<{ className?: string }> }[];
  accentColor: string;
};

const AUTOPLAY_MS = 6000;

export function ProHero({
  locale,
  landing,
}: {
  locale: string;
  landing: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  const [index, setIndex] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const mockupRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const primaryBtnRef = useRef<HTMLAnchorElement>(null);
  const secondaryBtnRef = useRef<HTMLAnchorElement>(null);
  const buttonRafRef = useRef<number | null>(null);

  const handleButtonPointerMove = (btnRef: React.RefObject<HTMLAnchorElement | null>) => (e: React.PointerEvent) => {
    const el = btnRef.current;
    if (!el) return;
    
    const isCoarse = typeof window !== "undefined" && (
      window.matchMedia("(hover: none), (pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    if (isCoarse) return;

    if (buttonRafRef.current) cancelAnimationFrame(buttonRafRef.current);
    buttonRafRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const strength = 0.22;
      const maxPx = 10;
      const x = Math.max(Math.min(dx * strength, maxPx), -maxPx);
      const y = Math.max(Math.min(dy * strength, maxPx), -maxPx);
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    });
  };

  const handleButtonPointerLeave = (btnRef: React.RefObject<HTMLAnchorElement | null>) => () => {
    const el = btnRef.current;
    if (!el) return;
    if (buttonRafRef.current) cancelAnimationFrame(buttonRafRef.current);
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  };

  const heroOverride = resolveHero(landing, locale, {
    badge: isAr ? "شريكك التقني الرقمي للمستقبل" : "Your futuristic tech partner",
    title: isAr
      ? "نبني ونطور منصات رقمية فائقة الأداء والتوسع"
      : "We Engineer High-Performance Digital Platforms",
    subtitle: isAr
      ? "تطوير برمجيات متكاملة، تصميم واجهات مذهلة، استضافة فائقة السرعة، وتسويق رقمي ذكي يضمن ريادتك ومضاعفة عملائك."
      : "A high-end engineering studio designing, coding, launching, and scaling digital services with modern UI/UX and clean systems.",
    primaryLabel: isAr ? "ابدأ مشروعك الآن" : "Launch Your Project",
    primaryHref: "/contact",
    secondaryLabel: isAr ? "استكشف أعمالنا" : "View Portfolio",
    secondaryHref: "/portfolio",
  });

  const defaultSlides: Slide[] = [
    {
      badge: heroOverride.badge,
      badgeIcon: Sparkles,
      accentColor: "var(--pro-primary)",
      title: (
        <>
          {isAr ? "نبني ونطور منصات رقمية" : "We Engineer High-Performance"}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)]">
            {isAr ? "فائقة الأداء والتوسع" : "Digital Platforms"}
          </span>
        </>
      ),
      subtitle: heroOverride.subtitle,
      primary: heroOverride.primary,
      secondary: heroOverride.secondary,
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=90",
      techMetrics: [
        { label: "FCP Speed", value: "0.3s",  color: "text-[color:var(--pro-primary)]",   icon: Zap },
        { label: "INP Score",  value: "10ms",  color: "text-[color:var(--pro-secondary)]", icon: Zap },
        { label: "Uptime",     value: "99.99%",color: "text-[color:var(--pro-accent)]",    icon: Globe },
      ],
    },
    {
      badge: isAr ? "البرمجة والتطوير السحابي" : "Engineering & Cloud Architectures",
      badgeIcon: Rocket,
      accentColor: "var(--pro-secondary)",
      title: (
        <>
          {isAr ? "أطلق خدماتك الرقمية" : "Ship Scalable Systems"}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)]">
            {isAr ? "بكود نظيف وهندسة متكاملة" : "With Clean Architecture"}
          </span>
        </>
      ),
      subtitle: isAr
        ? "تطوير وتصميم مواقع وتطبيقات متكاملة بأقوى التقنيات الحديثة مع فحوصات أمان شاملة ومتابعة مستمرة."
        : "Full-scale application engineering utilizing modern stacks, comprehensive automated QA and rock-solid frameworks.",
      primary: { label: isAr ? "طلب عرض سعر" : "Get Estimate", href: "/contact" },
      secondary: { label: isAr ? "الخدمات" : "Services Map", href: "/services" },
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=90",
      techMetrics: [
        { label: "Engine",      value: "TypeScript", color: "text-[color:var(--pro-primary)]" },
        { label: "QA Pipeline", value: "Automated",  color: "text-[color:var(--pro-secondary)]" },
        { label: "Framework",   value: "Next.js",    color: "text-[color:var(--pro-accent)]" },
      ],
    },
    {
      badge: isAr ? "التسويق ومضاعفة الأرباح" : "Growth & Performance Marketing",
      badgeIcon: TrendingUp,
      accentColor: "var(--pro-accent)",
      title: (
        <>
          {isAr ? "ضاعف عملاءك ومبيعاتك" : "Double Customer Acquisition"}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)]">
            {isAr ? "بخطط وحملات مدروسة" : "Through Analytical Ads"}
          </span>
        </>
      ),
      subtitle: isAr
        ? "نوجه الحملات الإعلانية ونحسن محركات البحث وإدارة السوشيال ميديا بناءً على أرقام حقيقية وتقارير شفافة لتوسيع نشاطك."
        : "Targeted digital marketing campaigns, SEO optimization, and social media funnels built to maximize ROI and scale business metrics.",
      primary: { label: isAr ? "استشر خبيراً" : "Talk to Expert", href: "/contact" },
      secondary: { label: isAr ? "شاهد أعمالنا" : "Case Studies", href: "/portfolio" },
      imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=90",
      techMetrics: [
        { label: "CTR Growth", value: "+240%", color: "text-[color:var(--pro-primary)]" },
        { label: "Leads Rate",  value: "3.5x",  color: "text-[color:var(--pro-secondary)]" },
        { label: "ROI Ratio",   value: "5.8x",  color: "text-[color:var(--pro-accent)]" },
      ],
    },
    {
      badge: isAr ? "الاستضافة والبنية التحتية" : "Infrastructure & Server Monitoring",
      badgeIcon: Wrench,
      accentColor: "var(--pro-primary)",
      title: (
        <>
          {isAr ? "سيرفرات فائقة السرعة" : "High-Availability Infrastructure"}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)]">
            {isAr ? "ودعم فني متواصل 24/7" : "With 24/7 Monitoring"}
          </span>
        </>
      ),
      subtitle: isAr
        ? "استضافات سحابية آمنة ومحمية بالكامل، مع تتبع مستمر للأخطاء ودعم فني صيانة طوال اليوم بلا انقطاع."
        : "Ultra-fast global cloud setups, automated scaling, continuous server monitoring, and professional DevOps support round-the-clock.",
      primary: { label: isAr ? "احجز استضافتك" : "Claim Server Space", href: "/contact" },
      secondary: { label: isAr ? "اتصل بنا" : "Talk Support", href: "/contact" },
      imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=90",
      techMetrics: [
        { label: "CDN Nodes",  value: "120+ Edge", color: "text-[color:var(--pro-primary)]" },
        { label: "DDoS Guard", value: "Active",    color: "text-[color:var(--pro-secondary)]" },
        { label: "Ping Time",  value: "7ms avg",   color: "text-[color:var(--pro-accent)]" },
      ],
    },
  ];

  const displaySlides: Slide[] = landing?.hero_slides && landing.hero_slides.length > 0
    ? landing.hero_slides.map((s, i) => {
        const colors = ["var(--pro-primary)", "var(--pro-secondary)", "var(--pro-accent)", "var(--pro-primary)"];
        const icons = [Sparkles, Rocket, TrendingUp, Wrench];
        return {
          badge: (isAr ? s.badge_ar : s.badge_en) || heroOverride.badge,
          badgeIcon: icons[i % icons.length],
          accentColor: colors[i % colors.length],
          title: (isAr ? s.title_ar : s.title_en) || "Slide Title",
          subtitle: (isAr ? s.subtitle_ar : s.subtitle_en) || heroOverride.subtitle,
          primary: {
            label: (isAr ? s.primary_cta_label_ar : s.primary_cta_label_en) || heroOverride.primary.label,
            href: s.primary_cta_href || heroOverride.primary.href,
          },
          secondary: {
            label: (isAr ? s.secondary_cta_label_ar : s.secondary_cta_label_en) || heroOverride.secondary.label,
            href: s.secondary_cta_href || heroOverride.secondary.href,
          },
          imageUrl: s.image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=90",
          videoUrl: s.video_url || undefined,
          techMetrics: [],
        };
      })
    : defaultSlides;

  const handleNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % displaySlides.length);
    setSlideKey((k) => k + 1);
  }, [displaySlides.length]);

  const handlePrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
    setSlideKey((k) => k + 1);
  }, [displaySlides.length]);

  const goTo = useCallback((i: number) => {
    setIndex(i);
    setSlideKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(handleNext, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [handleNext]);

  // 3D Tilt on mouse move
  useEffect(() => {
    const el = mockupRef.current;
    if (!el) return;

    const parent = el.closest(".pro-3d-stage");

    function handleMouseMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!el) return;
        // Consistent natural 3D tilt tracking user pointer in both RTL/LTR
        const rotY = dx * 8;
        const rotX = -dy * 6;
        el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;

        // Parallax depth translation on floating cards inside the stage
        const floatingCards = parent?.querySelectorAll(".pro-float-card, .pro-float-card-alt");
        floatingCards?.forEach((card) => {
          const cardEl = card as HTMLDivElement;
          const isAlt = cardEl.classList.contains("pro-float-card-alt");
          // Adjust translate scaling coefficients so they move offset from mockup frame
          const factorX = isAlt ? -25 : 25;
          const factorY = isAlt ? -18 : 18;
          const tx = dx * factorX;
          const ty = dy * factorY;
          // Apply translateZ to push it in 3D space with more separation
          cardEl.style.transform = `translate3d(${tx}px, ${ty}px, 50px) rotateX(${-rotX * 0.5}deg) rotateY(${-rotY * 0.5}deg)`;
        });
      });
    }

    function handleMouseLeave() {
      if (!el) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // Snap back to default 3D tilt
      el.style.transform = "";
      el.style.transition = "transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)";
      
      const floatingCards = parent?.querySelectorAll(".pro-float-card, .pro-float-card-alt");
      floatingCards?.forEach((card) => {
        const cardEl = card as HTMLDivElement;
        cardEl.style.transform = "";
        cardEl.style.transition = "transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)";
      });

      setTimeout(() => {
        if (el) el.style.transition = "";
        floatingCards?.forEach((card) => {
          (card as HTMLDivElement).style.transition = "";
        });
      }, 700);
    }

    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove as EventListener);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove as EventListener);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isAr]);

  // Scroll Parallax for background spheres
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const onScroll = () => {
      const scrolled = window.scrollY;
      const orb1 = document.querySelector(".pro-hero-orb-1") as HTMLDivElement;
      const orb2 = document.querySelector(".pro-hero-orb-2") as HTMLDivElement;
      if (orb1) {
        orb1.style.transform = `translateY(${scrolled * 0.12}px) translateZ(0)`;
      }
      if (orb2) {
        orb2.style.transform = `translateY(${scrolled * -0.1}px) translateZ(0)`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = displaySlides[index];
  const BadgeIcon = current.badgeIcon;

  return (
    <section id="hero" className="relative pt-24 md:pt-36 pb-16 overflow-hidden">
      {/* Aurora background layer */}
      <div className="pro-aurora" aria-hidden />

      {/* Dot particle field */}
      <div className="absolute inset-0 pro-dots-bg pointer-events-none opacity-40" aria-hidden />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        <div className="absolute top-[20%] left-[10%] w-2.5 h-2.5 bg-[color:var(--pro-primary)]/20 rounded-full blur-[1px] animate-particle-drift" style={{ animationDuration: "9s", animationDelay: "0s" } as React.CSSProperties} />
        <div className="absolute top-[60%] left-[25%] w-3.5 h-3.5 bg-[color:var(--pro-secondary)]/15 rounded-full blur-[2px] animate-particle-drift" style={{ animationDuration: "12s", animationDelay: "2s" } as React.CSSProperties} />
        <div className="absolute top-[40%] right-[15%] w-2 h-2 bg-[color:var(--pro-accent)]/20 rounded-full blur-[1px] animate-particle-drift" style={{ animationDuration: "10s", animationDelay: "4s" } as React.CSSProperties} />
        <div className="absolute top-[75%] right-[30%] w-3 h-3 bg-[color:var(--pro-primary)]/15 rounded-full blur-[2px] animate-particle-drift" style={{ animationDuration: "14s", animationDelay: "1s" } as React.CSSProperties} />
      </div>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[color:var(--pro-primary)]/10 blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[color:var(--pro-secondary)]/10 blur-[120px] pointer-events-none animate-float-delayed" />

      <div className="container mx-auto max-w-7xl px-6 relative">
        <div className="grid gap-12 lg:grid-cols-12 items-center">

          {/* ── Left: Content Column ─────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-start">

            {/* Badge — entrance d1 */}
            <div className="pro-hero-enter pro-hero-enter-d1 pro-badge pro-badge-glow w-fit">
              <BadgeIcon className="h-3.5 w-3.5" />
              <span key={`badge-${slideKey}`} className="pro-slide-content">{current.badge}</span>
            </div>

            {/* Heading — entrance d2 */}
            <h1
              key={`h1-${slideKey}`}
              className="pro-hero-enter pro-hero-enter-d2 pro-slide-content text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-white pro-heading-glow"
            >
              {current.title}
            </h1>

            {/* Subtitle — entrance d3 */}
            <p
              key={`sub-${slideKey}`}
              className="pro-hero-enter pro-hero-enter-d3 pro-slide-content text-lg text-slate-400 leading-relaxed max-w-xl"
            >
              {current.subtitle}
            </p>

            {/* CTA Buttons — entrance d4 */}
            <div className="pro-hero-enter pro-hero-enter-d4 flex flex-wrap items-center gap-4 pt-2">
              <Link
                ref={primaryBtnRef}
                href={current.primary.href}
                className="pro-btn pro-btn-primary pro-btn-3d pro-magnetic font-bold text-slate-950"
                style={{ color: "#000" }}
                onPointerMove={handleButtonPointerMove(primaryBtnRef)}
                onPointerLeave={handleButtonPointerLeave(primaryBtnRef)}
              >
                {current.primary.label}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                ref={secondaryBtnRef}
                href={current.secondary.href}
                className="pro-btn pro-btn-secondary pro-btn-3d pro-magnetic font-semibold"
                onPointerMove={handleButtonPointerMove(secondaryBtnRef)}
                onPointerLeave={handleButtonPointerLeave(secondaryBtnRef)}
              >
                {current.secondary.label}
              </Link>
            </div>

            {/* Slide Nav + Progress — entrance d5 */}
            <div className="pro-hero-enter pro-hero-enter-d5 flex items-center gap-3 pt-4">
              <button
                onClick={handlePrev}
                aria-label={isAr ? "السابق" : "Previous Slide"}
                className="pro-nav-arrow flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white"
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>

              <div className="flex items-center gap-2">
                {displaySlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={cn(
                      "rounded-full transition-all duration-500",
                      index === i
                        ? "h-2 w-8 bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)] shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                        : "h-1.5 w-2 bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                aria-label={isAr ? "التالي" : "Next Slide"}
                className="pro-nav-arrow flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white"
              >
                <ChevronRight className="h-5 w-5 rtl:rotate-180" />
              </button>

              {/* Live indicator */}
              <div className="ms-2 flex items-center gap-2 text-[11px] text-slate-500 font-medium tracking-wide">
                <span className="pro-live-dot" />
                <span>{isAr ? "مباشر" : "Live"}</span>
              </div>
            </div>

          </div>

          {/* ── Right: 3D Visual Showcase ─────────────────────────────────── */}
          <div className="lg:col-span-5 relative w-full max-w-lg mx-auto lg:mx-0">

            {/* Orbs behind mockup */}
            <div className="pro-hero-orb-1 top-[-60px] left-[-40px]" aria-hidden />
            <div className="pro-hero-orb-2 bottom-[-40px] right-[-30px]" aria-hidden />

            {/* 3D Stage container — catches mouse for tilt */}
            <div className="pro-3d-stage pro-hero-enter pro-hero-enter-d6">

              {/* ── Main Mockup Frame ─────────────────────────────────────── */}
              <div
                ref={mockupRef}
                className="pro-hero-mockup-3d pro-mockup-glow-pulse rounded-[22px] border border-white/10 bg-slate-950/70 p-2.5 backdrop-blur-md"
              >
                {/* Browser chrome header */}
                <div className="flex items-center justify-between px-3 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Slide progress bar */}
                    <div className="w-28 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div key={`progress-${slideKey}`} className="pro-slide-progress" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-wider">
                      https://pro.agency
                    </div>
                  </div>
                </div>

                {/* Image Canvas — depth layer 1 */}
                <div className="pro-depth-layer-1 relative aspect-[4/3] rounded-[14px] overflow-hidden bg-slate-900 mt-2.5 pro-image-scan">
                  <img
                    key={`img-${slideKey}`}
                    src={current.imageUrl}
                    alt="Hero Mockup Visualization"
                    className="w-full h-full object-cover animate-ken-burns"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Color accent overlay matching slide */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen"
                    style={{ background: `radial-gradient(ellipse at 50% 120%, ${current.accentColor}, transparent 70%)` }}
                  />

                  {/* ── Metric Chips — depth layer 2 ───────────────────── */}
                  <div className="pro-depth-layer-2 absolute bottom-3 inset-x-3 grid grid-cols-3 gap-1.5">
                    {current.techMetrics.map((metric, i) => (
                      <div
                        key={`${slideKey}-${i}`}
                        className="pro-metric-chip rounded-xl p-2 text-center"
                      >
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">
                          {metric.label}
                        </div>
                        <div className={cn("text-[11px] font-black font-mono leading-none", metric.color)}>
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* ── Floating Card — Top Right ─────────────────────────── */}
              <div
                className="absolute -top-5 -right-5 pro-float-card pro-glass-panel rounded-2xl p-3 flex items-center gap-2.5 pointer-events-none z-20"
                aria-hidden
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center border flex-shrink-0"
                  style={{
                    background: "rgba(6,182,212,0.12)",
                    borderColor: "rgba(6,182,212,0.25)",
                    boxShadow: "0 0 16px rgba(6,182,212,0.2)",
                    color: "var(--pro-primary)",
                  }}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-start">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                    {isAr ? "التحقق والأمان" : "Verified Safe"}
                  </div>
                  <div className="text-xs font-black text-white mt-0.5 leading-none">
                    {isAr ? "مضمون 100%" : "ISO Secure Certified"}
                  </div>
                </div>
              </div>

              {/* ── Floating Card — Bottom Left ───────────────────────── */}
              <div
                className="absolute -bottom-5 -left-5 pro-float-card-alt pro-glass-panel rounded-2xl p-3 flex items-center gap-2.5 pointer-events-none z-20"
                aria-hidden
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center border flex-shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    borderColor: "rgba(16,185,129,0.25)",
                    boxShadow: "0 0 16px rgba(16,185,129,0.2)",
                    color: "var(--pro-secondary)",
                  }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="text-start">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                    {isAr ? "مستوى الرضا" : "Client Success"}
                  </div>
                  <div className="text-xs font-black text-white mt-0.5 leading-none">
                    {isAr ? "4.9/5 نجوم" : "4.9/5 Review Score"}
                  </div>
                </div>
              </div>

            </div>{/* /pro-3d-stage */}
          </div>

        </div>
      </div>
    </section>
  );
}
