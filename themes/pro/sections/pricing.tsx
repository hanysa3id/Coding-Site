"use client";

import { useState } from "react";
import { Check, HelpCircle, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

export function ProPricing({ locale, landing }: { locale: string; landing?: LandingSettings | null }) {
  const isAr = locale === "ar";
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const content = resolveSectionContent(landing, "pricing", locale, {
    title_ar: "استثمر في منتج رقمي يصنع فارقاً",
    title_en: "Invest in Engineering that Converts",
    subtitle_ar: "خطط وأسعار الباقات",
    subtitle_en: "Transparent Pricing plans",
    description_ar: "اختر الباقة المناسبة لحجم ونشاط عملك، بدون شروط خفية أو تكاليف إضافية غير معلنة.",
    description_en: "Choose the roadmap designed explicitly for your current operations. Zero hidden fees, cancellation policy details.",
  });

  const plans = [
    {
      name: isAr ? "باقة التشغيل والبدء" : "Startup Launch",
      desc: isAr ? "مثالية لإطلاق أول مشروع ويب أو صفحة هبوط لشركتك الناشئة." : "Perfect for launching a custom high-performance landing page or MVP.",
      priceMonthly: 499,
      priceYearly: 399,
      features: [
        isAr ? "تصميم وتطوير صفحة هبوط مخصصة" : "Single-page responsive design & code",
        isAr ? "لوحة تحكم إدارة محتوى مصغرة" : "Sleek CMS control dashboard",
        isAr ? "تهيئة مجانية لأمان SSL وسرعة CDN" : "Free SSL validation & CDN routing",
        isAr ? "دعم فني وتعديلات مجانية لمدة شهر" : "1 month technical maintenance warranty",
        isAr ? "تكامل مباشر مع الواتساب وبوابات الاتصال" : "WhatsApp call-to-action triggers",
      ],
      popular: false,
      ctaLabel: isAr ? "اختر باقة البدء" : "Get Startup Track",
    },
    {
      name: isAr ? "باقة الأعمال والنمو" : "Business Scale",
      desc: isAr ? "منظومة رقمية متكاملة لشركات الخدمات الراغبة بالنمو السريع والتوسع." : "Comprehensive digital systems for expanding agencies and platforms.",
      priceMonthly: 1299,
      priceYearly: 999,
      features: [
        isAr ? "موقع متعدد الصفحات ونظام إدارة محتوى كامل" : "Multi-page dynamic custom architecture",
        isAr ? "تصميمات واجهات مخصصة UX/UI متميزة" : "Advanced custom UX/UI blueprints",
        isAr ? "تكامل بوابات دفع فيزا / ماستر / المحافظ" : "Visa, Card & Wallet payments gateway",
        isAr ? "تحليل وحملات تسويقية SEO وإدارة إعلانات" : "Performance SEO and conversion setup",
        isAr ? "دعم فني وحل مشاكل متواصل لمدة 3 أشهر" : "3 months senior support warranty",
        isAr ? "اختبارات جودة QA وفحص أمان شامل للموقع" : "Automated QA checks & security scans",
      ],
      popular: true,
      ctaLabel: isAr ? "ابدأ باقة النمو" : "Choose Growth Track",
    },
    {
      name: isAr ? "باقة المؤسسات المخصصة" : "Enterprise Custom",
      desc: isAr ? "أنظمة برمجية مصممة خصيصاً لتلبية متطلبات الشركات الكبيرة والمؤسسات." : "Custom architecture engineered to support high enterprise demands.",
      priceMonthly: null,
      priceYearly: null,
      features: [
        isAr ? "برمجة وبناء وتطوير مخصص بنسبة 100%" : "100% custom engineered software code",
        isAr ? "إدارة وتوسيع السيرفرات السحابية DevOps" : "Cloud infrastructure scaling & DevOps support",
        isAr ? "فريق عمل مخصص وتطوير مستمر للمشروع" : "Dedicated senior development squad",
        isAr ? "دعم فني مخصص واتفاقية SLA مضمونة" : "SLA maintenance contract and 24/7 hotline",
        isAr ? "تحليل تسويقي شامل وخطط مضاعفة الأرباح" : "Omnichannel marketing conversion audits",
      ],
      popular: false,
      ctaLabel: isAr ? "احجز استشارة خاصة" : "Book Custom Scoping Session",
    },
  ];

  return (
    <section id="pricing" className="relative py-20 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 relative">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="pro-section-label justify-center">
            {content.subtitle}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight pro-heading-glow">
            {content.title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {content.description}
          </p>

          {/* Billing Switch Toggle */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-xl transition-all ${
                billing === "monthly"
                  ? "bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)] text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isAr ? "الدفع شهرياً" : "Bill Monthly"}
            </button>
            
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-xl transition-all flex items-center gap-1.5 ${
                billing === "yearly"
                  ? "bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)] text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>{isAr ? "الدفع سنوياً" : "Bill Yearly"}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black tracking-normal">
                {isAr ? "توفير 20%" : "Save 20%"}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing plans list cards */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {plans.map((plan, i) => {
            const hasPrice = plan.priceMonthly !== null;
            const activePrice = billing === "yearly" ? plan.priceYearly : plan.priceMonthly;

            return (
              <div
                key={i}
                className={`pro-card p-8 flex flex-col justify-between relative text-start ${
                  plan.popular 
                    ? "pro-pricing-popular border-[color:var(--pro-primary)]/50 shadow-[0_0_40px_rgba(6,182,212,0.1)] bg-slate-950/80" 
                    : "bg-slate-950/40"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                    {isAr ? "الباقة الأكثر اختياراً" : "Most Selected Track"}
                  </span>
                )}

                <div className="space-y-6">
                  {/* Plan details */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {plan.desc}
                    </p>
                  </div>

                  {/* Pricing Rate display */}
                  <div className="py-2 text-start">
                    {hasPrice ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-400">
                          {isAr ? "$" : "$"}
                        </span>
                        <span className="text-4xl md:text-5xl font-black font-mono text-white tracking-tight">
                          {activePrice}
                        </span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider ms-1">
                          {isAr ? "/ شهرياً" : "/ Month"}
                        </span>
                      </div>
                    ) : (
                      <div className="text-3xl font-black text-white tracking-tight leading-none min-h-[3rem] flex items-center">
                        {isAr ? "طلب تسعير مخصص" : "Enterprise Quote"}
                      </div>
                    )}
                  </div>

                  {/* Plan specifications */}
                  <div className="border-t border-white/5 pt-6 space-y-4">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="pro-check-icon h-5 w-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--pro-secondary)] mt-0.5 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-xs text-slate-300 leading-relaxed font-medium">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card footer CTA action */}
                <Link
                  href="/contact"
                  className={`pro-btn mt-8 text-center text-xs font-black tracking-wider uppercase rounded-xl transition-all ${
                    plan.popular
                      ? "pro-btn-primary text-slate-950 font-black hover:opacity-90"
                      : "pro-btn-secondary"
                  }`}
                  style={plan.popular ? { color: "#000" } : {}}
                >
                  {plan.ctaLabel}
                </Link>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
