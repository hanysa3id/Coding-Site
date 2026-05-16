import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Users,
  Briefcase,
  CreditCard,
  Star,
  Clock,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const supabase = await createClient();

  const [
    { count: orderCount },
    { count: pendingOrderCount },
    { count: customerCount },
    { count: serviceCount },
    { count: reviewCount },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending_review", "under_negotiation"]),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      label: isAr ? "إجمالي الطلبات" : "Total orders",
      value: orderCount ?? 0,
      icon: ShoppingCart,
    },
    {
      label: isAr ? "طلبات قيد المراجعة" : "Pending review",
      value: pendingOrderCount ?? 0,
      icon: Clock,
    },
    {
      label: isAr ? "العملاء" : "Customers",
      value: customerCount ?? 0,
      icon: Users,
    },
    {
      label: isAr ? "الخدمات" : "Services",
      value: serviceCount ?? 0,
      icon: Briefcase,
    },
    {
      label: isAr ? "التقييمات" : "Reviews",
      value: reviewCount ?? 0,
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "لوحة التحكم" : "Dashboard"}</h1>
        <p className="text-muted-foreground">
          {isAr ? "نظرة عامة على نشاط المنصة" : "Overview of platform activity"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
