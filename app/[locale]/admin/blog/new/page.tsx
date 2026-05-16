import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { BlogForm } from "../blog-form";
import type { BlogCategory } from "@/types/database";

export default async function NewBlogPostPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("blog_categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">
        {isAr ? "مقالة جديدة" : "New post"}
      </h1>
      <BlogForm
        allCategories={(categories as BlogCategory[] | null) ?? []}
        initialCategoryIds={[]}
        locale={locale}
      />
    </div>
  );
}
