import { Link } from "@/i18n/routing";
import { ArrowRight, Sparkles, MessageCircle, CalendarCheck } from "lucide-react";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

export function ProCta({ locale, landing }: { locale: string; landing?: LandingSettings | null }) {
  const isAr = locale === "ar";

  const content = resolveSectionContent(landing, "cta", locale, {
    title_ar: "هل أنت مستعد لنقل عملك الرقمي للمستوى القادم؟",
    title_en: "Ready to Engineer Your Digital Future?",
    subtitle_ar: "احصل على استشارة مجانية",
    subtitle_en: "Free Scoping Call",
    description_ar: "تحدث مباشرة مع مستشارينا التقنيين لتحديد هيكل ومخطط مشروعك القادم وتفادي الأخطاء البرمجية.",
    description_en: "Schedule a discovery session today. We'll map your requirements, audit security setups, and provide a clear timeline estimate.",
    primary_btn_label_ar: "ابدأ مشروعك الآن",
    primary_btn_label_en: "Launch Your Project",
    secondary_btn_label_ar: "شاهد أعمالنا السابقة",
    secondary_btn_label_en: "Explore Case Studies",
  });

  return (
    <section id="cta" className="relative py-24 overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6 relative text-center">
        <div className="pro-card relative overflow-hidden text-center group">
          
          {/* Aurora animated background */}
          <div className="pro-aurora" aria-hidden />

          {/* Dot particle field */}
          <div className="absolute inset-0 pro-dots-bg opacity-30 pointer-events-none" aria-hidden />
          
          {/* Corner orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[color:var(--pro-primary)]/6 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[color:var(--pro-secondary)]/6 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[color:var(--pro-accent)]/3 blur-3xl pointer-events-none" />

          {/* Connected lines network map SVG decoration overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-1000">
            <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none">
              <circle cx="200" cy="100" r="4" fill="white" />
              <circle cx="600" cy="300" r="4" fill="white" />
              <circle cx="400" cy="200" r="7" fill="white" className="animate-pulse" />
              <circle cx="150" cy="280" r="3" fill="white" />
              <circle cx="680" cy="120" r="3" fill="white" />
              <circle cx="100" cy="180" r="2" fill="white" />
              <circle cx="720" cy="250" r="2" fill="white" />
              
              <path d="M200 100 L400 200 L600 300" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M150 280 L400 200 L680 120" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M200 100 L150 280" stroke="white" strokeWidth="0.5" />
              <path d="M680 120 L600 300" stroke="white" strokeWidth="0.5" />
              <path d="M100 180 L200 100" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
              <path d="M720 250 L600 300" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
          </div>

          <div className="max-w-2xl mx-auto space-y-8 relative z-10 p-10 md:p-20">
            <div className="pro-badge pro-badge-glow mx-auto w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{content.subtitle}</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight pro-heading-glow">
              {content.title}
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
              {content.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="pro-btn pro-btn-primary font-bold text-slate-950 rounded-xl"
                style={{ color: "#000" }}
              >
                <CalendarCheck className="h-4 w-4" />
                <span>{content.primary_btn_label}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/portfolio"
                className="pro-btn pro-btn-secondary font-semibold rounded-xl"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{content.secondary_btn_label}</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {isAr ? "استجابة خلال 24 ساعة" : "Response within 24h"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                {isAr ? "بدون التزامات مسبقة" : "No commitment required"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {isAr ? "استشارة مجانية بالكامل" : "100% free consultation"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
