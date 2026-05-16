"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { success: false; error: string };

export async function replyToReviewAction(
  reviewId: string,
  reply: string
): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ admin_reply: reply.trim() || null })
    .eq("id", reviewId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function toggleReviewVisibilityAction(
  reviewId: string,
  visible: boolean
): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ is_visible: visible })
    .eq("id", reviewId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReviewAction(reviewId: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/reviews");
  return { success: true };
}
