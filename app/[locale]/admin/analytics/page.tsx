import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsCharts } from "./analytics-charts";
import { AnalyticsDateFilter } from "./analytics-date-filter";
import { TrendingUp, ShoppingCart, Users, Star, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";
import type { OrderStatus } from "@/types/database";

type Preset = "7d" | "30d" | "90d" | "12m" | "all";

function presetToFrom(preset: Preset): string | null {
  const now = Date.now();
  const ms: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 };
  const days = ms[preset];
  return days ? new Date(now - days * 86_400_000).toISOString() : null;
}

type PaymentLite = { amount: number; currency: string; paid_at: string | null; method: string };
type OrderLite = { status: string; service_id: string; created_at: string };
type ServiceLite = { id: string; name_ar: string; name_en: string };

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const intlLocale = isAr ? "ar-EG" : "en-US";
  await requireAdmin();

  const sp = await searchParams;
  const preset = (sp.period ?? "12m") as Preset;
  const fromDate = presetToFrom(preset);

  const supabase = await createClient();

  // Payments query
  let paymentsQ = supabase
    .from("payments")
    .select("amount, currency, paid_at, method")
    .eq("status", "paid")
    .limit(2000);
  if (fromDate) paymentsQ = paymentsQ.gte("paid_at", fromDate);

  // Orders query
  let ordersQ = supabase.from("orders").select("status, service_id, created_at");
  if (fromDate) ordersQ = ordersQ.gte("created_at", fromDate);

  // New customers
  let customersQ = supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer");
  if (fromDate) customersQ = customersQ.gte("created_at", fromDate);

  // Reviews
  let reviewsQ = supabase.from("reviews").select("rating");
  if (fromDate) reviewsQ = reviewsQ.gte("created_at", fromDate);

  // Previous period (for revenue delta)
  let prevQ: Promise<{ data: { amount: number }[] | null }> = Promise.resolve({ data: [] });
  if (fromDate && preset !== "all") {
    const periodMs = Date.now() - new Date(fromDate).getTime();
    const prevFrom = new Date(Date.now() - periodMs * 2).toISOString();
    prevQ = supabase
      .from("payments")
      .select("amount")
      .eq("status", "paid")
      .gte("paid_at", prevFrom)
      .lt("paid_at", fromDate) as unknown as Promise<{ data: { amount: number }[] | null }>;
  }

  const [
    { data: paymentsRaw },
    { data: ordersRaw },
    { data: servicesRaw },
    { count: newCustomers },
    { data: reviewsRaw },
    { data: prevPaymentsRaw },
  ] = await Promise.all([
    paymentsQ,
    ordersQ,
    supabase.from("services").select("id, name_ar, name_en"),
    customersQ,
    reviewsQ,
    prevQ,
  ]);

  const allPayments = (paymentsRaw as PaymentLite[]) ?? [];
  const allOrders = (ordersRaw as OrderLite[]) ?? [];
  const allServices = (servicesRaw as ServiceLite[]) ?? [];
  const allRatings = ((reviewsRaw as { rating: number }[] | null) ?? []).map((r) => r.rating);
  const prevRevenue = ((prevPaymentsRaw as { amount: number }[] | null) ?? []).reduce(
    (a, p) => a + Number(p.amount),
    0
  );

  const totalRevenue = allPayments.reduce((a, p) => a + Number(p.amount), 0);
  const avgOrderValue = allPayments.length ? totalRevenue / allPayments.length : 0;
  const avgRating = allRatings.length
    ? (allRatings.reduce((a, r) => a + r, 0) / allRatings.length).toFixed(1)
    : "—";

  const revenueDelta =
    prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : null;

  const revenueByMonth = buildMonthlyRevenue(allPayments);
  const ordersByStatus = buildStatusBreakdown(allOrders);
  const topServices = buildTopServices(allOrders, allServices, isAr);
  const paymentMethods = buildPaymentMethods(allPayments);
  const conversionFunnel = buildConversionFunnel(allOrders, isAr);

  const kpiTiles = [
    {
      label: isAr ? "إجمالي الإيرادات" : "Total revenue",
      value: formatCurrency(totalRevenue, "EGP", intlLocale),
      sub:
        revenueDelta !== null
          ? `${revenueDelta >= 0 ? "+" : ""}${revenueDelta.toFixed(1)}% ${isAr ? "عن السابق" : "vs prev"}`
          : undefined,
      positive: revenueDelta !== null ? revenueDelta >= 0 : null,
      icon: TrendingUp,
      accent: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    },
    {
      label: isAr ? "إجمالي الطلبات" : "Total orders",
      value: allOrders.length.toLocaleString(intlLocale),
      icon: ShoppingCart,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: isAr ? "عملاء جدد" : "New customers",
      value: (newCustomers ?? 0).toLocaleString(intlLocale),
      icon: Users,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: isAr ? "متوسط قيمة الطلب" : "Avg order value",
      value: formatCurrency(avgOrderValue, "EGP", intlLocale),
      icon: CreditCard,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: isAr ? "متوسط التقييم" : "Avg rating",
      value: String(avgRating),
      sub: isAr ? `${allRatings.length} تقييم` : `${allRatings.length} reviews`,
      icon: Star,
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? "التحليلات" : "Analytics"}</h1>
          <p className="text-muted-foreground text-sm">
            {isAr ? "نظرة عامة على الأداء" : "Performance overview"}
          </p>
        </div>
        <AnalyticsDateFilter locale={locale} />
      </header>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        {kpiTiles.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-lg p-2 ${t.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground line-clamp-1">{t.label}</p>
                  <p className="text-xl font-bold mt-0.5 tabular-nums">{t.value}</p>
                  {t.sub && (
                    <p
                      className={`text-[10px] mt-0.5 inline-flex items-center gap-0.5 ${
                        t.positive === true
                          ? "text-emerald-600 dark:text-emerald-400"
                          : t.positive === false
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t.positive === true && <ArrowUpRight className="h-3 w-3" />}
                      {t.positive === false && <ArrowDownRight className="h-3 w-3" />}
                      {t.sub}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AnalyticsCharts
        locale={locale}
        revenueByMonth={revenueByMonth}
        ordersByStatus={ordersByStatus}
        topServices={topServices}
        paymentMethods={paymentMethods}
        conversionFunnel={conversionFunnel}
      />
    </div>
  );
}

function buildMonthlyRevenue(payments: PaymentLite[]) {
  const map = new Map<string, number>();
  for (const p of payments) {
    if (!p.paid_at) continue;
    const month = p.paid_at.slice(0, 7);
    map.set(month, (map.get(month) ?? 0) + Number(p.amount));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
}

function buildStatusBreakdown(orders: OrderLite[]) {
  const map = new Map<string, number>();
  for (const o of orders) map.set(o.status, (map.get(o.status) ?? 0) + 1);
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

function buildTopServices(
  orders: OrderLite[],
  services: ServiceLite[],
  isAr: boolean
) {
  const map = new Map<string, number>();
  for (const o of orders) map.set(o.service_id, (map.get(o.service_id) ?? 0) + 1);
  const svcMap = new Map(services.map((s) => [s.id, isAr ? s.name_ar : s.name_en]));
  return Array.from(map.entries())
    .map(([id, count]) => ({ name: svcMap.get(id) ?? "—", count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function buildPaymentMethods(payments: PaymentLite[]) {
  const map = new Map<string, { amount: number; count: number }>();
  for (const p of payments) {
    const cur = map.get(p.method) ?? { amount: 0, count: 0 };
    cur.amount += Number(p.amount);
    cur.count += 1;
    map.set(p.method, cur);
  }
  return Array.from(map.entries())
    .map(([method, { amount, count }]) => ({ method, amount, count }))
    .sort((a, b) => b.amount - a.amount);
}

function buildConversionFunnel(orders: OrderLite[], isAr: boolean) {
  const STATUS_ORDER: OrderStatus[] = [
    "pending_review",
    "under_negotiation",
    "awaiting_customer_approval",
    "awaiting_payment",
    "in_progress",
    "delivered",
    "completed",
  ];
  const map = new Map<string, number>();
  for (const o of orders) map.set(o.status, (map.get(o.status) ?? 0) + 1);
  return STATUS_ORDER.map((s) => ({
    stage: isAr ? ORDER_STATUS_LABELS[s]?.ar ?? s : ORDER_STATUS_LABELS[s]?.en ?? s,
    count: map.get(s) ?? 0,
  })).filter((f) => f.count > 0);
}
