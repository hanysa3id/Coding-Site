import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, LayoutTemplate, Layers, Sparkles, BarChart3, ImageIcon, HelpCircle, Megaphone } from "lucide-react";
import Link from "next/link";
import { getActiveThemeId } from "@/themes";
import { getLandingSettings } from "@/lib/settings/get";

const SECTIONS = [
  { id: "hero", icon: Sparkles, ar: "البطل (Hero)", en: "Hero", path: "hero", desc: "العنوان، الأزرار، الخلفية" },
  { id: "logo_cloud", icon: Layers, ar: "شعارات العملاء", en: "Logo cloud", path: "brands", desc: "عنوان قسم شركاء النجاح" },
  { id: "features", icon: Layers, ar: "المميزات / Bento", en: "Features / Bento", path: "features", desc: "نصوص ومميزات الخدمة" },
  { id: "stats", icon: BarChart3, ar: "الإحصائيات", en: "Stats", path: "stats", desc: "عناوين الإحصائيات" },
  { id: "services", icon: Layers, ar: "الخدمات", en: "Services", path: "services", desc: "عنوان قسم الخدمات" },
  { id: "process", icon: Layers, ar: "خطوات العمل", en: "Process steps", path: "process", desc: "عنوان وخطوات العمل" },
  { id: "portfolio", icon: ImageIcon, ar: "معرض الأعمال", en: "Portfolio", path: "portfolio", desc: "عنوان معرض الأعمال" },
  { id: "testimonials", icon: HelpCircle, ar: "آراء العملاء", en: "Testimonials", path: "testimonials", desc: "عنوان قسم التقييمات" },
  { id: "pricing", icon: BarChart3, ar: "الأسعار", en: "Pricing", path: "pricing", desc: "عنوان قسم الأسعار" },
  { id: "team", icon: Layers, ar: "فريق العمل", en: "Team", path: "team", desc: "عنوان قسم فريق العمل" },
  { id: "blog", icon: Layers, ar: "المدونة", en: "Blog", path: "blog", desc: "عنوان قسم المقالات" },
  { id: "faq", icon: HelpCircle, ar: "الأسئلة الشائعة", en: "FAQ", path: "faq", desc: "عنوان قسم الأسئلة الشائعة" },
  { id: "newsletter", icon: Megaphone, ar: "النشرة البريدية", en: "Newsletter", path: "newsletter", desc: "نصوص الاشتراك بالنشرة" },
  { id: "cta", icon: Megaphone, ar: "دعوة للعمل", en: "Final CTA", path: "cta", desc: "قسم الدعوة للعمل الأخير" },
];

export default async function AdminSectionsOverviewPage() {
  await requireAdmin();
  const locale = await getLocale();
  const isAr = locale === "ar";
  const themeId = await getActiveThemeId();
  const landing = await getLandingSettings();

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/landing`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
          >
            {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {isAr ? "إدارة محتوى الأقسام (CMS)" : "Sections Content (CMS)"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ms-10">
          {isAr
            ? "اختر القسم الذي تريد تعديل نصوصه، صوره، أو أزراره. سيتم تطبيق التعديلات على الـ Theme النشط."
            : "Choose a section to edit its text, images, or buttons. Changes apply to the active theme."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {SECTIONS.map((s) => {
          const visible = landing?.sections?.[s.id as any] !== false;
          return (
            <Link key={s.id} href={`/${locale}/admin/landing/sections/${s.path}`}>
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${visible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`font-semibold ${!visible && "text-muted-foreground"}`}>
                      {isAr ? s.ar : s.en}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {s.desc}
                    </p>
                    {!visible && (
                      <div className="text-[10px] uppercase text-muted-foreground mt-2 font-medium">
                        {isAr ? "مخفي حالياً" : "Currently hidden"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
