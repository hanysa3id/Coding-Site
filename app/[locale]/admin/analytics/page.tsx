import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsCharts } from "./analytics-charts";

export default async function AdminAnalyticsPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  await requireAdmin();

  const supabase = await createClient();

  const [
    { data: payments },
    { data: orders },
    { data: services },
    { count: newCustomers },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("amount, currency, paid_at, status, method")
      .eq("status", "paid")
      .order("paid_at", { ascending: false })
      .limit(500),
    supabase
      .from("orders")
      .select("status, service_id, created_at, currency"),
    supabase
      .from("services")
      .select("id, name_ar, name_en"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 3600_000).toISOString()),
  ]);

  type PaymentLite = { amount: number; currency: string; paid_at: string | null; status: string; method: string };
  type OrderLite = { status: string; service_id: string; created_at: string; currency: string };
  type ServiceLite = { id: string; name_ar: string; name_en: string };

  const allPayments = (payments as PaymentLite[]) ?? [];
  const allOrders = (orders as OrderLite[]) ?? [];
  const allServices = (services as ServiceLite[]) ?? [];

  const totalRevenue = allPayments.reduce((a, p) => a + Number(p.amount), 0);
  const revenueByMonth = buildMonthlyRevenue(allPayments);
  const ordersByStatus = buildStatusBreakdown(allOrders);
  const topServices = buildTopServices(allOrders, allServices, isAr);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{isAr ? "التحليلات" : "Analytics"}</h1>
        <p className="text-muted-foreground">
          {isAr ? "نظرة عامة على الأداء" : "Performance overview"}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {isAr ? "إجمالي الإيرادات" : "Total revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(totalRevenue, "EGP", isAr ? "ar-EG" : "en-US")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {isAr ? "إجمالي الطلبات" : "Total orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{allOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {isAr ? "عملاء جدد (30 يوم)" : "New customers (30d)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{newCustomers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {isAr ? "متوسط قيمة الطلب" : "Avg order value"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(
                allPayments.length ? totalRevenue / allPayments.length : 0,
                "EGP",
                isAr ? "ar-EG" : "en-US"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <AnalyticsCharts
        locale={locale}
        revenueByMonth={revenueByMonth}
        ordersByStatus={ordersByStatus}
        topServices={topServices}
      />
    </div>
  );
}

function buildMonthlyRevenue(payments: { amount: number; paid_at: string | null }[]) {
  const map = new Map<string, number>();
  for (const p of payments) {
    if (!p.paid_at) continue;
    const month = p.paid_at.slice(0, 7);
    map.set(month, (map.get(month) ?? 0) + Number(p.amount));
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, revenue]) => ({ month, revenue }));
}

function buildStatusBreakdown(orders: { status: string }[]) {
  const map = new Map<string, number>();
  for (const o of orders) map.set(o.status, (map.get(o.status) ?? 0) + 1);
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

function buildTopServices(
  orders: { service_id: string }[],
  services: { id: string; name_ar: string; name_en: string }[],
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
