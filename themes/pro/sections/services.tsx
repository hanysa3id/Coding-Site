import { Link } from "@/i18n/routing";
import {
  Code2,
  Palette,
  TrendingUp,
  Share2,
  CloudLightning,
  ShieldAlert,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import type { Service, Category } from "@/types/database";

type Bucket = "build" | "grow" | "maintain";

const KEYWORDS: Record<Bucket, RegExp> = {
  build: /(program|development|code|web|app|mobile|design|ui|ux|graphic|برمج|تصميم|تطوير|موقع|تطبيق|واجهة)/i,
  grow: /(market|seo|social|ads|content|campaign|تسويق|سوشيال|إعلان|محتوى|حمل)/i,
  maintain: /(host|server|infra|support|train|qa|test|maintenance|استضاف|دعم|تدريب|اختبار|صيانة|خادم|بنية)/i,
};

function classify(s: { name_ar: string; name_en: string }, c?: Category): Bucket {
  const haystack = [s.name_ar, s.name_en, c?.name_ar ?? "", c?.name_en ?? ""].join(" ");
  if (KEYWORDS.grow.test(haystack)) return "grow";
  if (KEYWORDS.maintain.test(haystack)) return "maintain";
  return "build";
}

const PILLARS: Record<
  Bucket,
  {
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    color: string;
    glow: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  build: {
    titleAr: "🚀 هندسة وبناء المنتجات (Build)",
    titleEn: "🚀 Build & Engineer",
    descAr: "برمجة وبناء وتصميم الأنظمة والمنصات الرقمية بأقوى البنى الهندسية المعاصرة.",
    descEn: "Building robust backend systems, frontend client apps, and high-converting UI blueprints.",
    color: "from-cyan-500/20 to-blue-500/20",
    glow: "rgba(6, 182, 212, 0.25)",
    icon: Code2,
  },
  grow: {
    titleAr: "📈 تسويق ومضاعفة النمو (Grow)",
    titleEn: "📈 Scale & Grow",
    descAr: "إدارة وتخطيط الحملات الإعلانية ومحركات البحث لزيادة عدد عملائك ومبيعاتك.",
    descEn: "Performance marketing, conversion funnel architecture, ads management, and brand scaling.",
    color: "from-emerald-500/20 to-teal-500/20",
    glow: "rgba(16, 185, 129, 0.25)",
    icon: TrendingUp,
  },
  maintain: {
    titleAr: "🛠 تشغيل وصيانة مستمرة (Maintain)",
    titleEn: "🛠 Support & Maintain",
    descAr: "استضافات سحابية آمنة، اختبارات حقيقية للجودة ودعم فني متواصل 24/7.",
    descEn: "DevOps cloud scaling, QA automation, secure staging audits, and permanent code support.",
    color: "from-amber-500/20 to-orange-500/20",
    glow: "rgba(251, 191, 36, 0.25)",
    icon: CloudLightning,
  },
};

import { resolveSectionContent } from "@/lib/landing/section-resolver";
import type { LandingSettings } from "@/lib/validators/settings";

export function ProServices({
  locale,
  services,
  categories,
  landing,
}: {
  locale: string;
  services: Service[];
  categories: Category[];
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";
  
  const content = resolveSectionContent(landing, "services", locale, {
    title_ar: "خدماتنا الاحترافية",
    title_en: "Full-Suite Capabilities",
    subtitle_ar: "منظومة رقمية شاملة تحت سقف واحد",
    subtitle_en: "Engineering, Growth & Hosting Integrated",
  });

  const defaultServices = [
    {
      id: "ds-1",
      slug: "programming-dev",
      name_ar: "برمجة المواقع والتطبيقات",
      name_en: "Programming & Development",
      short_description_ar: "بناء تطبيقات ويب وتطبيقات هواتف ذكية متكاملة بكود نظيف وسريع.",
      short_description_en: "We code custom responsive web portals and mobile applications from scratch.",
      full_description_ar: null,
      full_description_en: null,
      estimated_price_min: null,
      estimated_price_max: null,
      currency: "USD",
      estimated_duration_days: null,
      cover_image: null,
      thumbnail_url: null,
      video_url: null,
      features_ar: [],
      features_en: [],
      deliverables_ar: [],
      deliverables_en: [],
      timeline_ar: [],
      timeline_en: [],
      seo_title_ar: null,
      seo_title_en: null,
      seo_description_ar: null,
      seo_description_en: null,
      seo_keywords: null,
      is_visible: true,
      is_featured: false,
      category_id: "c-1",
      sort_order: 1,
      created_at: "",
      updated_at: "",
    },
    {
      id: "ds-2",
      slug: "ui-ux-design",
      name_ar: "تصميم واجهات وتجربة المستخدم",
      name_en: "Design & UX/UI",
      short_description_ar: "تصميم واجهات مستخدم مذهلة تركز على تجربة عميل مثالية ومبيعات أعلى.",
      short_description_en: "High-end product visuals and prototypes matching professional modern aesthetics.",
      full_description_ar: null,
      full_description_en: null,
      estimated_price_min: null,
      estimated_price_max: null,
      currency: "USD",
      estimated_duration_days: null,
      cover_image: null,
      thumbnail_url: null,
      video_url: null,
      features_ar: [],
      features_en: [],
      deliverables_ar: [],
      deliverables_en: [],
      timeline_ar: [],
      timeline_en: [],
      seo_title_ar: null,
      seo_title_en: null,
      seo_description_ar: null,
      seo_description_en: null,
      seo_keywords: null,
      is_visible: true,
      is_featured: false,
      category_id: "c-1",
      sort_order: 2,
      created_at: "",
      updated_at: "",
    },
    {
      id: "ds-3",
      slug: "social-media",
      name_ar: "إدارة السوشيال ميديا",
      name_en: "Social Media Management",
      short_description_ar: "إدارة حساباتك وصناعة محتوى إبداعي يربط الجمهور بهويتك.",
      short_description_en: "Social brand storytelling, organic growth calendars, and customer interaction.",
      full_description_ar: null,
      full_description_en: null,
      estimated_price_min: null,
      estimated_price_max: null,
      currency: "USD",
      estimated_duration_days: null,
      cover_image: null,
      thumbnail_url: null,
      video_url: null,
      features_ar: [],
      features_en: [],
      deliverables_ar: [],
      deliverables_en: [],
      timeline_ar: [],
      timeline_en: [],
      seo_title_ar: null,
      seo_title_en: null,
      seo_description_ar: null,
      seo_description_en: null,
      seo_keywords: null,
      is_visible: true,
      is_featured: false,
      category_id: "c-2",
      sort_order: 3,
      created_at: "",
      updated_at: "",
    },
    {
      id: "ds-4",
      slug: "digital-marketing",
      name_ar: "التسويق الرقمي والإعلانات",
      name_en: "Digital Marketing",
      short_description_ar: "إعلانات ممولة مستهدفة وحلول تحسين محركات البحث لضمان تصدرك.",
      short_description_en: "SEO strategies and paid ads management built to scale sales.",
      full_description_ar: null,
      full_description_en: null,
      estimated_price_min: null,
      estimated_price_max: null,
      currency: "USD",
      estimated_duration_days: null,
      cover_image: null,
      thumbnail_url: null,
      video_url: null,
      features_ar: [],
      features_en: [],
      deliverables_ar: [],
      deliverables_en: [],
      timeline_ar: [],
      timeline_en: [],
      seo_title_ar: null,
      seo_title_en: null,
      seo_description_ar: null,
      seo_description_en: null,
      seo_keywords: null,
      is_visible: true,
      is_featured: false,
      category_id: "c-2",
      sort_order: 4,
      created_at: "",
      updated_at: "",
    },
    {
      id: "ds-5",
      slug: "cloud-hosting",
      name_ar: "الاستضافة والبنية التحتية",
      name_en: "Hosting & Infrastructure",
      short_description_ar: "سيرفرات سحابية فائقة السرعة وآمنة تضمن تشغيل موقعك بلا انقطاع.",
      short_description_en: "Enterprise cloud hosting solutions with robust automated backups.",
      full_description_ar: null,
      full_description_en: null,
      estimated_price_min: null,
      estimated_price_max: null,
      currency: "USD",
      estimated_duration_days: null,
      cover_image: null,
      thumbnail_url: null,
      video_url: null,
      features_ar: [],
      features_en: [],
      deliverables_ar: [],
      deliverables_en: [],
      timeline_ar: [],
      timeline_en: [],
      seo_title_ar: null,
      seo_title_en: null,
      seo_description_ar: null,
      seo_description_en: null,
      seo_keywords: null,
      is_visible: true,
      is_featured: false,
      category_id: "c-3",
      sort_order: 5,
      created_at: "",
      updated_at: "",
    },
    {
      id: "ds-6",
      slug: "support-training",
      name_ar: "الدعم الفني والتدريب",
      name_en: "Support & Training",
      short_description_ar: "دعم صيانة مستمر وتدريب لفريقك لضمان التحكم الكامل بمنتجك.",
      short_description_en: "Post-launch training sessions and reliable code maintenance.",
      full_description_ar: null,
      full_description_en: null,
      estimated_price_min: null,
      estimated_price_max: null,
      currency: "USD",
      estimated_duration_days: null,
      cover_image: null,
      thumbnail_url: null,
      video_url: null,
      features_ar: [],
      features_en: [],
      deliverables_ar: [],
      deliverables_en: [],
      timeline_ar: [],
      timeline_en: [],
      seo_title_ar: null,
      seo_title_en: null,
      seo_description_ar: null,
      seo_description_en: null,
      seo_keywords: null,
      is_visible: true,
      is_featured: false,
      category_id: "c-3",
      sort_order: 6,
    },
    {
      id: "ds-7",
      name_ar: "اختبار الجودة والأمان",
      name_en: "Testing & QA Audits",
      short_description_ar: "اختبارات شاملة للموقع وضمان خلوه من الثغرات والأخطاء البرمجية.",
      short_description_en: "Security audits, penetration testing, and software quality checks.",
      is_visible: true,
      category_id: "c-3",
      sort_order: 7,
    },
  ] as Service[];

  const displayServices = services.length > 0 ? services : defaultServices;

  // Group services
  const groups: Record<Bucket, Service[]> = { build: [], grow: [], maintain: [] };
  displayServices.forEach((s) => {
    const cat = categories.find((c) => c.id === s.category_id);
    const bucket = classify(s, cat);
    groups[bucket].push(s);
  });
  return (
    <section id="services" className="relative py-20 overflow-hidden pro-section-reveal pro-anim-fade-up">
      <div className="container mx-auto max-w-7xl px-6 relative">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-xs font-bold tracking-widest text-[color:var(--pro-primary)] uppercase">
            {content.title}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight pro-heading-glow">
            {content.subtitle}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {isAr
              ? "نجمع بين التميز البرمجي، والتصميم الإبداعي، وإستراتيجيات النمو لنبني ونرعى ونطور منصات رقمية متكاملة."
              : "We orchestrate technology, brand design, and data strategies to create, protect, and scale modern web projects."}
          </p>
        </div>

        {/* 3 Pillars Bento/Grid display */}
        <div className="grid gap-8 lg:grid-cols-3">
          {(Object.keys(PILLARS) as Bucket[]).map((bucket) => {
            const pillar = PILLARS[bucket];
            const list = groups[bucket];
            const IconComponent = pillar.icon;

            if (list.length === 0) return null;

            return (
              <div
                key={bucket}
                className="pro-card pro-card-premium pro-service-pillar-card p-8 flex flex-col relative overflow-hidden group border border-white/5"
              >
                {/* SVG Geometric Decor — smaller, stays at corner */}
                <div className="absolute top-0 end-0 opacity-[0.03] text-white pointer-events-none group-hover:opacity-[0.06] transition-all" aria-hidden>
                  <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
                    <circle cx="90" cy="10" r="40" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="20" y1="100" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>

                {/* Icon Header */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center border border-white/10"
                    style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.02), ${pillar.glow})` }}
                  >
                    <IconComponent className="h-6 w-6 text-white pro-pillar-icon" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {bucket}
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="text-start space-y-1 mb-5">
                  <h3 className="text-2xl font-black text-white group-hover:text-[color:var(--pro-primary)] transition-colors">
                    {isAr ? pillar.titleAr : pillar.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr ? pillar.descAr : pillar.descEn}
                  </p>
                </div>

                {/* Child Services */}
                <div className="border-t border-white/5 pt-4 mb-5">
                  <div className="grid gap-2">
                    {list.map((service) => {
                      const desc = isAr ? service.short_description_ar : service.short_description_en;
                      return (
                        <div
                          key={service.id}
                          className="pro-service-card-expand rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-start"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: pillar.glow }} />
                            <span className="text-sm font-bold text-white leading-tight">
                              {isAr ? service.name_ar : service.name_en}
                            </span>
                          </div>
                          {desc && (
                            <div className="pro-service-expand-body">
                              <p className="text-xs text-slate-400 leading-relaxed ps-4 pt-2">{desc}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer link */}
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--pro-primary)] hover:text-white transition-colors mt-auto"
                >
                  {isAr ? "اطلب هذه الباقة" : "Enquire for this track"}
                  <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
