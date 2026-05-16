import type { OrderStatus } from "@/types/database";

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  {
    ar: string;
    en: string;
    variant: "default" | "secondary" | "success" | "warning" | "destructive";
  }
> = {
  pending_review: { ar: "قيد المراجعة", en: "Pending review", variant: "secondary" },
  under_negotiation: { ar: "قيد التفاوض", en: "Under negotiation", variant: "warning" },
  awaiting_customer_approval: {
    ar: "بانتظار موافقة العميل",
    en: "Awaiting customer approval",
    variant: "warning",
  },
  awaiting_payment: { ar: "بانتظار الدفع", en: "Awaiting payment", variant: "warning" },
  in_progress: { ar: "قيد التنفيذ", en: "In progress", variant: "default" },
  delivered: { ar: "تم التسليم", en: "Delivered", variant: "success" },
  completed: { ar: "مكتمل", en: "Completed", variant: "success" },
  cancelled: { ar: "ملغي", en: "Cancelled", variant: "destructive" },
  refunded: { ar: "مسترد", en: "Refunded", variant: "destructive" },
};

// Valid transitions from each status
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_review: ["under_negotiation", "cancelled"],
  under_negotiation: ["awaiting_customer_approval", "cancelled"],
  awaiting_customer_approval: ["awaiting_payment", "under_negotiation", "cancelled"],
  awaiting_payment: ["in_progress", "cancelled"],
  in_progress: ["delivered", "cancelled"],
  delivered: ["completed", "in_progress"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function canTransitionTo(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
