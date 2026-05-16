import { listAllCategoriesForAdmin } from "@/lib/queries/services";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { CategoriesTable } from "./categories-table";
import { CsvPanel } from "@/components/admin/csv-panel";
import { Card } from "@/components/ui/card";
import { FolderTree, Eye, EyeOff } from "lucide-react";
import {
  exportCategoriesAction,
  importCategoriesAction,
  templateCategoriesAction,
} from "./csv-actions";

export default async function AdminCategoriesPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const intlLocale = isAr ? "ar-EG" : "en-US";

  const supabase = await createClient();
  const [categories, { data: services }] = await Promise.all([
    listAllCategoriesForAdmin(),
    supabase.from("services").select("category_id, is_visible"),
  ]);

  // Build service-count map per category
  const serviceCountMap = new Map<string, { total: number; visible: number }>();
  for (const s of (services as { category_id: string; is_visible: boolean }[] | null) ?? []) {
    const cur = serviceCountMap.get(s.category_id) ?? { total: 0, visible: 0 };
    cur.total += 1;
    if (s.is_visible) cur.visible += 1;
    serviceCountMap.set(s.category_id, cur);
  }

  const totalCategories = categories.length;
  const visibleCategories = categories.filter((c) => c.is_visible).length;
  const rootCategories = categories.filter((c) => !c.parent_id).length;

  const stats = [
    {
      label: isAr ? "إجمالي الأقسام" : "Total categories",
      value: totalCategories.toLocaleString(intlLocale),
      icon: FolderTree,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: isAr ? "أقسام جذر" : "Root categories",
      value: rootCategories.toLocaleString(intlLocale),
      icon: FolderTree,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: isAr ? "مرئية" : "Visible",
      value: visibleCategories.toLocaleString(intlLocale),
      icon: Eye,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: isAr ? "مخفية" : "Hidden",
      value: (totalCategories - visibleCategories).toLocaleString(intlLocale),
      icon: EyeOff,
      accent: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "الأقسام" : "Categories"}</h1>
        <p className="text-muted-foreground text-sm">
          {isAr
            ? "إدارة أقسام الخدمات الهرمية"
            : "Manage hierarchical service categories"}
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-lg p-2 ${t.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.label}</p>
                  <p className="text-xl font-bold mt-0.5 tabular-nums">{t.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <CsvPanel
        resourceAr="الأقسام"
        resourceEn="categories"
        locale={locale}
        exportAction={exportCategoriesAction}
        templateAction={templateCategoriesAction}
        importAction={importCategoriesAction}
      />

      <CategoriesTable
        categories={categories}
        locale={locale}
        serviceCountMap={Object.fromEntries(serviceCountMap)}
      />
    </div>
  );
}
