import { getLocale } from "next-intl/server";
import { listAllOrders } from "@/lib/queries/orders";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { AdminPagination } from "@/components/admin/pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { parsePage, pageRange, totalPages } from "@/lib/pagination";
import { ArrowRight } from "lucide-react";
import type { OrderStatus } from "@/types/database";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: OrderStatus; page?: string }>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const range = pageRange(page);

  const { rows: orders, total } = await listAllOrders(
    { status: sp.status },
    { from: range.from, to: range.to }
  );

  const statusFilters: (OrderStatus | "all")[] = [
    "all",
    "pending_review",
    "under_negotiation",
    "awaiting_customer_approval",
    "awaiting_payment",
    "in_progress",
    "delivered",
    "completed",
    "cancelled",
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{isAr ? "الطلبات" : "Orders"}</h1>
        <p className="text-muted-foreground">
          {isAr ? `${total} طلب` : `${total} orders`}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const isActive = f === "all" ? !sp.status : f === sp.status;
          const href = f === "all" ? "/admin/orders" : `/admin/orders?status=${f}`;
          const label =
            f === "all"
              ? isAr ? "الكل" : "All"
              : isAr
                ? statusLabel(f).ar
                : statusLabel(f).en;
          return (
            <Link
              key={f}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {isAr ? "لا توجد طلبات" : "No orders"}
            </p>
          ) : (
            <ul className="divide-y">
              {orders.map((o) => (
                <li key={o.id} className="p-4 hover:bg-muted/30">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {o.services?.cover_image && (
                        <div
                          className="h-12 w-12 shrink-0 rounded bg-cover bg-center"
                          style={{ backgroundImage: `url(${o.services.cover_image})` }}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <code className="text-xs">{o.order_number}</code>
                          <OrderStatusBadge status={o.status} locale={locale} />
                        </div>
                        <p className="font-medium truncate">
                          {o.services
                            ? isAr
                              ? o.services.name_ar
                              : o.services.name_en
                            : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {o.customer?.full_name ?? "—"} ·{" "}
                          {formatDate(o.created_at, isAr ? "ar-EG" : "en-US")}
                        </p>
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      {(o.final_price ?? o.estimated_price) && (
                        <p className="font-semibold">
                          {formatCurrency(
                            o.final_price ?? o.estimated_price!,
                            o.currency,
                            isAr ? "ar-EG" : "en-US"
                          )}
                        </p>
                      )}
                      <ArrowRight className="h-4 w-4 mt-1 ms-auto rtl:rotate-180 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AdminPagination
        page={page}
        totalPages={totalPages(total)}
        totalItems={total}
        basePath="/admin/orders"
        preserveParams={{ status: sp.status }}
        locale={locale}
      />
    </div>
  );
}

function statusLabel(s: OrderStatus): { ar: string; en: string } {
  const map: Record<OrderStatus, { ar: string; en: string }> = {
    pending_review: { ar: "مراجعة", en: "Review" },
    under_negotiation: { ar: "تفاوض", en: "Negotiation" },
    awaiting_customer_approval: { ar: "بانتظار العميل", en: "Awaiting customer" },
    awaiting_payment: { ar: "بانتظار الدفع", en: "Awaiting payment" },
    in_progress: { ar: "قيد التنفيذ", en: "In progress" },
    delivered: { ar: "مُسلّم", en: "Delivered" },
    completed: { ar: "مكتمل", en: "Completed" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    refunded: { ar: "مسترد", en: "Refunded" },
  };
  return map[s];
}
