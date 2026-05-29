import { z } from "zod";

const optionalStr = z.string().nullable().optional().or(z.literal(""));

export const sectionItemSchema = z.object({
  id: z.string().min(1),
  title_ar: optionalStr,
  title_en: optionalStr,
  description_ar: optionalStr,
  description_en: optionalStr,
  icon: optionalStr,
  icon_name: optionalStr,
  image_url: optionalStr,
  badge_ar: optionalStr,
  badge_en: optionalStr,
  link_href: optionalStr,
  link_label_ar: optionalStr,
  link_label_en: optionalStr,
});
export type SectionItem = z.infer<typeof sectionItemSchema>;

export const sectionContentOverrideSchema = z.object({
  // Basic Text
  title_ar: optionalStr,
  title_en: optionalStr,
  subtitle_ar: optionalStr,
  subtitle_en: optionalStr,
  description_ar: optionalStr,
  description_en: optionalStr,
  badge_ar: optionalStr,
  badge_en: optionalStr,
  
  // Primary CTA
  primary_btn_label_ar: optionalStr,
  primary_btn_label_en: optionalStr,
  primary_btn_href: optionalStr,
  
  // Secondary CTA
  secondary_btn_label_ar: optionalStr,
  secondary_btn_label_en: optionalStr,
  secondary_btn_href: optionalStr,
  
  // Media
  background_image: optionalStr,
  icon_name: optionalStr,
  
  // List items (for features, stats, steps, etc.)
  items: z.array(sectionItemSchema).optional(),
});
export type SectionContentOverride = z.infer<typeof sectionContentOverrideSchema>;
