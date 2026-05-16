import type { LandingSectionId, LandingSettings } from "@/lib/validators/settings";

/**
 * Returns true if the given canonical section id should be rendered.
 * Default visibility is TRUE — admins explicitly toggle a section OFF.
 *
 * Themes should use this for every section they render so the admin
 * `/admin/landing` toggles take effect.
 */
export function isSectionVisible(
  landing: LandingSettings | null | undefined,
  id: LandingSectionId
): boolean {
  if (!landing) return true;
  return landing.sections[id] !== false;
}

/**
 * Picks the hero text/cta from landing settings if present, otherwise the
 * theme's own fallback. All fields are independent — admins can override
 * just the title or just one CTA label.
 */
export function resolveHero(
  landing: LandingSettings | null | undefined,
  locale: string,
  fallback: {
    badge: string;
    title: string;
    subtitle: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  }
) {
  const isAr = locale === "ar";
  const h = landing?.hero ?? {};
  const pick = (
    ar: string | null | undefined,
    en: string | null | undefined,
    fb: string
  ) => {
    const v = (isAr ? ar : en)?.trim();
    return v && v.length > 0 ? v : fb;
  };
  return {
    badge: pick(h.badge_ar, h.badge_en, fallback.badge),
    title: pick(h.title_ar, h.title_en, fallback.title),
    subtitle: pick(h.subtitle_ar, h.subtitle_en, fallback.subtitle),
    primary: {
      label: pick(h.primary_cta_label_ar, h.primary_cta_label_en, fallback.primaryLabel),
      href: (h.primary_cta_href?.trim() ?? "") || fallback.primaryHref,
    },
    secondary: {
      label: pick(h.secondary_cta_label_ar, h.secondary_cta_label_en, fallback.secondaryLabel),
      href: (h.secondary_cta_href?.trim() ?? "") || fallback.secondaryHref,
    },
  };
}

/**
 * Returns the ordered nav items based on the landing settings.
 * The default 5 links each have a show flag; custom items are appended.
 */
export function resolveNav(
  landing: LandingSettings | null | undefined,
  locale: string,
  labels: { services: string; portfolio: string; blog: string; about: string; contact: string }
): { href: string; label: string }[] {
  const isAr = locale === "ar";
  const n = landing?.nav ?? {
    show_services: true,
    show_portfolio: true,
    show_blog: true,
    show_about: true,
    show_contact: true,
    custom_items: [],
  };
  const items: { href: string; label: string }[] = [];
  if (n.show_services) items.push({ href: "/services", label: labels.services });
  if (n.show_portfolio) items.push({ href: "/portfolio", label: labels.portfolio });
  if (n.show_blog) items.push({ href: "/blog", label: labels.blog });
  if (n.show_about) items.push({ href: "/about", label: labels.about });
  if (n.show_contact) items.push({ href: "/contact", label: labels.contact });
  for (const item of n.custom_items ?? []) {
    items.push({ href: item.href, label: isAr ? item.label_ar : item.label_en });
  }
  return items;
}
