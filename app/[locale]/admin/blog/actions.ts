"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { uploadToBucket } from "@/lib/storage/upload";
import {
  blogPostSchema,
  blogCategorySchema,
  type BlogPostInput,
  type BlogCategoryInput,
} from "@/lib/validators/blog";
import { deriveSeoFromContent, estimateReadingTime } from "@/lib/blog/seo-helpers";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };

// ── Posts ───────────────────────────────────────────────────────────────────

async function syncPostCategories(postId: string, categoryIds: string[]) {
  const supabase = await createClient();
  // Replace strategy: clear then re-insert. Cheap for small junction tables.
  await supabase.from("blog_post_categories").delete().eq("post_id", postId);
  if (categoryIds.length > 0) {
    await supabase.from("blog_post_categories").insert(
      categoryIds.map((category_id) => ({ post_id: postId, category_id }))
    );
  }
}

function statusAndDates(input: BlogPostInput, prevStatus?: string) {
  const now = new Date().toISOString();
  const scheduled = input.scheduled_at && new Date(input.scheduled_at) > new Date();
  const dates: Record<string, unknown> = {};
  let status = input.status;
  // If user picked "scheduled" but the date is in the past, promote to published.
  if (status === "scheduled" && !scheduled) status = "published";
  if (status === "scheduled") dates.scheduled_at = input.scheduled_at;
  if (status === "published" && prevStatus !== "published") {
    dates.published_at = now;
    dates.scheduled_at = null;
  }
  if (status === "draft") {
    dates.scheduled_at = null;
  }
  return { status, dates };
}

export async function createPostAction(input: BlogPostInput): Promise<Result> {
  const profile = await requireAdmin();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { id: _ignore, category_ids, ...rest } = data;
  const { status, dates } = statusAndDates(data);

  // Auto-fill reading time if missing.
  const reading = rest.content_ar || rest.content_en;
  const readingTime = reading
    ? estimateReadingTime(rest.content_ar ?? rest.content_en ?? "", rest.content_ar ? "ar" : "en")
    : null;

  const payload: Record<string, unknown> = {
    ...rest,
    status,
    ...dates,
    reading_time_minutes: readingTime,
    author_id: profile.id,
  };

  const { data: row, error } = await supabase
    .from("blog_posts")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };

  if (category_ids && category_ids.length > 0) {
    await syncPostCategories(row.id, category_ids);
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true, id: row.id };
}

export async function updatePostAction(input: BlogPostInput): Promise<Result> {
  await requireAdmin();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) return { success: false, error: "Missing id" };

  const data = parsed.data;
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", data.id)
    .single();

  const { id, category_ids, ...rest } = data;
  const { status, dates } = statusAndDates(data, existing?.status);

  const reading = rest.content_ar || rest.content_en;
  const readingTime = reading
    ? estimateReadingTime(rest.content_ar ?? rest.content_en ?? "", rest.content_ar ? "ar" : "en")
    : null;

  const payload: Record<string, unknown> = {
    ...rest,
    status,
    ...dates,
    reading_time_minutes: readingTime,
  };

  const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };

  await syncPostCategories(id!, category_ids ?? []);

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  return { success: true, id };
}

export async function deletePostAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function uploadBlogImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false as const, error: "No file" };
  return uploadToBucket("blog-images", file);
}

// Server-side auto-SEO: takes the current draft (title + content) and returns
// suggested title / description / keywords + reading-time. Caller decides
// whether to overwrite the existing fields.
export async function autoGenerateSeoAction(input: {
  title_ar: string;
  title_en: string;
  content_ar?: string | null;
  content_en?: string | null;
}) {
  await requireAdmin();
  const ar = deriveSeoFromContent(input.title_ar || "", input.content_ar, "ar");
  const en = deriveSeoFromContent(input.title_en || "", input.content_en, "en");
  return {
    success: true as const,
    ar,
    en,
  };
}

// ── Categories ──────────────────────────────────────────────────────────────

export async function createBlogCategoryAction(input: BlogCategoryInput): Promise<Result> {
  await requireAdmin();
  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { id: _ignore, ...payload } = parsed.data;
  const { data, error } = await supabase
    .from("blog_categories")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  return { success: true, id: data.id };
}

export async function updateBlogCategoryAction(input: BlogCategoryInput): Promise<Result> {
  await requireAdmin();
  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) return { success: false, error: "Missing id" };
  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase.from("blog_categories").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  return { success: true, id };
}

export async function deleteBlogCategoryAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  return { success: true };
}

export async function uploadBlogCategoryImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false as const, error: "No file" };
  return uploadToBucket("blog-images", file, "categories/");
}
