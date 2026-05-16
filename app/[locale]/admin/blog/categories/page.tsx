import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { BlogCategoriesTable } from "./categories-table";
import type { BlogCategory } from "@/types/database";

export default async function AdminBlogCategoriesPage() {
  await requireAdmin();
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const [{ data: categories }, { data: posts }] = await Promise.all([
    supabase.from("blog_categories").select("*").order("sort_order"),
    supabase.from("blog_post_categories").select("category_id"),
  ]);

  const countMap = new Map<string, number>();
  for (const row of (posts as { category_id: string }[] | null) ?? []) {
    countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
  }
  const postCountMap: Record<string, number> = Object.fromEntries(countMap);

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {isAr ? "أقسام المدونة" : "Blog Categories"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isAr
            ? "إنشاء أقسام رئيسية وفرعية لفهرسة مقالاتك بشكل احترافي"
            : "Create root and sub-categories to organize your articles"}
        </p>
      </header>

      <BlogCategoriesTable
        categories={(categories as BlogCategory[] | null) ?? []}
        locale={locale}
        postCountMap={postCountMap}
      />
    </div>
  );
}
