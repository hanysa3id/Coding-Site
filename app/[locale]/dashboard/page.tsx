import { setRequestLocale, getLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { ShoppingCart, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/database";

const STATUS_LABELS: Record<OrderStatus, { ar: string; en: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  pending_review: { ar: "قيد المراجعة", en: "Pending review", variant: "secondary" },
  under_negotiation: { ar: "قيد التفاوض", en: "Under negotiation", variant: "warning" },
  awaiting_customer_approval: { ar: "بانتظار موافقتك", en: "Awaiting your approval", variant: "warning" },
  awaiting_payment: { ar: "بانتظار الدفع", en: "Awaiting payment", variant: "warning" },
  in_progress: { ar: "قيد التنفيذ", en: "In progress", variant: "default" },
  delivered: { ar: "تم التسليم", en: "Delivered", variant: "success" },
  completed: { ar: "مكتمل", en: "Completed", variant: "success" },
  cancelled: { ar: "ملغي", en: "Cancelled", variant: "destructive" },
  refunded: { ar: "مسترد", en: "Refunded", variant: "destructive" },
};

export default async function CustomerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  const profile = await requireUser();
  const supabase = await createClient();

  const [{ data: orders }, { count: totalOrders }, { count: completedOrders }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*, services(name_ar, name_en)")
        .eq("customer_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", profile.id),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", profile.id)
        .eq("status", "completed"),
    ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">
          {isAr ? `مرحباً ${profile.full_name ?? ""}` : `Welcome ${profile.full_name ?? ""}`}
        </h1>
        <p className="text-muted-foreground">
          {isAr ? "هذه نظرة عامة على نشاطك" : "Here's an overview of your activity"}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">
              {isAr ? "إجمالي الطلبات" : "Total orders"}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">
              {isAr ? "طلبات نشطة" : "Active orders"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalOrders ?? 0) - (completedOrders ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">
              {isAr ? "مشاريع مكتملة" : "Completed projects"}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isAr ? "آخر الطلبات" : "Recent orders"}</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/orders">
              {isAr ? "كل الطلبات" : "All orders"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground">
                {isAr ? "لا توجد طلبات بعد" : "No orders yet"}
              </p>
              <Button asChild>
                <Link href="/services">
                  {isAr ? "تصفح الخدمات" : "Browse services"}
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {(orders as (Order & { services: { name_ar: string; name_en: string } | null })[]).map((o) => {
                const status = STATUS_LABELS[o.status];
                return (
                  <li key={o.id} className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs">{o.order_number}</code>
                        <Badge variant={status.variant}>
                          {isAr ? status.ar : status.en}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">
                        {o.services ? (isAr ? o.services.name_ar : o.services.name_en) : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(o.created_at, isAr ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {(o.final_price ?? o.estimated_price) && (
                        <span className="font-medium">
                          {formatCurrency(
                            o.final_price ?? o.estimated_price!,
                            o.currency,
                            isAr ? "ar-EG" : "en-US"
                          )}
                        </span>
                      )}
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/orders/${o.id}`}>
                          {isAr ? "تفاصيل" : "Details"}
                        </Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
