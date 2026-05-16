"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";
import type { OrderStatus } from "@/types/database";

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#a855f7",
];

const METHOD_LABELS: Record<string, { ar: string; en: string }> = {
  paymob: { ar: "بطاقة (PayMob)", en: "Card (PayMob)" },
  bank_transfer: { ar: "تحويل بنكي", en: "Bank transfer" },
  cash: { ar: "كاش", en: "Cash" },
  instapay: { ar: "InstaPay", en: "InstaPay" },
  vodafone_cash: { ar: "Vodafone Cash", en: "Vodafone Cash" },
};

export function AnalyticsCharts({
  locale,
  revenueByMonth,
  ordersByStatus,
  topServices,
  paymentMethods,
  conversionFunnel,
}: {
  locale: string;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topServices: { name: string; count: number }[];
  paymentMethods: { method: string; amount: number; count: number }[];
  conversionFunnel: { stage: string; count: number }[];
}) {
  const isAr = locale === "ar";

  const statusData = ordersByStatus.map((s) => ({
    name:
      isAr
        ? ORDER_STATUS_LABELS[s.status as OrderStatus]?.ar ?? s.status
        : ORDER_STATUS_LABELS[s.status as OrderStatus]?.en ?? s.status,
    value: s.count,
  }));

  const methodData = paymentMethods.map((m) => ({
    name:
      isAr
        ? METHOD_LABELS[m.method]?.ar ?? m.method
        : METHOD_LABELS[m.method]?.en ?? m.method,
    amount: m.amount,
    count: m.count,
  }));

  const funnelData = conversionFunnel.map((f) => ({ ...f }));

  const empty = (
    <p className="text-sm text-muted-foreground text-center py-8">
      {isAr ? "لا توجد بيانات بعد" : "No data yet"}
    </p>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue trend — full width */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{isAr ? "الإيرادات الشهرية" : "Monthly revenue"}</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueByMonth.length === 0 ? (
            empty
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Orders by status */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isAr ? "توزيع الطلبات حسب الحالة" : "Orders by status"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            empty
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Payment methods breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isAr ? "طرق الدفع (الإيرادات)" : "Payment methods (revenue)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {methodData.length === 0 ? (
            empty
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={methodData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="amount" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top services */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "أكثر الخدمات طلباً" : "Top services"}</CardTitle>
        </CardHeader>
        <CardContent>
          {topServices.length === 0 ? (
            empty
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topServices}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Conversion funnel */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isAr ? "مسار تحويل الطلبات" : "Order conversion funnel"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {funnelData.length === 0 ? (
            empty
          ) : (
            <div className="space-y-3 pt-2">
              {funnelData.map((f, i) => {
                const maxCount = funnelData[0]?.count ?? 1;
                const pct = Math.round((f.count / maxCount) * 100);
                return (
                  <div key={f.stage} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{f.stage}</span>
                      <span className="tabular-nums font-medium">
                        {f.count.toLocaleString(isAr ? "ar-EG" : "en-US")}
                        <span className="text-muted-foreground ms-1">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
