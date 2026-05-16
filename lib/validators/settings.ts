import { z } from "zod";

export const siteSettingsSchema = z.object({
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  logo_url: z.string().url().nullable().optional().or(z.literal("")),
  favicon_url: z.string().url().nullable().optional().or(z.literal("")),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const whatsappSettingsSchema = z.object({
  business_number: z.string().min(8),
  show_floating_button: z.boolean().default(true),
  default_message_ar: z.string().nullable().optional(),
  default_message_en: z.string().nullable().optional(),
});
export type WhatsappSettings = z.infer<typeof whatsappSettingsSchema>;

export const seoSettingsSchema = z.object({
  default_title_ar: z.string().nullable().optional(),
  default_title_en: z.string().nullable().optional(),
  default_description_ar: z.string().nullable().optional(),
  default_description_en: z.string().nullable().optional(),
  og_image: z.string().url().nullable().optional().or(z.literal("")),
  twitter_handle: z.string().nullable().optional(),
});
export type SeoSettings = z.infer<typeof seoSettingsSchema>;

export const contactSettingsSchema = z.object({
  email: z.string().email().or(z.literal("")),
  phone: z.string().nullable().optional(),
  address_ar: z.string().nullable().optional(),
  address_en: z.string().nullable().optional(),
  social: z.object({
    facebook: z.string().nullable().optional().or(z.literal("")),
    instagram: z.string().nullable().optional().or(z.literal("")),
    twitter: z.string().nullable().optional().or(z.literal("")),
    linkedin: z.string().nullable().optional().or(z.literal("")),
    youtube: z.string().nullable().optional().or(z.literal("")),
  }),
});
export type ContactSettings = z.infer<typeof contactSettingsSchema>;

export const paymentsSettingsSchema = z.object({
  paymob_enabled: z.boolean().default(false),
  offline_enabled: z.boolean().default(true),
  currency: z.string().min(2).default("EGP"),
  currency_symbol_ar: z.string().nullable().optional(),
  currency_symbol_en: z.string().nullable().optional(),
});
export type PaymentsSettings = z.infer<typeof paymentsSettingsSchema>;

export const bankAccountSchema = z.object({
  id: z.string().uuid().optional(),
  name_ar: z.string().min(1),
  name_en: z.string().min(1),
  bank_name: z.string().min(1),
  account_number: z.string().nullable().optional(),
  iban: z.string().nullable().optional(),
  account_holder: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_visible: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
export type BankAccountInput = z.infer<typeof bankAccountSchema>;

// ============================================================================
// Integrations — public IDs only (anything secret goes in .env.local)
// ============================================================================

const optionalString = z.string().nullable().optional().or(z.literal(""));

export const integrationsSettingsSchema = z.object({
  // Google
  ga4_measurement_id: optionalString, // G-XXXXXXXXXX
  gtm_id: optionalString, // GTM-XXXXXXX
  google_site_verification: optionalString, // verification token
  google_maps_api_key: optionalString, // public API key (restricted by HTTP referrer)
  google_ads_id: optionalString, // AW-XXXXXXXXX

  // Meta / Facebook
  facebook_pixel_id: optionalString,
  facebook_app_id: optionalString,

  // Microsoft
  microsoft_clarity_id: optionalString,
  bing_site_verification: optionalString,

  // Other analytics / heatmaps
  hotjar_id: optionalString,

  // MENA-popular ad platforms
  tiktok_pixel_id: optionalString,
  snap_pixel_id: optionalString,

  // Forms protection
  recaptcha_site_key: optionalString, // public site key only

  // Live chat
  intercom_app_id: optionalString,
  tawk_to_id: optionalString,
  crisp_website_id: optionalString,
});
export type IntegrationsSettings = z.infer<typeof integrationsSettingsSchema>;
