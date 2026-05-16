import { getLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { Mail, Phone, MessageCircle, ShoppingBag, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminPagination } from "@/components/admin/pagination";
import { parsePage, pageRange, totalPages } from "@/lib/pagination";
import { CustomerRoleSelector } from "./customer-role-selector";
import { CustomersStats } from "./customers-stats";
import { CustomersFilters } from "./customers-filters";
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

type Sort = "newest" | "oldest" | "most_orders" | "highest_spend";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const intlLocale = isAr ? "ar-EG" : "en-US";
  const me = await requireStaff();
  const sp = await searchParams;

  const filterRole = sp.role && sp.role !== "all" ? (sp.role as UserRole) : null;
  const sort = (sp.sort ?? "newest") as Sort;
  const q = sp.q ?? "";
  const page = parsePage(sp.page);
  const range = pageRange(page);

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, whatsapp_number, role, created_at", {
      count: "exact",
    });

  if (filterRole) query = query.eq("role", filterRole);
  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);

  if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  query = query.range(range.from, range.to);

  const { data: profiles, count } = await query;
  const total = count ?? 0;

  const list = (
    profiles as Array<{
      id: string;
      full_name: string | null;
      email: string | null;
      phone: string | null;
      whatsapp_number: string | null;
      role: UserRole;
      created_at: string;
    }>
  ) ?? [];

  // Bulk-fetch order stats per visible page
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
      if (
        ["completed", "delivered", "in_progress", "awaiting_payment"].includes(
          o.status
        )
      ) {
        cur.spent += Number(o.final_price ?? o.estimated_price ?? 0);
      }
      statsMap.set(o.customer_id, cur);
    }
  }

  let rows: CustomerRow[] = list.map((p) => {
    const s = statsMap.get(p.id);
    return { ...p, total_orders: s?.count ?? 0, total_spent: s?.spent ?? 0 };
  });

  // In-page sort for computed stats fields
  if (sort === "most_orders") rows.sort((a, b) => b.total_orders - a.total_orders);
  else if (sort === "highest_spend") rows.sort((a, b) => b.total_spent - a.total_spent);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">
            {isAr ? "العملاء والمستخدمون" : "Customers & Users"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isAr
              ? "إدارة حسابات العملاء وفريق العمل"
              : "Manage customer and team accounts"}
          </p>
        </div>
      </header>

      <CustomersStats locale={locale} />

      <CustomersFilters locale={locale} totalShowing={rows.length} total={total} />

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>{isAr ? "لا يوجد مستخدمون يطابقون البحث" : "No users match the search"}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs">
                  <tr>
                    <th className="px-4 py-2.5 text-start font-semibold text-muted-foreground whitespace-nowrap">
                      {isAr ? "المستخدم" : "User"}
                    </th>
                    <th className="px-4 py-2.5 text-start font-semibold text-muted-foreground whitespace-nowrap">
                      {isAr ? "التواصل" : "Contact"}
                    </th>
                    <th className="px-4 py-2.5 text-start font-semibold text-muted-foreground whitespace-nowrap">
                      {isAr ? "الطلبات" : "Orders"}
                    </th>
                    <th className="px-4 py-2.5 text-start font-semibold text-muted-foreground whitespace-nowrap">
                      {isAr ? "الإنفاق" : "Spent"}
                    </th>
                    <th className="px-4 py-2.5 text-start font-semibold text-muted-foreground whitespace-nowrap">
                      {isAr ? "الانضمام" : "Joined"}
                    </th>
                    {me.role === "admin" && (
                      <th className="px-4 py-2.5 text-start font-semibold text-muted-foreground whitespace-nowrap">
                        {isAr ? "الدور" : "Role"}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {(r.full_name ?? r.email ?? "?")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[160px]">
                              {r.full_name ?? "—"}
                            </p>
                            <Badge
                              variant={roleVariant(r.role)}
                              className="text-[10px] px-1.5 py-0 mt-0.5"
                            >
                              {r.role}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          {r.email && (
                            <div className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3 shrink-0" />
                              <a
                                href={`mailto:${r.email}`}
                                className="hover:text-foreground truncate max-w-[180px]"
                                dir="ltr"
                              >
                                {r.email}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {r.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span dir="ltr">{r.phone}</span>
                              </span>
                            )}
                            {r.whatsapp_number && (
                              <a
                                href={`https://wa.me/${r.whatsapp_number.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <MessageCircle className="h-3 w-3" />
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.total_orders > 0 ? (
                          <Link
                            href={`/admin/orders?q=${encodeURIComponent(r.email ?? r.full_name ?? "")}`}
                            className="inline-flex items-center gap-1.5 font-bold hover:text-primary transition-colors"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {r.total_orders}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium">
                        {r.total_spent > 0 ? (
                          formatCurrency(r.total_spent, "EGP", intlLocale)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(r.created_at, intlLocale)}
                      </td>
                      {me.role === "admin" && (
                        <td className="px-4 py-3 w-36">
                          {r.id !== me.id && (
                            <CustomerRoleSelector
                              userId={r.id}
                              currentRole={r.role}
                              locale={locale}
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages(total)}
        totalItems={total}
        basePath="/admin/customers"
        preserveParams={{ role: sp.role, q: sp.q, sort: sp.sort }}
        locale={locale}
      />
    </div>
  );
}

function roleVariant(
  role: UserRole
): "default" | "secondary" | "success" | "warning" {
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
