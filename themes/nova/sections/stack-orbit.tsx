import { NovaSection } from "../ui/section";
import { NovaButton } from "../ui/nova-button";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";

// "Part of your stack" — circular orbit of tech logos around a center mark.
export function NovaStackOrbit({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const stacks = ["React", "Next.js", "Node", "Supabase", "Stripe", "AWS", "Vercel", "Twilio"];

  return (
    <NovaSection size="lg">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6 max-w-xl">
          <span className="nova-eyebrow">{isAr ? "تكاملات" : "Integrations"}</span>
          <h2 className="nova-display text-3xl md:text-5xl">
            <span className="nova-grad-text">
              {isAr ? "جزء من حزمتك التقنية" : "Part of your stack"}
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/55 leading-relaxed">
            {isAr
              ? "تكاملات أصلية مع الأدوات التي تستخدمها بالفعل — لا حاجة لاستبدال شيء."
              : "Native integrations with the tools you already use — no rip-and-replace required."}
          </p>
          <NovaButton asChild size="lg" variant="primary">
            <Link href="/services">
              {isAr ? "ابدأ الآن" : "Get started"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </NovaButton>
        </div>

        {/* Orbit visual */}
        <div className="relative aspect-square max-w-md mx-auto">
          {/* Concentric rings */}
          <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[14%] rounded-full border border-white/[0.05]" />
          <div className="absolute inset-[28%] rounded-full border border-white/[0.04]" />

          {/* Central N badge */}
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-[0_0_60px_-10px_rgba(139,92,246,0.6)] border border-violet-300/30">
            <span className="text-white text-2xl font-bold">N</span>
          </div>

          {/* Orbiting chips */}
          {stacks.map((s, i) => {
            const angle = (i / stacks.length) * 2 * Math.PI;
            const radius = 44; // % of container
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            return (
              <span
                key={s}
                className="absolute -translate-x-1/2 -translate-y-1/2 nova-card px-3 py-1 text-xs nova-mono text-white/75 whitespace-nowrap"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {s}
              </span>
            );
          })}

          {/* Soft center glow */}
          <div
            className="absolute inset-1/4 rounded-full -z-10"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>
      </div>
    </NovaSection>
  );
}
