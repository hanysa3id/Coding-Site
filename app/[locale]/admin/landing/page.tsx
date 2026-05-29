import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { LandingForm } from "./_components/landing-form";
import { getActiveThemeId } from "@/themes";
import { Sparkles, LayoutTemplate } from "lucide-react";

export default async function AdminLandingPage() {
  await requireAdmin();
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data: landingRow } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "landing")
    .maybeSingle();
  const themeId = await getActiveThemeId();

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {isAr ? "إدارة الصفحة الرئيسية" : "Landing Page"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAr
            ? "تحكم في كل قسم من أقسام الواجهة العامة — أظهر/أخفِ الأقسام، عدّل نصوص الـ Hero، أضف بنوداً للقائمة العلوية، وأدر شريط الشركاء والأسئلة الشائعة."
            : "Control every section of the public landing page — toggle section visibility, edit hero copy, add nav items, and curate the client logo strip and FAQ."}
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>
              {isAr ? "Theme النشط حالياً: " : "Active theme: "}
              <span className="font-semibold capitalize">{themeId}</span>
            </span>
          </div>
          <a href={`/${locale}/admin/landing/sections`} className="inline-flex items-center gap-2 rounded-full border bg-violet-500/10 px-3 py-1 text-xs text-violet-600 font-medium hover:bg-violet-500/20 transition-colors">
            <LayoutTemplate className="h-3.5 w-3.5" />
            <span>{isAr ? "محتوى الأقسام (CMS)" : "Section Content (CMS)"}</span>
          </a>
          <a href={`/${locale}/admin/landing/dictionary`} className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs text-primary font-medium hover:bg-primary/20 transition-colors">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isAr ? "إدارة القاموس (النصوص)" : "Global Dictionary"}</span>
          </a>
        </div>
      </header>

      <Card>
        <CardContent className="pt-6">
          <LandingForm
            initial={(landingRow?.value as Record<string, unknown> | null) ?? null}
            locale={locale}
            themeId={themeId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
