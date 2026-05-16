"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { cmsPageSchema, type CmsPageInput } from "@/lib/validators/cms";
import { revalidatePath } from "next/cache";

type Result =
  | { success: true; id?: string }
  | { success: false; error: string };

export async function createCmsPageAction(input: CmsPageInput): Promise<Result> {
  await requireAdmin();
  const parsed = cmsPageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { id: _ignore, ...rest } = parsed.data;
  const payload: Record<string, unknown> = { ...rest };
  if (parsed.data.status === "published") {
    payload.published_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from("cms_pages")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return { success: true, id: data.id };
}

export async function updateCmsPageAction(input: CmsPageInput): Promise<Result> {
  await requireAdmin();
  const parsed = cmsPageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) return { success: false, error: "Missing id" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("cms_pages")
    .select("status, published_at, slug")
    .eq("id", parsed.data.id)
    .single();

  const { id, ...rest } = parsed.data;
  const payload: Record<string, unknown> = rest;
  if (
    parsed.data.status === "published" &&
    (existing as { status?: string } | null)?.status !== "published"
  ) {
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("cms_pages").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  revalidatePath(`/p/${parsed.data.slug}`);
  if ((existing as { slug?: string } | null)?.slug) {
    revalidatePath(`/p/${(existing as { slug: string }).slug}`);
  }
  return { success: true, id };
}

export async function deleteCmsPageAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();

  // System pages cannot be deleted (only edited)
  const { data: row } = await supabase
    .from("cms_pages")
    .select("is_system, slug")
    .eq("id", id)
    .single();

  if ((row as { is_system?: boolean } | null)?.is_system) {
    return {
      success: false,
      error: "System page cannot be deleted. Edit its content instead.",
    };
  }

  const { error } = await supabase.from("cms_pages").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return { success: true };
}
