import { type NextRequest } from "next/server";
import { requireStaff } from "@/lib/auth/guards";
import { listAllOrdersAdvanced, type OrderSort, type OrderListFilter } from "@/lib/queries/orders";
import { serializeCsv, csvResponse } from "@/lib/csv/serialize";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";
import type { OrderStatus } from "@/types/database";

const ALL_STATUSES: OrderStatus[] = [
  "pending_review",
  "under_negotiation",
  "awaiting_customer_approval",
  "awaiting_payment",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
];

function parseStatuses(raw: string | null): OrderStatus[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is OrderStatus => ALL_STATUSES.includes(s as OrderStatus));
  return parts.length ? parts : undefined;
}

/**
 * Filtered CSV export. Honors the same query params the admin orders page
 * uses, so "export current view" gives the admin exactly what they see.
 *
 * Cap at 5000 rows so a runaway export can't hammer the database.
 */
export async function GET(req: NextRequest) {
  await requireStaff();

  const url = new URL(req.url);
  const sp = url.searchParams;

  const filter: OrderListFilter = {
    statuses: parseStatuses(sp.get("statuses")),
    search: sp.get("q") ?? undefined,
    service_id: sp.get("service") ?? undefined,
    assigned_staff_id: sp.get("staff") ?? undefined,
    payment_status: (sp.get("payment") as "paid" | "unpaid" | undefined) ?? undefined,
    date_from: sp.get("from") ?? undefined,
    date_to: sp.get("to") ?? undefined,
    sort: (sp.get("sort") as OrderSort) ?? "newest",
  };

  const { rows } = await listAllOrdersAdvanced(filter, { from: 0, to: 4999 });

  const columns = [
    "order_number",
    "status",
    "status_label",
    "customer_name",
    "customer_email",
    "customer_phone",
    "service_name",
    "estimated_price",
    "final_price",
    "currency",
    "estimated_duration_days",
    "final_duration_days",
    "paid",
    "paid_amount",
    "assigned_staff",
    "sales_person",
    "created_at",
    "updated_at",
  ];

  const csvRows = rows.map((o) => ({
    order_number: o.order_number,
    status: o.status,
    status_label: ORDER_STATUS_LABELS[o.status]?.en ?? o.status,
    customer_name: o.customer?.full_name ?? "",
    customer_email: o.customer?.email ?? "",
    customer_phone: o.customer?.phone ?? "",
    service_name: o.services?.name_en ?? "",
    estimated_price: o.estimated_price ?? "",
    final_price: o.final_price ?? "",
    currency: o.currency,
    estimated_duration_days: o.estimated_duration_days ?? "",
    final_duration_days: o.final_duration_days ?? "",
    paid: o.payment_summary.has_paid,
    paid_amount: o.payment_summary.paid_amount,
    assigned_staff: o.assigned_staff?.full_name ?? "",
    sales_person: o.sales?.full_name ?? "",
    created_at: o.created_at,
    updated_at: o.updated_at,
  }));

  const csv = serializeCsv(csvRows, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `orders-${stamp}.csv`);
}
