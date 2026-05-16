import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymobHmac } from "@/lib/paymob/hmac";
import { createNotification, notifyAdmins } from "@/lib/notifications/create";
import {
  sendEmail,
  paymentReceivedEmail,
  paymentFailedEmail,
} from "@/lib/email/resend";
import { paymentMethodLabel } from "@/lib/orders/payment-summary";
import { formatCurrency } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const obj = body?.obj as Record<string, unknown> | undefined;
  const receivedHmac = request.nextUrl.searchParams.get("hmac") ?? body?.hmac;

  if (!obj || !receivedHmac) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "HMAC secret not configured" }, { status: 500 });
  }

  if (!verifyPaymobHmac(obj, receivedHmac, secret)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  const success = obj.success === true;
  const paymobTxId = String(obj.id ?? "");
  const paymobOrderId = String(
    (obj.order as Record<string, unknown> | undefined)?.id ?? ""
  );

  if (!paymobOrderId) {
    return NextResponse.json({ error: "Missing PayMob order id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Find the payment row + linked order/customer info we'll need for notifs
  const { data: payment } = await supabase
    .from("payments")
    .select(
      `id, order_id, status, amount, currency, method,
       orders(
         id, order_number, customer_id,
         customer:profiles!orders_customer_id_fkey(email, full_name, locale)
       )`
    )
    .eq("paymob_order_id", paymobOrderId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Idempotent: don't reprocess already-paid
  if (payment.status === "paid") {
    return NextResponse.json({ ok: true, note: "already paid" });
  }

  const newStatus = success ? "paid" : "failed";
  await supabase
    .from("payments")
    .update({
      status: newStatus,
      transaction_id: paymobTxId,
      paid_at: success ? new Date().toISOString() : null,
    })
    .eq("id", payment.id);

  // If paid, move order to in_progress
  if (success) {
    await supabase
      .from("orders")
      .update({ status: "in_progress" })
      .eq("id", payment.order_id)
      .eq("status", "awaiting_payment");
  }

  // Notifications + emails (best-effort, do not block the response)
  notifyParties({
    payment: {
      id: payment.id,
      orderId: payment.order_id,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      transactionId: paymobTxId,
    },
    order: payment.orders as unknown as {
      order_number: string;
      customer_id: string;
      customer: { email: string | null; full_name: string | null; locale: string | null } | null;
    },
    success,
    failureReason: success
      ? null
      : (typeof obj.data === "object" && obj.data
          ? String((obj.data as Record<string, unknown>).message ?? "")
          : null) || null,
  }).catch((err) => console.error("[paymob webhook] notifications failed:", err));

  return NextResponse.json({ ok: true });
}

async function notifyParties(args: {
  payment: { id: string; orderId: string; amount: number; currency: string; method: string; transactionId: string };
  order: {
    order_number: string;
    customer_id: string;
    customer: { email: string | null; full_name: string | null; locale: string | null } | null;
  };
  success: boolean;
  failureReason: string | null;
}) {
  const { payment, order, success, failureReason } = args;
  const locale = (order.customer?.locale === "en" ? "en" : "ar") as "ar" | "en";
  const isAr = locale === "ar";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const customerOrderUrl = `${siteUrl}/${locale}/orders/${payment.orderId}`;
  const amountStr = formatCurrency(payment.amount, payment.currency, isAr ? "ar-EG" : "en-US");

  if (success) {
    // Customer: in-app + email
    createNotification({
      user_id: order.customer_id,
      title: isAr ? `✅ تم استلام دفعتك — ${order.order_number}` : `✅ Payment received — ${order.order_number}`,
      body: isAr ? `${amountStr} عبر ${paymentMethodLabel(payment.method, locale)}` : `${amountStr} via ${paymentMethodLabel(payment.method, locale)}`,
      type: "payment_received",
      link: `/orders/${payment.orderId}`,
    }).catch(() => {});

    if (order.customer?.email) {
      const tmpl = paymentReceivedEmail({
        customerName: order.customer.full_name ?? order.customer.email,
        orderNumber: order.order_number,
        amount: amountStr,
        method: paymentMethodLabel(payment.method, locale),
        transactionId: payment.transactionId,
        locale,
        orderUrl: customerOrderUrl,
      });
      sendEmail({ ...tmpl, to: order.customer.email }).catch(() => {});
    }

    // Admins
    notifyAdmins({
      title: isAr ? `💰 دفعة جديدة — ${order.order_number}` : `💰 New payment — ${order.order_number}`,
      body: `${amountStr} · ${paymentMethodLabel(payment.method, locale)}`,
      type: "payment_received",
      link: `/admin/orders/${payment.orderId}`,
    }).catch(() => {});
  } else {
    // Customer: in-app + email
    createNotification({
      user_id: order.customer_id,
      title: isAr ? `⚠️ فشل الدفع — ${order.order_number}` : `⚠️ Payment failed — ${order.order_number}`,
      body: isAr ? "حاول مرة أخرى أو اختر طريقة دفع مختلفة" : "Try again or use a different method",
      type: "payment_failed",
      link: `/orders/${payment.orderId}/pay`,
    }).catch(() => {});

    if (order.customer?.email) {
      const tmpl = paymentFailedEmail({
        customerName: order.customer.full_name ?? order.customer.email,
        orderNumber: order.order_number,
        amount: amountStr,
        reason: failureReason,
        locale,
        payUrl: `${siteUrl}/${locale}/orders/${payment.orderId}/pay`,
      });
      sendEmail({ ...tmpl, to: order.customer.email }).catch(() => {});
    }

    // Admins
    notifyAdmins({
      title: isAr ? `❌ فشل دفعة — ${order.order_number}` : `❌ Payment failed — ${order.order_number}`,
      body: failureReason ?? (isAr ? "العميل قد يحاول مرة أخرى" : "Customer may retry"),
      type: "payment_failed",
      link: `/admin/orders/${payment.orderId}`,
    }).catch(() => {});
  }
}

// PayMob also calls the callback URL via GET on success — redirect to the order
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("merchant_order_id");
  const url = new URL("/ar/orders", request.url);
  if (orderId) url.pathname = `/ar/orders/${orderId}`;
  return NextResponse.redirect(url);
}
