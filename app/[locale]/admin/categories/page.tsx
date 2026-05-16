import { listAllCategoriesForAdmin } from "@/lib/queries/services";
import { getLocale } from "next-intl/server";
import { CategoriesTable } from "./categories-table";

export default async function AdminCategoriesPage() {
  const locale = await getLocale();
  const categories = await listAllCategoriesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {locale === "ar" ? "الأقسام" : "Categories"}
          </h1>
          <p className="text-muted-foreground">
            {locale === "ar"
              ? "إدارة أقسام الخدمات الهرمية"
              : "Manage hierarchical service categories"}
          </p>
        </div>
      </div>

      <CategoriesTable categories={categories} locale={locale} />
    </div>
  );
}
