import { z } from "zod";

export const timelineStepSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
});
export type TimelineStepInput = z.infer<typeof timelineStepSchema>;

export const galleryItemSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url(),
  alt_text: z.string().nullable().optional(),
  media_type: z.enum(["image", "video"]).default("image"),
  sort_order: z.number().int().default(0),
});
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

export const portfolioExtendedSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/, "lowercase, hyphens only"),
  title_ar: z.string().min(1),
  title_en: z.string().min(1),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  delivery_date: z.string().nullable().optional(),
  cover_image: z.string().url().nullable().optional().or(z.literal("")),
  project_url: z.string().url().nullable().optional().or(z.literal("")),

  features_ar: z.array(z.string().min(1)).default([]),
  features_en: z.array(z.string().min(1)).default([]),
  problems_solved_ar: z.array(z.string().min(1)).default([]),
  problems_solved_en: z.array(z.string().min(1)).default([]),
  technologies: z.array(z.string().min(1)).default([]),
  timeline_ar: z.array(timelineStepSchema).default([]),
  timeline_en: z.array(timelineStepSchema).default([]),

  service_ids: z.array(z.string().uuid()).default([]),
  gallery: z.array(galleryItemSchema).default([]),

  seo_title_ar: z.string().nullable().optional(),
  seo_title_en: z.string().nullable().optional(),
  seo_description_ar: z.string().nullable().optional(),
  seo_description_en: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),

  is_featured: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
export type PortfolioExtendedInput = z.infer<typeof portfolioExtendedSchema>;
