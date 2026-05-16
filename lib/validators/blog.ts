import { z } from "zod";

export const blogMediaItemSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url(),
  caption_ar: z.string().optional(),
  caption_en: z.string().optional(),
});

export const blogFaqSchema = z.object({
  question_ar: z.string().min(1),
  question_en: z.string().min(1),
  answer_ar: z.string().min(1),
  answer_en: z.string().min(1),
});

export const blogPostSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/, "lowercase letters, digits, hyphens only"),
  title_ar: z.string().min(1),
  title_en: z.string().min(1),
  excerpt_ar: z.string().nullable().optional(),
  excerpt_en: z.string().nullable().optional(),
  content_ar: z.string().nullable().optional(),
  content_en: z.string().nullable().optional(),
  cover_image: z.string().url().nullable().optional(),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
  is_featured: z.boolean().default(false),
  tags: z.array(z.string().min(1)).default([]),
  media: z.array(blogMediaItemSchema).default([]),
  faqs: z.array(blogFaqSchema).default([]),
  category_ids: z.array(z.string().uuid()).default([]),
  seo_title_ar: z.string().nullable().optional(),
  seo_title_en: z.string().nullable().optional(),
  seo_description_ar: z.string().nullable().optional(),
  seo_description_en: z.string().nullable().optional(),
  seo_keywords_ar: z.string().nullable().optional(),
  seo_keywords_en: z.string().nullable().optional(),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type BlogMediaItemInput = z.infer<typeof blogMediaItemSchema>;
export type BlogFaqInput = z.infer<typeof blogFaqSchema>;

export const blogCategorySchema = z.object({
  id: z.string().uuid().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/, "lowercase letters, digits, hyphens only"),
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  is_visible: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;
