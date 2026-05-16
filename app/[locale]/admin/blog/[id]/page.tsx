import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BlogForm } from "../blog-form";
import type { BlogPost, BlogCategory } from "@/types/database";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const [{ data: post }, { data: categories }, { data: postCats }] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("id", id).single(),
    supabase.from("blog_categories").select("*").order("sort_order"),
    supabase.from("blog_post_categories").select("category_id").eq("post_id", id),
  ]);
  if (!post) notFound();

  const categoryIds = ((postCats as { category_id: string }[] | null) ?? []).map(
    (r) => r.category_id
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">
        {isAr ? "تعديل مقالة" : "Edit post"}
      </h1>
      <BlogForm
        initial={post as BlogPost}
        initialCategoryIds={categoryIds}
        allCategories={(categories as BlogCategory[] | null) ?? []}
        locale={locale}
      />
    </div>
  );
}
