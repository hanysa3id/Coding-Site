import { z } from "zod";
import { timelineStepSchema, galleryItemSchema } from "@/lib/validators/portfolio";

export const serviceExtendedSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "lowercase + hyphens only"),
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  short_description_ar: z.string().nullable().optional(),
  short_description_en: z.string().nullable().optional(),
  full_description_ar: z.string().nullable().optional(),
  full_description_en: z.string().nullable().optional(),

  estimated_price_min: z.number().min(0).nullable().optional(),
  estimated_price_max: z.number().min(0).nullable().optional(),
  currency: z.string().default("EGP"),
  estimated_duration_days: z.number().int().min(0).nullable().optional(),

  cover_image: z.string().url().nullable().optional().or(z.literal("")),
  thumbnail_url: z.string().url().nullable().optional().or(z.literal("")),
  video_url: z.string().url().nullable().optional().or(z.literal("")),

  features_ar: z.array(z.string().min(1)).default([]),
  features_en: z.array(z.string().min(1)).default([]),
  deliverables_ar: z.array(z.string().min(1)).default([]),
  deliverables_en: z.array(z.string().min(1)).default([]),
  timeline_ar: z.array(timelineStepSchema).default([]),
  timeline_en: z.array(timelineStepSchema).default([]),

  gallery: z.array(galleryItemSchema).default([]),

  seo_title_ar: z.string().nullable().optional(),
  seo_title_en: z.string().nullable().optional(),
  seo_description_ar: z.string().nullable().optional(),
  seo_description_en: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),

  sort_order: z.number().int().default(0),
  is_visible: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export type ServiceExtendedInput = z.infer<typeof serviceExtendedSchema>;
