import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/, "lowercase, hyphens only"),
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_visible: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable(),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/),
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
  cover_image: z.string().url().nullable().optional(),
  video_url: z.string().url().nullable().optional(),
  seo_title_ar: z.string().nullable().optional(),
  seo_title_en: z.string().nullable().optional(),
  seo_description_ar: z.string().nullable().optional(),
  seo_description_en: z.string().nullable().optional(),
  seo_keywords: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_visible: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const portfolioSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/),
  title_ar: z.string().min(1),
  title_en: z.string().min(1),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  delivery_date: z.string().nullable().optional(),
  cover_image: z.string().url().nullable().optional(),
  project_url: z.string().url().nullable().optional(),
  is_featured: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;
