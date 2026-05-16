import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/guards";
import { listAllOrdersAdvanced, getOrdersStats } from "@/lib/queries/orders";
import { AdminPagination } from "@/components/admin/pagination";
import { parsePage, pageRange, totalPages } from "@/lib/pagination";
import { getPaymentsSettings } from "@/lib/settings/get";
import { OrdersStatsStrip } from "./_components/orders-stats-strip";
import { OrdersFilters } from "./_components/orders-filters";
import { OrdersList } from "./_components/orders-list";
import type { OrderStatus } from "@/types/database";
import type { OrderSort } from "@/lib/queries/orders";

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

function parseStatuses(raw: string | undefined): OrderStatus[] | undefined {
  if (!raw) return undefined;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is OrderStatus => ALL_STATUSES.includes(s as OrderStatus));
  return parts.length ? parts : undefined;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireStaff();
  const locale = await getLocale();
  const isAr = locale === "ar";
  const sp = await searchParams;

  // Pagination
  const page = parsePage(sp.page);
  const range = pageRange(page);

  // Build filter from URL
  const statuses = parseStatuses(sp.statuses);
  // Back-compat: support legacy single-status param
  const legacyStatus =
    sp.status && ALL_STATUSES.includes(sp.status as OrderStatus)
      ? [sp.status as OrderStatus]
      : undefined;
  const filter = {
    statuses: statuses ?? legacyStatus,
    search: sp.q,
    service_id: sp.service,
    assigned_staff_id: sp.staff,
    date_from: sp.from,
    date_to: sp.to,
    payment_status: (sp.payment as "paid" | "unpaid" | undefined) ?? undefined,
    sort: (sp.sort as OrderSort) ?? "newest",
  };

  // Parallel fetch: orders + stats + dropdown options + currency
  const supabase = await createClient();
  const [
    { rows: orders, total },
    stats,
    { data: services },
    { data: staff },
    paymentsSettings,
  ] = await Promise.all([
    listAllOrdersAdvanced(filter, { from: range.from, to: range.to }),
    getOrdersStats(),
    supabase
      .from("services")
      .select("id, name_ar, name_en")
      .order("sort_order", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["admin", "sales", "staff"])
      .order("full_name", { ascending: true }),
    getPaymentsSettings(),
  ]);

  const currency = paymentsSettings?.currency ?? "EGP";

  type SvcRow = { id: string; name_ar: string; name_en: string };
  type StaffRow = { id: string; full_name: string | null; role: string };
  const serviceOptions = ((services as SvcRow[] | null) ?? []).map((s) => ({
    id: s.id,
    name: isAr ? s.name_ar : s.name_en,
  }));
  const staffOptions = ((staff as StaffRow[] | null) ?? []).map((s) => ({
    id: s.id,
    name: `${s.full_name ?? s.id.slice(0, 6)} · ${s.role}`,
  }));

  // Build export URL preserving current filters
  const exportParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v != null && v !== "" && k !== "page") exportParams.set(k, v);
  }
  const exportHref = `/api/admin/orders/export${exportParams.toString() ? `?${exportParams}` : ""}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? "الطلبات" : "Orders"}</h1>
          <p className="text-muted-foreground text-sm">
            {isAr
              ? "إدارة كل الطلبات الواردة والجارية"
              : "Manage all incoming and active orders"}
          </p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {isAr
            ? `عرض ${orders.length} من ${total} طلب`
            : `Showing ${orders.length} of ${total} orders`}
        </p>
      </header>

      <OrdersStatsStrip stats={stats} currency={currency} locale={locale} />

      <OrdersFilters
        locale={locale}
        services={serviceOptions}
        staff={staffOptions}
        exportHref={exportHref}
      />

      <OrdersList orders={orders} locale={locale} />

      <AdminPagination
        page={page}
        totalPages={totalPages(total)}
        totalItems={total}
        basePath="/admin/orders"
        preserveParams={sp}
        locale={locale}
      />
    </div>
  );
}
