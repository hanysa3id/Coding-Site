import { z } from "zod";
import { sectionContentOverrideSchema } from "./section-content";

// Available theme ids must stay in sync with themes/index.ts THEMES map.
export const themeIdSchema = z.enum(["classic", "aurora", "nova", "sky", "moon", "prism", "combo", "hany", "new", "newwwww", "pro"]);
export type ThemeId = z.infer<typeof themeIdSchema>;

export const themeSettingsSchema = z.object({
  active: themeIdSchema.default("classic"),
});
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;

// ─── Landing page / Frontpage settings ──────────────────────────────────────
// Canonical section ids that themes opt-in to. If a theme has the section,
// it reads the visibility toggle; if it doesn't, the toggle is a no-op.
export const landingSectionIdSchema = z.enum([
  "hero",
  "logo_cloud",
  "features",
  "stats",
  "services",
  "process",
  "portfolio",
  "testimonials",
  "pricing",
  "blog",
  "faq",
  "newsletter",
  "team",
  "cta",
]);
export type LandingSectionId = z.infer<typeof landingSectionIdSchema>;

export const landingNavItemSchema = z.object({
  label_ar: z.string().min(1),
  label_en: z.string().min(1),
  href: z.string().min(1),
});
export type LandingNavItem = z.infer<typeof landingNavItemSchema>;

export const landingFaqSchema = z.object({
  q_ar: z.string().min(1),
  q_en: z.string().min(1),
  a_ar: z.string().min(1),
  a_en: z.string().min(1),
});
export type LandingFaqItem = z.infer<typeof landingFaqSchema>;

export const landingStatSchema = z.object({
  value: z.string().min(1),       // e.g. "100+", "98%", "7"
  label_ar: z.string().min(1),
  label_en: z.string().min(1),
});
export type LandingStatItem = z.infer<typeof landingStatSchema>;

// Logo cloud entry — name, optional image, optional bilingual description.
// String values are auto-migrated to `{ name }` via the preprocess on `logos`.
export const landingLogoSchema = z.object({
  name: z.string().min(1),
  image_url: z.string().nullable().optional().or(z.literal("")),
  description_ar: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
});
export type LandingLogoItem = z.infer<typeof landingLogoSchema>;

// Hero slide — title/subtitle/badge + dual CTAs + optional backdrop media.
// Every field is optional; empty fields fall back to the theme default.
export const landingHeroSlideSchema = z.object({
  badge_ar: z.string().nullable().optional(),
  badge_en: z.string().nullable().optional(),
  title_ar: z.string().nullable().optional(),
  title_en: z.string().nullable().optional(),
  subtitle_ar: z.string().nullable().optional(),
  subtitle_en: z.string().nullable().optional(),
  primary_cta_label_ar: z.string().nullable().optional(),
  primary_cta_label_en: z.string().nullable().optional(),
  primary_cta_href: z.string().nullable().optional(),
  secondary_cta_label_ar: z.string().nullable().optional(),
  secondary_cta_label_en: z.string().nullable().optional(),
  secondary_cta_href: z.string().nullable().optional(),
  /** Background image (overrides theme default for this slide). */
  image_url: z.string().nullable().optional().or(z.literal("")),
  /** Optional looping muted video URL (mp4/webm). */
  video_url: z.string().nullable().optional().or(z.literal("")),
});
export type LandingHeroSlide = z.infer<typeof landingHeroSlideSchema>;

export const landingSettingsSchema = z.object({
  // Section visibility — keyed by canonical id. Missing key = visible.
  sections: z.record(z.string(), z.boolean()).default({}),

  // Hero overrides — empty fields fall back to the theme default.
  hero: z
    .object({
      title_ar: z.string().nullable().optional(),
      title_en: z.string().nullable().optional(),
      subtitle_ar: z.string().nullable().optional(),
      subtitle_en: z.string().nullable().optional(),
      badge_ar: z.string().nullable().optional(),
      badge_en: z.string().nullable().optional(),
      primary_cta_label_ar: z.string().nullable().optional(),
      primary_cta_label_en: z.string().nullable().optional(),
      primary_cta_href: z.string().nullable().optional(),
      secondary_cta_label_ar: z.string().nullable().optional(),
      secondary_cta_label_en: z.string().nullable().optional(),
      secondary_cta_href: z.string().nullable().optional(),
    })
    .default({}),

  // Nav-bar visibility + custom items appended after the defaults.
  nav: z
    .object({
      show_services: z.boolean().default(true),
      show_portfolio: z.boolean().default(true),
      show_blog: z.boolean().default(true),
      show_about: z.boolean().default(true),
      show_contact: z.boolean().default(true),
      custom_items: z.array(landingNavItemSchema).default([]),
    })
    .default({}),

  // Logo cloud entries — each may have an uploaded image + bilingual
  // description. Legacy data (array of strings) is auto-migrated to
  // `{ name }` objects so existing settings keep working.
  logos: z
    .preprocess(
      (v) => {
        if (!Array.isArray(v)) return v;
        return v.map((item) =>
          typeof item === "string" ? { name: item } : item
        );
      },
      z.array(landingLogoSchema)
    )
    .default([]),

  // Multi-slide hero — when populated, themes that support a slider render
  // these in order. Empty = fall back to the single `hero` block + theme defaults.
  hero_slides: z.array(landingHeroSlideSchema).default([]),

  // FAQ entries. Empty = theme uses built-in defaults.
  faqs: z.array(landingFaqSchema).default([]),

  // Stats — the big numbers shown in the stats strip. Empty = theme uses
  // either AboutSettings.stats (Sky) or its own defaults.
  stats: z.array(landingStatSchema).default([]),

  // Marketing Testimonials. Empty = theme uses fallback or database reviews.
  testimonials: z.array(
    z.object({
      id: z.string().min(1),
      rating: z.number().min(1).max(5).default(5),
      comment_ar: z.string().min(1),
      comment_en: z.string().min(1),
      customer_name_ar: z.string().min(1),
      customer_name_en: z.string().min(1),
      customer_role_ar: z.string().nullable().optional(),
      customer_role_en: z.string().nullable().optional(),
      avatar_url: z.string().nullable().optional().or(z.literal("")),
    })
  ).default([]),

  // Overrides for standard sections (titles, subtitles, etc.)
  section_overrides: z.record(
    z.string(),
    sectionContentOverrideSchema
  ).default({}),

  // Global dictionary text overrides
  dictionary_overrides_ar: z.record(z.string(), z.any()).default({}),
  dictionary_overrides_en: z.record(z.string(), z.any()).default({}),
});
export type LandingTestimonial = z.infer<typeof landingSettingsSchema>["testimonials"][0];
export type LandingSettings = z.infer<typeof landingSettingsSchema>;

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

const optionalStr = z.string().nullable().optional().or(z.literal(""));

export const contactSettingsSchema = z.object({
  email: z.string().email().or(z.literal("")),
  phone: z.string().nullable().optional(),
  address_ar: z.string().nullable().optional(),
  address_en: z.string().nullable().optional(),
  address_link: optionalStr,
  working_hours_note_ar: optionalStr,
  working_hours_note_en: optionalStr,
  social: z.object({
    facebook:  optionalStr,
    instagram: optionalStr,
    twitter:   optionalStr,
    linkedin:  optionalStr,
    youtube:   optionalStr,
    tiktok:    optionalStr,
    snapchat:  optionalStr,
    github:    optionalStr,
    behance:   optionalStr,
    dribbble:  optionalStr,
    telegram:  optionalStr,
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

// ============================================================================
// Telegram notifications
// ============================================================================

const TELEGRAM_EVENTS = [
  "new_order",
  "order_status_changed",
  "payment_received",
  "payment_failed",
  "new_review",
  "new_message_from_customer",
  "order_cancelled",
] as const;

export const telegramEventEnum = z.enum(TELEGRAM_EVENTS);
export type TelegramEventKey = z.infer<typeof telegramEventEnum>;

const telegramEventBooleans = z.object(
  Object.fromEntries(TELEGRAM_EVENTS.map((k) => [k, z.boolean()])) as Record<
    TelegramEventKey,
    z.ZodBoolean
  >
);

const telegramEventTemplates = z.object(
  Object.fromEntries(TELEGRAM_EVENTS.map((k) => [k, z.string()])) as Record<
    TelegramEventKey,
    z.ZodString
  >
);

export const telegramSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  bot_token: z.string().nullable().optional().or(z.literal("")),
  admin_chat_id: z.string().nullable().optional().or(z.literal("")),
  events: telegramEventBooleans,
  templates: telegramEventTemplates,
});
export type TelegramSettingsInput = z.infer<typeof telegramSettingsSchema>;

// ============================================================================
// Orders policy
// ============================================================================
export const orderStatusEnum = z.enum([
  "pending_review",
  "under_negotiation",
  "awaiting_customer_approval",
  "awaiting_payment",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
]);

export const ordersPolicySchema = z.object({
  max_pending_per_customer: z.coerce.number().int().min(0).max(1000).default(3),
  pending_statuses: z.array(orderStatusEnum).default(["pending_review", "under_negotiation"]),
  require_phone_on_signup: z.boolean().default(false),
  auto_assign_sales: z.boolean().default(false),
});
export type OrdersPolicyInput = z.infer<typeof ordersPolicySchema>;

// ============================================================================
// Business hours
// ============================================================================
const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM");
const businessDay = z.object({
  open: timeStr,
  close: timeStr,
  closed: z.boolean().default(false),
});

export const businessHoursSchema = z.object({
  timezone: z.string().min(1).default("Africa/Cairo"),
  sunday: businessDay,
  monday: businessDay,
  tuesday: businessDay,
  wednesday: businessDay,
  thursday: businessDay,
  friday: businessDay,
  saturday: businessDay,
});
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;
