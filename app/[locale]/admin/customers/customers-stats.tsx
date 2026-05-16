import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, Briefcase, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export async function CustomersStats({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const intlLocale = isAr ? "ar-EG" : "en-US";
  const supabase = await createClient();

  const [{ data: roleCounts }, { data: revenueData }] = await Promise.all([
    supabase.from("profiles").select("role"),
    supabase.from("payments").select("amount").eq("status", "paid"),
  ]);

  const roles = (roleCounts as { role: string }[]) ?? [];
  const total = roles.length;
  const customers = roles.filter((r) => r.role === "customer").length;
  const team = roles.filter((r) => ["admin", "sales", "staff"].includes(r.role)).length;
  const totalRevenue = ((revenueData as { amount: number }[]) ?? []).reduce(
    (a, p) => a + Number(p.amount),
    0
  );

  const tiles = [
    {
      label: isAr ? "إجمالي المستخدمين" : "Total users",
      value: total.toLocaleString(intlLocale),
      icon: Users,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: isAr ? "العملاء" : "Customers",
      value: customers.toLocaleString(intlLocale),
      icon: UserCheck,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: isAr ? "فريق العمل" : "Team members",
      value: team.toLocaleString(intlLocale),
      icon: Briefcase,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: isAr ? "إجمالي الإيرادات" : "Total revenue",
      value: formatCurrency(totalRevenue, "EGP", intlLocale),
      icon: TrendingUp,
      accent: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => {
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
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
