import { Link } from "@/i18n/routing";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import { GradientOrbs } from "../ui/gradient-orbs";
import { AuroraButton } from "../ui/aurora-button";
import { BleedSection } from "../ui/section";

// Hero section: floating orbs background, gradient headline, two CTAs,
// and a mock "request a project" terminal card on the side.
export function AuroraHero({
  locale,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  badge,
}: {
  locale: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  badge: string;
}) {
  const isAr = locale === "ar";
  return (
    <BleedSection size="lg" className="overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <GradientOrbs />
      </div>

      <div className="container relative">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Left: copy + CTAs */}
          <div className="space-y-7 max-w-2xl">
            <div className="aurora-fade-up" style={{ "--aurora-delay": "0ms" } as React.CSSProperties}>
              <span className="aurora-pill inline-flex items-center gap-2 px-3 py-1 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                <span className="aurora-mono text-white/80">{badge}</span>
              </span>
            </div>

            <h1
              className="aurora-display aurora-fade-up text-5xl md:text-6xl lg:text-7xl text-white"
              style={{ "--aurora-delay": "80ms" } as React.CSSProperties}
            >
              {title.split("|")[0]}
              {title.includes("|") && (
                <>
                  <br />
                  <span className="aurora-grad-text">{title.split("|")[1]}</span>
                </>
              )}
            </h1>

            <p
              className="aurora-fade-up text-lg md:text-xl text-white/65 leading-relaxed max-w-xl"
              style={{ "--aurora-delay": "160ms" } as React.CSSProperties}
            >
              {subtitle}
            </p>

            <div
              className="aurora-fade-up flex flex-wrap items-center gap-3"
              style={{ "--aurora-delay": "240ms" } as React.CSSProperties}
            >
              <AuroraButton asChild size="lg" variant="primary">
                <Link href={primaryCta.href}>
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </AuroraButton>
              <AuroraButton asChild size="lg" variant="secondary">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </AuroraButton>
            </div>

            {/* Marquee-style trust line */}
            <div
              className="aurora-fade-up pt-6 flex items-center gap-3 text-xs text-white/40"
              style={{ "--aurora-delay": "320ms" } as React.CSSProperties}
            >
              <span className="h-px flex-1 bg-white/10" />
              <span className="aurora-mono whitespace-nowrap">
                {isAr ? "موثوق من 100+ شركة" : "TRUSTED BY 100+ COMPANIES"}
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
          </div>

          {/* Right: terminal-style mock card */}
          <div
            className="aurora-fade-up relative"
            style={{ "--aurora-delay": "320ms" } as React.CSSProperties}
          >
            <div className="aurora-glass rounded-2xl p-1 shadow-2xl">
              <div className="rounded-xl bg-black/40">
                {/* Window chrome */}
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                  </div>
                  <span className="aurora-mono text-[10px] text-white/40">
                    request.json
                  </span>
                  <Terminal className="h-3.5 w-3.5 text-white/30" />
                </div>

                <div className="p-5 aurora-mono text-[13px] leading-7" dir="ltr">
                  <CodeLine n={1} ch={<>{"{"}</>} />
                  <CodeLine n={2} indent={1} ch={
                    <><span className="text-cyan-300">"project"</span><span className="text-white/40">:</span> <span className="text-emerald-300">"E-commerce platform"</span><span className="text-white/40">,</span></>
                  } />
                  <CodeLine n={3} indent={1} ch={
                    <><span className="text-cyan-300">"stack"</span><span className="text-white/40">:</span> <span className="text-white/40">[</span><span className="text-emerald-300">"Next.js"</span><span className="text-white/40">,</span> <span className="text-emerald-300">"Supabase"</span><span className="text-white/40">],</span></>
                  } />
                  <CodeLine n={4} indent={1} ch={
                    <><span className="text-cyan-300">"budget"</span><span className="text-white/40">:</span> <span className="text-amber-300">25000</span><span className="text-white/40">,</span></>
                  } />
                  <CodeLine n={5} indent={1} ch={
                    <><span className="text-cyan-300">"timeline"</span><span className="text-white/40">:</span> <span className="text-emerald-300">"6 weeks"</span><span className="text-white/40">,</span></>
                  } />
                  <CodeLine n={6} indent={1} ch={
                    <><span className="text-cyan-300">"status"</span><span className="text-white/40">:</span> <span className="text-violet-300">"ready_to_ship"</span></>
                  } />
                  <CodeLine n={7} ch={<>{"}"}</>} />
                </div>

                <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between text-[11px]">
                  <span className="text-white/40 aurora-mono">$ npx ship</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-300/90">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="aurora-mono">live</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative side dots */}
            <div
              className="absolute -inset-px -z-10 rounded-3xl opacity-50 blur-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.35), rgba(6,182,212,0.25))",
              }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </BleedSection>
  );
}

function CodeLine({
  n,
  indent = 0,
  ch,
}: {
  n: number;
  indent?: number;
  ch: React.ReactNode;
}) {
  return (
    <div className="flex">
      <span className="w-6 select-none text-end pe-3 text-white/25 tabular-nums">
        {n}
      </span>
      <span style={{ paddingInlineStart: indent * 16 }} className="text-white/80">
        {ch}
      </span>
    </div>
  );
}
