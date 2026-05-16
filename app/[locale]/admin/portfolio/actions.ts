"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { portfolioSchema, type PortfolioInput } from "@/lib/validators/admin";
import { uploadToBucket } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };

export async function createPortfolioAction(input: PortfolioInput): Promise<Result> {
  await requireAdmin();
  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { id: _ignore, ...payload } = parsed.data;
  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  return { success: true, id: data.id };
}

export async function updatePortfolioAction(input: PortfolioInput): Promise<Result> {
  await requireAdmin();
  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) return { success: false, error: "Missing id" };
  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase.from("portfolio_projects").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${parsed.data.slug}`);
  return { success: true, id };
}

export async function deletePortfolioAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  return { success: true };
}

export async function uploadPortfolioImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false as const, error: "No file" };
  return uploadToBucket("portfolio-images", file);
}
