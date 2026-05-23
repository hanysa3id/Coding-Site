"use client";

import { Zap, ShieldCheck, Cpu, Layers } from "lucide-react";
import { MouseEvent } from "react";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

const defaultFeatures = [
  {
    id: "f1",
    title_ar: "أداء فائق السرعة وبلا انقطاع",
    title_en: "Ultra-Fast Performance",
    description_ar: "مواقع سريعة الاستجابة تحقق أعلى تقييمات في Core Web Vitals لضمان أفضل تجربة للمستخدم وأعلى تصدر بمحركات البحث.",
    description_en: "Engineered for maximum loading speed, passing Core Web Vitals checks out-of-the-box to enhance search ranks.",
    badge_en: "LCP < 1.2s",
    badge_ar: "أقل من ثانية",
    icon_name: "Zap",
  },
  {
    id: "f2",
    title_ar: "بنية هندسية متكاملة",
    title_en: "Clean Code Architecture",
    description_ar: "نعتمد على لغات برمجية حديثة وبنى هندسية مرنة وقابلة للتطوير المستقبلي بيسر.",
    description_en: "Enterprise-grade component mapping built with robust TypeScript modular structures.",
    badge_en: "TypeScript",
    badge_ar: "كود نظيف",
    icon_name: "Cpu",
  },
  {
    id: "f3",
    title_ar: "أمان وحماية قصوى للمعلومات",
    title_en: "Continuous Security Audits",
    description_ar: "نطبق أعلى بروتوكولات الأمان العالمية مع فحوصات واختبارات حية دورية لحماية مشروعك وبيانات عملائك.",
    description_en: "Robust compliance frameworks, standard authentication encryption protocols, and zero data leakage pipelines.",
    badge_en: "SSL Protected",
    badge_ar: "حماية 100%",
    icon_name: "ShieldCheck",
  },
  {
    id: "f4",
    title_ar: "واجهات مرنة وتجربة بصرية فريدة",
    title_en: "Fully Adaptive Cross-Device",
    description_ar: "تصميمات متوافقة ومتجاوبة بنسبة 100% مع كافة الشاشات وأجهزة الهواتف والأجهزة اللوحية لتوفير واجهة مستخدم مريحة.",
    description_en: "Layout scaling optimized automatically for mobile devices, screens, tablets, and high-DPI displays.",
    badge_en: "100% Responsive",
    badge_ar: "متجاوب بالكامل",
    icon_name: "Layers",
  },
];

const ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, ShieldCheck, Cpu, Layers,
};

export function ProFeatures({ locale, landing }: { locale: string; landing?: LandingSettings | null }) {
  const isAr = locale === "ar";

  const content = resolveSectionContent(landing, "features", locale, {
    title_ar: "مواصفات ومعايير الجودة",
    title_en: "core engineering standards",
    items: defaultFeatures,
  });

  const featuresList = content.items?.map((item: any, i: number) => {
    const Icon = ICONS_MAP[item.icon_name] || Zap;
    
    // Maintain the aesthetic styling layout logic based on index
    const gridClass = i === 0 || i === 3 ? "md:col-span-2" : "md:col-span-1";
    
    // Cycle through colors
    const colors = [
      { color: "text-cyan-400", bg: "bg-cyan-400/8", border: "border-cyan-400/20", glow: "rgba(6, 182, 212, 0.15)" },
      { color: "text-purple-400", bg: "bg-purple-400/8", border: "border-purple-400/20", glow: "rgba(168, 85, 247, 0.15)" },
      { color: "text-emerald-400", bg: "bg-emerald-400/8", border: "border-emerald-400/20", glow: "rgba(16, 185, 129, 0.15)" },
      { color: "text-orange-400", bg: "bg-orange-400/8", border: "border-orange-400/20", glow: "rgba(249, 115, 22, 0.15)" },
    ];
    const c = colors[i % colors.length];

    return {
      ...item,
      title: isAr ? item.title_ar : item.title_en,
      desc: isAr ? item.description_ar : item.description_en,
      badge: isAr ? item.badge_ar : item.badge_en,
      icon: Icon,
      gridClass,
      colorClass: c.color,
      bgClass: c.bg,
      borderClass: c.border,
      glowColor: c.glow,
    };
  }) || [];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section id="features" className="relative py-24 bg-[#02040a]/20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pro-dots-bg opacity-15 pointer-events-none" aria-hidden />
      
      <div className="container mx-auto max-w-7xl px-6 relative">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="pro-section-label justify-center">
            {content.title}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight pro-heading-glow">
            {content.subtitle || (isAr ? "لماذا يعتمد القادة والمبتكرون علينا؟" : "Engineered to Win & Scaled to Perform")}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {isAr
              ? "نلتزم بأعلى معايير البرمجة والتصميم والتسويق لنوفر لك تجربة سلسة تركز على تحويل الزوار إلى عملاء حقيقيين."
              : "We don't build standard basic MVPs. We construct high-converting digital setups that position you at the top."}
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid gap-5 md:grid-cols-3">
          {featuresList.map((feat: any) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onMouseMove={handleMouseMove}
                className={`pro-card pro-card-highlight p-8 flex flex-col justify-between relative overflow-hidden group ${feat.gridClass}`}
                style={{ "--feat-glow": feat.glowColor } as React.CSSProperties}
              >
                {/* Animated top indicator bar */}
                <div className="absolute top-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)] group-hover:w-full transition-all duration-700" />

                {/* Corner glow decoration */}
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${feat.glowColor} 0%, transparent 70%)` }}
                />

                <div className="space-y-6 text-start">
                  <div className="flex items-center justify-between">
                    <div className={`pro-icon-box h-12 w-12 ${feat.bgClass} ${feat.colorClass} border ${feat.borderClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/4 border border-white/8 text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                      {feat.badge}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className={`text-xl font-bold text-white group-hover:${feat.colorClass} transition-colors duration-300`}>
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-slate-600 group-hover:text-slate-400 transition-colors">
                  <span className={`h-1 w-1 rounded-full ${feat.colorClass.replace("text-", "bg-")} opacity-60`} />
                  <span>{isAr ? "// معايير الجودة العالمية" : "// World-Class Quality Standards"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
