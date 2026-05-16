"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  ArrowRight,
  LayoutGrid,
  Rows3,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderRow } from "@/lib/queries/orders";

type Props = {
  orders: OrderRow[];
  locale: string;
};

type ViewMode = "cards" | "table";

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function OrdersList({ orders, locale }: Props) {
  const isAr = locale === "ar";
  const intlLocale = isAr ? "ar-EG" : "en-US";

  const [view, setView] = useState<ViewMode>("cards");

  // Persist the view choice so admins don't have to flip it every page load.
  useEffect(() => {
    const saved = (typeof window !== "undefined"
      ? localStorage.getItem("admin_orders_view")
      : null) as ViewMode | null;
    if (saved === "cards" || saved === "table") setView(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("admin_orders_view", view);
  }, [view]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-md border bg-background overflow-hidden">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs ${
              view === "cards" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
            aria-pressed={view === "cards"}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {isAr ? "بطاقات" : "Cards"}
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs ${
              view === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
            aria-pressed={view === "table"}
          >
            <Rows3 className="h-3.5 w-3.5" />
            {isAr ? "جدول" : "Table"}
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>{isAr ? "لا توجد طلبات تطابق الفلاتر" : "No orders match the current filters"}</p>
          </CardContent>
        </Card>
      ) : view === "cards" ? (
        <OrdersCards orders={orders} locale={locale} intlLocale={intlLocale} />
      ) : (
        <OrdersTable orders={orders} locale={locale} intlLocale={intlLocale} />
      )}
    </div>
  );
}

// ===========================================================================
// CARD VIEW — large rows with cover image, customer, payment, age
// ===========================================================================
function OrdersCards({
  orders,
  locale,
  intlLocale,
}: {
  orders: OrderRow[];
  locale: string;
  intlLocale: string;
}) {
  const isAr = locale === "ar";

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {orders.map((o) => {
            const days = daysSince(o.created_at);
            const isStale =
              days >= 3 &&
              ["pending_review", "under_negotiation", "awaiting_customer_approval"].includes(o.status);
            const amount = o.final_price ?? o.estimated_price;

            return (
              <li key={o.id} className="p-4 hover:bg-muted/30 transition">
                <Link href={`/admin/orders/${o.id}`} className="block">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-md bg-muted border overflow-hidden relative">
                      {o.services?.cover_image ? (
                        <Image
                          src={o.services.cover_image}
                          alt={o.services.name_en ?? ""}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <code className="text-xs font-mono">{o.order_number}</code>
                        <OrderStatusBadge status={o.status} locale={locale} />
                        {o.payment_summary.has_paid && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {isAr ? "مدفوع" : "Paid"}
                          </Badge>
                        )}
                        {isStale && (
                          <Badge variant="warning" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {isAr ? `${days} يوم بدون تحديث` : `${days}d stale`}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium truncate">
                        {o.services
                          ? isAr
                            ? o.services.name_ar
                            : o.services.name_en
                          : "—"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <UserIcon className="h-3 w-3" />
                          {o.customer?.full_name ?? "—"}
                        </span>
                        <span>·</span>
                        <span>{formatDate(o.created_at, intlLocale)}</span>
                        {o.assigned_staff && (
                          <>
                            <span>·</span>
                            <span>
                              {isAr ? "مكلَّف: " : "Assigned: "}
                              <span className="font-medium text-foreground">
                                {o.assigned_staff.full_name}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-end shrink-0 min-w-[100px]">
                      {amount != null && (
                        <p className="font-bold tabular-nums">
                          {formatCurrency(amount, o.currency, intlLocale)}
                        </p>
                      )}
                      {o.payment_summary.paid_amount > 0 && amount != null &&
                        o.payment_summary.paid_amount < amount && (
                          <p className="text-[10px] text-muted-foreground">
                            {isAr ? "مدفوع: " : "Paid: "}
                            {formatCurrency(
                              o.payment_summary.paid_amount,
                              o.currency,
                              intlLocale
                            )}
                          </p>
                        )}
                      <ArrowRight className="h-4 w-4 mt-1 ms-auto rtl:rotate-180 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

// ===========================================================================
// TABLE VIEW — compact, sortable columns
// ===========================================================================
function OrdersTable({
  orders,
  locale,
  intlLocale,
}: {
  orders: OrderRow[];
  locale: string;
  intlLocale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const currentSort = search.get("sort") ?? "newest";

  function clickSort(field: "newest" | "oldest" | "price_desc" | "price_asc") {
    const params = new URLSearchParams(search.toString());
    params.set("sort", field);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs">
              <tr className="text-start">
                <Th>{isAr ? "الطلب" : "Order"}</Th>
                <Th>{isAr ? "العميل" : "Customer"}</Th>
                <Th>{isAr ? "الخدمة" : "Service"}</Th>
                <Th>{isAr ? "الحالة" : "Status"}</Th>
                <Th>{isAr ? "الدفع" : "Payment"}</Th>
                <Th
                  sortable
                  active={currentSort === "price_desc" || currentSort === "price_asc"}
                  direction={currentSort === "price_desc" ? "desc" : "asc"}
                  onClick={() =>
                    clickSort(currentSort === "price_desc" ? "price_asc" : "price_desc")
                  }
                >
                  {isAr ? "المبلغ" : "Amount"}
                </Th>
                <Th
                  sortable
                  active={currentSort === "newest" || currentSort === "oldest"}
                  direction={currentSort === "newest" ? "desc" : "asc"}
                  onClick={() =>
                    clickSort(currentSort === "newest" ? "oldest" : "newest")
                  }
                >
                  {isAr ? "أُنشئ" : "Created"}
                </Th>
                <Th>{isAr ? "مكلَّف" : "Assigned"}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const days = daysSince(o.created_at);
                const isStale =
                  days >= 3 &&
                  ["pending_review", "under_negotiation", "awaiting_customer_approval"].includes(o.status);
                const amount = o.final_price ?? o.estimated_price;

                return (
                  <tr
                    key={o.id}
                    onClick={() =>
                      router.push(`/${locale}/admin/orders/${o.id}`)
                    }
                    className="border-t hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="px-3 py-2.5">
                      <code className="text-xs font-mono">{o.order_number}</code>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium truncate max-w-[160px]">
                        {o.customer?.full_name ?? "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[160px]" dir="ltr">
                        {o.customer?.email ?? ""}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="truncate max-w-[200px]">
                        {o.services
                          ? isAr
                            ? o.services.name_ar
                            : o.services.name_en
                          : "—"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <OrderStatusBadge status={o.status} locale={locale} />
                    </td>
                    <td className="px-3 py-2.5">
                      {o.payment_summary.has_paid ? (
                        <Badge variant="success">{isAr ? "مدفوع" : "Paid"}</Badge>
                      ) : (
                        <Badge variant="outline">{isAr ? "—" : "—"}</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums font-medium">
                      {amount != null
                        ? formatCurrency(amount, o.currency, intlLocale)
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-xs whitespace-nowrap">
                        {formatDate(o.created_at, intlLocale)}
                      </p>
                      {isStale && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">
                          {isAr ? `${days}ي بدون تحديث` : `${days}d stale`}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {o.assigned_staff?.full_name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Button asChild size="icon" variant="ghost">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Th({
  children,
  sortable,
  active,
  direction,
  onClick,
}: {
  children?: React.ReactNode;
  sortable?: boolean;
  active?: boolean;
  direction?: "asc" | "desc";
  onClick?: () => void;
}) {
  return (
    <th
      className={`px-3 py-2 text-start font-semibold text-muted-foreground whitespace-nowrap ${
        sortable ? "cursor-pointer hover:text-foreground select-none" : ""
      }`}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span
            className={`opacity-${active ? "100" : "30"} text-foreground`}
            aria-hidden
          >
            {active && direction === "asc" ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </span>
        )}
      </span>
    </th>
  );
}
