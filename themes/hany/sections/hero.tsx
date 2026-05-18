import { Link } from "@/i18n/routing";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { HanyButton } from "../ui/hany-button";
import { resolveHero } from "@/lib/landing/helpers";
import type { LandingSettings } from "@/lib/validators/settings";

export function HanyHero({
  locale,
  landing,
}: {
  locale: string;
  landing: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  const hero = resolveHero(landing, locale, {
    badge: isAr ? "وكالتك الرقمية المتكاملة" : "Your end-to-end digital partner",
    title: isAr
      ? "نحوّل أفكارك إلى منتجات رقمية ناجحة"
      : "We turn your ideas into successful digital products",
    subtitle: isAr
      ? "برمجة، تصميم، استضافة، تسويق، ودعم — كل ما يحتاجه عملك تحت سقف واحد، بفريق محترف وتسليم سريع."
      : "Programming, design, hosting, marketing, and support — everything your business needs under one roof, delivered fast by a senior team.",
    primaryLabel: isAr ? "ابدأ مشروعك" : "Start your project",
    primaryHref: "/contact",
    secondaryLabel: isAr ? "شاهد أعمالنا" : "View portfolio",
    secondaryHref: "/portfolio",
  });

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      <div className="hany-hero-glow" aria-hidden />
      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="hany-chip hany-reveal">
            <Sparkles className="h-3.5 w-3.5" />
            {hero.badge}
          </span>

          <h1
            className="hany-display text-4xl md:text-6xl lg:text-7xl hany-reveal"
            style={{ ["--delay" as string]: "60ms" }}
          >
            <span className="hany-gradient-text">{hero.title}</span>
          </h1>

          <p
            className="text-base md:text-lg text-[color:var(--hany-fg-muted)] leading-relaxed max-w-2xl mx-auto hany-reveal"
            style={{ ["--delay" as string]: "120ms" }}
          >
            {hero.subtitle}
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-3 pt-2 hany-reveal"
            style={{ ["--delay" as string]: "180ms" }}
          >
            <HanyButton asChild size="lg" variant="primary">
              <Link href={hero.primary.href}>
                {hero.primary.label}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </HanyButton>
            <HanyButton asChild size="lg" variant="secondary">
              <Link href={hero.secondary.href}>
                <Play className="h-4 w-4" />
                {hero.secondary.label}
              </Link>
            </HanyButton>
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-[color:var(--hany-fg-subtle)] hany-reveal"
            style={{ ["--delay" as string]: "260ms" }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {isAr ? "متاحون الآن للمشاريع الجديدة" : "Available for new projects"}
            </span>
            <span>{isAr ? "تسليم خلال 14 يوم" : "Delivery in 14 days"}</span>
            <span>{isAr ? "دعم 24/7" : "24/7 support"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
