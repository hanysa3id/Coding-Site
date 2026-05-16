import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PortfolioForm } from "../portfolio-form";

export default async function NewPortfolioPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name_ar, name_en")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "مشروع جديد" : "New project"}</h1>
        <p className="text-muted-foreground">
          {isAr
            ? "أضف مشروعاً جديداً لمعرض الأعمال — املأ التابات بالتفاصيل"
            : "Add a new project to the portfolio — fill in the tabs with details"}
        </p>
      </div>
      <PortfolioForm
        services={(services as { id: string; name_ar: string; name_en: string }[]) ?? []}
        locale={locale}
      />
    </div>
  );
}
