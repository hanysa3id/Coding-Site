import "server-only";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { landingSettingsSchema } from "@/lib/validators/settings";
import type {
  SiteSettings,
  WhatsappSettings,
  SeoSettings,
  ContactSettings,
  PaymentsSettings,
  IntegrationsSettings,
  TelegramSettingsInput,
  OrdersPolicyInput,
  BusinessHoursInput,
  ThemeSettings,
  LandingSettings,
} from "@/lib/validators/settings";

/**
 * Per-request cached reader for the singleton settings table.
 * Each settings key is a jsonb blob. Returns null if the key is missing.
 *
 * Cache is scoped to a single request (React `cache`) so calling
 * `getSiteSettings()` multiple times in one render does a single DB hit.
 */
const fetchAllSettings = cache(async (): Promise<Map<string, Record<string, unknown>>> => {
  // Opt out of Next's data cache for the underlying fetch — `settings` is a
  // small singleton table that admins edit live from /admin/themes and
  // /admin/settings, so we can never serve stale data. React `cache()`
  // still memoizes within a single request.
  noStore();
  const map = new Map<string, Record<string, unknown>>();
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("settings").select("key, value");
    for (const row of (data as Array<{ key: string; value: Record<string, unknown> }>) ?? []) {
      map.set(row.key, row.value);
    }
  } catch {
    // ignore — return empty map; callers should fall back to defaults
  }
  return map;
});

async function getSetting<T>(key: string): Promise<T | null> {
  const all = await fetchAllSettings();
  return (all.get(key) as T | undefined) ?? null;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return getSetting<SiteSettings>("site");
}

export async function getWhatsappSettings(): Promise<WhatsappSettings | null> {
  return getSetting<WhatsappSettings>("whatsapp");
}

export async function getSeoSettings(): Promise<SeoSettings | null> {
  return getSetting<SeoSettings>("seo");
}

export async function getContactSettings(): Promise<ContactSettings | null> {
  return getSetting<ContactSettings>("contact");
}

export async function getPaymentsSettings(): Promise<PaymentsSettings | null> {
  return getSetting<PaymentsSettings>("payments");
}

export async function getIntegrationsSettings(): Promise<IntegrationsSettings | null> {
  return getSetting<IntegrationsSettings>("integrations");
}

export async function getTelegramSettings(): Promise<TelegramSettingsInput | null> {
  return getSetting<TelegramSettingsInput>("telegram");
}

export async function getOrdersPolicy(): Promise<OrdersPolicyInput | null> {
  return getSetting<OrdersPolicyInput>("orders_policy");
}

export async function getBusinessHours(): Promise<BusinessHoursInput | null> {
  return getSetting<BusinessHoursInput>("business_hours");
}

export async function getThemeSettings(): Promise<ThemeSettings | null> {
  return getSetting<ThemeSettings>("theme");
}

export async function getLandingSettings(): Promise<LandingSettings | null> {
  // Parse through the schema so legacy shapes (e.g. logos as a plain string
  // array) are migrated by the Zod preprocess into the current object shape.
  // Without this every theme that iterates `landing.logos` and accesses
  // `entry.name.trim()` would crash on data saved before the schema change.
  const raw = await getSetting<unknown>("landing");
  if (!raw || typeof raw !== "object") return null;
  const parsed = landingSettingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function getThemeCustomizationsRaw(): Promise<Record<string, unknown> | null> {
  return getSetting<Record<string, unknown>>("theme_customizations");
}

/**
 * Convenience: resolve the localized site name with sensible fallback.
 */
export async function getSiteName(locale: string): Promise<string> {
  const site = await getSiteSettings();
  if (!site) return locale === "ar" ? "منصة الشركة" : "Company Platform";
  return locale === "ar" ? site.name_ar : site.name_en;
}

/**
 * Convenience: resolve the WhatsApp number with .env fallback.
 */
export async function getWhatsappNumber(): Promise<string> {
  const wa = await getWhatsappSettings();
  if (wa?.business_number) return wa.business_number;
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "201000000000";
}
