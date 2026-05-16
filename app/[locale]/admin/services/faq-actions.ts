"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth/guards";

export async function listServiceFaqsAction(serviceId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("service_faqs")
    .select("*")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });
  if (error) return { success: false as const, error: error.message };
  return { success: true as const, data: data ?? [] };
}

export async function upsertFaqAction(payload: {
  id?: string;
  service_id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  sort_order: number;
}) {
  await requireStaff();
  const supabase = createAdminClient();
  const { id, ...rest } = payload;
  let error;
  if (id) {
    ({ error } = await supabase.from("service_faqs").update(rest).eq("id", id));
  } else {
    ({ error } = await supabase.from("service_faqs").insert(rest));
  }
  if (error) return { success: false as const, error: error.message };
  revalidatePath(`/admin/services`);
  return { success: true as const };
}

export async function deleteFaqAction(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("service_faqs").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath(`/admin/services`);
  return { success: true as const };
}

export async function reorderFaqsAction(items: { id: string; sort_order: number }[]) {
  await requireStaff();
  const supabase = createAdminClient();
  await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase.from("service_faqs").update({ sort_order }).eq("id", id)
    )
  );
  revalidatePath(`/admin/services`);
  return { success: true as const };
}
