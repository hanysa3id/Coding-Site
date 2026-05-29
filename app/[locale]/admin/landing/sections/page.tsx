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
    <div className="space-y-8 max-w-6xl pb-10">
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/landing`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
          >
            {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Link>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isAr ? "إدارة محتوى الأقسام (CMS)" : "Sections Content (CMS)"}
            </h1>
            <div className="flex items-center gap-3 rtl:mr-auto ltr:ml-auto">
              <Badge variant="outline" className="px-3 py-1 bg-background text-xs font-mono">
                {isAr ? "الثيم النشط: " : "Active Theme: "}
                <span className="text-primary capitalize ms-1">{themeId}</span>
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                {configuredCount} / {totalCount} {isAr ? "مُعدّل" : "Configured"}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-base text-muted-foreground ms-10 max-w-2xl">
          {isAr
            ? "اختر القسم الذي تريد تعديل نصوصه، صوره، أو أزراره. التعديلات التي تقوم بها ستتجاوز النصوص الافتراضية للثيم النشط."
            : "Choose a section to edit its text, images, or buttons. Your overrides will replace the default theme text."}
        </p>
      </header>

      <div className="space-y-10 ms-10">
        {SECTION_GROUPS.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold tracking-tight">
                {isAr ? group.titleAr : group.titleEn}
              </h2>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((s) => {
                const visible = landing?.sections?.[s.id as any] !== false;
                const hasOverride = overrides[s.id] && Object.keys(overrides[s.id]).length > 0;
                
                return (
                  <Link key={s.id} href={`/${locale}/admin/landing/sections/${s.path}`}>
                    <Card className="hover:bg-muted/50 hover:border-primary/30 transition-all h-full group relative overflow-hidden">
                      {/* Decorative gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardContent className="p-5 flex flex-col h-full relative">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            visible 
                              ? (s.isComplex ? "bg-indigo-500/10 text-indigo-500" : "bg-primary/10 text-primary")
                              : "bg-muted text-muted-foreground"
                          }`}>
                            <s.icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3 className={`font-semibold truncate ${!visible && "text-muted-foreground"}`}>
                              {isAr ? s.ar : s.en}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {hasOverride && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 whitespace-nowrap">
                                  {isAr ? "مُعدّل" : "Customized"}
                                </Badge>
                              )}
                              {!visible && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground bg-muted whitespace-nowrap">
                                  {isAr ? "مخفي" : "Hidden"}
                                </Badge>
                              )}
                              {s.isComplex && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-indigo-500/30 text-indigo-600 bg-indigo-500/5 whitespace-nowrap">
                                  {isAr ? "محرر متقدم" : "Advanced"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground leading-relaxed mt-auto">
                          {isAr ? s.descAr : s.descEn}
                        </p>
                        
                        <div className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 rtl:-translate-x-2 rtl:group-hover:translate-x-0">
                          <ArrowRight className="h-4 w-4 text-primary rtl:rotate-180" />
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
