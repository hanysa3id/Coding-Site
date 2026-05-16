import { listAllCategoriesForAdmin } from "@/lib/queries/services";
import { getLocale } from "next-intl/server";
import { CategoriesTable } from "./categories-table";
import { CsvPanel } from "@/components/admin/csv-panel";
import {
  exportCategoriesAction,
  importCategoriesAction,
  templateCategoriesAction,
} from "./csv-actions";

export default async function AdminCategoriesPage() {
  const locale = await getLocale();
  const categories = await listAllCategoriesForAdmin();
  const isAr = locale === "ar";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAr ? "الأقسام" : "Categories"}
          </h1>
          <p className="text-muted-foreground">
            {isAr
              ? "إدارة أقسام الخدمات الهرمية"
              : "Manage hierarchical service categories"}
          </p>
        </div>
      </div>

      <CsvPanel
        resourceAr="الأقسام"
        resourceEn="categories"
        locale={locale}
        exportAction={exportCategoriesAction}
        templateAction={templateCategoriesAction}
        importAction={importCategoriesAction}
      />

      <CategoriesTable categories={categories} locale={locale} />
    </div>
  );
}
