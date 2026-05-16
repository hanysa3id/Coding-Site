import {
  Sparkles,
  Globe,
  Zap,
  Layers,
  ShieldCheck,
  Clock4,
} from "lucide-react";
import { GlassCard } from "../ui/glass-card";
import { SectionHeading } from "../ui/section-heading";

// Bento grid (6 cells, asymmetric). Inspired by three.tools / n8n.io.
// Each cell mixes icon + headline + body, with one large feature cell
// that gets a stylized visual.

export function AuroraBentoFeatures({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <section className="container py-24 md:py-32 relative">
      <SectionHeading
        kicker={isAr ? "لماذا تختارنا" : "Why work with us"}
        title={isAr ? "كل ما تحتاجه لإطلاق منتجك" : "Everything you need to ship a product"}
        description={
          isAr
            ? "نجمع تحت سقف واحد فريق تطوير، تصميم، DevOps، وتسويق — لتركز أنت على نمو عملك بينما نتولى التنفيذ."
            : "Engineering, design, DevOps, and growth under one roof — so you can focus on the business while we handle the build."
        }
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3 lg:grid-cols-6 lg:grid-rows-2 [&>*]:min-h-[180px]">
        {/* Cell 1 — large feature with stylized visual */}
        <GlassCard className="md:col-span-3 lg:col-span-4 lg:row-span-2 p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-md space-y-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-white/10">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <h3 className="text-xl md:text-2xl font-semibold text-white">
              {isAr ? "تسليم متكامل من البداية للنهاية" : "End-to-end delivery"}
            </h3>
            <p className="text-sm text-white/55 leading-relaxed">
              {isAr
                ? "نأخذ مشروعك من فكرة على ورق إلى منتج منشور — بحث، تصميم، تطوير، اختبار، نشر، ومتابعة بعد الإطلاق."
                : "We take your project from idea to launch — research, design, development, QA, deployment, and post-launch monitoring."}
            </p>
          </div>

          {/* Decorative bento illustration */}
          <div className="pointer-events-none absolute end-6 bottom-4 grid grid-cols-3 gap-2 opacity-90">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="h-12 w-12 rounded-lg border border-white/8"
                style={{
                  background:
                    i === 4
                      ? "linear-gradient(135deg, rgba(139,92,246,0.7), rgba(6,182,212,0.6))"
                      : i % 3 === 0
                      ? "rgba(236,72,153,0.18)"
                      : i % 4 === 0
                      ? "rgba(6,182,212,0.18)"
                      : "rgba(255,255,255,0.03)",
                }}
              />
            ))}
          </div>
        </GlassCard>

        {/* Cell 2 — bilingual */}
        <GlassCard className="md:col-span-3 lg:col-span-2 p-6 space-y-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/10">
            <Globe className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-base font-semibold text-white">
            {isAr ? "عربي وإنجليزي بشكل أصلي" : "Native AR and EN"}
          </h3>
          <p className="text-sm text-white/55">
            {isAr ? "RTL مدروس بعناية في كل تفصيلة" : "RTL handled at every layer, not bolted on"}
          </p>
          <div className="flex items-center gap-2 pt-1 aurora-mono text-[11px]">
            <span className="rounded-md bg-white/5 px-2 py-1 text-white/70">AR</span>
            <span className="h-px flex-1 bg-white/10" />
            <span className="rounded-md bg-white/5 px-2 py-1 text-white/70">EN</span>
          </div>
        </GlassCard>

        {/* Cell 3 — performance */}
        <GlassCard className="md:col-span-1 lg:col-span-2 p-6 space-y-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/10">
            <Zap className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-base font-semibold text-white">
            {isAr ? "أداء فائق" : "Performance-first"}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="aurora-mono text-3xl font-bold aurora-grad-text">95+</span>
            <span className="text-xs text-white/40">Lighthouse</span>
          </div>
        </GlassCard>

        {/* Cell 4 — scale */}
        <GlassCard className="md:col-span-1 lg:col-span-2 p-6 space-y-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/10">
            <Layers className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-base font-semibold text-white">
            {isAr ? "مصمم للنمو" : "Built to scale"}
          </h3>
          <p className="text-sm text-white/55">
            {isAr ? "من 10 إلى 10,000 مستخدم بدون إعادة كتابة" : "From 10 to 10K users without a rewrite"}
          </p>
        </GlassCard>

        {/* Cell 5 — security */}
        <GlassCard className="md:col-span-1 lg:col-span-1 p-6 space-y-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/10">
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-sm font-semibold text-white">
            {isAr ? "أمان من اليوم الأول" : "Secure by design"}
          </h3>
        </GlassCard>

        {/* Cell 6 — SLA */}
        <GlassCard className="md:col-span-1 lg:col-span-1 p-6 space-y-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] border border-white/10">
            <Clock4 className="h-4 w-4 text-white" />
          </span>
          <h3 className="text-sm font-semibold text-white">
            {isAr ? "دعم 24/7" : "24/7 support"}
          </h3>
        </GlassCard>
      </div>
    </section>
  );
}
