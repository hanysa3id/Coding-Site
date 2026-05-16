import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { OrdersStats } from "@/lib/queries/orders";

type Props = {
  stats: OrdersStats;
  currency: string;
  locale: string;
};

export function OrdersStatsStrip({ stats, currency, locale }: Props) {
  const isAr = locale === "ar";
  const intlLocale = isAr ? "ar-EG" : "en-US";

  const inProgress =
    stats.byStatus.in_progress + stats.byStatus.awaiting_payment;
  const delivered = stats.byStatus.delivered + stats.byStatus.completed;

  const tiles: Array<{
    label: string;
    value: string;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }> = [
    {
      label: isAr ? "إجمالي الطلبات" : "Total orders",
      value: stats.total.toLocaleString(intlLocale),
      sub: isAr ? `${stats.newThisWeek} هذا الأسبوع` : `${stats.newThisWeek} this week`,
      icon: Activity,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: isAr ? "بحاجة لإجراء" : "Needs action",
      value: stats.needsAction.toLocaleString(intlLocale),
      sub: isAr ? "مراجعة / تفاوض / موافقة" : "review · negotiation · approval",
      icon: AlertCircle,
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: isAr ? "قيد التنفيذ" : "In progress",
      value: inProgress.toLocaleString(intlLocale),
      sub: isAr ? "بانتظار الدفع + تنفيذ" : "awaiting payment + executing",
      icon: Clock,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: isAr ? "مُسلَّمة" : "Delivered",
      value: delivered.toLocaleString(intlLocale),
      sub: isAr ? "تسليم + مكتمل" : "delivered + completed",
      icon: CheckCircle2,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: isAr ? "إيرادات هذا الشهر" : "Revenue this month",
      value: formatCurrency(stats.paidRevenueThisMonth, currency, intlLocale),
      sub: isAr ? `إجمالي: ${formatCurrency(stats.paidRevenue, currency, intlLocale)}` : `total: ${formatCurrency(stats.paidRevenue, currency, intlLocale)}`,
      icon: TrendingUp,
      accent: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    },
    {
      label: isAr ? "بانتظار الدفع" : "Awaiting payment",
      value: stats.byStatus.awaiting_payment.toLocaleString(intlLocale),
      sub: isAr ? "حالات تنتظر دفعة" : "orders waiting for payment",
      icon: CreditCard,
      accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
                {t.sub && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{t.sub}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
