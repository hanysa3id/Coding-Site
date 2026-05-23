import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import type { BlogPost } from "@/types/database";

type DisplayPost = {
  id: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  cover_image: string | null;
  slug: string;
  published_at: string;
  author_name: string;
  read_time: string;
  category_label: string;
};

const FALLBACK_POSTS: DisplayPost[] = [
  {
    id: "pro-blog-fb-1",
    title_ar: "كيف تختار التقنية المناسبة لموقعك في 2026؟",
    title_en: "Selecting the Optimal Tech Stack in 2026",
    excerpt_ar: "نظرة تفصيلية على محركات الويب الحديثة وحلول السيرفرات السحابية المناسبة لحجم ونشاط مشروعك القادم.",
    excerpt_en: "Deep dive comparison into modern frameworks, edge functions, and server scalability profiles.",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    slug: "selecting-tech-stack",
    published_at: "2026-05-18T10:00:00Z",
    author_name: "Hany A.",
    read_time: "5 Min Read",
    category_label: "Engineering",
  },
  {
    id: "pro-blog-fb-2",
    title_ar: "معايير تصميم واجهات المستخدم عالية التحويل للمبيعات",
    title_en: "Design Guidelines for Higher Sales Conversions",
    excerpt_ar: "شرح علمي مبسط لكيفية استغلال المساحات البيضاء وتوزيع الأزرار لجذب انتباه الزوار وتحويلهم لعملاء.",
    excerpt_en: "Psychological principles of UI design, spacing rules, and optimizing calls-to-action.",
    cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    slug: "higher-sales-design",
    published_at: "2026-05-15T09:00:00Z",
    author_name: "Sara M.",
    read_time: "6 Min Read",
    category_label: "UI/UX Design",
  },
  {
    id: "pro-blog-fb-3",
    title_ar: "الدليل الشامل لتحسين سرعة وأداء السيرفرات السحابية",
    title_en: "Ultimate Guide to Cloud CDN Performance Optimization",
    excerpt_ar: "مجموعة من النصائح العملية والخطوات البرمجية لتقليل زمن استجابة الصفحة لأقل من نصف ثانية.",
    excerpt_en: "Configuring cloud server layers, edge node distributions, and advanced asset compression.",
    cover_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    slug: "cdn-performance-optimization",
    published_at: "2026-05-12T14:30:00Z",
    author_name: "Yousef K.",
    read_time: "8 Min Read",
    category_label: "Cloud Ops",
  },
  {
    id: "pro-blog-fb-4",
    title_ar: "إستراتيجيات التسويق الرقمي الحديث لرفع نسبة التحويل",
    title_en: "Growth Strategies to Double Your Inbound Lead Flow",
    excerpt_ar: "كيفية بناء مسارات تحويل مبيعات تلقائية وإدارة ميزانيات الإعلانات استناداً إلى بيانات الأداء.",
    excerpt_en: "Data-focused marketing hacks, email nurture setups, and custom social tracking setups.",
    cover_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    slug: "double-lead-flow",
    published_at: "2026-05-10T11:00:00Z",
    author_name: "Layla H.",
    read_time: "4 Min Read",
    category_label: "Marketing",
  },
  {
    id: "pro-blog-fb-5",
    title_ar: "أهمية اختبار الجودة التلقائي وأمان المواقع للمؤسسات",
    title_en: "Why Enterprise Scaling Demands Automated Integration QA",
    excerpt_ar: "لماذا يُعد فحص الأخطاء التلقائي خط دفاعك الأول لمنع المشاكل وحماية بيانات شركتك الحساسة.",
    excerpt_en: "Understanding continuous integration test suites, security audits, and preventing downtime.",
    cover_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    slug: "automated-integration-qa",
    published_at: "2026-05-08T08:00:00Z",
    author_name: "Karim R.",
    read_time: "7 Min Read",
    category_label: "Security & QA",
  },
  {
    id: "pro-blog-fb-6",
    title_ar: "تطوير تطبيقات الهواتف بنظام الكود الموحد",
    title_en: "Building Cross-Platform Mobile Applications in 2026",
    excerpt_ar: "مراجعة تقنية شاملة للمزايا والعيوب عند اختيار أطر العمل المشتركة للهواتف الذكية.",
    excerpt_en: "Pros and cons analysis of modern hybrid frameworks versus raw native development cycles.",
    cover_image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    slug: "cross-platform-mobile-builds",
    published_at: "2026-05-05T12:00:00Z",
    author_name: "Nour A.",
    read_time: "5 Min Read",
    category_label: "Mobile Dev",
  },
];

import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

export function ProBlog({
  locale,
  posts,
  landing,
}: {
  locale: string;
  posts: BlogPost[];
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";

  const realPosts: DisplayPost[] = posts.slice(0, 6).map(p => ({
    id: p.id,
    title_ar: p.title_ar,
    title_en: p.title_en,
    excerpt_ar: p.excerpt_ar || "",
    excerpt_en: p.excerpt_en || "",
    cover_image: p.cover_image,
    slug: p.slug,
    published_at: p.published_at ?? new Date().toISOString(),
    author_name: "Pro Admin",
    read_time: "5 Min Read",
    category_label: isAr ? "تقنية" : "Tech",
  }));

  const visiblePosts = realPosts.length >= 6 
    ? realPosts 
    : [...realPosts, ...FALLBACK_POSTS].slice(0, 6);

  const content = resolveSectionContent(landing, "blog", locale, {
    title_ar: "دروس وأفكار تقنية لنساعدك على النمو",
    title_en: "Deep Technical Resources & Guides",
    subtitle_ar: "مدونة المعرفة الرقمية",
    subtitle_en: "Engineering Insights",
    description_ar: "اقرأ أحدث المقالات والتقارير التقنية والتسويقية المكتوبة بواسطة مهندسينا وخبراء النمو لدينا.",
    description_en: "Articles and case breakdowns covering web scalability, UX architecture design, and server security.",
    primary_btn_label_ar: "تصفح كامل المقالات",
    primary_btn_label_en: "View All Resources",
  });

  return (
    <section id="blog" className="relative py-20 bg-[#02040a]/20 border-t border-white/5">
      <div className="container mx-auto max-w-7xl px-6 relative">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="pro-section-label justify-center">
            {content.subtitle}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight pro-heading-glow">
            {content.title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {content.description}
          </p>
          <div className="pt-4">
            <Link
              href="/blog"
              className="pro-btn pro-btn-secondary inline-flex font-bold hover:text-[color:var(--pro-primary)]"
            >
              {content.primary_btn_label}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Blog Post Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => {
            const title = isAr ? post.title_ar : post.title_en;
            const excerpt = isAr ? post.excerpt_ar : post.excerpt_en;
            const dateStr = new Date(post.published_at).toLocaleDateString(
              locale === "ar" ? "ar-EG" : "en-US",
              { year: "numeric", month: "short", day: "numeric" }
            );

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block relative h-full"
              >
                <article className="pro-card overflow-hidden h-full flex flex-col justify-between hover:border-[color:var(--pro-primary)]/40">
                  <div className="space-y-4">
                    {/* Cover image */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                      <img
                        src={post.cover_image ?? "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-slate-950/80 border border-white/5 text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                        {post.category_label}
                      </span>
                    </div>

                    {/* Meta info dates */}
                    <div className="px-6 flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{dateStr}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{post.read_time}</span>
                      </span>
                    </div>

                    {/* Text descriptions */}
                    <div className="px-6 space-y-2 text-start">
                      <h3 className="text-lg font-bold text-white group-hover:text-[color:var(--pro-primary)] transition-colors line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Author and footer */}
                  <div className="p-6 border-t border-white/5 mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {post.author_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-white/5 border border-white/5 text-[color:var(--pro-primary)] group-hover:bg-[color:var(--pro-primary)] group-hover:text-slate-950 transition-all">
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
