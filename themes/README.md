# Theme system

The public-facing UI (header, homepage, footer) is rendered through a theme
selected at boot time. Each theme is a self-contained module that exports the
top-level pieces the public layout needs.

## Active theme

Set `NEXT_PUBLIC_SITE_THEME` to switch (defaults to `aurora` if unset):

```bash
NEXT_PUBLIC_SITE_THEME=aurora    # current default
NEXT_PUBLIC_SITE_THEME=classic   # legacy light theme (components/public/*)
```

The resolver lives in [`themes/index.ts`](./index.ts). Server components call
`getActiveTheme()` and render `<theme.SiteHeader />`, `<theme.HomePage />`,
`<theme.SiteFooter />`.

## Module contract

Every theme `themes/<name>/index.ts` re-exports:

```ts
export { HomePage } from "./home-page";
export { SiteHeader } from "./site-header";
export { SiteFooter } from "./site-footer";
export { config } from "./config";
```

The `config` object describes the theme:

```ts
export const config = {
  name: "Aurora",
  description: "Dark, gradient-forward, bento-grid layout",
  dark: true,           // theme is dark-first
  body_class: "theme-aurora",
};
```

The `body_class` is applied to `<body>` so the theme can scope its CSS without
clashing with other themes.

## Adding a new theme

1. Create a folder `themes/<your-theme>/`.
2. Add `config.ts`, `home-page.tsx`, `site-header.tsx`, `site-footer.tsx`, and
   any internal sections/components needed.
3. Add `index.ts` that re-exports the public contract (above).
4. Register the theme in [`themes/index.ts`](./index.ts) `themes` map.
5. Switch via env var.

## Conventions

- Use logical Tailwind classes (`ps-*`, `pe-*`, `start-*`, `end-*`, `ms-*`,
  `me-*`, `border-s`, `border-e`, `text-start`, `text-end`) so RTL works out
  of the box.
- Use `rtl:` prefix to reverse direction-specific things like arrow rotation.
- Read `locale` and `isAr` in components that need bilingual content; the
  active locale is available via `getLocale()` from `next-intl/server`.
- Themes can ship their own CSS (`theme.css`) — import it from the theme's
  `index.ts` and rely on `body_class` for scoping.
