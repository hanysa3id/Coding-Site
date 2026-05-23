"use client";

import { useEffect, useState, useRef } from "react";

function CounterReveal({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  const [isCounting, setIsCounting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          startCounting();
        } else {
          // Reset when out of view so it replays on re-entry
          setDisplayValue("0");
          setIsCounting(false);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const startCounting = () => {
    setIsCounting(true);
    const regex = /(\d+(?:\.\d+)?)/g;
    const matches = value.match(regex);

    if (!matches) {
      setDisplayValue(value);
      setIsCounting(false);
      return;
    }

    const duration = 2000; // 2s as requested
    const startTime = performance.now();
    const targets = matches.map(Number);

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutCubic(progress);

      let index = 0;
      const currentText = value.replace(regex, () => {
        const target = targets[index++];
        const hasDecimals = value.includes(".") && target % 1 !== 0;
        return (target * easeProgress).toFixed(hasDecimals ? 1 : 0);
      });

      setDisplayValue(currentText);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        setIsCounting(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <span ref={ref} className={isCounting ? "pro-stat-counting" : ""}>
      {displayValue}
    </span>
  );
}

function TypewriterLabel({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayText(text);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasRun) {
          setHasRun(true);
          let index = 0;
          const interval = setInterval(() => {
            setDisplayText(text.slice(0, index + 1));
            index++;
            if (index >= text.length) {
              clearInterval(interval);
            }
          }, 35);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [text, hasRun]);

  return <span ref={ref}>{displayText}</span>;
}

import type { LandingSettings, LandingStatItem } from "@/lib/validators/settings";

export function ProStats({
  locale,
  customStats,
  landing,
}: {
  locale: string;
  customStats: LandingStatItem[];
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";

  const defaultStats = [
    { value: "99.9%", label_ar: "معدل تشغيل السيرفرات", label_en: "Average Uptime Speed" },
    { value: "+240%", label_ar: "متوسط زيادة مبيعات عملائنا", label_en: "Average Client ROI Gain" },
    { value: "150+", label_ar: "منتج رقمي مكتمل", label_en: "Digital Assets Deployed" },
    { value: "24/7", label_ar: "متابعة ودعم فني", label_en: "Active Support Lane" },
  ];

  const displayStats = customStats.length > 0 
    ? customStats.map(s => ({
        value: s.value,
        label_ar: s.label_ar,
        label_en: s.label_en
      }))
    : defaultStats;

  return (
    <section id="stats" className="relative py-16 bg-[#02040a]/40 border-y border-white/5 overflow-hidden pro-section-reveal pro-anim-fade-up">
      {/* Subtle dot grid background */}
      <div className="absolute inset-0 pro-dots-bg opacity-20 pointer-events-none" aria-hidden />
      
      <div className="container mx-auto max-w-7xl px-6 relative">
        <div className="grid gap-0 grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
          {displayStats.map((stat, i) => (
            <div
              key={i}
              className="p-6 md:p-10 text-center space-y-2 relative group"
            >
              {/* Subtle glow center backdrop on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--pro-primary)]/5 to-transparent rounded-2xl scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 pointer-events-none" />

              <div className="pro-stat-value text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)] font-mono tracking-tight select-none">
                <CounterReveal value={stat.value} />
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                <TypewriterLabel text={isAr ? stat.label_ar : stat.label_en} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
