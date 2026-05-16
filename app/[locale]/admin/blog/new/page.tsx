import { getLocale } from "next-intl/server";
import { BlogForm } from "../blog-form";

export default async function NewBlogPostPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">{isAr ? "مقالة جديدة" : "New post"}</h1>
      <BlogForm locale={locale} />
    </div>
  );
}
