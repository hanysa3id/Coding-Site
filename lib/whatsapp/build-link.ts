export type WhatsAppContext =
  | { type: "general"; siteName?: string }
  | { type: "service"; serviceName: string; estimatedPrice?: string }
  | { type: "order"; orderNumber: string; serviceName?: string }
  | { type: "custom"; message: string };

export function buildWaLink(
  phoneNumber: string,
  context: WhatsAppContext,
  locale: "ar" | "en" = "ar"
): string {
  const cleanedPhone = phoneNumber.replace(/[^\d]/g, "");
  const message = buildMessage(context, locale);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanedPhone}?text=${encoded}`;
}

function buildMessage(ctx: WhatsAppContext, locale: "ar" | "en"): string {
  if (ctx.type === "custom") return ctx.message;

  const isAr = locale === "ar";

  if (ctx.type === "general") {
    return isAr
      ? `مرحباً، أرغب في الاستفسار عن خدماتكم في ${ctx.siteName ?? ""}.`
      : `Hello, I would like to inquire about your services at ${ctx.siteName ?? ""}.`;
  }

  if (ctx.type === "service") {
    const priceLine = ctx.estimatedPrice
      ? isAr
        ? `\nالسعر التقديري: ${ctx.estimatedPrice}`
        : `\nEstimated price: ${ctx.estimatedPrice}`
      : "";
    return isAr
      ? `مرحباً، أرغب في الاستفسار عن خدمة: ${ctx.serviceName}${priceLine}`
      : `Hello, I would like to inquire about the service: ${ctx.serviceName}${priceLine}`;
  }

  if (ctx.type === "order") {
    const svcLine = ctx.serviceName
      ? isAr
        ? `\nالخدمة: ${ctx.serviceName}`
        : `\nService: ${ctx.serviceName}`
      : "";
    return isAr
      ? `مرحباً، أرغب في متابعة الطلب رقم: ${ctx.orderNumber}${svcLine}`
      : `Hello, I would like to follow up on order: ${ctx.orderNumber}${svcLine}`;
  }

  return "";
}
