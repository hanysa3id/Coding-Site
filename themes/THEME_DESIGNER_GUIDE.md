# Theme Designer Guide

A complete reference for building a new theme in this codebase. Read this end-to-end before designing — the contract is opinionated and the existing themes (`classic` / `aurora` / `nova` / `sky`) all follow it.

---

## Table of contents

1. [What a theme is](#1-what-a-theme-is)
2. [Directory layout](#2-directory-layout)
3. [The module contract](#3-the-module-contract)
4. [CSS scoping rules](#4-css-scoping-rules)
5. [RTL / LTR rules](#5-rtl--ltr-rules)
6. [Landing settings — every theme must integrate](#6-landing-settings--every-theme-must-integrate)
7. [Canonical section IDs](#7-canonical-section-ids)
8. [Available data — server-side getters](#8-available-data--server-side-getters)
9. [Available data — query helpers](#9-available-data--query-helpers)
10. [Shared components you can reuse](#10-shared-components-you-can-reuse)
11. [Locale & i18n](#11-locale--i18n)
12. [Registering the theme](#12-registering-the-theme)
13. [Testing & verification checklist](#13-testing--verification-checklist)
14. [Pitfalls observed in past themes](#14-pitfalls-observed-in-past-themes)

---

## 1. What a theme is

A theme is a **self-contained module under `themes/<your-id>/`** that produces three things for the public site:

| Export | What it renders |
|--------|-----------------|
| `HomePage` | The whole `/` and `/<locale>` page |
| `SiteHeader` | The sticky/floating header (logo + nav + locale switcher + user menu) |
| `SiteFooter` | The footer |
| `config` | Metadata describing the theme |

The active theme is resolved at request time by [`themes/index.ts`](./index.ts) in this order:

1. `settings.theme.active` (DB) — admins set this from `/admin/settings → Theme`
2. `process.env.NEXT_PUBLIC_SITE_THEME` (build-time override)
3. `DEFAULT_THEME` constant in `themes/index.ts` (currently `"classic"`)

Themes are **never** loaded conditionally — every theme is imported at module top of `themes/index.ts`. The active one is picked on every render. CSS is scoped under a per-theme body class so all themes' CSS coexists without bleeding into one another.

---

## 2. Directory layout

The minimum:

```
themes/
└── your-theme/
    ├── config.ts             ← theme metadata
    ├── index.ts              ← public contract (HomePage/SiteHeader/SiteFooter/config)
    ├── theme.css             ← scoped styles + design tokens
    ├── home-page.tsx         ← homepage composition
    ├── site-header.tsx       ← header
    ├── site-footer.tsx       ← footer
    ├── <theme>-mobile-menu.tsx     ← (recommended) dark/light-aware mobile sheet
    ├── ui/                   ← internal primitives (button, section, typography…)
    └── sections/             ← homepage section files (hero, faq, …)
```

See [`themes/aurora/`](./aurora) and [`themes/sky/`](./sky) for full working examples.

---

## 3. The module contract

`themes/your-theme/index.ts` **must** re-export exactly these four names:

```ts
import "./theme.css";          // side-effect: registers your CSS

export { config } from "./config";
export { HomePage } from "./home-page";
export { SiteHeader } from "./site-header";
export { SiteFooter } from "./site-footer";
```

### `config.ts`

```ts
export const config = {
  name: "Your Theme",
  description: "One-sentence pitch for the admin theme picker.",
  dark: true,                 // dark-first? (drives admin preview only)
  body_class: "theme-yours",  // unique CSS class scope — MUST start with theme-
};
```

### `HomePage`

Takes `params: Promise<{ locale: string }>` and returns JSX. It is a **Server Component** by default — fetch all data here, pass to client islands as props.

```tsx
export async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch everything in parallel; degrade gracefully on failure.
  const [services, landing] = await Promise.all([
    listFeaturedServices(6).catch(() => []),
    getLandingSettings().catch(() => null),
  ]);

  const show = (id: LandingSectionId) => isSectionVisible(landing, id);

  return (
    <>
      {show("hero")     && <Hero ... />}
      {show("services") && <Services services={services} ... />}
      {show("cta")      && <Cta ... />}
    </>
  );
}
```

### `SiteHeader`

Server Component. Read `landing.nav` via [`resolveNav()`](#6-landing-settings--every-theme-must-integrate) and respect the admin nav configuration.

### `SiteFooter`

Server Component. Read `getSiteSettings()` / `getContactSettings()` from `lib/settings/get.ts` for branding + social links.

---

## 4. CSS scoping rules

| Rule | Why |
|------|-----|
| **Every CSS rule must start with `.theme-yours`** | Prevents bleed into other themes / admin |
| **Define tokens as CSS variables on `.theme-yours`** | Enables future dark/light variants without touching components |
| **Never modify `app/globals.css`** | It's shared with admin and auth flows |
| **No hex / rgba inline in components** | Use your tokens — `var(--yours-brand)` or Tailwind classes |
| **Tailwind classes must be present in source for the JIT to pick them up** | Files under `themes/**` are scanned (configured in `tailwind.config.ts`) |

Example token block:

```css
.theme-yours {
  --yours-bg:         #06060a;
  --yours-fg:         #ffffff;
  --yours-brand:      #8b5cf6;
  --yours-border:     rgba(255,255,255,0.08);

  background-color: var(--yours-bg);
  color: var(--yours-fg);
  color-scheme: dark;
}

.theme-yours .yours-card {
  background: var(--yours-bg-soft);
  border: 1px solid var(--yours-border);
  border-radius: 16px;
}
```

### Mesh / fixed backdrops

If you want a fixed background gradient/mesh, add a class `yours-mesh` and a render line in [`app/[locale]/(public)/layout.tsx`](../app/%5Blocale%5D/(public)/layout.tsx):

```tsx
{themeId === "yours" && <div className="yours-mesh" aria-hidden />}
```

The mesh element must use `position: fixed; inset: 0; z-index: -1; pointer-events: none;`.

---

## 5. RTL / LTR rules

Every theme must work in both languages. The locale is set on `<html dir="rtl|ltr">` by [`app/[locale]/layout.tsx`](../app/%5Blocale%5D/layout.tsx).

### What to do

- Use **logical Tailwind classes**: `ps-*` / `pe-*` (padding-start/end), `start-*` / `end-*` (inset-start/end), `me-*` / `ms-*` (margin), `border-s` / `border-e`, `text-start` / `text-end`.
- Use **`rtl:`** variant for direction-specific transforms (e.g. `rtl:rotate-180` on a forward-arrow icon).
- For CSS animations that travel horizontally (marquee), reverse direction in RTL:
  ```css
  [dir="rtl"] .theme-yours .yours-marquee {
    animation-direction: reverse;
  }
  ```
- For inline-position styles, use logical CSS properties: `inset-inline-start`, `padding-inline-start`, `border-inline-end-*`.

### What NOT to do

- Don't use `left` / `right` directly in Tailwind — use `start` / `end`.
- Don't rely on `flex-direction: row` order (it reverses in RTL).
- Don't hardcode `dir="ltr"` everywhere — only on code blocks / phone numbers / emails / Latin-only identifiers.

---

## 6. Landing settings — every theme must integrate

Admins control sections, hero text, nav, logos, FAQs, and stats from `/admin/landing`. **Every theme is responsible for reading these settings.** The shared helpers live in [`lib/landing/helpers.ts`](../lib/landing/helpers.ts):

```ts
import { isSectionVisible, resolveHero, resolveNav } from "@/lib/landing/helpers";

// in your HomePage
const show = (id: LandingSectionId) => isSectionVisible(landing, id);
const hero = resolveHero(landing, locale, {
  badge: "...", title: "...", subtitle: "...",
  primaryLabel: "...", primaryHref: "/services",
  secondaryLabel: "...", secondaryHref: "/contact",
});

// in your SiteHeader
const navItems = resolveNav(landing, locale, {
  services: tc("services"),
  portfolio: tc("portfolio"),
  blog: tc("blog"),
  about: tc("about"),
  contact: tc("contact"),
});
```

### Contract per area

| Area | What your theme does |
|------|---------------------|
| **Sections** | Wrap each section with `{show("id") && <X />}`. Admins toggle visibility. |
| **Hero** | Use `resolveHero(landing, locale, fallback)`. Render the returned `{badge, title, subtitle, primary, secondary}`. |
| **Nav** | Use `resolveNav()` to build the list — it honors `show_*` toggles and appends `custom_items`. |
| **Logos** | If your theme has a logo cloud, accept `landing.logos: string[]` and use it before falling back to defaults. |
| **FAQs** | If your theme has a FAQ section, accept `landing.faqs` and render them if non-empty. |
| **Stats** | If your theme has a stats strip, accept `landing.stats` and render them; fall back to AboutSettings.stats or defaults. |

Update the [`SECTIONS`](../app/%5Blocale%5D/admin/landing/_components/landing-form.tsx) array in `landing-form.tsx` to declare which canonical sections your theme has, so admins see the right "available in" matrix.

---

## 7. Canonical section IDs

These are the ids the admin form exposes. Pick the ones your theme renders; admin toggles for unsupported ids show a "not in this theme" badge.

| Id | What it represents |
|----|--------------------|
| `hero` | First-screen headline + CTAs |
| `logo_cloud` | Trust marquee of client names/logos |
| `features` | "Why us" bento or features grid |
| `stats` | Big-number strip (projects, years, satisfaction) |
| `services` | Service offerings (from DB) |
| `process` | "How we work" steps |
| `portfolio` | Recent projects (from DB) |
| `testimonials` | Customer reviews |
| `pricing` | Pricing tiers |
| `team` | Team members + mission/vision |
| `blog` | Latest blog posts (from DB) |
| `faq` | FAQ accordion |
| `newsletter` | Email signup |
| `cta` | Final conversion strip |

Adding a new canonical id?

1. Add it to `landingSectionIdSchema` in [`lib/validators/settings.ts`](../lib/validators/settings.ts).
2. Add a row to the `SECTIONS` array in [`landing-form.tsx`](../app/%5Blocale%5D/admin/landing/_components/landing-form.tsx) — name, description, icon, which themes use it.

---

## 8. Available data — server-side getters

All of these are in [`lib/settings/get.ts`](../lib/settings/get.ts), React-cached per request:

| Getter | Returns | Use case |
|--------|---------|----------|
| `getSiteSettings()` | `{ name_ar/en, description_ar/en, logo_url, favicon_url }` | Branding in header / footer / OG |
| `getContactSettings()` | `{ email, phone, address_ar/en, address_link, working_hours_note_ar/en, social: { facebook, instagram, twitter, linkedin, youtube, github, telegram, tiktok, snapchat, behance, dribbble } }` | Contact strip + footer socials |
| `getWhatsappSettings()` | `{ business_number, show_floating_button, default_message_ar/en }` | WhatsApp CTAs |
| `getWhatsappNumber()` | `string` (with env fallback) | Quick CTA helper |
| `getSeoSettings()` | `{ default_title_ar/en, default_description_ar/en, og_image, twitter_handle }` | Metadata |
| `getPaymentsSettings()` | `{ currency, paymob_enabled, offline_enabled, ... }` | Currency formatting |
| `getBusinessHours()` | `{ timezone, days: [...] }` | "Open now" badges |
| `getThemeSettings()` | `{ active }` | Resolve active theme id |
| `getLandingSettings()` | `LandingSettings` | **The big one** — see section 6 |

Direct DB read for things without a typed getter (e.g. `about` setting):

```ts
const { data } = await supabase
  .from("settings")
  .select("value")
  .eq("key", "about")
  .maybeSingle();
const about = data?.value as AboutSettings | null;
```

---

## 9. Available data — query helpers

Catalog queries (cached per request):

```ts
// Services
import { listFeaturedServices, listVisibleServices, listVisibleCategories } from "@/lib/queries/services";

await listFeaturedServices(6);           // top 6 with is_featured=true, ordered
await listVisibleServices();             // all visible
await listVisibleCategories();           // all visible (with parent_id hierarchy)
```

Direct supabase reads (use `createClient()` for RLS-respecting / `createAdminClient()` for full access — header/footer use server client):

```ts
const supabase = await createClient();

// Portfolio
await supabase.from("portfolio_projects")
  .select("*")
  .eq("is_visible", true)
  .order("is_featured", { ascending: false })
  .order("sort_order", { ascending: true })
  .limit(8);

// Blog — includes "scheduled" posts whose time has come
const now = new Date().toISOString();
await supabase.from("blog_posts")
  .select("*")
  .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
  .order("published_at", { ascending: false })
  .limit(3);

// Team
await supabase.from("team_members")
  .select("*")
  .eq("is_visible", true)
  .order("sort_order", { ascending: true });

// Reviews (for testimonials)
await supabase.from("reviews")
  .select("id, rating, comment, customer:profiles!customer_id(full_name), service:services!service_id(name_ar, name_en)")
  .eq("is_visible", true)
  .gte("rating", 4)
  .not("comment", "is", null)
  .order("created_at", { ascending: false })
  .limit(6);

// FAQ per service (use service_faqs table)
// CMS pages for footer
await supabase.from("cms_pages")
  .select("slug, title_ar, title_en")
  .eq("status", "published")
  .eq("show_in_footer", true)
  .order("sort_order");
```

---

## 10. Shared components you can reuse

Inside your sections you can use anything from `@/components/ui/*` (shadcn) and:

| Component | Source | What it does |
|-----------|--------|-------------|
| `<Link>` | `@/i18n/routing` | Locale-aware Next.js Link |
| `<LocaleSwitcher>` | `@/components/shared/locale-switcher` | ar/en toggle |
| `<UserMenu>` | `@/components/shared/user-menu` | Auth-aware dropdown |
| `<NotificationsBell>` | `@/components/shared/notifications-bell` | Realtime bell |
| `<WhatsAppButton>` | `@/components/shared/whatsapp-button` | Pre-styled WA CTA |
| `<WhatsAppFloatingButton>` | `@/components/shared/whatsapp-floating` | Already mounted by public layout |
| `<Sheet>` etc. | `@/components/ui/sheet` | Mobile menu drawer |
| `<Image>` | `next/image` | Always prefer over `<img>` |
| Icons | `lucide-react` | Use sparingly, prefer outlined |

For typography / sections / cards, **build your own primitives inside `themes/yours/ui/`** — don't share across themes. Each theme owns its visual vocabulary.

---

## 11. Locale & i18n

```ts
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

setRequestLocale(locale);              // every server component at the top
const tc = await getTranslations("common");   // common namespace
const t  = await getTranslations("home");     // home namespace

tc("services") // → "الخدمات" or "Services"
```

For ad-hoc text in your sections (not in the locale files), the typical pattern is:

```tsx
const isAr = locale === "ar";
<h2>{isAr ? "نص بالعربية" : "Text in English"}</h2>
```

Avoid mixing `t()` translations and inline `isAr` in the same line — pick one approach per component.

---

## 12. Registering the theme

1. **Update the registry** [`themes/index.ts`](./index.ts):

   ```ts
   import * as yours from "./yours";
   export const themes = { classic, aurora, nova, sky, yours } as const;
   ```

2. **Update the validator** [`lib/validators/settings.ts`](../lib/validators/settings.ts) `themeIdSchema`:

   ```ts
   export const themeIdSchema = z.enum(["classic", "aurora", "nova", "sky", "yours"]);
   ```

3. **Add a preview tile** in [`app/[locale]/admin/settings/_components/theme-form.tsx`](../app/%5Blocale%5D/admin/settings/_components/theme-form.tsx) — add a `ThemeOption` entry and a `<YoursPreview />` mini-mockup component that paints a tiny representation of the theme.

4. **(Optional) Mesh/backdrop** — if your theme has a fixed backdrop, add the conditional render in [`app/[locale]/(public)/layout.tsx`](../app/%5Blocale%5D/(public)/layout.tsx).

5. **(Optional) Declare canonical sections** in [`landing-form.tsx`](../app/%5Blocale%5D/admin/landing/_components/landing-form.tsx) — add `"yours"` to the `themes` array for each section you support.

---

## 13. Testing & verification checklist

Run through this before submitting a new theme:

- [ ] `npx tsc --noEmit` passes
- [ ] `npx next build` finishes without warnings about your new theme files
- [ ] Visit `/` and `/en` with your theme active → everything renders
- [ ] `Ctrl+Click` "View site" from admin → opens correctly in both locales
- [ ] Hover every nav item — dropdown menus expand smoothly
- [ ] Resize viewport to 375px width → no horizontal scroll, mobile menu works
- [ ] Switch theme to yours via `/admin/settings → Theme` → public site updates
- [ ] Toggle 3 sections off in `/admin/landing` → they disappear from the page
- [ ] Type a custom hero title in `/admin/landing → Hero` → it appears on the homepage
- [ ] Add 3 logos in `/admin/landing → Logos` → they show in the marquee
- [ ] Add 2 FAQs in `/admin/landing → FAQ` → they show in the FAQ accordion
- [ ] Add 1 stat in `/admin/landing → Stats` → it shows in the stats band
- [ ] Add a custom nav item → it appears in the header
- [ ] Verify all images use `next/image` with proper `sizes` attribute
- [ ] Test with `prefers-reduced-motion: reduce` set → no auto-playing animations
- [ ] Lighthouse audit (mobile): performance ≥ 85, accessibility ≥ 95

---

## 14. Pitfalls observed in past themes

1. **Tailwind JIT skipped your file** → arbitrary classes like `h-[34rem]` are dropped. The fix lives in `tailwind.config.ts`'s `content` array (`./themes/**/*.{ts,tsx}` is included). Don't move your theme outside that.

2. **Page renders but body height is 0** → check that the wrapper has `min-h-screen flex flex-col` and your sections have explicit padding (use a `<Section>` primitive — never `py-*` ad-hoc).

3. **Marquee animation paused or jumpy** → make sure your CSS `[dir="rtl"]` variant is scoped to `.theme-yours .your-marquee` and not to `.theme-yours[dir="rtl"]` (the `dir` is on `<html>`, not on your wrapper).

4. **Glass cards have no border-glow** → the `::after` mask-composite trick requires `position: relative` on the parent + `border-radius: inherit` on the after element. Test in Chrome AND Safari.

5. **First slide is briefly empty** → fade-in animations starting at `opacity: 0` make first paint look empty. Either render the first slide synchronously or use `animation-fill-mode: backwards` + a small delay.

6. **Hero overrides ignored** → make sure you call `resolveHero(landing, locale, fallback)` and render its result, not your hardcoded values.

7. **Admin landing toggles do nothing** → you forgot to wrap a section in `{show("id") && ...}`. Walk through each section in `home-page.tsx`.

8. **Section visible in Theme A's home-page but not declared in the admin's section list** → admins can't toggle it. Add it to the `SECTIONS` array's `themes:` list in `landing-form.tsx`.

9. **Stats / FAQs / logos hardcoded** → the admin can't override them. Wire the props through your home-page.

10. **The site uses cached CSS after a switch** → that's Vercel's CDN. Admin landing/theme actions already call `revalidatePath("/", "layout")` — on Vercel preview deployments it can take 5-10 seconds.

---

## Quick-reference: minimal new theme

```bash
mkdir -p themes/yours/{ui,sections}
```

**`themes/yours/config.ts`**:
```ts
export const config = {
  name: "Yours",
  description: "Short description.",
  dark: true,
  body_class: "theme-yours",
};
```

**`themes/yours/index.ts`**:
```ts
import "./theme.css";
export { config } from "./config";
export { HomePage } from "./home-page";
export { SiteHeader } from "./site-header";
export { SiteFooter } from "./site-footer";
```

**`themes/yours/theme.css`** (a one-token starter):
```css
.theme-yours { --bg: #000; --fg: #fff; background: var(--bg); color: var(--fg); }
.theme-yours .yours-card { background: rgba(255,255,255,0.04); border-radius: 12px; }
```

**`themes/yours/home-page.tsx`**:
```tsx
import { setRequestLocale } from "next-intl/server";
import { getLandingSettings } from "@/lib/settings/get";
import { isSectionVisible } from "@/lib/landing/helpers";
import type { LandingSectionId } from "@/lib/validators/settings";

export async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const landing = await getLandingSettings().catch(() => null);
  const show = (id: LandingSectionId) => isSectionVisible(landing, id);
  return (
    <>
      {show("hero") && <section className="container py-20"><h1>Hello</h1></section>}
    </>
  );
}
```

**`themes/yours/site-header.tsx`** and **`themes/yours/site-footer.tsx`** can be one-liners while you bootstrap.

Then add `yours` to `themes/index.ts` and `themeIdSchema`, and the admin theme picker. Done.

---

## Questions or improvements?

Open an issue tagged `theme-system`. The contract evolves — if you find yourself fighting it, the contract probably needs to bend.
