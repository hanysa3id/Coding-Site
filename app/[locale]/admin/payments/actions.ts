"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/create";
import {
  sendEmail,
  paymentReceivedEmail,
  paymentFailedEmail,
} from "@/lib/email/resend";
import { paymentMethodLabel } from "@/lib/orders/payment-summary";
import { formatCurrency } from "@/lib/utils";

type Result = { success: true } | { success: false; error: string };

async function loadPaymentContext(paymentId: string) {
  const supabase = await createClient();
  return supabase
    .from("payments")
    .select(
      `id, order_id, status, amount, currency, method, transaction_id,
       orders(
         id, order_number, customer_id,
         customer:profiles!orders_customer_id_fkey(email, full_name, locale)
       )`
    )
    .eq("id", paymentId)
    .single();
}

export async function verifyPaymentAction(paymentId: string): Promise<Result> {
  const profile = await requireStaff();
  const supabase = await createClient();

  const { data: payment } = await loadPaymentContext(paymentId);
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

  // Notify customer + send receipt email
  const order = payment.orders as unknown as {
    order_number: string;
    customer_id: string;
    customer: { email: string | null; full_name: string | null; locale: string | null } | null;
  } | null;

  if (order) {
    const locale = (order.customer?.locale === "en" ? "en" : "ar") as "ar" | "en";
    const isAr = locale === "ar";
    const amountStr = formatCurrency(
      Number(payment.amount),
      payment.currency,
      isAr ? "ar-EG" : "en-US"
    );

    createNotification({
      user_id: order.customer_id,
      title: isAr
        ? `✅ تم اعتماد دفعتك — ${order.order_number}`
        : `✅ Payment verified — ${order.order_number}`,
      body: `${amountStr} · ${paymentMethodLabel(payment.method, locale)}`,
      type: "payment_received",
      link: `/orders/${payment.order_id}`,
    }).catch(() => {});

    if (order.customer?.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const tmpl = paymentReceivedEmail({
        customerName: order.customer.full_name ?? order.customer.email,
        orderNumber: order.order_number,
        amount: amountStr,
        method: paymentMethodLabel(payment.method, locale),
        transactionId: payment.transaction_id,
        locale,
        orderUrl: `${siteUrl}/${locale}/orders/${payment.order_id}`,
      });
      sendEmail({ ...tmpl, to: order.customer.email }).catch(() => {});
    }
  }

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

  const { data: payment } = await loadPaymentContext(paymentId);
  if (!payment) return { success: false, error: "Payment not found" };

  const { error } = await supabase
    .from("payments")
    .update({
      status: "failed",
      admin_note: note,
    })
    .eq("id", paymentId);

  if (error) return { success: false, error: error.message };

  // Notify customer the payment was rejected so they can retry
  const order = payment.orders as unknown as {
    order_number: string;
    customer_id: string;
    customer: { email: string | null; full_name: string | null; locale: string | null } | null;
  } | null;

  if (order) {
    const locale = (order.customer?.locale === "en" ? "en" : "ar") as "ar" | "en";
    const isAr = locale === "ar";
    const amountStr = formatCurrency(
      Number(payment.amount),
      payment.currency,
      isAr ? "ar-EG" : "en-US"
    );

    createNotification({
      user_id: order.customer_id,
      title: isAr
        ? `⚠️ تم رفض الدفعة — ${order.order_number}`
        : `⚠️ Payment rejected — ${order.order_number}`,
      body: note || (isAr ? "يرجى المحاولة مرة أخرى أو التواصل معنا" : "Please retry or contact us"),
      type: "payment_failed",
      link: `/orders/${payment.order_id}/pay`,
    }).catch(() => {});

    if (order.customer?.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const tmpl = paymentFailedEmail({
        customerName: order.customer.full_name ?? order.customer.email,
        orderNumber: order.order_number,
        amount: amountStr,
        reason: note,
        locale,
        payUrl: `${siteUrl}/${locale}/orders/${payment.order_id}/pay`,
      });
      sendEmail({ ...tmpl, to: order.customer.email }).catch(() => {});
    }
  }

  revalidatePath("/admin/payments");
  revalidatePath(`/admin/orders/${payment.order_id}`);
  revalidatePath(`/orders/${payment.order_id}`);
  return { success: true };
}
