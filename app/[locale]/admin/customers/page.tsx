import { getLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { Users, Mail, Phone } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerRoleSelector } from "./customer-role-selector";
import type { UserRole } from "@/types/database";

type CustomerRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  role: UserRole;
  created_at: string;
  total_orders: number;
  total_spent: number;
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: UserRole | "all" }>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const me = await requireStaff();
  const { role } = await searchParams;
  const filterRole = role && role !== "all" ? role : null;

  const supabase = await createClient();

  let profilesQuery = supabase
    .from("profiles")
    .select("id, full_name, email, phone, whatsapp_number, role, created_at")
    .order("created_at", { ascending: false });
  if (filterRole) profilesQuery = profilesQuery.eq("role", filterRole);
  const { data: profiles } = await profilesQuery;

  const list = (profiles as Array<{
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    whatsapp_number: string | null;
    role: UserRole;
    created_at: string;
  }>) ?? [];

  // Bulk-fetch order stats per customer
  const customerIds = list.map((p) => p.id);
  const statsMap = new Map<string, { count: number; spent: number }>();

  if (customerIds.length > 0) {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("customer_id, final_price, estimated_price, status")
      .in("customer_id", customerIds);

    for (const o of (orderRows as Array<{
      customer_id: string;
      final_price: number | null;
      estimated_price: number | null;
      status: string;
    }>) ?? []) {
      const cur = statsMap.get(o.customer_id) ?? { count: 0, spent: 0 };
      cur.count += 1;
      if (["completed", "delivered", "in_progress"].includes(o.status)) {
        cur.spent += Number(o.final_price ?? o.estimated_price ?? 0);
      }
      statsMap.set(o.customer_id, cur);
    }
  }

  const rows: CustomerRow[] = list.map((p) => {
    const s = statsMap.get(p.id);
    return {
      ...p,
      total_orders: s?.count ?? 0,
      total_spent: s?.spent ?? 0,
    };
  });

  const filters: { key: UserRole | "all"; ar: string; en: string }[] = [
    { key: "all", ar: "الكل", en: "All" },
    { key: "customer", ar: "عملاء", en: "Customers" },
    { key: "sales", ar: "مبيعات", en: "Sales" },
    { key: "staff", ar: "فريق", en: "Staff" },
    { key: "admin", ar: "إدارة", en: "Admins" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold inline-flex items-center gap-3">
          <Users className="h-7 w-7" />
          {isAr ? "العملاء والمستخدمون" : "Customers & Users"}
        </h1>
        <p className="text-muted-foreground">
          {isAr ? `${rows.length} مستخدم` : `${rows.length} users`}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = f.key === "all" ? !filterRole : filterRole === f.key;
          const href = f.key === "all" ? "/admin/customers" : `/admin/customers?role=${f.key}`;
          return (
            <Link
              key={f.key}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted"
              }`}
            >
              {isAr ? f.ar : f.en}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isAr ? "لا يوجد مستخدمون" : "No users found"}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {rows.map((r) => (
                <li key={r.id} className="p-4 flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold">{r.full_name ?? "—"}</p>
                      <Badge variant={roleVariant(r.role)}>{r.role}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {r.email && (
                        <p className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${r.email}`} className="hover:text-foreground" dir="ltr">
                            {r.email}
                          </a>
                        </p>
                      )}
                      {r.phone && (
                        <p className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          <span dir="ltr">{r.phone}</span>
                        </p>
                      )}
                      <p className="text-xs">
                        {isAr ? "انضم في " : "Joined "}
                        {formatDate(r.created_at, isAr ? "ar-EG" : "en-US")}
                      </p>
                    </div>
                  </div>

                  <div className="text-end shrink-0 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {isAr ? "الطلبات" : "Orders"}
                    </p>
                    <p className="text-lg font-bold">{r.total_orders}</p>
                  </div>

                  <div className="text-end shrink-0 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {isAr ? "المنفق" : "Spent"}
                    </p>
                    <p className="text-lg font-bold">
                      {formatCurrency(r.total_spent, "EGP", isAr ? "ar-EG" : "en-US")}
                    </p>
                  </div>

                  {me.role === "admin" && r.id !== me.id && (
                    <div className="shrink-0 w-32">
                      <CustomerRoleSelector
                        userId={r.id}
                        currentRole={r.role}
                        locale={locale}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function roleVariant(role: UserRole): "default" | "secondary" | "success" | "warning" {
  switch (role) {
    case "admin":
      return "warning";
    case "sales":
      return "default";
    case "staff":
      return "success";
    default:
      return "secondary";
  }
}
