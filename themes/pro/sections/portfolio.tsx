import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight, ExternalLink } from "lucide-react";
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

  return (
    <section id="portfolio" className="relative py-20 bg-[#02040a]/10 border-b border-white/5">
      <div className="container mx-auto max-w-7xl px-6 relative">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="pro-section-label justify-center">
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

        {/* Portfolio Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayProjects.slice(0, 3).map((proj) => {
            const title = isAr ? proj.title_ar : proj.title_en;
            const desc = isAr ? proj.description_ar : proj.description_en;

            return (
              <Link
                key={proj.id}
                href={`/portfolio/${proj.slug}`}
                className="group block relative"
              >
                <article className="pro-card overflow-hidden h-full flex flex-col hover:border-[color:var(--pro-primary)]/40">
                  
                  {/* Image wrapper */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={proj.cover_image ?? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Visual Hover Tag overlay */}
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                        <ExternalLink className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-start">
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[color:var(--pro-primary)] uppercase">
                        {proj.is_featured ? (isAr ? "// مشروع متميز" : "// Featured Work") : (isAr ? "// تطوير رقمي" : "// System Build")}
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-[color:var(--pro-primary)] transition-colors line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--pro-primary)] group-hover:text-white transition-colors">
                      <span>{isAr ? "اقرأ دراسة الحالة" : "Case Analysis"}</span>
                      <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                    </div>
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
