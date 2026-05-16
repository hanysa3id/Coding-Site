import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, Receipt, ExternalLink } from "lucide-react";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import {
  paymentMethodLabel,
  paymentStatusLabel,
} from "@/lib/orders/payment-summary";
import type { Payment } from "@/types/database";

type Props = {
  payments: Payment[];
  locale: string;
  /** Show admin-only details: customer note, admin note, raw transaction id. */
  showAdminDetails?: boolean;
};

/**
 * Chronological log of every payment attempt on this order — successful,
 * pending review, and failed. Useful for both the customer (transparency
 * about retries) and the admin (decision history).
 */
export function PaymentHistoryList({ payments, locale, showAdminDetails = false }: Props) {
  const isAr = locale === "ar";

  if (payments.length === 0) {
    return null;
  }

  // Sort newest first
  const sorted = [...payments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base inline-flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          {isAr ? "سجل المدفوعات" : "Payment history"}
          <span className="text-xs text-muted-foreground font-normal">
            ({payments.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ol className="divide-y">
          {sorted.map((p) => {
            const status = paymentStatusLabel(p.status, locale);
            const StatusIcon =
              p.status === "paid"
                ? CheckCircle2
                : p.status === "failed"
                  ? AlertCircle
                  : Clock;
            const statusColor =
              p.status === "paid"
                ? "text-green-600"
                : p.status === "failed"
                  ? "text-destructive"
                  : p.status === "pending"
                    ? "text-amber-600"
                    : "text-muted-foreground";

            return (
              <li key={p.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StatusIcon className={cn("h-5 w-5 shrink-0", statusColor)} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {formatCurrency(
                            Number(p.amount),
                            p.currency,
                            isAr ? "ar-EG" : "en-US"
                          )}
                        </span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {paymentMethodLabel(p.method, locale)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(p.created_at, isAr ? "ar-EG" : "en-US")}
                        {p.paid_at && p.status === "paid" && (
                          <>
                            {" · "}
                            {isAr ? "اكتمل في " : "completed "}
                            {formatDateTime(p.paid_at, isAr ? "ar-EG" : "en-US")}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {p.receipt_url && (
                    <a
                      href={p.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {isAr ? "عرض الإيصال" : "View receipt"}
                    </a>
                  )}
                </div>

                {/* Notes */}
                {p.customer_note && (
                  <div className="rounded-md bg-muted/40 p-2 text-xs">
                    <span className="font-medium">
                      {isAr ? "ملاحظة العميل: " : "Customer note: "}
                    </span>
                    {p.customer_note}
                  </div>
                )}
                {showAdminDetails && p.admin_note && (
                  <div className="rounded-md bg-destructive/5 border border-destructive/20 p-2 text-xs">
                    <span className="font-medium text-destructive">
                      {isAr ? "ملاحظة الإدارة: " : "Admin note: "}
                    </span>
                    {p.admin_note}
                  </div>
                )}

                {/* Transaction reference */}
                {(p.transaction_id || (showAdminDetails && p.paymob_order_id)) && (
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {p.transaction_id && (
                      <>Tx: {p.transaction_id}</>
                    )}
                    {showAdminDetails && p.paymob_order_id && (
                      <>
                        {p.transaction_id ? " · " : ""}
                        PayMob: {p.paymob_order_id}
                      </>
                    )}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
