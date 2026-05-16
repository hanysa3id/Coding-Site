import { z } from "zod";

export const createOrderSchema = z.object({
  service_id: z.string().uuid(),
  customer_message: z.string().min(10).max(2000),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const negotiateOrderSchema = z.object({
  order_id: z.string().uuid(),
  final_price: z.number().min(0).nullable().optional(),
  final_duration_days: z.number().int().min(0).nullable().optional(),
  admin_notes: z.string().max(2000).nullable().optional(),
});
export type NegotiateOrderInput = z.infer<typeof negotiateOrderSchema>;

export const updateOrderStatusSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum([
    "pending_review",
    "under_negotiation",
    "awaiting_customer_approval",
    "awaiting_payment",
    "in_progress",
    "delivered",
    "completed",
    "cancelled",
    "refunded",
  ]),
  note: z.string().max(1000).optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const assignStaffSchema = z.object({
  order_id: z.string().uuid(),
  staff_id: z.string().uuid().nullable(),
});

export const sendMessageSchema = z.object({
  order_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  attachment_url: z.string().url().nullable().optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const milestoneSchema = z.object({
  id: z.string().uuid().optional(),
  order_id: z.string().uuid(),
  title_ar: z.string().min(1),
  title_en: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["pending", "in_progress", "done"]).default("pending"),
  sort_order: z.number().int().default(0),
});
export type MilestoneInput = z.infer<typeof milestoneSchema>;

export const deliverableSchema = z.object({
  order_id: z.string().uuid(),
  file_url: z.string().url(),
  file_name: z.string().min(1),
  file_type: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type DeliverableInput = z.infer<typeof deliverableSchema>;

export const reviewSchema = z.object({
  order_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
