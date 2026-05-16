import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { signStorageUrls } from "@/lib/storage/sign-url";
import { PaymentActions } from "./payment-actions";
import type { Payment, Order } from "@/types/database";

type PaymentRow = Payment & {
  orders: Pick<Order, "id" | "order_number" | "customer_id"> | null;
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const { status } = await searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("payments")
    .select("*, orders(id, order_number, customer_id)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: payments } = await query;
  const rows = (payments as unknown as PaymentRow[]) ?? [];

  // Receipts live in a private bucket — sign URLs server-side so the
  // "View receipt" links actually open the file for the admin.
  const indexed: { idx: number; url: string }[] = [];
  rows.forEach((p, i) => {
    if (p.receipt_url) indexed.push({ idx: i, url: p.receipt_url });
  });
  if (indexed.length > 0) {
    const signed = await signStorageUrls(indexed.map((x) => x.url));
    indexed.forEach(({ idx }, i) => {
      rows[idx].receipt_url = signed[i];
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{isAr ? "المدفوعات" : "Payments"}</h1>
        <p className="text-muted-foreground">
          {isAr ? `${rows.length} عملية` : `${rows.length} transactions`}
        </p>
      </header>

      <div className="flex gap-2">
        {(["all", "pending", "paid", "failed", "refunded"] as const).map((s) => {
          const isActive = s === "all" ? !status : s === status;
          return (
            <Link
              key={s}
              href={s === "all" ? "/admin/payments" : `/admin/payments?status=${s}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {s}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {isAr ? "لا توجد مدفوعات" : "No payments"}
            </p>
          ) : (
            <ul className="divide-y">
              {rows.map((p) => {
                const variant: "default" | "success" | "destructive" | "warning" =
                  p.status === "paid"
                    ? "success"
                    : p.status === "failed"
                      ? "destructive"
                      : p.status === "refunded"
                        ? "destructive"
                        : "warning";
                return (
                  <li key={p.id} className="flex items-start justify-between gap-4 p-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/orders/${p.orders?.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          <code>{p.orders?.order_number}</code>
                        </Link>
                        <Badge variant={variant}>{p.status}</Badge>
                        <span className="text-xs text-muted-foreground">{p.method}</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatCurrency(p.amount, p.currency, isAr ? "ar-EG" : "en-US")}
                      </p>
                      {p.customer_note && (
                        <p className="text-sm text-muted-foreground">
                          {isAr ? "ملاحظة العميل: " : "Customer note: "}
                          {p.customer_note}
                        </p>
                      )}
                      {p.transaction_id && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Tx: {p.transaction_id}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(p.created_at, isAr ? "ar-EG" : "en-US")}
                      </p>
                      {p.receipt_url && (
                        <a
                          href={p.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-xs text-primary hover:underline"
                        >
                          {isAr ? "عرض إيصال الدفع" : "View receipt"}
                        </a>
                      )}
                    </div>
                    {p.status === "pending" && (
                      <PaymentActions paymentId={p.id} locale={locale} />
                    )}
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
