"use server";

import { createClient } from "@/lib/supabase/server";
import { requireStaff, requireAdmin } from "@/lib/auth/guards";
import { uploadToBucket } from "@/lib/storage/upload";
import {
  negotiateOrderSchema,
  updateOrderStatusSchema,
  milestoneSchema,
  type NegotiateOrderInput,
  type UpdateOrderStatusInput,
  type MilestoneInput,
} from "@/lib/validators/orders";
import { canTransitionTo, ORDER_STATUS_LABELS } from "@/lib/orders/status";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/create";
import { sendEmail, orderStatusChangedEmail } from "@/lib/email/resend";
import { getLocale } from "next-intl/server";

type Result = { success: true } | { success: false; error: string };

export async function negotiateOrderAction(
  input: NegotiateOrderInput
): Promise<Result> {
  await requireStaff();
  const parsed = negotiateOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const update: Record<string, unknown> = {
    status: "awaiting_customer_approval",
  };
  if (parsed.data.final_price !== undefined) update.final_price = parsed.data.final_price;
  if (parsed.data.final_duration_days !== undefined)
    update.final_duration_days = parsed.data.final_duration_days;
  if (parsed.data.admin_notes !== undefined) update.admin_notes = parsed.data.admin_notes;

  const { error } = await supabase.from("orders").update(update).eq("id", parsed.data.order_id);
  if (error) return { success: false, error: error.message };

  // Notify customer
  const { data: order } = await supabase
    .from("orders")
    .select("customer_id, order_number")
    .eq("id", parsed.data.order_id)
    .single();
  if (order) {
    const locale = (await getLocale()) as "ar" | "en";
    createNotification({
      user_id: order.customer_id,
      title:
        locale === "ar"
          ? `عرض جديد على طلبك ${order.order_number}`
          : `New offer on order ${order.order_number}`,
      body:
        locale === "ar"
          ? "راجع التفاصيل ووافق على التعاقد"
          : "Review details and approve the contract",
      type: "order_negotiated",
      link: `/orders/${parsed.data.order_id}`,
    }).catch(() => {});
  }

  revalidatePath(`/admin/orders/${parsed.data.order_id}`);
  revalidatePath(`/orders/${parsed.data.order_id}`);
  return { success: true };
}

export async function updateOrderStatusAction(
  input: UpdateOrderStatusInput
): Promise<Result> {
  await requireStaff();
  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("orders")
    .select("status")
    .eq("id", parsed.data.order_id)
    .single();
  if (!current) return { success: false, error: "Order not found" };

  if (!canTransitionTo(current.status, parsed.data.status)) {
    return {
      success: false,
      error: `Cannot transition from ${current.status} to ${parsed.data.status}`,
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.order_id);
  if (error) return { success: false, error: error.message };

  // Notify customer of status change
  const { data: order } = await supabase
    .from("orders")
    .select("customer_id, order_number, customer:profiles!orders_customer_id_fkey(email, full_name, locale)")
    .eq("id", parsed.data.order_id)
    .single();
  if (order) {
    const locale = (await getLocale()) as "ar" | "en";
    const meta = ORDER_STATUS_LABELS[parsed.data.status];
    const statusLabel = locale === "ar" ? meta.ar : meta.en;
    createNotification({
      user_id: order.customer_id,
      title:
        locale === "ar"
          ? `تحديث على طلب ${order.order_number}`
          : `Update on ${order.order_number}`,
      body: `${locale === "ar" ? "الحالة الجديدة: " : "New status: "}${statusLabel}`,
      type: "order_status_changed",
      link: `/orders/${parsed.data.order_id}`,
    }).catch(() => {});

    const cust = (order as unknown as {
      customer: { email: string | null; full_name: string | null } | null;
    }).customer;
    if (cust?.email) {
      const tmpl = orderStatusChangedEmail({
        customerName: cust.full_name ?? cust.email,
        orderNumber: order.order_number,
        statusLabel,
        locale,
        orderUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${locale}/orders/${parsed.data.order_id}`,
      });
      sendEmail({ ...tmpl, to: cust.email }).catch(() => {});
    }
  }

  revalidatePath(`/admin/orders/${parsed.data.order_id}`);
  revalidatePath(`/orders/${parsed.data.order_id}`);
  return { success: true };
}

export async function assignStaffAction(
  orderId: string,
  staffId: string | null
): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ assigned_staff_id: staffId })
    .eq("id", orderId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function assignSalesAction(
  orderId: string,
  salesId: string | null
): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ sales_id: salesId })
    .eq("id", orderId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function sendStaffMessageAction(formData: FormData): Promise<Result> {
  const profile = await requireStaff();
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

  revalidatePath(`/admin/orders/${order_id}`);
  revalidatePath(`/orders/${order_id}`);
  return { success: true };
}

export async function upsertMilestoneAction(input: MilestoneInput): Promise<Result> {
  await requireStaff();
  const parsed = milestoneSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = {
    order_id: parsed.data.order_id,
    title_ar: parsed.data.title_ar,
    title_en: parsed.data.title_en ?? null,
    description: parsed.data.description ?? null,
    status: parsed.data.status,
    sort_order: parsed.data.sort_order,
  };
  if (parsed.data.status === "done") payload.completed_at = new Date().toISOString();

  if (parsed.data.id) {
    const { error } = await supabase
      .from("order_milestones")
      .update(payload)
      .eq("id", parsed.data.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("order_milestones").insert(payload);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath(`/admin/orders/${parsed.data.order_id}`);
  revalidatePath(`/orders/${parsed.data.order_id}`);
  return { success: true };
}

export async function deleteMilestoneAction(
  milestoneId: string,
  orderId: string
): Promise<Result> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("order_milestones").delete().eq("id", milestoneId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function uploadDeliverableAction(formData: FormData) {
  const profile = await requireStaff();
  const orderId = formData.get("order_id") as string;
  const description = (formData.get("description") as string) ?? null;
  const file = formData.get("file") as File | null;

  if (!orderId || !file) {
    return { success: false as const, error: "Missing required fields" };
  }

  const upload = await uploadToBucket("order-deliverables", file, `${orderId}/`);
  if (!upload.success) return upload;

  const supabase = await createClient();
  const { error } = await supabase.from("order_deliverables").insert({
    order_id: orderId,
    file_url: upload.url,
    file_name: file.name,
    file_type: file.type,
    description,
    uploaded_by: profile.id,
  });
  if (error) return { success: false as const, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  return { success: true as const };
}

export async function deleteDeliverableAction(
  deliverableId: string,
  orderId: string
): Promise<Result> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("order_deliverables").delete().eq("id", deliverableId);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}
