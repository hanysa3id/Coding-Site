import { getLocale } from "next-intl/server";
import { PortfolioForm } from "../portfolio-form";

export default async function NewPortfolioPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "مشروع جديد" : "New project"}</h1>
        <p className="text-muted-foreground">
          {isAr ? "أضف مشروعاً جديداً لمعرض الأعمال" : "Add a new project to the portfolio"}
        </p>
      </div>
      <PortfolioForm locale={locale} />
    </div>
  );
}
