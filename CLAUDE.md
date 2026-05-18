# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Next.js dev server (Turbopack), http://localhost:3000 → /ar
npm run build            # Production build
npm run lint             # ESLint (next lint)
npm run type-check       # tsc --noEmit
npm run check            # type-check + lint (run before committing)
npm run supabase:types   # Regenerate types/database.ts from linked Supabase project
```

There is no test runner configured. Verify changes via `npm run check` and by exercising the feature in the dev server.

Admin bootstrap: `node scripts/create-admin.mjs` and `node scripts/verify-admin.mjs` (require `SUPABASE_SERVICE_ROLE_KEY` in env).

## Architecture

**Next.js 16 App Router + Supabase + next-intl (ar/en, RTL/LTR).** This is a service/portfolio/orders platform for a design+dev studio. Arabic is the default locale.

### Routing & middleware

- All app routes live under `app/[locale]/` — `ar` and `en` are the locales (`i18n/routing.ts`). `/` redirects to `/ar`.
- `proxy.ts` is the Next.js 16 middleware (renamed from `middleware.ts`). It composes `next-intl` middleware with Supabase session refresh (`lib/supabase/middleware.ts`) and gates `/dashboard`, `/orders`, `/profile`, `/admin` behind auth, redirecting to `/<locale>/login?next=…` for unauthenticated users.
- Public route groups: `app/[locale]/(auth)` (login/register/forgot-password) and `app/[locale]/(public)` (marketing pages rendered by the active theme).
- Authenticated areas: `app/[locale]/{dashboard,orders,profile,notifications,admin}`.

### Supabase access layers (do not mix)

- `lib/supabase/client.ts` — browser client (Client Components).
- `lib/supabase/server.ts` — RSC/Server Action client using cookies. Use this in Server Components and Server Actions.
- `lib/supabase/admin.ts` — service-role client. Server-only; never import from client code.
- `lib/supabase/middleware.ts` — session refresh used by `proxy.ts`.

Auth/role guards live in `lib/auth/guards.ts`. RLS is the source of truth — `supabase/migrations/*_rls_policies.sql` defines policy. Regenerate `types/database.ts` after schema changes with `npm run supabase:types`.

### Theme system (public site only)

The public-facing UI (header, homepage, footer) is **swappable at request time** via a theme module. See `themes/README.md` and `themes/THEME_DESIGNER_GUIDE.md` — the guide is mandatory reading before adding/editing a theme.

- Registered themes: `classic`, `aurora`, `nova`, `sky`, `moon`, `prism`, `combo` (registered in `themes/index.ts`).
- Resolution order: `settings.theme.active` (DB, set via `/admin/settings → Theme`) → `NEXT_PUBLIC_SITE_THEME` env → `classic` default.
- Each theme is a self-contained dir exporting `HomePage`, `SiteHeader`, `SiteFooter`, `config`. CSS is scoped via `config.body_class` (e.g. `theme-aurora`).
- Server components call `getActiveTheme()` from `themes/index.ts` and render `<theme.SiteHeader />` etc. Do not import themes directly by name in shared code.
- Admin/authenticated areas do **not** use themes — they use `components/admin`, `components/ui`, etc. directly.

### Domain code organization

- `lib/queries/` — Supabase query helpers grouped by domain. Prefer adding queries here over inlining in components.
- `lib/validators/` — Zod schemas shared between forms (react-hook-form + `@hookform/resolvers/zod`) and Server Actions.
- `lib/{blog, cms, orders, settings, landing, notifications, paymob, email, telegram, whatsapp, storage, csv, pagination}` — domain modules. `lib/settings/get.ts` is the central reader for admin-configurable settings (theme, landing sections, etc.).
- `components/ui/` — shadcn/ui primitives (do not modify casually; they're code-owned versions, not a package).
- `components/{admin,public,shared,blog,orders,portfolio,analytics,seo}` — feature components. Public-area components are mostly consumed by themes.

### i18n

- Messages in `i18n/messages/{ar,en}.json`. Use `next-intl`'s `useTranslations` / `getTranslations`.
- Layout sets `dir="rtl"` for Arabic; themes must work in both directions (see THEME_DESIGNER_GUIDE §5).
- Fonts: Cairo (Arabic) + Inter (Latin).

### Server Actions & forms

The codebase uses Next.js Server Actions (no separate API layer for most mutations). Pattern: validate input with a Zod schema from `lib/validators/`, perform the action with the server-side Supabase client, `revalidatePath`, return a typed result. Forms are `react-hook-form` + Zod resolver on the client.

### Payments & integrations

PayMob (online) and offline payments are wired in `lib/paymob/` and the `/admin/payments` area. WhatsApp deep links via `lib/whatsapp/`. Outbound email via Resend (`lib/email/`). Telegram notifications via `lib/telegram/`.

## Environment

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`. Optional: `PAYMOB_*`, `NEXT_PUBLIC_SITE_THEME`. See `README.md` and `DEPLOYMENT.md` for the full list.

## Conventions

- Server-first: default to Server Components and Server Actions; mark client components with `"use client"` only when needed (forms, interactivity).
- Never import `lib/supabase/admin.ts` from a client component or expose service-role data to the browser.
- When adding migrations, drop a file in `supabase/migrations/` following the `YYYYMMDDHHMMSS_description.sql` pattern, then run `npm run supabase:types`.
- Commit messages follow Conventional Commits (`feat(...)`, `fix(...)`) as seen in `git log`.
