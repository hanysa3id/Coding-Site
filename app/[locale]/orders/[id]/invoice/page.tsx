import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getOrderForCustomer, listOrderPayments } from "@/lib/queries/orders";
import { getSiteSettings, getContactSettings } from "@/lib/settings/get";
import { summarizePayments } from "@/lib/orders/payment-summary";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoicePrintButton } from "./invoice-print-button";
import type { Payment, PaymentInstallment } from "@/types/database";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";
  const profile = await requireUser();

  const order = await getOrderForCustomer(id, profile.id);
  if (!order) notFound();

  const [payments, site, contact] = await Promise.all([
    listOrderPayments(id),
    getSiteSettings(),
    getContactSettings(),
  ]);

  const summary = summarizePayments(order, (payments as Payment[]) ?? []);
  const finalAmount = order.final_price ?? order.estimated_price;
  const paidAmount = summary.totalPaid;
  const remaining = summary.outstanding;

  const intlLocale = isAr ? "ar-EG" : "en-US";
  const siteName = site ? (isAr ? site.name_ar : site.name_en) : "Company";
  const siteEmail = contact?.email ?? "";
  const sitePhone = contact?.phone ?? "";
  const siteAddress = contact ? (isAr ? contact.address_ar : contact.address_en) : "";

  const plan = (order.payment_plan as unknown as PaymentInstallment[]) ?? null;

  return (
    <div className="min-h-screen bg-muted/20 print:bg-white p-4 print:p-0">
      {/* Print button — hidden when printing */}
      <div className="max-w-3xl mx-auto mb-4 flex justify-end gap-2 print:hidden">
        <InvoicePrintButton locale={locale} />
      </div>

      {/* Invoice document */}
      <div
        id="invoice"
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg print:shadow-none print:rounded-none p-10 print:p-8 space-y-8 text-sm"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{siteName}</h1>
            <p className="text-muted-foreground text-xs mt-1">{siteEmail}</p>
            <p className="text-muted-foreground text-xs">{sitePhone}</p>
            {siteAddress && <p className="text-muted-foreground text-xs">{siteAddress}</p>}
          </div>
          <div className="text-end">
            <p className="text-2xl font-bold text-primary">
              {isAr ? "فاتورة" : "INVOICE"}
            </p>
            <code className="text-xs font-mono text-muted-foreground">{order.order_number}</code>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(order.created_at, intlLocale)}
            </p>
          </div>
        </div>

        <hr />

        {/* Billing to */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {isAr ? "فاتورة إلى" : "Bill to"}
            </p>
            <p className="font-semibold">{profile.full_name ?? "—"}</p>
            {profile.email && <p className="text-muted-foreground">{profile.email}</p>}
            {profile.phone && <p className="text-muted-foreground">{profile.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {isAr ? "تفاصيل الخدمة" : "Service details"}
            </p>
            <p className="font-semibold">
              {order.services
                ? isAr
                  ? order.services.name_ar
                  : order.services.name_en
                : "—"}
            </p>
            {(order.final_duration_days ?? order.estimated_duration_days) && (
              <p className="text-muted-foreground">
                {isAr ? "المدة: " : "Duration: "}
                {order.final_duration_days ?? order.estimated_duration_days}{" "}
                {isAr ? "يوم" : "days"}
              </p>
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-start font-semibold">{isAr ? "الوصف" : "Description"}</th>
                <th className="p-3 text-end font-semibold">{isAr ? "المبلغ" : "Amount"}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3">
                  {order.services ? (isAr ? order.services.name_ar : order.services.name_en) : "—"}
                  {order.customer_message && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {order.customer_message}
                    </p>
                  )}
                </td>
                <td className="p-3 text-end font-mono tabular-nums">
                  {finalAmount
                    ? formatCurrency(finalAmount, order.currency, intlLocale)
                    : "—"}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-muted/30 divide-y">
              <tr>
                <td className="p-3 font-semibold">{isAr ? "الإجمالي" : "Total"}</td>
                <td className="p-3 text-end font-bold font-mono tabular-nums">
                  {finalAmount
                    ? formatCurrency(finalAmount, order.currency, intlLocale)
                    : "—"}
                </td>
              </tr>
              {paidAmount > 0 && (
                <tr>
                  <td className="p-3 text-green-700">{isAr ? "مدفوع" : "Paid"}</td>
                  <td className="p-3 text-end text-green-700 font-mono tabular-nums">
                    {formatCurrency(paidAmount, order.currency, intlLocale)}
                  </td>
                </tr>
              )}
              {remaining > 0 && (
                <tr>
                  <td className="p-3 font-bold text-amber-700">{isAr ? "المتبقي" : "Balance due"}</td>
                  <td className="p-3 text-end font-bold text-amber-700 font-mono tabular-nums">
                    {formatCurrency(remaining, order.currency, intlLocale)}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* Payment plan (if set) */}
        {plan && plan.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold">{isAr ? "خطة الدفع" : "Payment schedule"}</p>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-start font-semibold">{isAr ? "القسط" : "Installment"}</th>
                    <th className="p-3 text-start font-semibold">{isAr ? "الاستحقاق" : "Due"}</th>
                    <th className="p-3 text-end font-semibold">{isAr ? "المبلغ" : "Amount"}</th>
                    <th className="p-3 text-end font-semibold">{isAr ? "الحالة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {plan.map((inst, i) => (
                    <tr key={i}>
                      <td className="p-3">{isAr ? inst.label_ar : inst.label_en}</td>
                      <td className="p-3 text-muted-foreground">
                        {inst.due_date ? formatDate(inst.due_date, intlLocale) : "—"}
                      </td>
                      <td className="p-3 text-end font-mono tabular-nums">
                        {formatCurrency(inst.amount, order.currency, intlLocale)}
                      </td>
                      <td className="p-3 text-end">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${inst.paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {inst.paid ? (isAr ? "مدفوع" : "Paid") : (isAr ? "معلق" : "Pending")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment history */}
        {(payments as Payment[]).filter((p) => p.status === "paid").length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold">{isAr ? "سجل المدفوعات" : "Payment history"}</p>
            <div className="space-y-2">
              {(payments as Payment[])
                .filter((p) => p.status === "paid")
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{p.method.replace("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.paid_at ? formatDate(p.paid_at, intlLocale) : "—"}
                      </p>
                    </div>
                    <p className="font-mono tabular-nums text-green-700">
                      {formatCurrency(p.amount, p.currency, intlLocale)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <hr />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>{siteName}</p>
          {siteEmail && <p>{siteEmail}</p>}
          <p className="mt-2">{isAr ? "شكراً لثقتكم بنا" : "Thank you for your business"}</p>
        </div>
      </div>
    </div>
  );
}
