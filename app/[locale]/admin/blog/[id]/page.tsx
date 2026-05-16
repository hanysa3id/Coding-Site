import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BlogForm } from "../blog-form";
import type { BlogPost } from "@/types/database";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">{isAr ? "تعديل مقالة" : "Edit post"}</h1>
      <BlogForm initial={data as BlogPost} locale={locale} />
    </div>
  );
}
