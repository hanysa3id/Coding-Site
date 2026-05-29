"use client";

import { ClipboardList, LayoutTemplate, Braces, ShieldAlert, Cloud, LineChart } from "lucide-react";
import { MouseEvent } from "react";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";
import { defaultProcessSteps as defaultSteps } from "@/lib/landing/defaults";

const ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList, LayoutTemplate, Braces, ShieldAlert, Cloud, LineChart,
};

export function ProProcess({ locale, landing }: { locale: string; landing?: LandingSettings | null }) {
  const isAr = locale === "ar";

  const content = resolveSectionContent(landing, "process", locale, {
    title_ar: "دليل التطوير المتكامل",
    title_en: "Roadmap & Method",
    subtitle_ar: "خارطة طريق مدروسة بدقة لنجاح مضمون",
    subtitle_en: "Our Precision Engineering Life-cycle",
    items: defaultSteps,
  });

  const dynamicSteps = (landing?.process_steps && landing.process_steps.length > 0)
    ? landing.process_steps
    : defaultSteps;

  const stepsList = dynamicSteps.map((item: any) => {
    const Icon = ICONS_MAP[item.icon_name] || ClipboardList;
    return {
      title: isAr ? item.title_ar : item.title_en,
      desc: isAr ? item.description_ar : item.description_en,
      icon: Icon,
    };
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section id="process" className="relative py-20 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 relative">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="pro-section-label justify-center">
            {content.title}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight pro-heading-glow">
            {content.subtitle}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {isAr
              ? "نعتمد منهجية رصينة وخطوات واضحة تضمن دقة التفاصيل، سرعة التنفيذ، وحماية أمن بياناتك بالكامل."
              : "A robust engineering process structured explicitly to eliminate bugs, maintain speed, and guarantee scale."}
          </p>
        </div>

        {/* Chronological Timeline path */}
        <div className="relative">
          {/* Vertical central path line */}
          <div className="pro-timeline-line hidden md:block" />

          <div className="space-y-12 md:space-y-0">
            {stepsList.map((step, i) => {
              const StepIcon = step.icon;
              const isEven = i % 2 === 0;

              return (
                <div
                  key={i}
                  className={`grid gap-6 md:grid-cols-2 items-center relative ${
                    isEven ? "md:text-start" : "md:text-end md:flex-row-reverse"
                  }`}
                >
                  
                  {/* Central Node Circle on timeline */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center">
                    <div className="pro-timeline-dot pro-timeline-dot-animate hover:border-[color:var(--pro-secondary)] transition-all">
                      <StepIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Left Column content (Active card text for even, spacer for odd) */}
                  <div className={isEven ? "md:pe-16" : "md:col-start-2 md:ps-16"}>
                    <div
                      onMouseMove={handleMouseMove}
                      className="pro-card pro-card-highlight p-6 border-white/5 bg-slate-950/45 hover:border-[color:var(--pro-primary)]/30 text-start group"
                      style={{ "--feat-glow": "rgba(6, 182, 212, 0.12)" } as React.CSSProperties}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="pro-step-num">{i + 1}</div>
                        <div className="md:hidden h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--pro-primary)]">
                          <StepIcon className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[color:var(--pro-primary)] transition-colors duration-300">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Spacer helper column */}
                  <div className="hidden md:block" />

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
