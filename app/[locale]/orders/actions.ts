"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { uploadToBucket } from "@/lib/storage/upload";
import {
  createOrderSchema,
  reviewSchema,
  type CreateOrderInput,
  type ReviewInput,
} from "@/lib/validators/orders";
import { revalidatePath } from "next/cache";
import { createNotification, notifyAdmins } from "@/lib/notifications/create";
import { sendEmail, orderCreatedEmail } from "@/lib/email/resend";
import { getLocale } from "next-intl/server";
import { getOrdersPolicy } from "@/lib/settings/get";
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

  // Enforce the configurable per-customer pending-orders limit
  const policy = await getOrdersPolicy();
  const limit = policy?.max_pending_per_customer ?? 0;
  if (limit > 0) {
    const pendingStatuses = policy?.pending_statuses?.length
      ? policy.pending_statuses
      : (["pending_review", "under_negotiation"] as const);
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", profile.id)
      .in("status", pendingStatuses as unknown as string[]);
    if ((count ?? 0) >= limit) {
      const isAr = (await getLocale()) === "ar";
      return {
        success: false,
        error: isAr
          ? `لديك ${count} طلب قيد المراجعة. الحد الأقصى المسموح به هو ${limit}. يرجى الانتظار حتى تتم مراجعة طلباتك الحالية.`
          : `You have ${count} pending orders. The maximum allowed is ${limit}. Please wait until your existing orders are reviewed.`,
      };
    }
  }

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

  const orderUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/admin/orders/${order.id}`;
  notifyAdmins({
    title: locale === "ar" ? `طلب جديد ${order.order_number}` : `New order ${order.order_number}`,
    body: locale === "ar"
      ? `${profile.full_name ?? "عميل"} طلب: ${serviceName}`
      : `${profile.full_name ?? "Customer"} requested: ${serviceName}`,
    type: "order_created",
    link: `/admin/orders/${order.id}`,
    telegramEvent: "new_order",
    telegramVars: {
      order_number: order.order_number,
      customer_name: profile.full_name ?? "—",
      service_name: serviceName,
      estimated_price: service.estimated_price_min ?? "—",
      currency: service.currency,
      order_url: orderUrl,
    },
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
    .select("status, customer_id, order_number")
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

  const locale = (await getLocale()) as "ar" | "en";
  notifyAdmins({
    title: locale === "ar" ? `🚫 تم إلغاء طلب ${order.order_number}` : `🚫 Order cancelled ${order.order_number}`,
    body: locale === "ar"
      ? `${profile.full_name ?? "العميل"} ألغى الطلب`
      : `${profile.full_name ?? "Customer"} cancelled the order`,
    type: "order_cancelled",
    link: `/admin/orders/${orderId}`,
    telegramEvent: "order_cancelled",
    telegramVars: {
      order_number: order.order_number,
      customer_name: profile.full_name ?? "—",
    },
  }).catch(() => {});

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function sendCustomerMessageAction(
  formData: FormData
): Promise<Result> {
  const profile = await requireUser();
  const order_id = String(formData.get("order_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const audio = formData.get("audio");
  const audioFile = audio instanceof File && audio.size > 0 ? audio : null;

  if (!order_id) return { success: false, error: "Missing order id" };
  if (!content && !audioFile) {
    return { success: false, error: "Message is empty" };
  }
  if (audioFile && audioFile.size > 25 * 1024 * 1024) {
    return { success: false, error: "Voice note too large (max 25MB)" };
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("id", order_id)
    .single();

  if (!order || order.customer_id !== profile.id) {
    return { success: false, error: "Not your order" };
  }

  let attachmentUrl: string | null = null;
  let attachmentMeta = {
    kind: null as "audio" | "image" | "file" | null,
    mime: null as string | null,
    size: null as number | null,
    name: null as string | null,
  };
  if (audioFile) {
    const upload = await uploadToBucket("order-attachments", audioFile, `${order_id}/messages/`);
    if (!upload.success) return { success: false, error: upload.error };
    attachmentUrl = upload.url;
    attachmentMeta = {
      kind: "audio",
      mime: audioFile.type || "audio/webm",
      size: audioFile.size,
      name: audioFile.name,
    };
  }

  const { error } = await supabase.from("order_messages").insert({
    order_id,
    sender_id: profile.id,
    content: content || null,
    attachment_url: attachmentUrl,
    attachment_kind: attachmentMeta.kind,
    attachment_mime: attachmentMeta.mime,
    attachment_size: attachmentMeta.size,
    attachment_name: attachmentMeta.name,
  });

  if (error) return { success: false, error: error.message };

  // Notify staff that the customer sent a new message
  const { data: orderInfo } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", order_id)
    .single();
  if (orderInfo) {
    const locale = (await getLocale()) as "ar" | "en";
    const isAr = locale === "ar";
    const preview =
      attachmentMeta.kind === "audio"
        ? isAr
          ? "🎙️ ملاحظة صوتية جديدة"
          : "🎙️ New voice note"
        : content
          ? content.slice(0, 80)
          : isAr
            ? "رسالة جديدة"
            : "New message";
    notifyAdmins({
      title: isAr
        ? `💬 رسالة من العميل — ${orderInfo.order_number}`
        : `💬 Customer message — ${orderInfo.order_number}`,
      body: preview,
      type: "new_message",
      link: `/admin/orders/${order_id}`,
      telegramEvent: "new_message_from_customer",
      telegramVars: {
        order_number: orderInfo.order_number,
        customer_name: profile.full_name ?? "—",
        preview,
      },
    }).catch(() => {});
  }

  revalidatePath(`/orders/${order_id}`);
  revalidatePath(`/admin/orders/${order_id}`);
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

  // Notify admins (+Telegram) about the new review
  const { data: orderInfo } = await supabase
    .from("orders")
    .select("order_number")
    .eq("id", parsed.data.order_id)
    .single();
  if (orderInfo) {
    const locale = (await getLocale()) as "ar" | "en";
    notifyAdmins({
      title: locale === "ar" ? `⭐ تقييم جديد ${parsed.data.rating}/5` : `⭐ New review ${parsed.data.rating}/5`,
      body: parsed.data.comment ?? "",
      type: "new_review",
      link: `/admin/reviews`,
      telegramEvent: "new_review",
      telegramVars: {
        order_number: orderInfo.order_number,
        customer_name: profile.full_name ?? "—",
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? "",
      },
    }).catch(() => {});
  }

  revalidatePath(`/orders/${parsed.data.order_id}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function approveMilestoneAction(milestoneId: string, orderId: string): Promise<Result> {
  const profile = await requireUser();
  const supabase = await createClient();

  // Verify the order belongs to this customer
  const { data: order } = await supabase
    .from("orders")
    .select("id, customer_id, order_number")
    .eq("id", orderId)
    .eq("customer_id", profile.id)
    .single();
  if (!order) return { success: false, error: "Order not found" };

  const { error } = await supabase
    .from("order_milestones")
    .update({ customer_approved_at: new Date().toISOString() })
    .eq("id", milestoneId)
    .eq("order_id", orderId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
