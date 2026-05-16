"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { success: false; error: string };

export async function verifyPaymentAction(paymentId: string): Promise<Result> {
  const profile = await requireStaff();
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, status")
    .eq("id", paymentId)
    .single();

  if (!payment) return { success: false, error: "Payment not found" };
  if (payment.status === "paid") return { success: false, error: "Already verified" };

  const { error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      verified_by: profile.id,
      paid_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) return { success: false, error: error.message };

  // Auto-advance order status to in_progress if it was awaiting_payment
  await supabase
    .from("orders")
    .update({ status: "in_progress" })
    .eq("id", payment.order_id)
    .eq("status", "awaiting_payment");

  revalidatePath("/admin/payments");
  revalidatePath(`/admin/orders/${payment.order_id}`);
  revalidatePath(`/orders/${payment.order_id}`);
  return { success: true };
}

export async function rejectPaymentAction(
  paymentId: string,
  note: string
): Promise<Result> {
  await requireStaff();
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("id", paymentId)
    .single();

  if (!payment) return { success: false, error: "Payment not found" };

  const { error } = await supabase
    .from("payments")
    .update({
      status: "failed",
      admin_note: note,
    })
    .eq("id", paymentId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/payments");
  return { success: true };
}
