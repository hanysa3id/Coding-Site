import { Link } from "@/i18n/routing";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import type { PortfolioProject } from "@/types/database";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

export function ProPortfolio({
  locale,
  projects,
  landing,
}: {
  locale: string;
  projects: PortfolioProject[];
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  const content = resolveSectionContent(landing, "portfolio", locale, {
    title_ar: "معرض أعمالنا الإبداعية",
    title_en: "Featured Case Studies",
    subtitle_ar: "منتجات رقمية صنعت فارقاً حقيقياً",
    subtitle_en: "Digital Products Engineered to Perform",
  });

  const defaultProjects = [
    {
      id: "dp-1",
      title_ar: "منصة تجارة إلكترونية متطورة",
      title_en: "Next-Gen SaaS E-Commerce Portal",
      description_ar: "منصة تسوق متكاملة سريعة الأداء مع بوابات دفع متنوعة وتوافق تام مع محركات البحث.",
      description_en: "A robust online storefront equipped with checkout routes and search index setups.",
      cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      slug: "saas-ecommerce",
      is_featured: true,
      is_visible: true,
      sort_order: 1,
    },
    {
      id: "dp-2",
      title_ar: "نظام لوحات بيانات التتبع الفوري",
      title_en: "Real-Time Growth Analytics System",
      description_ar: "لوحة تحكم إحصائية متكاملة لربط وتحليل مؤشرات نمو الشركات والمبيعات لحظياً.",
      description_en: "Advanced backend control dashboard visualizing performance indicators and API feeds.",
      cover_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      slug: "growth-analytics",
      is_featured: true,
      is_visible: true,
      sort_order: 2,
    },
    {
      id: "dp-3",
      title_ar: "تطبيق حجز وتوزيع المهام السحابية",
      title_en: "Cloud DevOps Scheduling Application",
      description_ar: "تطبيق هواتف متكامل لإدارة وجدولة مهام الصيانة والمتابعة السيرفرات السحابية.",
      description_en: "Mobile cross-platform system tracking container orchestration tasks and DevOps alerts.",
      cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      slug: "devops-scheduler",
      is_featured: false,
      is_visible: true,
      sort_order: 3,
    },
  ] as PortfolioProject[];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;
  const trackProjects = [...displayProjects, ...displayProjects, ...displayProjects];

  return (
    <section id="portfolio" className="relative py-20 bg-[#02040a]/10 border-b border-white/5 overflow-hidden">
      {/* Decorative gradient orbs behind track */}
      <div
        className="pointer-events-none absolute -top-32 start-1/4 h-72 w-72 rounded-full blur-[120px] opacity-40"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 end-1/4 h-72 w-72 rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)" }}
        aria-hidden
      />

      <div className="container mx-auto max-w-7xl px-6 relative">

        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="pro-section-label justify-center">
            <Sparkles className="h-3 w-3" />
            {content.title}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight pro-heading-glow">
            {content.subtitle}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {isAr
              ? "تصفح مجموعة مختارة من أحدث مشاريعنا حيث دمجنا بين هندسة البرمجيات القوية والتصميم البصري الفاخر."
              : "Explore a hand-picked gallery of our latest builds, scaling systems, and infrastructure deployments."}
          </p>
          <div className="pt-4">
            <Link
              href="/portfolio"
              className="pro-btn pro-btn-secondary inline-flex font-bold hover:text-[color:var(--pro-primary)]"
            >
              {isAr ? "تصفح جميع المشاريع" : "Explore Full Gallery"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* Portfolio Cards — Infinite Marquee (pause on hover) */}
      <div className="pro-portfolio-marquee group/marquee relative w-full">
        <div className="pro-portfolio-track flex gap-6 px-4">
          {trackProjects.map((proj, idx) => {
            const title = isAr ? proj.title_ar : proj.title_en;
            const desc = isAr ? proj.description_ar : proj.description_en;
            const cover =
              proj.cover_image ??
              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";

            return (
              <Link
                key={`${proj.id}-${idx}`}
                href={`/portfolio/${proj.slug}`}
                className="pro-portfolio-card group/card block relative w-[300px] sm:w-[360px] shrink-0"
                aria-hidden={idx >= displayProjects.length ? "true" : undefined}
              >
                <article className="relative h-full overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-slate-900/60 to-slate-950/80 backdrop-blur-md transition-all duration-500 hover:border-[color:var(--pro-primary)]/60 hover:shadow-[0_30px_80px_-20px_rgba(6,182,212,0.45)] hover:-translate-y-2">

                  {/* Cover image with parallax-style zoom */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={cover}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover/card:scale-110"
                      loading="lazy"
                    />

                    {/* Top gradient veil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Featured badge */}
                    {proj.is_featured && (
                      <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-[color:var(--pro-primary)]/15 backdrop-blur-md border border-[color:var(--pro-primary)]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[color:var(--pro-primary)]">
                        <Sparkles className="h-2.5 w-2.5" />
                        {isAr ? "متميز" : "Featured"}
                      </span>
                    )}

                    {/* Hover external-link icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                        <ExternalLink className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3 text-start">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[color:var(--pro-primary)] uppercase">
                      {proj.is_featured
                        ? isAr
                          ? "// مشروع متميز"
                          : "// Featured Work"
                        : isAr
                          ? "// تطوير رقمي"
                          : "// System Build"}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover/card:text-[color:var(--pro-primary)] transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5em]">
                      {desc}
                    </p>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--pro-primary)] group-hover/card:text-white transition-colors pt-2">
                      <span>{isAr ? "اقرأ دراسة الحالة" : "Case Analysis"}</span>
                      <ArrowRight className="h-3 w-3 rtl:rotate-180 transition-transform group-hover/card:translate-x-1 rtl:group-hover/card:-translate-x-1" />
                    </div>
                  </div>

                  {/* Shine overlay on hover */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                    <div className="absolute -inset-x-1 -inset-y-1 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
