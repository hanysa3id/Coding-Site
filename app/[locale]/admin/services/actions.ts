"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serviceSchema, type ServiceInput } from "@/lib/validators/admin";
import { uploadToBucket } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

type Result = { success: true; id?: string } | { success: false; error: string };

export async function createServiceAction(input: ServiceInput): Promise<Result> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { id: _ignore, ...payload } = parsed.data;
  const { data, error } = await supabase
    .from("services")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/services");
  return { success: true, id: data.id };
}

export async function updateServiceAction(input: ServiceInput): Promise<Result> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) return { success: false, error: "Missing id" };

  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/services");
  revalidatePath(`/services/${parsed.data.slug}`);
  return { success: true, id };
}

export async function deleteServiceAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/services");
  return { success: true };
}

export async function uploadServiceImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false as const, error: "No file" };
  return uploadToBucket("service-images", file);
}
