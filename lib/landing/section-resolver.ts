import type { LandingSettings } from "@/lib/validators/settings";
import type { SectionContentOverride } from "@/lib/validators/section-content";

/**
 * Merges admin-defined overrides for a section with its default content.
 * Admin overrides take precedence. If a field is empty/null, it falls back to the default.
 */
export function resolveSectionContent<T extends Partial<SectionContentOverride>>(
  landing: LandingSettings | null | undefined,
  sectionId: string,
  locale: string,
  defaults: T
): T & {
  // Convenience accessors for current locale
  title: string | undefined;
  subtitle: string | undefined;
  description: string | undefined;
  badge: string | undefined;
  primary_btn_label: string | undefined;
  secondary_btn_label: string | undefined;
} {
  const isAr = locale === "ar";
  const overrides = landing?.section_overrides?.[sectionId] ?? {};

  const pick = (
    arOverride: string | null | undefined,
    enOverride: string | null | undefined,
    arDefault: string | null | undefined,
    enDefault: string | null | undefined
  ) => {
    const overrideVal = (isAr ? arOverride : enOverride)?.trim();
    if (overrideVal && overrideVal.length > 0) return overrideVal;
    
    // Use default if no override
    const defaultVal = (isAr ? arDefault : enDefault)?.trim();
    return defaultVal || undefined;
  };

  const title = pick(overrides.title_ar, overrides.title_en, defaults.title_ar, defaults.title_en);
  const subtitle = pick(overrides.subtitle_ar, overrides.subtitle_en, defaults.subtitle_ar, defaults.subtitle_en);
  const description = pick(overrides.description_ar, overrides.description_en, defaults.description_ar, defaults.description_en);
  const badge = pick(overrides.badge_ar, overrides.badge_en, defaults.badge_ar, defaults.badge_en);
  
  const primary_btn_label = pick(
    overrides.primary_btn_label_ar, overrides.primary_btn_label_en,
    defaults.primary_btn_label_ar, defaults.primary_btn_label_en
  );
  const secondary_btn_label = pick(
    overrides.secondary_btn_label_ar, overrides.secondary_btn_label_en,
    defaults.secondary_btn_label_ar, defaults.secondary_btn_label_en
  );

  return {
    ...defaults,
    ...overrides, // Raw overrides still accessible
    // Resolved localized strings
    title,
    subtitle,
    description,
    badge,
    primary_btn_label,
    secondary_btn_label,
    // Links (not localized, but fallback to defaults)
    primary_btn_href: (overrides.primary_btn_href?.trim() || defaults.primary_btn_href) as string | undefined,
    secondary_btn_href: (overrides.secondary_btn_href?.trim() || defaults.secondary_btn_href) as string | undefined,
    background_image: (overrides.background_image?.trim() || defaults.background_image) as string | undefined,
    icon_name: (overrides.icon_name?.trim() || defaults.icon_name) as string | undefined,
    items: overrides.items && overrides.items.length > 0 ? overrides.items : defaults.items,
  } as any;
}
