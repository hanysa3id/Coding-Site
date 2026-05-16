"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
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

const COLORS = ["#2563eb", "#7c3aed", "#16a34a", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16", "#a855f7"];

export function AnalyticsCharts({
  locale,
  revenueByMonth,
  ordersByStatus,
  topServices,
}: {
  locale: string;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topServices: { name: string; count: number }[];
}) {
  const isAr = locale === "ar";

  const statusData = ordersByStatus.map((s) => ({
    name:
      isAr
        ? ORDER_STATUS_LABELS[s.status as OrderStatus]?.ar ?? s.status
        : ORDER_STATUS_LABELS[s.status as OrderStatus]?.en ?? s.status,
    value: s.count,
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{isAr ? "الإيرادات الشهرية" : "Monthly revenue"}</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueByMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {isAr ? "لا توجد بيانات بعد" : "No data yet"}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "توزيع الطلبات حسب الحالة" : "Orders by status"}</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {isAr ? "لا توجد بيانات بعد" : "No data yet"}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" label outerRadius={90}>
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

      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "أكثر الخدمات طلباً" : "Top services"}</CardTitle>
        </CardHeader>
        <CardContent>
          {topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {isAr ? "لا توجد بيانات بعد" : "No data yet"}
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices} layout="vertical" margin={{ left: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
