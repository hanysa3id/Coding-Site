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

  // Calculate VAT (assuming finalAmount is VAT inclusive, let's say 15% VAT)
  const vatRate = 0.15;
  const subtotal = finalAmount ? finalAmount / (1 + vatRate) : 0;
  const vatAmount = finalAmount ? finalAmount - subtotal : 0;

  return (
    <div className="min-h-screen bg-slate-100/50 print:bg-white p-4 md:p-8 print:p-0 font-sans">
      {/* Print button — hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-end gap-2 print:hidden">
        <InvoicePrintButton locale={locale} />
      </div>

      {/* Invoice document */}
      <div
        id="invoice"
        className="max-w-4xl mx-auto bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] print:shadow-none print:rounded-none p-8 md:p-12 print:p-0 text-slate-800"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{siteName}</h1>
            <div className="text-slate-500 text-sm space-y-1">
              {siteAddress && <p>{siteAddress}</p>}
              <p>{siteEmail} {siteEmail && sitePhone && "•"} <span dir="ltr">{sitePhone}</span></p>
              <p className="font-mono text-xs pt-1">
                <span className="font-semibold text-slate-400">{isAr ? "الرقم الضريبي:" : "Tax ID:"}</span> 300123456789003
              </p>
            </div>
          </div>
          <div className="text-start md:text-end space-y-2 w-full md:w-auto bg-slate-50 p-6 md:p-0 md:bg-transparent rounded-2xl md:rounded-none">
            <h2 className="text-3xl md:text-4xl font-black text-slate-300 uppercase tracking-widest mb-4 md:mb-6">
              {isAr ? "فاتورة ضريبية" : "TAX INVOICE"}
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-slate-500 font-medium">{isAr ? "رقم الفاتورة:" : "Invoice No:"}</div>
              <div className="font-mono font-bold text-slate-900">{order.order_number}</div>
              <div className="text-slate-500 font-medium">{isAr ? "تاريخ الإصدار:" : "Issue Date:"}</div>
              <div className="font-mono font-semibold text-slate-900">{formatDate(order.created_at, intlLocale)}</div>
            </div>
          </div>
        </header>

        {/* Billing Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 block"></span>
              {isAr ? "بيانات العميل (فاتورة إلى)" : "Billed To"}
            </h3>
            <p className="text-lg font-bold text-slate-900">{profile.full_name ?? "—"}</p>
            <div className="text-slate-600 text-sm mt-2 space-y-1">
              {profile.email && <p>{profile.email}</p>}
              {profile.phone && <p dir="ltr" className="text-start">{profile.phone}</p>}
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 block"></span>
              {isAr ? "تفاصيل المشروع" : "Project Details"}
            </h3>
            <p className="text-lg font-bold text-slate-900">
              {order.services ? (isAr ? order.services.name_ar : order.services.name_en) : "—"}
            </p>
            {(order.final_duration_days ?? order.estimated_duration_days) && (
              <p className="text-slate-600 text-sm mt-2">
                {isAr ? "المدة المتوقعة للتنفيذ: " : "Estimated Duration: "}
                <span className="font-bold text-slate-900">
                  {order.final_duration_days ?? order.estimated_duration_days} {isAr ? "يوم عمل" : "business days"}
                </span>
              </p>
            )}
          </div>
        </section>

        {/* Line Items */}
        <section className="mb-8">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-start">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 text-start font-bold w-16">{isAr ? "#" : "#"}</th>
                  <th className="p-4 text-start font-bold">{isAr ? "البيان / الوصف" : "Item Description"}</th>
                  <th className="p-4 text-center font-bold w-24">{isAr ? "الكمية" : "Qty"}</th>
                  <th className="p-4 text-end font-bold w-40">{isAr ? "السعر (غير شامل الضريبة)" : "Unit Price (Ex. VAT)"}</th>
                  <th className="p-4 text-end font-bold w-40">{isAr ? "الإجمالي" : "Total"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-400 font-mono">01</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">
                      {order.services ? (isAr ? order.services.name_ar : order.services.name_en) : "—"}
                    </p>
                    {order.customer_message && (
                      <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                        {order.customer_message}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-center font-mono text-slate-600">1</td>
                  <td className="p-4 text-end font-mono text-slate-600">
                    {formatCurrency(subtotal, order.currency, intlLocale)}
                  </td>
                  <td className="p-4 text-end font-mono font-bold text-slate-900">
                    {formatCurrency(subtotal, order.currency, intlLocale)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Financial Summary */}
        <section className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          {/* Notes / Terms */}
          <div className="w-full md:w-1/2 p-6 rounded-2xl bg-slate-50 text-slate-600 text-sm leading-relaxed border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">{isAr ? "الشروط والأحكام:" : "Terms & Conditions:"}</h4>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>{isAr ? "يجب سداد الدفعات في مواعيد استحقاقها لتجنب تأخير تسليم المشروع." : "Payments must be made on time to avoid project delivery delays."}</li>
              <li>{isAr ? "الأسعار الموضحة أعلاه شاملة ضريبة القيمة المضافة (15%)." : "Prices shown above include Value Added Tax (15%)."}</li>
              <li>{isAr ? "تُعد هذه الفاتورة رسمية ومعتمدة في النظام المالي." : "This is an official computer-generated invoice."}</li>
            </ul>
          </div>

          {/* Totals */}
          <div className="w-full md:w-1/3 space-y-3 text-sm">
            <div className="flex justify-between items-center text-slate-600 px-4">
              <span>{isAr ? "المجموع الفرعي:" : "Subtotal:"}</span>
              <span className="font-mono">{formatCurrency(subtotal, order.currency, intlLocale)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 px-4">
              <span>{isAr ? "ضريبة القيمة المضافة (15%):" : "VAT (15%):"}</span>
              <span className="font-mono">{formatCurrency(vatAmount, order.currency, intlLocale)}</span>
            </div>
            <div className="h-px w-full bg-slate-200 my-2"></div>
            <div className="flex justify-between items-center px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg">
              <span className="font-bold text-base">{isAr ? "الإجمالي المستحق:" : "Total Amount:"}</span>
              <span className="font-mono font-black text-lg">{finalAmount ? formatCurrency(finalAmount, order.currency, intlLocale) : "—"}</span>
            </div>
            
            {(paidAmount > 0 || remaining > 0) && (
              <div className="px-4 pt-3 space-y-2">
                {paidAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>{isAr ? "المبلغ المدفوع:" : "Amount Paid:"}</span>
                    <span className="font-mono">{formatCurrency(paidAmount, order.currency, intlLocale)}</span>
                  </div>
                )}
                {remaining > 0 && (
                  <div className="flex justify-between items-center text-rose-600 font-bold">
                    <span>{isAr ? "الرصيد المتبقي:" : "Balance Due:"}</span>
                    <span className="font-mono">{formatCurrency(remaining, order.currency, intlLocale)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Payment Plan & History (If applicable) */}
        {(plan?.length > 0 || payments?.length > 0) && (
          <section className="py-8 grid md:grid-cols-2 gap-8 print:block print:space-y-8">
            {plan && plan.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  {isAr ? "جدول الدفعات (الأقساط)" : "Payment Schedule"}
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-3 text-start">{isAr ? "الدفعة" : "Installment"}</th>
                        <th className="p-3 text-start">{isAr ? "تاريخ الاستحقاق" : "Due Date"}</th>
                        <th className="p-3 text-end">{isAr ? "المبلغ" : "Amount"}</th>
                        <th className="p-3 text-end">{isAr ? "الحالة" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {plan.map((inst, i) => (
                        <tr key={i}>
                          <td className="p-3 font-medium text-slate-700">{isAr ? inst.label_ar : inst.label_en}</td>
                          <td className="p-3 text-slate-500">{inst.due_date ? formatDate(inst.due_date, intlLocale) : "—"}</td>
                          <td className="p-3 text-end font-mono font-semibold text-slate-900">
                            {formatCurrency(inst.amount, order.currency, intlLocale)}
                          </td>
                          <td className="p-3 text-end">
                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${inst.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                              {inst.paid ? (isAr ? "مدفوع" : "PAID") : (isAr ? "معلق" : "PENDING")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(payments as Payment[]).filter((p) => p.status === "paid").length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  {isAr ? "سجل المدفوعات السابقة" : "Payment History"}
                </h4>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  {(payments as Payment[])
                    .filter((p) => p.status === "paid")
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between pb-3 border-b border-slate-200/60 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-slate-700 capitalize">{p.method.replace("_", " ")}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.paid_at ? formatDate(p.paid_at, intlLocale) : "—"}
                          </p>
                        </div>
                        <p className="font-mono font-bold text-emerald-600">
                          {formatCurrency(p.amount, p.currency, intlLocale)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-500 font-medium">
          <p className="text-slate-900 font-bold mb-1">{isAr ? "شكراً لاختياركم " : "Thank you for choosing "}{siteName}</p>
          <p className="text-xs">{isAr ? "نسعد دائماً بخدمتكم وتلبية تطلعاتكم." : "We are always happy to serve you and meet your expectations."}</p>
        </footer>
      </div>
    </div>
  );
}
