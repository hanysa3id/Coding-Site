import { z } from "zod";

export const cmsPageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9\-]+$/, "lowercase letters, digits, hyphens only"),
  title_ar: z.string().min(1).max(200),
  title_en: z.string().min(1).max(200),
  content_ar: z.string().nullable().optional(),
  content_en: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  show_in_footer: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
  seo_title_ar: z.string().nullable().optional(),
  seo_title_en: z.string().nullable().optional(),
  seo_description_ar: z.string().nullable().optional(),
  seo_description_en: z.string().nullable().optional(),
});
export type CmsPageInput = z.infer<typeof cmsPageSchema>;
