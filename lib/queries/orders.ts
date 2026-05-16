import { createClient } from "@/lib/supabase/server";
import { signStorageUrls } from "@/lib/storage/sign-url";
import type { Order, OrderStatus, Service, Profile } from "@/types/database";

export type OrderWithService = Order & {
  services: Pick<Service, "id" | "name_ar" | "name_en" | "slug" | "cover_image"> | null;
};

export type OrderFull = OrderWithService & {
  customer: Pick<Profile, "id" | "full_name" | "email" | "phone" | "whatsapp_number"> | null;
  sales: Pick<Profile, "id" | "full_name" | "email"> | null;
  assigned_staff: Pick<Profile, "id" | "full_name" | "email"> | null;
};

export async function listCustomerOrders(customerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, services(id, name_ar, name_en, slug, cover_image)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return (data as unknown as OrderWithService[]) ?? [];
}

export async function listAllOrders(
  filter?: { status?: OrderStatus },
  pagination?: { from: number; to: number }
) {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "*, services(id, name_ar, name_en, slug, cover_image), customer:profiles!orders_customer_id_fkey(id, full_name, email, phone, whatsapp_number)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });
  if (filter?.status) query = query.eq("status", filter.status);
  if (pagination) query = query.range(pagination.from, pagination.to);
  const { data, count } = await query;
  return {
    rows: (data as unknown as (OrderWithService & {
      customer: Pick<Profile, "id" | "full_name" | "email" | "phone" | "whatsapp_number"> | null;
    })[]) ?? [],
    total: count ?? 0,
  };
}

export async function getOrderForCustomer(orderId: string, customerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, services(id, name_ar, name_en, slug, cover_image)")
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .single();
  return data as unknown as OrderWithService | null;
}

export async function getOrderForAdmin(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `*,
       services(id, name_ar, name_en, slug, cover_image),
       customer:profiles!orders_customer_id_fkey(id, full_name, email, phone, whatsapp_number),
       sales:profiles!orders_sales_id_fkey(id, full_name, email),
       assigned_staff:profiles!orders_assigned_staff_id_fkey(id, full_name, email)`
    )
    .eq("id", orderId)
    .single();
  return data as unknown as OrderFull | null;
}

export async function listOrderMessages(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_messages")
    .select("*, sender:profiles(id, full_name, role, avatar_url)")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const rows = (data as unknown as Array<{
    id: string;
    order_id: string;
    sender_id: string;
    content: string | null;
    attachment_url: string | null;
    attachment_kind: "audio" | "image" | "file" | null;
    attachment_mime: string | null;
    attachment_size: number | null;
    attachment_name: string | null;
    is_read: boolean;
    created_at: string;
    sender: { id: string; full_name: string | null; role: string; avatar_url: string | null } | null;
  }>) ?? [];

  // Replace stored URLs with short-lived signed URLs so <audio src=...> works
  // regardless of whether the storage bucket is public or private.
  const indexedUrls: { msgIdx: number; url: string }[] = [];
  rows.forEach((m, i) => {
    if (m.attachment_url) indexedUrls.push({ msgIdx: i, url: m.attachment_url });
  });
  if (indexedUrls.length > 0) {
    const signed = await signStorageUrls(indexedUrls.map((x) => x.url));
    indexedUrls.forEach(({ msgIdx }, i) => {
      rows[msgIdx].attachment_url = signed[i];
    });
  }

  return rows;
}

export async function listOrderMilestones(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_milestones")
    .select("*")
    .eq("order_id", orderId)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function listOrderDeliverables(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_deliverables")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listOrderPayments(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listOrderStatusHistory(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("order_status_history")
    .select("*, changed_by_profile:profiles(id, full_name, role)")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
