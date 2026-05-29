import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { getOrderForCustomer, listOrderPayments } from "@/lib/queries/orders";
import {
  getSiteSettings,
  getContactSettings,
  getPaymentsSettings,
} from "@/lib/settings/get";
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

  const [payments, site, contact, paymentsSettings] = await Promise.all([
    listOrderPayments(id),
    getSiteSettings(),
    getContactSettings(),
    getPaymentsSettings(),
  ]);

  const summary = summarizePayments(order, (payments as Payment[]) ?? []);
  const finalAmount = order.final_price ?? order.estimated_price ?? 0;
  const paidAmount = summary.totalPaid;
  const remaining = summary.outstanding;

  const intlLocale = isAr ? "ar-EG" : "en-US";
  const siteName = site ? (isAr ? site.name_ar : site.name_en) : "Company";
  const siteEmail = contact?.email ?? "";
  const sitePhone = contact?.phone ?? "";
  const siteAddress = contact ? (isAr ? contact.address_ar : contact.address_en) : "";
  const taxId = site?.tax_id ?? "";
  const crNumber = site?.commercial_registration ?? "";
  const currency = order.currency || paymentsSettings?.currency || "SAR";

  // VAT-inclusive total → split into subtotal + VAT
  const vatRate = 0.15;
  const subtotal = finalAmount / (1 + vatRate);
  const vatAmount = finalAmount - subtotal;

  const plan = (order.payment_plan as unknown as PaymentInstallment[]) ?? null;
  const paidPayments = ((payments as Payment[]) ?? []).filter((p) => p.status === "paid");

  const issueDate = formatDate(order.created_at, intlLocale);
  const docNumber = order.order_number;
  const isFullyPaid = remaining <= 0 && paidAmount > 0;

  const serviceName = order.services
    ? isAr
      ? order.services.name_ar
      : order.services.name_en
    : "—";
  const durationDays = order.final_duration_days ?? order.estimated_duration_days;

  // Build QR-style stamp data (visual only — not a real ZATCA TLV).
  const stampLines = [
    siteName,
    taxId ? `${isAr ? "ر.ض" : "VAT"}: ${taxId}` : null,
    `${isAr ? "رقم" : "No."}: ${docNumber}`,
    issueDate,
    `${isAr ? "الإجمالي" : "Total"}: ${formatCurrency(finalAmount, currency, intlLocale)}`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white p-4 md:p-8 print:p-0">
      {/* Print toolbar — hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between gap-2 print:hidden">
        <div className="text-sm text-slate-600">
          {isAr
            ? "اضغط على «طباعة / PDF» لحفظ الفاتورة أو طباعتها بالحجم الرسمي."
            : "Use «Print / Save PDF» to export this invoice at official A4 size."}
        </div>
        <InvoicePrintButton locale={locale} />
      </div>

      {/* Invoice document */}
      <div
        id="invoice"
        className="invoice-doc relative max-w-4xl mx-auto bg-white rounded-2xl shadow-[0_30px_60px_-20px_rgba(15,23,42,0.18)] print:shadow-none print:rounded-none overflow-hidden text-slate-900"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* PAID watermark */}
        {isFullyPaid && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center select-none print:flex"
            aria-hidden
          >
            <div className="rotate-[-22deg] border-[6px] border-emerald-500/20 text-emerald-500/20 text-7xl md:text-9xl font-black tracking-[0.3em] px-10 py-3 rounded-md uppercase">
              {isAr ? "مدفوع" : "PAID"}
            </div>
          </div>
        )}

        {/* Accent top bar */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500" />

        {/* Header */}
        <header className="grid grid-cols-1 md:grid-cols-12 gap-6 px-8 md:px-12 pt-8 pb-6 border-b border-slate-200/80">
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-4">
              {site?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={site.logo_url}
                  alt={siteName}
                  className="h-14 w-14 object-contain rounded-xl border border-slate-200 bg-white p-2"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {siteName.trim().charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">
                  {siteName}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {isAr ? "وثيقة فاتورة ضريبية رسمية" : "Official Tax Invoice Document"}
                </p>
              </div>
            </div>
            <div className="text-slate-600 text-xs leading-relaxed space-y-0.5">
              {siteAddress && <p>{siteAddress}</p>}
              <p className="flex flex-wrap gap-x-3 gap-y-0.5">
                {siteEmail && <span>{siteEmail}</span>}
                {sitePhone && <span dir="ltr">{sitePhone}</span>}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 pt-1 text-[11px] font-mono text-slate-500">
                {taxId && (
                  <span>
                    <span className="text-slate-400">{isAr ? "الرقم الضريبي:" : "Tax ID:"}</span>{" "}
                    <span className="font-bold text-slate-700">{taxId}</span>
                  </span>
                )}
                {crNumber && (
                  <span>
                    <span className="text-slate-400">{isAr ? "س.ت:" : "CR:"}</span>{" "}
                    <span className="font-bold text-slate-700">{crNumber}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {isAr ? "فاتورة ضريبية" : "TAX INVOICE"}
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mt-1 font-bold">
                    {isAr ? "نسخة العميل" : "Customer Copy"}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                    isFullyPaid
                      ? "bg-emerald-100 text-emerald-700"
                      : paidAmount > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isFullyPaid
                    ? isAr
                      ? "مدفوع"
                      : "Paid"
                    : paidAmount > 0
                      ? isAr
                        ? "مدفوع جزئياً"
                        : "Partial"
                      : isAr
                        ? "مستحقة"
                        : "Due"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs pt-2 border-t border-slate-200">
                <div className="text-slate-500">{isAr ? "رقم الفاتورة" : "Invoice #"}</div>
                <div className="col-span-2 font-mono font-bold text-slate-900 text-end break-all">
                  {docNumber}
                </div>

                <div className="text-slate-500">{isAr ? "تاريخ الإصدار" : "Issue Date"}</div>
                <div className="col-span-2 font-mono font-semibold text-slate-900 text-end">
                  {issueDate}
                </div>

                <div className="text-slate-500">{isAr ? "العملة" : "Currency"}</div>
                <div className="col-span-2 font-mono font-semibold text-slate-900 text-end">
                  {currency}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Billing parties */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 md:px-12 py-8">
          <div className="rounded-2xl border border-slate-200 p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {isAr ? "فاتورة إلى (العميل)" : "Bill To (Customer)"}
              </h3>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-snug">
              {profile.full_name ?? "—"}
            </p>
            <div className="text-slate-600 text-xs mt-2 space-y-1">
              {profile.email && <p className="break-all">{profile.email}</p>}
              {profile.phone && (
                <p dir="ltr" className="text-start">
                  {profile.phone}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {isAr ? "تفاصيل الخدمة" : "Service Details"}
              </h3>
            </div>
            <p className="text-lg font-bold text-slate-900 leading-snug">{serviceName}</p>
            <dl className="text-xs text-slate-600 mt-2 space-y-1">
              {durationDays != null && (
                <div className="flex justify-between gap-2">
                  <dt>{isAr ? "المدة المقدرة:" : "Estimated duration:"}</dt>
                  <dd className="font-semibold text-slate-800">
                    {durationDays} {isAr ? "يوم عمل" : "business days"}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt>{isAr ? "حالة الطلب:" : "Order status:"}</dt>
                <dd className="font-semibold text-slate-800 capitalize">{order.status}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Line items */}
        <section className="px-8 md:px-12 pb-6">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-start font-bold w-10">#</th>
                  <th className="px-4 py-3 text-start font-bold">
                    {isAr ? "البيان / الوصف" : "Description"}
                  </th>
                  <th className="px-3 py-3 text-center font-bold w-16">
                    {isAr ? "الكمية" : "Qty"}
                  </th>
                  <th className="px-3 py-3 text-end font-bold w-32">
                    {isAr ? "السعر (قبل الضريبة)" : "Unit (Ex. VAT)"}
                  </th>
                  <th className="px-3 py-3 text-center font-bold w-20">
                    {isAr ? "الضريبة" : "VAT %"}
                  </th>
                  <th className="px-3 py-3 text-end font-bold w-32">
                    {isAr ? "الإجمالي" : "Total"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-4 py-4 align-top text-slate-400 font-mono">01</td>
                  <td className="px-4 py-4 align-top">
                    <p className="font-bold text-slate-900 leading-snug">{serviceName}</p>
                    {order.customer_message && (
                      <p className="text-[11px] text-slate-500 mt-1.5 max-w-md leading-relaxed">
                        {order.customer_message}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-4 align-top text-center font-mono text-slate-700">1</td>
                  <td className="px-3 py-4 align-top text-end font-mono text-slate-700">
                    {formatCurrency(subtotal, currency, intlLocale)}
                  </td>
                  <td className="px-3 py-4 align-top text-center font-mono text-slate-700">
                    15%
                  </td>
                  <td className="px-3 py-4 align-top text-end font-mono font-bold text-slate-900">
                    {formatCurrency(subtotal, currency, intlLocale)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals + QR stamp */}
        <section className="px-8 md:px-12 pb-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Stamp / QR placeholder */}
          <div className="md:col-span-5 space-y-3">
            <div className="rounded-2xl border-2 border-dashed border-slate-300 p-4 bg-slate-50/50">
              <div className="flex items-start gap-3">
                <div
                  className="h-24 w-24 rounded-md bg-white border border-slate-200 grid grid-cols-8 grid-rows-8 p-1.5 shrink-0"
                  aria-hidden
                  title="Invoice stamp"
                >
                  {Array.from({ length: 64 }).map((_, i) => {
                    // Deterministic pseudo-QR pattern based on doc number
                    const seed = (docNumber.charCodeAt(i % docNumber.length) + i) % 7;
                    return (
                      <span
                        key={i}
                        className={`block ${seed < 3 ? "bg-slate-900" : "bg-transparent"}`}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] font-mono text-slate-600 leading-relaxed space-y-0.5">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    {isAr ? "ختم الفاتورة" : "Invoice Stamp"}
                  </div>
                  {stampLines.map((line, i) => (
                    <p key={i} dir={isAr ? "rtl" : "ltr"} className="break-all">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
              </h4>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 leading-relaxed">
                <li>
                  {isAr
                    ? "تسري الدفعات وفق جدول الأقساط المعتمد لتجنب تأخير تسليم المشروع."
                    : "Payments follow the agreed schedule to avoid delivery delays."}
                </li>
                <li>
                  {isAr
                    ? "جميع الأسعار شاملة ضريبة القيمة المضافة (15%)."
                    : "All prices include Value Added Tax (VAT) at 15%."}
                </li>
                <li>
                  {isAr
                    ? "هذه فاتورة معتمدة إلكترونياً ولا تحتاج إلى توقيع."
                    : "This is an electronically-issued invoice and requires no signature."}
                </li>
              </ul>
            </div>
          </div>

          {/* Totals card */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
              <dl className="divide-y divide-slate-100 text-sm">
                <div className="flex items-center justify-between px-5 py-3">
                  <dt className="text-slate-600">
                    {isAr ? "المجموع الفرعي" : "Subtotal"}
                  </dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {formatCurrency(subtotal, currency, intlLocale)}
                  </dd>
                </div>
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50/60">
                  <dt className="text-slate-600">
                    {isAr ? "ضريبة القيمة المضافة (15%)" : "VAT (15%)"}
                  </dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {formatCurrency(vatAmount, currency, intlLocale)}
                  </dd>
                </div>
                <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
                  <dt className="font-bold text-base">
                    {isAr ? "الإجمالي المستحق" : "Total Amount Due"}
                  </dt>
                  <dd className="font-mono font-black text-xl tracking-tight">
                    {formatCurrency(finalAmount, currency, intlLocale)}
                  </dd>
                </div>

                {(paidAmount > 0 || remaining > 0) && (
                  <>
                    {paidAmount > 0 && (
                      <div className="flex items-center justify-between px-5 py-2.5">
                        <dt className="text-emerald-700 font-medium">
                          {isAr ? "المبلغ المدفوع" : "Amount Paid"}
                        </dt>
                        <dd className="font-mono font-bold text-emerald-700">
                          − {formatCurrency(paidAmount, currency, intlLocale)}
                        </dd>
                      </div>
                    )}
                    {remaining > 0 && (
                      <div className="flex items-center justify-between px-5 py-3 bg-rose-50">
                        <dt className="text-rose-700 font-bold">
                          {isAr ? "الرصيد المتبقي" : "Balance Due"}
                        </dt>
                        <dd className="font-mono font-black text-rose-700 text-base">
                          {formatCurrency(remaining, currency, intlLocale)}
                        </dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
            </div>
          </div>
        </section>

        {/* Payment schedule & history */}
        {(Boolean(plan?.length) || paidPayments.length > 0) && (
          <section className="px-8 md:px-12 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
            {plan && plan.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  {isAr ? "جدول الدفعات (الأقساط)" : "Payment Schedule"}
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-start font-bold">
                          {isAr ? "الدفعة" : "Installment"}
                        </th>
                        <th className="px-3 py-2 text-start font-bold">
                          {isAr ? "الاستحقاق" : "Due"}
                        </th>
                        <th className="px-3 py-2 text-end font-bold">
                          {isAr ? "المبلغ" : "Amount"}
                        </th>
                        <th className="px-3 py-2 text-end font-bold">
                          {isAr ? "الحالة" : "Status"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {plan.map((inst, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium text-slate-700">
                            {isAr ? inst.label_ar : inst.label_en}
                          </td>
                          <td className="px-3 py-2 text-slate-500 font-mono">
                            {inst.due_date ? formatDate(inst.due_date, intlLocale) : "—"}
                          </td>
                          <td className="px-3 py-2 text-end font-mono font-semibold text-slate-900">
                            {formatCurrency(inst.amount, currency, intlLocale)}
                          </td>
                          <td className="px-3 py-2 text-end">
                            <span
                              className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                inst.paid
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {inst.paid
                                ? isAr
                                  ? "مدفوع"
                                  : "Paid"
                                : isAr
                                  ? "معلق"
                                  : "Due"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {paidPayments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  {isAr ? "سجل المدفوعات" : "Payment History"}
                </h4>
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  {paidPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 capitalize">
                          {p.method.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {p.paid_at ? formatDate(p.paid_at, intlLocale) : "—"}
                        </p>
                      </div>
                      <p className="font-mono font-bold text-emerald-700 text-sm">
                        {formatCurrency(p.amount, p.currency || currency, intlLocale)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 px-8 md:px-12 py-6 bg-slate-50/40 text-center space-y-1">
          <p className="text-sm font-bold text-slate-900">
            {isAr ? `شكراً لاختياركم ${siteName}` : `Thank you for choosing ${siteName}`}
          </p>
          <p className="text-[11px] text-slate-500">
            {isAr
              ? "هذه الفاتورة معتمدة إلكترونياً ومتوافقة مع متطلبات الفوترة الإلكترونية."
              : "This invoice is electronically issued and compliant with e-invoicing requirements."}
          </p>
          {(siteEmail || sitePhone) && (
            <p className="text-[11px] text-slate-400 pt-1">
              {isAr ? "للاستفسارات: " : "Inquiries: "}
              {siteEmail}
              {siteEmail && sitePhone && " · "}
              {sitePhone && <span dir="ltr">{sitePhone}</span>}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
