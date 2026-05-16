import "server-only";
import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "no-reply@example.com";

const client = resendKey ? new Resend(resendKey) : null;

export type EmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: EmailInput): Promise<void> {
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — skipping send");
    return;
  }
  try {
    await client.emails.send({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

export function orderCreatedEmail(opts: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  locale: "ar" | "en";
  siteUrl: string;
}): EmailInput {
  const { customerName, orderNumber, serviceName, locale, siteUrl } = opts;
  const isAr = locale === "ar";
  const orderUrl = `${siteUrl}/${locale}/orders`;
  return {
    to: "", // caller fills
    subject: isAr ? `طلبك ${orderNumber} قيد المراجعة` : `Your order ${orderNumber} is under review`,
    html: isAr
      ? `<div dir="rtl" style="font-family:sans-serif">
          <h2>مرحباً ${customerName}</h2>
          <p>تم استلام طلبك بنجاح:</p>
          <ul>
            <li><strong>رقم الطلب:</strong> ${orderNumber}</li>
            <li><strong>الخدمة:</strong> ${serviceName}</li>
          </ul>
          <p>سنراجع طلبك ونتواصل معك خلال 24 ساعة.</p>
          <p><a href="${orderUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">عرض طلباتي</a></p>
        </div>`
      : `<div style="font-family:sans-serif">
          <h2>Hi ${customerName},</h2>
          <p>We've received your order:</p>
          <ul>
            <li><strong>Order:</strong> ${orderNumber}</li>
            <li><strong>Service:</strong> ${serviceName}</li>
          </ul>
          <p>We'll review your order and get back to you within 24 hours.</p>
          <p><a href="${orderUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">View my orders</a></p>
        </div>`,
  };
}

export function orderStatusChangedEmail(opts: {
  customerName: string;
  orderNumber: string;
  statusLabel: string;
  locale: "ar" | "en";
  orderUrl: string;
}): EmailInput {
  const { customerName, orderNumber, statusLabel, locale, orderUrl } = opts;
  const isAr = locale === "ar";
  return {
    to: "",
    subject: isAr
      ? `تحديث على طلبك ${orderNumber}`
      : `Update on order ${orderNumber}`,
    html: isAr
      ? `<div dir="rtl" style="font-family:sans-serif">
          <h2>مرحباً ${customerName}</h2>
          <p>تم تحديث حالة طلبك <strong>${orderNumber}</strong> إلى:</p>
          <p style="font-size:18px;font-weight:bold">${statusLabel}</p>
          <p><a href="${orderUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">عرض الطلب</a></p>
        </div>`
      : `<div style="font-family:sans-serif">
          <h2>Hi ${customerName},</h2>
          <p>Your order <strong>${orderNumber}</strong> status has been updated to:</p>
          <p style="font-size:18px;font-weight:bold">${statusLabel}</p>
          <p><a href="${orderUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">View order</a></p>
        </div>`,
  };
}

export function paymentReceivedEmail(opts: {
  customerName: string;
  orderNumber: string;
  amount: string;
  method: string;
  transactionId?: string | null;
  locale: "ar" | "en";
  orderUrl: string;
}): EmailInput {
  const { customerName, orderNumber, amount, method, transactionId, locale, orderUrl } = opts;
  const isAr = locale === "ar";
  return {
    to: "",
    subject: isAr
      ? `تأكيد استلام دفعة — طلب ${orderNumber}`
      : `Payment received — order ${orderNumber}`,
    html: isAr
      ? `<div dir="rtl" style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#16a34a">✅ تم استلام دفعتك بنجاح</h2>
          <p>مرحباً ${customerName}،</p>
          <p>استلمنا دفعتك ونحن نباشر العمل على طلبك.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>رقم الطلب</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${orderNumber}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>المبلغ</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${amount}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>طريقة الدفع</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${method}</td></tr>
            ${transactionId ? `<tr><td style="padding:8px"><strong>رقم العملية</strong></td><td style="padding:8px;font-family:monospace">${transactionId}</td></tr>` : ""}
          </table>
          <p><a href="${orderUrl}" style="display:inline-block;padding:10px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">عرض الطلب</a></p>
        </div>`
      : `<div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#16a34a">✅ Payment received</h2>
          <p>Hi ${customerName},</p>
          <p>We've received your payment and started working on your order.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Order</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${orderNumber}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Amount</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${amount}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Method</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${method}</td></tr>
            ${transactionId ? `<tr><td style="padding:8px"><strong>Transaction</strong></td><td style="padding:8px;font-family:monospace">${transactionId}</td></tr>` : ""}
          </table>
          <p><a href="${orderUrl}" style="display:inline-block;padding:10px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px">View order</a></p>
        </div>`,
  };
}

export function paymentFailedEmail(opts: {
  customerName: string;
  orderNumber: string;
  amount: string;
  reason?: string | null;
  locale: "ar" | "en";
  payUrl: string;
}): EmailInput {
  const { customerName, orderNumber, amount, reason, locale, payUrl } = opts;
  const isAr = locale === "ar";
  return {
    to: "",
    subject: isAr
      ? `لم يتم إكمال دفعة — طلب ${orderNumber}`
      : `Payment not completed — order ${orderNumber}`,
    html: isAr
      ? `<div dir="rtl" style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#dc2626">⚠️ لم تكتمل دفعتك</h2>
          <p>مرحباً ${customerName}،</p>
          <p>محاولة الدفع للطلب <strong>${orderNumber}</strong> بقيمة <strong>${amount}</strong> لم تنجح.</p>
          ${reason ? `<p style="background:#fee;padding:12px;border-radius:6px;border-right:3px solid #dc2626"><strong>السبب:</strong> ${reason}</p>` : ""}
          <p>يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة:</p>
          <p><a href="${payUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">إعادة المحاولة</a></p>
        </div>`
      : `<div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#dc2626">⚠️ Payment not completed</h2>
          <p>Hi ${customerName},</p>
          <p>Your payment attempt for order <strong>${orderNumber}</strong> (<strong>${amount}</strong>) didn't go through.</p>
          ${reason ? `<p style="background:#fee;padding:12px;border-radius:6px;border-left:3px solid #dc2626"><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>You can retry or use a different payment method:</p>
          <p><a href="${payUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">Try again</a></p>
        </div>`,
  };
}

export function deliverableUploadedEmail(opts: {
  customerName: string;
  orderNumber: string;
  fileName: string;
  locale: "ar" | "en";
  orderUrl: string;
}): EmailInput {
  const { customerName, orderNumber, fileName, locale, orderUrl } = opts;
  const isAr = locale === "ar";
  return {
    to: "",
    subject: isAr
      ? `ملف جديد على طلبك ${orderNumber}`
      : `New deliverable on order ${orderNumber}`,
    html: isAr
      ? `<div dir="rtl" style="font-family:sans-serif">
          <h2>📎 ملف جديد متاح</h2>
          <p>مرحباً ${customerName}،</p>
          <p>تم رفع ملف جديد على طلبك <strong>${orderNumber}</strong>:</p>
          <p style="font-family:monospace;background:#f3f4f6;padding:8px;border-radius:4px">${fileName}</p>
          <p><a href="${orderUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">عرض الطلب وتحميل الملف</a></p>
        </div>`
      : `<div style="font-family:sans-serif">
          <h2>📎 New deliverable available</h2>
          <p>Hi ${customerName},</p>
          <p>A new file has been uploaded to your order <strong>${orderNumber}</strong>:</p>
          <p style="font-family:monospace;background:#f3f4f6;padding:8px;border-radius:4px">${fileName}</p>
          <p><a href="${orderUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">View order & download</a></p>
        </div>`,
  };
}
