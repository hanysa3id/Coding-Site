"use client";

import { useState } from "react";
import { Check, HelpCircle, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";
import { defaultPricingPlans } from "@/lib/landing/defaults";
import { cn } from "@/lib/utils";

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

  const dynamicPlans = (landing?.pricing_plans && landing.pricing_plans.length > 0)
    ? landing.pricing_plans
    : defaultPricingPlans;

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

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-start">
          {dynamicPlans.map((plan, index) => {
            const isPopular = plan.is_popular;
            const name = isAr ? plan.name_ar : plan.name_en;
            const desc = isAr ? plan.description_ar : plan.description_en;
            const priceMonthly = plan.price_monthly;
            const priceYearly = plan.price_yearly;
            const features = isAr ? plan.features_ar : plan.features_en;
            const ctaLabel = isAr ? plan.cta_label_ar : plan.cta_label_en;
            
            return (
              <div
                key={plan.id || index}
                className={cn(
                  "pro-card p-8 flex flex-col justify-between relative text-start",
                  isPopular 
                    ? "pro-card-premium border-[color:var(--pro-primary)]/50 shadow-[0_0_40px_-10px_rgba(6,182,212,0.2)] lg:-mt-4 lg:mb-4 scale-[1.02]" 
                    : "border-white/5 hover:border-white/20"
                )}
              >
                {/* Popular badge */}
                {isPopular && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                    {isAr ? "الباقة الأكثر اختياراً" : "Most Selected Track"}
                  </span>
                )}

                <div className="space-y-6">
                  {/* Plan details */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">
                      {name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {desc}
                    </p>
                  </div>

                  {/* Pricing Rate display */}
                  <div className="py-2 text-start">
                    {(billing === "yearly" ? priceYearly : priceMonthly) !== null ? (
                      <div className="flex items-baseline gap-1" dir="ltr">
                        <span className="text-sm font-bold text-slate-400">
                          {isAr ? "$" : "$"}
                        </span>
                        <span className="text-4xl md:text-5xl font-black font-mono text-white tracking-tight">
                          {billing === "yearly" ? priceYearly : priceMonthly}
                        </span>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider ms-1">
                          {billing === "yearly" ? (isAr ? "/ سنوياً" : "/ Year") : (isAr ? "/ شهرياً" : "/ Month")}
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
                    {features.map((feat, idx) => (
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
                    isPopular
                      ? "pro-btn-primary text-slate-950 font-black hover:opacity-90"
                      : "pro-btn-secondary"
                  }`}
                  style={isPopular ? { color: "#000" } : {}}
                >
                  {ctaLabel}
                </Link>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
