import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymobHmac } from "@/lib/paymob/hmac";

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

  // Find the payment row by paymob_order_id
  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, status")
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

  return NextResponse.json({ ok: true });
}

// PayMob also calls the callback URL via GET on success — accept both
export async function GET(request: NextRequest) {
  // GET callbacks carry data as query params (transactional response)
  // We rely on the server-to-server POST for state changes; GET just redirects.
  const orderId = request.nextUrl.searchParams.get("merchant_order_id");
  const url = new URL("/ar/orders", request.url);
  if (orderId) url.pathname = `/ar/orders/${orderId}`;
  return NextResponse.redirect(url);
}
