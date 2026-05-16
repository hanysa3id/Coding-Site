"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { uploadToBucket } from "@/lib/storage/upload";
import {
  createOrderSchema,
  sendMessageSchema,
  reviewSchema,
  type CreateOrderInput,
  type SendMessageInput,
  type ReviewInput,
} from "@/lib/validators/orders";
import { revalidatePath } from "next/cache";
import { createNotification, notifyAdmins } from "@/lib/notifications/create";
import { sendEmail, orderCreatedEmail } from "@/lib/email/resend";
import { getLocale } from "next-intl/server";
import type { OrderAttachment } from "@/types/database";

const MAX_ATTACHMENT_MB = 25;
const MAX_ATTACHMENTS = 10;

type Result = { success: true } | { success: false; error: string };
type ResultWith<T> = ({ success: true } & T) | { success: false; error: string };

export async function createOrderAction(
  formData: FormData
): Promise<ResultWith<{ orderId: string; orderNumber: string }>> {
  const profile = await requireUser();

  const input: CreateOrderInput = {
    service_id: String(formData.get("service_id") ?? ""),
    customer_message: String(formData.get("customer_message") ?? ""),
  };
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Collect attached files (general "files[]" and the optional voice note)
  const files = formData.getAll("files").filter((v): v is File => v instanceof File && v.size > 0);
  const voice = formData.get("voice");
  const voiceFile = voice instanceof File && voice.size > 0 ? voice : null;

  if (files.length > MAX_ATTACHMENTS) {
    return { success: false, error: `Too many files (max ${MAX_ATTACHMENTS})` };
  }
  for (const f of files) {
    if (f.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      return { success: false, error: `File "${f.name}" exceeds ${MAX_ATTACHMENT_MB}MB` };
    }
  }
  if (voiceFile && voiceFile.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
    return { success: false, error: `Voice note exceeds ${MAX_ATTACHMENT_MB}MB` };
  }

  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("estimated_price_min, estimated_duration_days, currency, is_visible")
    .eq("id", parsed.data.service_id)
    .single();

  if (!service || !service.is_visible) {
    return { success: false, error: "Service not available" };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_id: profile.id,
      service_id: parsed.data.service_id,
      customer_message: parsed.data.customer_message,
      estimated_price: service.estimated_price_min,
      estimated_duration_days: service.estimated_duration_days,
      currency: service.currency,
      status: "pending_review",
    })
    .select("id, order_number")
    .single();

  if (error || !order) {
    return { success: false, error: error?.message ?? "Failed to create order" };
  }

  // Upload attachments (files + voice note) under order-attachments/<order_id>/
  const attachments: OrderAttachment[] = [];
  const allToUpload: Array<{ file: File; kind: "file" | "audio" }> = [
    ...files.map((file) => ({ file, kind: "file" as const })),
    ...(voiceFile ? [{ file: voiceFile, kind: "audio" as const }] : []),
  ];
  for (const { file, kind } of allToUpload) {
    const upload = await uploadToBucket("order-attachments", file, `${order.id}/`);
    if (upload.success) {
      attachments.push({
        url: upload.url,
        name: file.name,
        mime: file.type || (kind === "audio" ? "audio/webm" : "application/octet-stream"),
        size: file.size,
        kind,
      });
    } else {
      console.error("[createOrder] attachment upload failed:", upload.error);
    }
  }
  if (attachments.length > 0) {
    await supabase
      .from("orders")
      .update({ customer_attachments: attachments })
      .eq("id", order.id);
  }

  // Fire-and-forget notifications
  const locale = (await getLocale()) as "ar" | "en";
  const { data: svcInfo } = await supabase
    .from("services")
    .select("name_ar, name_en")
    .eq("id", parsed.data.service_id)
    .single();
  const serviceName = svcInfo
    ? (locale === "ar" ? svcInfo.name_ar : svcInfo.name_en)
    : "";

  notifyAdmins({
    title: locale === "ar" ? `طلب جديد ${order.order_number}` : `New order ${order.order_number}`,
    body: locale === "ar"
      ? `${profile.full_name ?? "عميل"} طلب: ${serviceName}`
      : `${profile.full_name ?? "Customer"} requested: ${serviceName}`,
    type: "order_created",
    link: `/admin/orders/${order.id}`,
  }).catch(() => {});

  if (profile.email) {
    const tmpl = orderCreatedEmail({
      customerName: profile.full_name ?? profile.email,
      orderNumber: order.order_number,
      serviceName,
      locale,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    });
    sendEmail({ ...tmpl, to: profile.email }).catch(() => {});
  }

  revalidatePath("/orders");
  revalidatePath("/admin/orders");
  return { success: true, orderId: order.id, orderNumber: order.order_number };
}

export async function approveOrderAction(orderId: string): Promise<Result> {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("status, customer_id")
    .eq("id", orderId)
    .single();

  if (!order || order.customer_id !== profile.id) {
    return { success: false, error: "Not your order" };
  }
  if (order.status !== "awaiting_customer_approval") {
    return { success: false, error: "Order is not awaiting your approval" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "awaiting_payment" })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  const locale = (await getLocale()) as "ar" | "en";
  notifyAdmins({
    title: locale === "ar" ? "العميل وافق على التعاقد" : "Customer approved contract",
    body: locale === "ar" ? "بانتظار الدفع" : "Awaiting payment",
    type: "order_approved",
    link: `/admin/orders/${orderId}`,
  }).catch(() => {});

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function cancelOrderAction(orderId: string): Promise<Result> {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("status, customer_id")
    .eq("id", orderId)
    .single();

  if (!order || order.customer_id !== profile.id) {
    return { success: false, error: "Not your order" };
  }
  // Customer can only cancel before payment
  if (!["pending_review", "under_negotiation", "awaiting_customer_approval"].includes(order.status)) {
    return { success: false, error: "Cannot cancel at this stage" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function sendCustomerMessageAction(
  input: SendMessageInput
): Promise<Result> {
  const profile = await requireUser();
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("id", parsed.data.order_id)
    .single();

  if (!order || order.customer_id !== profile.id) {
    return { success: false, error: "Not your order" };
  }

  const { error } = await supabase.from("order_messages").insert({
    order_id: parsed.data.order_id,
    sender_id: profile.id,
    content: parsed.data.content,
    attachment_url: parsed.data.attachment_url ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath(`/orders/${parsed.data.order_id}`);
  return { success: true };
}

export async function submitReviewAction(input: ReviewInput): Promise<Result> {
  const profile = await requireUser();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("customer_id, service_id, status")
    .eq("id", parsed.data.order_id)
    .single();

  if (!order || order.customer_id !== profile.id) {
    return { success: false, error: "Not your order" };
  }
  if (!["delivered", "completed"].includes(order.status)) {
    return { success: false, error: "Order not ready for review" };
  }

  const { error: reviewErr } = await supabase.from("reviews").insert({
    order_id: parsed.data.order_id,
    customer_id: profile.id,
    service_id: order.service_id,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  });

  if (reviewErr) return { success: false, error: reviewErr.message };

  // Mark order completed if it was delivered
  if (order.status === "delivered") {
    await supabase.from("orders").update({ status: "completed" }).eq("id", parsed.data.order_id);
  }

  revalidatePath(`/orders/${parsed.data.order_id}`);
  revalidatePath("/admin/orders");
  return { success: true };
}
