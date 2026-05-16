import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { CreditCard, CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { paymentMethodLabel, type PaymentSummary } from "@/lib/orders/payment-summary";
import type { OrderStatus } from "@/types/database";

type Props = {
  summary: PaymentSummary;
  currency: string;
  locale: string;
  orderId: string;
  orderStatus: OrderStatus;
  /** Show a "Pay now" button when applicable. Set false on admin pages. */
  showPayButton?: boolean;
};

/**
 * Hero card at the top of an order detail page that gives the customer (and
 * admin) one-glance answers: How much is due? How much paid? How much left?
 * When the next action is "pay", an inline button takes them there.
 */
export function PaymentStatusCard({
  summary,
  currency,
  locale,
  orderId,
  orderStatus,
  showPayButton = true,
}: Props) {
  const isAr = locale === "ar";
  const fmt = (n: number) => formatCurrency(n, currency, isAr ? "ar-EG" : "en-US");

  const tone = pickTone(summary, orderStatus);

  return (
    <Card className={cn("overflow-hidden", tone.border)}>
      <div className={cn("h-1.5", tone.bar)} />
      <CardContent className="p-5 space-y-4">
        {/* Top row: status icon + label + badges */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", tone.iconBg)}>
              <tone.Icon className={cn("h-5 w-5", tone.iconColor)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {isAr ? "حالة الدفع" : "Payment status"}
              </p>
              <p className={cn("text-lg font-bold", tone.titleColor)}>{isAr ? tone.labelAr : tone.labelEn}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {summary.paidCount > 0 && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {summary.paidCount} {isAr ? "ناجح" : "paid"}
              </Badge>
            )}
            {summary.pendingCount > 0 && (
              <Badge variant="warning" className="gap-1">
                <Clock className="h-3 w-3" />
                {summary.pendingCount} {isAr ? "قيد المراجعة" : "pending"}
              </Badge>
            )}
            {summary.failedCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {summary.failedCount} {isAr ? "فشل" : "failed"}
              </Badge>
            )}
          </div>
        </div>

        {/* Amount grid */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">{isAr ? "الإجمالي" : "Total"}</p>
            <p className="text-lg font-bold">{fmt(summary.totalDue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{isAr ? "المدفوع" : "Paid"}</p>
            <p className="text-lg font-bold text-green-600">{fmt(summary.totalPaid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{isAr ? "المتبقي" : "Outstanding"}</p>
            <p
              className={cn(
                "text-lg font-bold",
                summary.outstanding === 0 ? "text-green-600" : "text-destructive"
              )}
            >
              {fmt(summary.outstanding)}
            </p>
          </div>
        </div>

        {/* Last attempt summary */}
        {summary.lastAttempt && (
          <div className="text-xs text-muted-foreground pt-1 border-t pt-3">
            <span className="font-medium">
              {isAr ? "آخر محاولة: " : "Last attempt: "}
            </span>
            {paymentMethodLabel(summary.lastAttempt.method, locale)} · {fmt(Number(summary.lastAttempt.amount))} ·{" "}
            {formatDateTime(summary.lastAttempt.created_at, isAr ? "ar-EG" : "en-US")}
          </div>
        )}

        {/* CTA */}
        {showPayButton && orderStatus === "awaiting_payment" && summary.outstanding > 0 && (
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/orders/${orderId}/pay`}>
              <CreditCard className="h-4 w-4" />
              {isAr ? `ادفع ${fmt(summary.outstanding)} الآن` : `Pay ${fmt(summary.outstanding)} now`}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function pickTone(summary: PaymentSummary, orderStatus: OrderStatus) {
  if (summary.isFullyPaid) {
    return {
      Icon: CheckCircle2,
      labelAr: "مدفوع بالكامل",
      labelEn: "Fully paid",
      border: "border-green-200",
      bar: "bg-green-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      titleColor: "text-green-700",
    };
  }
  if (summary.failedCount > 0 && summary.paidCount === 0 && summary.pendingCount === 0) {
    return {
      Icon: AlertCircle,
      labelAr: "فشل الدفع — حاول مرة أخرى",
      labelEn: "Payment failed — try again",
      border: "border-destructive/40",
      bar: "bg-destructive",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      titleColor: "text-destructive",
    };
  }
  if (summary.pendingCount > 0) {
    return {
      Icon: Clock,
      labelAr: "قيد المراجعة",
      labelEn: "Under review",
      border: "border-amber-200",
      bar: "bg-amber-500",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      titleColor: "text-amber-700",
    };
  }
  if (orderStatus === "awaiting_payment") {
    return {
      Icon: CreditCard,
      labelAr: "بانتظار الدفع",
      labelEn: "Awaiting payment",
      border: "border-primary/40",
      bar: "bg-primary",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      titleColor: "text-foreground",
    };
  }
  return {
    Icon: Clock,
    labelAr: "لم يُطلب الدفع بعد",
    labelEn: "Payment not yet requested",
    border: "border-border",
    bar: "bg-muted",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    titleColor: "text-foreground",
  };
}
