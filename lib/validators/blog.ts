import { z } from "zod";

export const blogPostSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9\-]+$/),
  title_ar: z.string().min(1),
  title_en: z.string().min(1),
  excerpt_ar: z.string().nullable().optional(),
  excerpt_en: z.string().nullable().optional(),
  content_ar: z.string().nullable().optional(),
  content_en: z.string().nullable().optional(),
  cover_image: z.string().url().nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  seo_title_ar: z.string().nullable().optional(),
  seo_title_en: z.string().nullable().optional(),
  seo_description_ar: z.string().nullable().optional(),
  seo_description_en: z.string().nullable().optional(),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;
