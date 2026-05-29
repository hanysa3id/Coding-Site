import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, ChevronRight, LayoutTemplate, Layers, Sparkles, 
  BarChart3, ImageIcon, HelpCircle, Megaphone,
  Type, Image as ImageIcon2, MessageSquare, ArrowRight,
  ListChecks, Target, ShieldCheck, Mail
} from "lucide-react";
import Link from "next/link";
import { getActiveThemeId } from "@/themes";
import { getLandingSettings } from "@/lib/settings/get";
import { Badge } from "@/components/ui/badge";

type SectionGroup = {
  id: string;
  titleAr: string;
  titleEn: string;
  items: {
    id: string;
    icon: any;
    ar: string;
    en: string;
    path: string;
    descAr: string;
    descEn: string;
    isComplex?: boolean;
  }[];
};

const SECTION_GROUPS: SectionGroup[] = [
  {
    id: "header",
    titleAr: "الواجهة العلوية",
    titleEn: "Header & Hero",
    items: [
      { id: "hero", icon: Sparkles, ar: "البطل (Hero)", en: "Hero Section", path: "hero", descAr: "العنوان الرئيسي، الأزرار، والخلفية", descEn: "Main headline, CTA buttons, and background" },
      { id: "logo_cloud", icon: ShieldCheck, ar: "شركاء النجاح", en: "Logo Cloud", path: "brands", descAr: "شعارات العملاء والعلامات التجارية", descEn: "Trusted client logos and brands" },
    ]
  },
  {
    id: "core",
    titleAr: "الخدمات والمميزات الأساسية",
    titleEn: "Core Value Proposition",
    items: [
      { id: "services", icon: LayoutTemplate, ar: "باقات الخدمات", en: "Service Pillars", path: "services", descAr: "إدارة وعرض الباقات الثلاث الرئيسية", descEn: "Manage the three main service offerings", isComplex: true },
      { id: "features", icon: Target, ar: "لماذا نحن مختلفون", en: "Features", path: "features", descAr: "بطاقات المميزات التنافسية الأربع", descEn: "The four competitive advantage cards", isComplex: true },
      { id: "process", icon: ListChecks, ar: "منهجية العمل", en: "Process", path: "process", descAr: "خطوات التنفيذ ومنهجية العمل", descEn: "Step-by-step workflow and methodology", isComplex: true },
      { id: "stats", icon: BarChart3, ar: "الإحصائيات", en: "Stats", path: "stats", descAr: "أرقام وإحصائيات النجاح", descEn: "Success metrics and numbers" },
    ]
  },
  {
    id: "social",
    titleAr: "الثقة ومعرض الأعمال",
    titleEn: "Social Proof & Portfolio",
    items: [
      { id: "portfolio", icon: ImageIcon2, ar: "معرض الأعمال", en: "Portfolio", path: "portfolio", descAr: "عنوان ومحتوى قسم الأعمال السابقة", descEn: "Showcase of past projects section text" },
      { id: "testimonials", icon: MessageSquare, ar: "آراء العملاء", en: "Testimonials", path: "testimonials", descAr: "نصوص قسم التقييمات وآراء العملاء", descEn: "Customer reviews and feedback section" },
      { id: "pricing", icon: Layers, ar: "باقات الأسعار", en: "Pricing Plans", path: "pricing", descAr: "إدارة خطط الأسعار والمميزات", descEn: "Manage subscription plans and pricing", isComplex: true },
    ]
  },
  {
    id: "content",
    titleAr: "المحتوى والتفاعل",
    titleEn: "Content & Engagement",
    items: [
      { id: "team", icon: Type, ar: "فريق العمل", en: "Team", path: "team", descAr: "نصوص قسم فريق العمل", descEn: "Team section headings and text" },
      { id: "blog", icon: Type, ar: "المدونة", en: "Blog", path: "blog", descAr: "نصوص قسم المقالات والأخبار", descEn: "Blog and news section headings" },
      { id: "faq", icon: HelpCircle, ar: "الأسئلة الشائعة", en: "FAQ / Common Inquiries", path: "faq", descAr: "نصوص قسم الأسئلة المتكررة", descEn: "Frequently asked questions section" },
    ]
  },
  {
    id: "footer",
    titleAr: "نهاية الصفحة (التحويل)",
    titleEn: "Footer & Conversion",
    items: [
      { id: "newsletter", icon: Mail, ar: "النشرة البريدية", en: "Newsletter", path: "newsletter", descAr: "نصوص الاشتراك في النشرة", descEn: "Mailing list subscription texts" },
      { id: "cta", icon: Megaphone, ar: "دعوة للعمل الأخيرة", en: "Final CTA", path: "cta", descAr: "قسم الدعوة للعمل الأخير قبل التذييل", descEn: "Final call-to-action before the footer" },
    ]
  }
];

export default async function AdminSectionsOverviewPage() {
  await requireAdmin();
  const locale = await getLocale();
  const isAr = locale === "ar";
  const themeId = await getActiveThemeId();
  const landing = await getLandingSettings();
  
  // Count configured overrides
  const overrides = landing?.section_overrides || {};
  const configuredCount = Object.keys(overrides).filter(k => Object.keys(overrides[k] || {}).length > 0).length;
  const totalCount = SECTION_GROUPS.flatMap(g => g.items).length;

  return (
    <div className="space-y-12 pb-10 max-w-7xl mx-auto">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10 p-8 sm:p-10 shadow-sm">
        {/* Decorative Background Pattern (Subtle grid/dots) */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/admin/landing`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-sm hover:bg-muted transition-colors hover:scale-105 active:scale-95"
            >
              {isAr ? <ChevronRight className="h-5 w-5 text-muted-foreground" /> : <ChevronLeft className="h-5 w-5 text-muted-foreground" />}
            </Link>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground flex items-center gap-2">
                  <Layers className="h-8 w-8 text-primary" />
                  {isAr ? "إدارة محتوى الأقسام" : "Sections Content"}
                </h1>
                <p className="text-base text-muted-foreground mt-2 max-w-2xl">
                  {isAr
                    ? "اختر القسم الذي تريد تعديل نصوصه، صوره، أو أزراره. التعديلات التي تقوم بها ستتجاوز النصوص الافتراضية للثيم النشط (CMS)."
                    : "Choose a section to edit its text, images, or buttons. Your overrides will replace the default theme text (CMS)."}
                </p>
              </div>
              
              <div className="flex flex-col gap-2 items-start sm:items-end">
                <Badge variant="outline" className="px-4 py-1.5 bg-background/80 backdrop-blur-sm text-xs font-medium border-primary/20 shadow-sm">
                  {isAr ? "الثيم النشط:" : "Active Theme:"}
                  <span className="text-primary font-bold capitalize ms-1.5">{themeId}</span>
                </Badge>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {configuredCount} / {totalCount} {isAr ? "قسماً مُعدّلاً" : "Sections Configured"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {SECTION_GROUPS.map((group) => (
          <div key={group.id} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1.5 rounded-full bg-primary/80" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground/90">
                {isAr ? group.titleAr : group.titleEn}
              </h2>
              <div className="h-px bg-border flex-1 mx-4" />
            </div>
            
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((s) => {
                const visible = landing?.sections?.[s.id as any] !== false;
                const hasOverride = overrides[s.id] && Object.keys(overrides[s.id]).length > 0;
                
                return (
                  <Link key={s.id} href={`/${locale}/admin/landing/sections/${s.path}`}>
                    <Card className="h-full group relative overflow-hidden bg-background/50 backdrop-blur-sm border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      {/* Decorative gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardContent className="p-6 flex flex-col h-full relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div className={`p-3 rounded-2xl shrink-0 transition-colors duration-300 ${
                            visible 
                              ? (s.isComplex ? "bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500/20" : "bg-primary/10 text-primary group-hover:bg-primary/20")
                              : "bg-muted text-muted-foreground"
                          }`}>
                            <s.icon className="h-6 w-6" strokeWidth={1.5} />
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5 pt-1">
                            {hasOverride && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-medium">
                                {isAr ? "مُعدّل" : "Customized"}
                              </Badge>
                            )}
                            {!visible && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 border-muted-foreground/30 text-muted-foreground bg-muted font-medium">
                                {isAr ? "مخفي" : "Hidden"}
                              </Badge>
                            )}
                            {s.isComplex && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 border-indigo-500/30 text-indigo-600 bg-indigo-500/10 font-medium">
                                {isAr ? "محرر متقدم" : "Advanced"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 flex-1 min-w-0">
                          <h3 className={`font-bold text-lg tracking-tight transition-colors duration-300 ${!visible ? "text-muted-foreground" : "text-foreground group-hover:text-primary"}`}>
                            {isAr ? s.ar : s.en}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {isAr ? s.descAr : s.descEn}
                          </p>
                        </div>
                        
                        <div className="mt-6 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                          <span className="me-2">{isAr ? "تعديل المحتوى" : "Edit Content"}</span>
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
