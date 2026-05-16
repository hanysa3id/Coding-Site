"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { uploadToBucket } from "@/lib/storage/upload";
import { initPaymobPayment } from "@/lib/paymob/client";
import { revalidatePath } from "next/cache";

type Result<T = Record<string, never>> =
  | ({ success: true } & T)
  | { success: false; error: string };

export async function initPaymobAction(
  orderId: string
): Promise<Result<{ iframeUrl: string }>> {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_id, status, final_price, estimated_price, currency, order_number")
    .eq("id", orderId)
    .single();

  if (!order || order.customer_id !== profile.id) {
    return { success: false, error: "Not your order" };
  }
  if (order.status !== "awaiting_payment") {
    return { success: false, error: "Order not awaiting payment" };
  }

  const amount = order.final_price ?? order.estimated_price;
  if (!amount) {
    return { success: false, error: "Order amount not set" };
  }

  const integrationId = process.env.PAYMOB_INTEGRATION_ID_CARD;
  if (!integrationId) {
    return { success: false, error: "Payment gateway not configured" };
  }

  try {
    const [first, ...rest] = (profile.full_name ?? "Customer").split(" ");
    const last = rest.join(" ") || ".";
    const init = await initPaymobPayment({
      amount,
      merchantOrderId: order.id,
      integrationId,
      billing: {
        first_name: first,
        last_name: last,
        email: profile.email ?? "noemail@example.com",
        phone_number: profile.phone ?? "+201000000000",
      },
    });

    // Create or update the payment row
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("order_id", orderId)
      .eq("method", "paymob")
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("payments")
        .update({ paymob_order_id: String(init.paymobOrderId) })
        .eq("id", existing.id);
    } else {
      await supabase.from("payments").insert({
        order_id: orderId,
        amount,
        currency: order.currency,
        method: "paymob",
        status: "pending",
        paymob_order_id: String(init.paymobOrderId),
      });
    }

    return { success: true, iframeUrl: init.iframeUrl };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function submitOfflinePaymentAction(formData: FormData) {
  const profile = await requireUser();
  const orderId = formData.get("order_id") as string;
  const method = formData.get("method") as string;
  const note = (formData.get("note") as string) ?? null;
  const file = formData.get("receipt") as File | null;

  if (!orderId || !method) {
    return { success: false as const, error: "Missing fields" };
  }

  const allowed = ["bank_transfer", "instapay", "vodafone_cash", "cash"];
  if (!allowed.includes(method)) {
    return { success: false as const, error: "Invalid method" };
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_id, status, final_price, estimated_price, currency")
    .eq("id", orderId)
    .single();

  if (!order || order.customer_id !== profile.id) {
    return { success: false as const, error: "Not your order" };
  }
  if (order.status !== "awaiting_payment") {
    return { success: false as const, error: "Order not awaiting payment" };
  }

  const amount = order.final_price ?? order.estimated_price;
  if (!amount) {
    return { success: false as const, error: "Order amount not set" };
  }

  let receiptUrl: string | null = null;
  if (file && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) {
      return { success: false as const, error: "Max 5MB" };
    }
    const upload = await uploadToBucket("payment-receipts", file, `${orderId}/`);
    if (!upload.success) return upload;
    receiptUrl = upload.url;
  }

  const { error } = await supabase.from("payments").insert({
    order_id: orderId,
    amount,
    currency: order.currency,
    method,
    status: "pending",
    receipt_url: receiptUrl,
    customer_note: note,
  });

  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/payments");
  return { success: true as const };
}
