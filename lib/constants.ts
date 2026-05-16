export const SITE_NAME = "Company Platform";
export const SITE_DESCRIPTION_AR =
  "منصة متكاملة لخدمات البرمجة والتصميم — اطلب خدمتك، تابع التنفيذ، واستلم مشروعك باحترافية.";
export const SITE_DESCRIPTION_EN =
  "A complete platform for programming and design services — request, track, and receive your project professionally.";

export const LOCALES = ["ar", "en"] as const;
export const DEFAULT_LOCALE = "ar" as const;

export type Locale = (typeof LOCALES)[number];

export const ORDER_STATUSES = [
  "pending_review",
  "under_negotiation",
  "awaiting_customer_approval",
  "awaiting_payment",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = [
  "paymob",
  "bank_transfer",
  "cash",
  "instapay",
  "vodafone_cash",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "refunded",
  "failed",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const USER_ROLES = ["customer", "sales", "staff", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];
