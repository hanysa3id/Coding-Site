import type { Payment, Order } from "@/types/database";

export type PaymentSummary = {
  /** Final amount due on the order (final_price or estimated_price fallback). */
  totalDue: number;
  /** Sum of all `paid` payments. */
  totalPaid: number;
  /** totalDue − totalPaid, never negative. */
  outstanding: number;
  /** How many attempts have been made (any status). */
  attemptsCount: number;
  /** How many succeeded. */
  paidCount: number;
  /** How many failed. */
  failedCount: number;
  /** How many are pending review (offline submissions). */
  pendingCount: number;
  /** True when the order is fully covered by successful payments. */
  isFullyPaid: boolean;
  /** Most recent payment (any status), or null. */
  lastAttempt: Payment | null;
};

export function summarizePayments(
  order: Pick<Order, "final_price" | "estimated_price">,
  payments: Payment[]
): PaymentSummary {
  const totalDue = Number(order.final_price ?? order.estimated_price ?? 0);
  const paid = payments.filter((p) => p.status === "paid");
  const failed = payments.filter((p) => p.status === "failed");
  const pending = payments.filter((p) => p.status === "pending");
  const totalPaid = paid.reduce((a, p) => a + Number(p.amount), 0);
  const outstanding = Math.max(0, totalDue - totalPaid);

  const lastAttempt =
    payments.length > 0
      ? [...payments].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : null;

  return {
    totalDue,
    totalPaid,
    outstanding,
    attemptsCount: payments.length,
    paidCount: paid.length,
    failedCount: failed.length,
    pendingCount: pending.length,
    isFullyPaid: totalDue > 0 && outstanding === 0,
    lastAttempt,
  };
}

export function paymentMethodLabel(method: string, locale: string): string {
  const isAr = locale === "ar";
  const map: Record<string, { ar: string; en: string }> = {
    paymob: { ar: "PayMob (بطاقة)", en: "PayMob (card)" },
    bank_transfer: { ar: "تحويل بنكي", en: "Bank transfer" },
    cash: { ar: "نقدًا", en: "Cash" },
    instapay: { ar: "InstaPay", en: "InstaPay" },
    vodafone_cash: { ar: "فودافون كاش", en: "Vodafone Cash" },
  };
  const meta = map[method];
  return meta ? (isAr ? meta.ar : meta.en) : method;
}

export function paymentStatusLabel(
  status: string,
  locale: string
): { label: string; variant: "default" | "success" | "destructive" | "warning" | "secondary" } {
  const isAr = locale === "ar";
  switch (status) {
    case "paid":
      return { label: isAr ? "مدفوع" : "Paid", variant: "success" };
    case "failed":
      return { label: isAr ? "فشل" : "Failed", variant: "destructive" };
    case "refunded":
      return { label: isAr ? "مسترد" : "Refunded", variant: "secondary" };
    case "pending":
      return { label: isAr ? "بانتظار المراجعة" : "Pending review", variant: "warning" };
    default:
      return { label: status, variant: "default" };
  }
}
