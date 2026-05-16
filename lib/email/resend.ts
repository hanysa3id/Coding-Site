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
