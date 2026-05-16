"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { categorySchema, type CategoryInput } from "@/lib/validators/admin";
import { uploadToBucket } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };

export async function createCategoryAction(input: CategoryInput): Promise<Result> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { id: _ignore, ...payload } = parsed.data;
  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/categories");
  return { success: true, id: data.id };
}

export async function updateCategoryAction(input: CategoryInput): Promise<Result> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) return { success: false, error: "Missing id" };

  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase.from("categories").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/categories");
  return { success: true, id };
}

export async function uploadCategoryImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false as const, error: "No file" };
  return uploadToBucket("service-images", file, "categories/");
}

export async function deleteCategoryAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}
