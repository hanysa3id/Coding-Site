"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { uploadToBucket } from "@/lib/storage/upload";
import { blogPostSchema, type BlogPostInput } from "@/lib/validators/blog";
import { revalidatePath } from "next/cache";

type Result =
  | { success: true; id?: string }
  | { success: false; error: string };

export async function createPostAction(input: BlogPostInput): Promise<Result> {
  const profile = await requireAdmin();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { id: _ignore, ...rest } = parsed.data;
  const payload: Record<string, unknown> = {
    ...rest,
    author_id: profile.id,
  };
  if (parsed.data.status === "published") {
    payload.published_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true, id: data.id };
}

export async function updatePostAction(input: BlogPostInput): Promise<Result> {
  await requireAdmin();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) return { success: false, error: "Missing id" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", parsed.data.id)
    .single();

  const { id, ...rest } = parsed.data;
  const payload: Record<string, unknown> = rest;
  if (
    parsed.data.status === "published" &&
    existing?.status !== "published"
  ) {
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
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
