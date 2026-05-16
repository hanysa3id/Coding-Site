import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { getPaymentsSettings } from "@/lib/settings/get";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  ShoppingCart,
  Users,
  Briefcase,
  CreditCard,
  TrendingUp,
  Zap,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { OrderStatus } from "@/types/database";

type RecentOrder = {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  final_price: number | null;
  estimated_price: number | null;
  currency: string;
  profiles: { full_name: string | null } | null;
  services: { name_ar: string; name_en: string } | null;
};

type AttentionOrder = {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  services: { name_ar: string; name_en: string } | null;
};

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  bgClass: string;
  href?: string;
}) {
  const inner = (
    <Card className={cn("transition-all", href && "hover:shadow-md hover:-translate-y-px cursor-pointer")}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bgClass)}>
            <Icon className={cn("h-5 w-5", iconClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const intlLocale = isAr ? "ar-EG" : "en-US";
  const supabase = await createClient();

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  const [
    { count: totalOrders },
    { count: thisMonthOrders },
    { count: pendingCount },
    { count: inProgressCount },
    { count: customerCount },
    { data: paidPayments },
    { data: recentOrders },
    { data: attentionOrders },
    paymentsSettings,
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending_review", "under_negotiation"]),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase.from("payments").select("amount").eq("status", "paid"),
    supabase
      .from("orders")
      .select(
        "id, order_number, status, created_at, final_price, estimated_price, currency, profiles!customer_id(full_name), services(name_ar, name_en)"
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("id, order_number, status, created_at, services(name_ar, name_en)")
      .in("status", ["pending_review", "awaiting_customer_approval", "awaiting_payment"])
      .order("created_at", { ascending: true })
      .limit(5),
    getPaymentsSettings(),
  ]);

  const currency = paymentsSettings?.currency ?? "EGP";
  const totalRevenue = ((paidPayments as { amount: number }[] | null) ?? []).reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const recent = (recentOrders as RecentOrder[] | null) ?? [];
  const attention = (attentionOrders as AttentionOrder[] | null) ?? [];

  const quickActions = [
    { href: "/admin/services", labelAr: "خدمة جديدة", labelEn: "New service", icon: Briefcase },
    { href: "/admin/portfolio", labelAr: "مشروع جديد", labelEn: "New project", icon: ImageIcon },
    { href: "/admin/blog", labelAr: "مقالة جديدة", labelEn: "New post", icon: FileText },
    { href: "/admin/orders", labelAr: "كل الطلبات", labelEn: "All orders", icon: ShoppingCart },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isAr ? "لوحة التحكم" : "Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isAr ? "نظرة عامة على نشاط المنصة" : "Overview of platform activity"}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={isAr ? "إجمالي الطلبات" : "Total orders"}
          value={totalOrders ?? 0}
          icon={ShoppingCart}
          bgClass="bg-blue-100 dark:bg-blue-900/30"
          iconClass="text-blue-600 dark:text-blue-400"
          href="/admin/orders"
        />
        <StatCard
          label={isAr ? "طلبات هذا الشهر" : "Orders this month"}
          value={thisMonthOrders ?? 0}
          icon={TrendingUp}
          bgClass="bg-violet-100 dark:bg-violet-900/30"
          iconClass="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label={isAr ? "قيد المراجعة" : "Pending review"}
          value={pendingCount ?? 0}
          icon={Clock}
          bgClass="bg-amber-100 dark:bg-amber-900/30"
          iconClass="text-amber-600 dark:text-amber-400"
          href="/admin/orders?statuses=pending_review,under_negotiation"
        />
        <StatCard
          label={isAr ? "جارية التنفيذ" : "In progress"}
          value={inProgressCount ?? 0}
          icon={Zap}
          bgClass="bg-sky-100 dark:bg-sky-900/30"
          iconClass="text-sky-600 dark:text-sky-400"
          href="/admin/orders?statuses=in_progress"
        />
        <StatCard
          label={isAr ? "إجمالي الإيرادات" : "Total revenue"}
          value={formatCurrency(totalRevenue, currency, intlLocale)}
          icon={CreditCard}
          bgClass="bg-emerald-100 dark:bg-emerald-900/30"
          iconClass="text-emerald-600 dark:text-emerald-400"
          href="/admin/payments"
        />
        <StatCard
          label={isAr ? "العملاء" : "Customers"}
          value={customerCount ?? 0}
          icon={Users}
          bgClass="bg-rose-100 dark:bg-rose-900/30"
          iconClass="text-rose-600 dark:text-rose-400"
          href="/admin/customers"
        />
      </div>

      {/* Content area */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">
              {isAr ? "آخر الطلبات" : "Recent orders"}
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
              <Link href="/admin/orders">
                {isAr ? "عرض الكل" : "View all"}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                {isAr ? "لا توجد طلبات حتى الآن" : "No orders yet"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-muted-foreground">
                      <th className="px-4 py-2.5 text-start text-xs font-medium">
                        {isAr ? "الطلب" : "Order"}
                      </th>
                      <th className="px-4 py-2.5 text-start text-xs font-medium">
                        {isAr ? "العميل" : "Customer"}
                      </th>
                      <th className="hidden px-4 py-2.5 text-start text-xs font-medium sm:table-cell">
                        {isAr ? "الخدمة" : "Service"}
                      </th>
                      <th className="px-4 py-2.5 text-start text-xs font-medium">
                        {isAr ? "الحالة" : "Status"}
                      </th>
                      <th className="px-4 py-2.5 text-end text-xs font-medium">
                        {isAr ? "المبلغ" : "Amount"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recent.map((order) => {
                      const amount = order.final_price ?? order.estimated_price;
                      return (
                        <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-mono text-xs text-primary hover:underline"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="max-w-[100px] truncate px-4 py-3 text-xs text-muted-foreground">
                            {order.profiles?.full_name ?? "—"}
                          </td>
                          <td className="hidden max-w-[120px] truncate px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                            {(isAr ? order.services?.name_ar : order.services?.name_en) ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <OrderStatusBadge status={order.status} locale={locale} />
                          </td>
                          <td className="px-4 py-3 text-end font-mono text-xs tabular-nums">
                            {amount
                              ? formatCurrency(amount, order.currency, intlLocale)
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Attention needed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {attention.length > 0 ? (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                {isAr ? "تحتاج انتباهاً" : "Needs attention"}
                {attention.length > 0 && (
                  <span className="ms-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    {attention.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {attention.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isAr ? "كل شيء على ما يرام" : "All clear — nothing pending"}
                </p>
              ) : (
                attention.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-start justify-between gap-2 rounded-lg border p-3 transition hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-primary">{order.order_number}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {(isAr ? order.services?.name_ar : order.services?.name_en) ?? "—"}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} locale={locale} />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {isAr ? "إجراءات سريعة" : "Quick actions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.href}
                    asChild
                    variant="outline"
                    className="h-auto flex-col gap-2 py-4"
                  >
                    <Link href={action.href}>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {isAr ? action.labelAr : action.labelEn}
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
