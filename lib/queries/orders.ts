import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signStorageUrls } from "@/lib/storage/sign-url";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  Service,
  Profile,
} from "@/types/database";

export type OrderWithService = Order & {
  services: Pick<Service, "id" | "name_ar" | "name_en" | "slug" | "cover_image"> | null;
};

export type OrderFull = OrderWithService & {
  customer: Pick<Profile, "id" | "full_name" | "email" | "phone" | "whatsapp_number"> | null;
  sales: Pick<Profile, "id" | "full_name" | "email"> | null;
  assigned_staff: Pick<Profile, "id" | "full_name" | "email"> | null;
};

export type OrderRow = OrderWithService & {
  customer: Pick<Profile, "id" | "full_name" | "email" | "phone" | "whatsapp_number"> | null;
  assigned_staff: Pick<Profile, "id" | "full_name"> | null;
  sales: Pick<Profile, "id" | "full_name"> | null;
  /** Aggregated payment status for the order. */
  payment_summary: {
    has_paid: boolean;
    paid_amount: number;
    last_status: PaymentStatus | null;
  };
};

export type OrderSort =
  | "newest"
  | "oldest"
  | "price_desc"
  | "price_asc"
  | "status_priority";

export type OrderListFilter = {
  statuses?: OrderStatus[];
  search?: string;
  service_id?: string;
  sales_id?: string;
  assigned_staff_id?: string;
  date_from?: string; // ISO date
  date_to?: string;   // ISO date
  payment_status?: "paid" | "unpaid" | "any";
  min_price?: number;
  max_price?: number;
  sort?: OrderSort;
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

// ===========================================================================
// Advanced admin listing — rich filters + sort + payment summary join.
// Used by the /admin/orders page so admins can slice the orders queue by any
// dimension that matters to operations.
// ===========================================================================

const STATUS_PRIORITY: Record<OrderStatus, number> = {
  pending_review: 1,
  under_negotiation: 2,
  awaiting_customer_approval: 3,
  awaiting_payment: 4,
  in_progress: 5,
  delivered: 6,
  completed: 7,
  cancelled: 8,
  refunded: 9,
};

export async function listAllOrdersAdvanced(
  filter: OrderListFilter,
  pagination?: { from: number; to: number }
): Promise<{ rows: OrderRow[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      `*,
       services(id, name_ar, name_en, slug, cover_image),
       customer:profiles!orders_customer_id_fkey(id, full_name, email, phone, whatsapp_number),
       assigned_staff:profiles!orders_assigned_staff_id_fkey(id, full_name),
       sales:profiles!orders_sales_id_fkey(id, full_name),
       payments(status, amount)`,
      { count: "exact" }
    );

  if (filter.statuses && filter.statuses.length > 0) {
    query = query.in("status", filter.statuses);
  }
  if (filter.service_id) query = query.eq("service_id", filter.service_id);
  if (filter.sales_id) query = query.eq("sales_id", filter.sales_id);
  if (filter.assigned_staff_id) query = query.eq("assigned_staff_id", filter.assigned_staff_id);
  if (filter.date_from) query = query.gte("created_at", filter.date_from);
  if (filter.date_to) {
    // make date_to inclusive of the entire day
    const end = new Date(filter.date_to);
    end.setHours(23, 59, 59, 999);
    query = query.lte("created_at", end.toISOString());
  }
  if (filter.min_price != null) query = query.gte("estimated_price", filter.min_price);
  if (filter.max_price != null) query = query.lte("estimated_price", filter.max_price);
  if (filter.search) {
    const q = filter.search.trim();
    if (q) {
      // order_number OR customer email/full_name — for the latter we filter
      // client-side after fetching because joining on related-table .or() is
      // limited in PostgREST.
      query = query.or(`order_number.ilike.%${q}%,customer_message.ilike.%${q}%`);
    }
  }

  // Sorting
  switch (filter.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "price_desc":
      query = query.order("estimated_price", { ascending: false, nullsFirst: false });
      break;
    case "price_asc":
      query = query.order("estimated_price", { ascending: true, nullsFirst: false });
      break;
    case "status_priority":
      // Order by status text (Postgres orders enums by definition order, which
      // matches our priority). Fall back to created_at desc as the tiebreaker.
      query = query.order("status", { ascending: true }).order("created_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  if (pagination) query = query.range(pagination.from, pagination.to);

  const { data, count } = await query;

  type Raw = OrderRow & {
    payments: { status: PaymentStatus; amount: number }[] | null;
  };

  let rows = ((data as unknown as Raw[]) ?? []).map((r) => {
    const payments = r.payments ?? [];
    const paid = payments.filter((p) => p.status === "paid");
    const paidAmount = paid.reduce((acc, p) => acc + Number(p.amount ?? 0), 0);
    const lastStatus = payments[payments.length - 1]?.status ?? null;
    const row: OrderRow = {
      ...r,
      payment_summary: {
        has_paid: paid.length > 0,
        paid_amount: paidAmount,
        last_status: lastStatus,
      },
    };
    return row;
  });

  // Client-side filter on payment status + customer name/email search
  if (filter.payment_status === "paid") {
    rows = rows.filter((r) => r.payment_summary.has_paid);
  } else if (filter.payment_status === "unpaid") {
    rows = rows.filter((r) => !r.payment_summary.has_paid);
  }

  if (filter.search?.trim()) {
    const q = filter.search.trim().toLowerCase();
    // Keep rows that matched server-side OR match customer name/email.
    rows = rows.filter((r) => {
      const inOrder = r.order_number.toLowerCase().includes(q);
      const inMsg = (r.customer_message ?? "").toLowerCase().includes(q);
      const inName = (r.customer?.full_name ?? "").toLowerCase().includes(q);
      const inEmail = (r.customer?.email ?? "").toLowerCase().includes(q);
      return inOrder || inMsg || inName || inEmail;
    });
  }

  // status_priority sort is partly handled by Postgres enum ordering; nothing
  // extra needed in JS unless we want to override (left for future use).
  void STATUS_PRIORITY;

  return { rows, total: count ?? rows.length };
}

// ===========================================================================
// Aggregate KPI stats for the admin dashboard / orders header.
// ===========================================================================

export type OrdersStats = {
  total: number;
  byStatus: Record<OrderStatus, number>;
  /** Orders that need admin/sales action right now. */
  needsAction: number;
  /** Sum of all payments.status='paid' (all time). */
  paidRevenue: number;
  /** Sum of payments paid in the current month. */
  paidRevenueThisMonth: number;
  /** Orders created within the last 7 days. */
  newThisWeek: number;
};

export async function getOrdersStats(): Promise<OrdersStats> {
  const supabase = await createClient();

  const [
    { data: statusRows },
    { count: weekCount },
    { data: paymentsAll },
  ] = await Promise.all([
    supabase.from("orders").select("status"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString()),
    supabase.from("payments").select("amount, status, paid_at"),
  ]);

  const byStatus = Object.fromEntries(
    (Object.keys(STATUS_PRIORITY) as OrderStatus[]).map((s) => [s, 0])
  ) as Record<OrderStatus, number>;

  for (const row of (statusRows as { status: OrderStatus }[] | null) ?? []) {
    if (row.status in byStatus) byStatus[row.status] += 1;
  }
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

  const NEEDS_ACTION: OrderStatus[] = [
    "pending_review",
    "under_negotiation",
    "awaiting_customer_approval",
  ];
  const needsAction = NEEDS_ACTION.reduce((acc, s) => acc + byStatus[s], 0);

  let paidRevenue = 0;
  let paidRevenueThisMonth = 0;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  for (const p of (paymentsAll as { amount: number; status: PaymentStatus; paid_at: string | null }[] | null) ?? []) {
    if (p.status !== "paid") continue;
    const amount = Number(p.amount ?? 0);
    paidRevenue += amount;
    if (p.paid_at && p.paid_at >= monthStart) paidRevenueThisMonth += amount;
  }

  return {
    total,
    byStatus,
    needsAction,
    paidRevenue,
    paidRevenueThisMonth,
    newThisWeek: weekCount ?? 0,
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
  // Use the service-role client so the profiles join is never blocked by RLS.
  // The caller is always an authenticated page (admin or customer guard runs first).
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("order_messages")
    .select("*, sender:profiles!sender_id(id, full_name, role, avatar_url)")
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

  const rows = (data ?? []) as Array<{ receipt_url: string | null } & Record<string, unknown>>;

  // Receipts live in a private bucket — convert stored URLs to short-lived
  // signed URLs so the "View receipt" links work for both customer and admin.
  const indexed: { idx: number; url: string }[] = [];
  rows.forEach((p, i) => {
    if (p.receipt_url) indexed.push({ idx: i, url: p.receipt_url });
  });
  if (indexed.length > 0) {
    const signed = await signStorageUrls(indexed.map((x) => x.url));
    indexed.forEach(({ idx }, i) => {
      rows[idx].receipt_url = signed[i];
    });
  }

  return rows;
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
