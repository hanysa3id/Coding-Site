"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

export function ProNewsletter({ locale, landing }: { locale: string; landing?: LandingSettings | null }) {
  const isAr = locale === "ar";
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const content = resolveSectionContent(landing, "newsletter", locale, {
    title_ar: "اشترك في نشرتنا المعرفية الأسبوعية",
    title_en: "Get Weekly Digital Insights",
    description_ar: "أفكار حصرية ومقالات تقنية وتسويقية يكتبها خبراؤنا مباشرة إلى بريدك الإلكتروني. لا رسائل مزعجة.",
    description_en: "No spam. Only high-fidelity technical writeups, growth tactics, and cloud design patterns.",
    primary_btn_label_ar: "اشترك الآن",
    primary_btn_label_en: "Subscribe",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
  };

  return (
    <section id="newsletter" className="relative py-20 overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6 relative">
        <div className="pro-card p-10 md:p-16 border-white/5 bg-slate-950/70 backdrop-blur-xl relative overflow-hidden text-center group hover:border-[color:var(--pro-primary)]/30">
          
          {/* Subtle glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[color:var(--pro-primary)]/5 blur-3xl pointer-events-none" />

          {/* Connected SVG lines decoration */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <svg width="100%" height="100%">
              <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
              {content.title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              {content.description}
            </p>

            {done ? (
              <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold max-w-sm mx-auto text-sm animate-float">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>
                  {isAr 
                    ? "تم الاشتراك بنجاح! شكراً لثقتك." 
                    : "Subscription successful! Welcome onboard."}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  required
                  placeholder={isAr ? "عنوان بريدك الإلكتروني" : "name@company.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[color:var(--pro-primary)] focus:ring-1 focus:ring-[color:var(--pro-primary)] placeholder-slate-500 transition-all text-start"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-[color:var(--pro-primary)] to-[color:var(--pro-secondary)] flex items-center justify-center gap-2 shrink-0 hover:opacity-90 active:scale-95 transition-all"
                  style={{ color: "#000" }}
                >
                  <span>{content.primary_btn_label}</span>
                  <Send className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
