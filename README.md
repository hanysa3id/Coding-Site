# Company Platform — منصة شركة برمجة وتصميم

منصة إلكترونية متكاملة لعرض الخدمات الرقمية لشركة برمجة وتصميم، تتيح للعملاء تصفح الخدمات وطلبها والدفع ومتابعة التنفيذ.

## Tech Stack

- **Next.js 16** (App Router + Server Actions + Turbopack)
- **TypeScript 5**
- **Supabase** (PostgreSQL + Auth + Storage + RLS + Realtime)
- **Tailwind CSS v3** + Cairo + Inter fonts (RTL/LTR)
- **shadcn/ui** + Radix UI primitives
- **next-intl v4** (ar/en)
- **react-hook-form** + **zod**
- **Resend** (email)
- **Recharts** (analytics)
- **PayMob** + Offline payments

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Fill in the values:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` — from your Supabase project
- `PAYMOB_*` — from your PayMob dashboard (optional initially)
- `RESEND_API_KEY` — from resend.com
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — your business WhatsApp number (with country code, no `+`)

### 3. Set up Supabase

Create a new project at [supabase.com](https://supabase.com), then run the migrations in [`supabase/migrations/`](./supabase/migrations) — see [`supabase/README.md`](./supabase/README.md) for details.

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/ar` by default.

## Project Structure

```
.
├── app/
│   ├── [locale]/              # i18n routing (ar | en)
│   │   ├── (auth)/            # Login, register, forgot-password
│   │   ├── layout.tsx         # Root layout (fonts, RTL, i18n provider)
│   │   └── page.tsx           # Homepage
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   └── shared/                # WhatsAppButton, LocaleSwitcher, ...
├── lib/
│   ├── supabase/              # client, server, admin, proxy
│   ├── whatsapp/              # wa.me link builder
│   ├── validators/            # zod schemas
│   ├── constants.ts
│   └── utils.ts
├── i18n/
│   ├── routing.ts
│   ├── request.ts
│   └── messages/{ar,en}.json
├── supabase/
│   ├── migrations/            # SQL migrations
│   └── README.md
├── types/
│   └── database.ts
└── proxy.ts                   # Next.js 16 middleware (was middleware.ts)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm run supabase:types` | Regenerate `types/database.ts` from Supabase |

## Roadmap

This is **Phase 1** — foundation. Next phases (in [`C:\Users\Badr\.claude\plans\splendid-napping-hickey.md`](../../Users/Badr/.claude/plans/splendid-napping-hickey.md)):

- **Phase 2** — Auth & roles (RLS done, UI in progress)
- **Phase 3** — Admin: services, categories, portfolio CRUD
- **Phase 4** — Public pages: services listing, service detail, portfolio
- **Phase 5** — Orders: submission, negotiation, messaging, milestones, deliverables
- **Phase 6** — Payments: PayMob + offline (bank transfer / cash / instapay / vodafone cash)
- **Phase 7** — Reviews
- **Phase 8** — Blog
- **Phase 9** — Notifications (Realtime + email via Resend)
- **Phase 10** — Analytics + SEO + Polish

## Roles

- **Customer** — browse, order, pay, review
- **Sales** — negotiate orders, adjust price/duration
- **Staff** — execute assigned orders, upload deliverables
- **Admin** — full access

Enforced via Supabase RLS using `profiles.role`.

## WhatsApp Strategy

All customer–business chat happens via `wa.me` deep links (free, no API costs). The customer always initiates, opening a 24-hour service window. See `lib/whatsapp/build-link.ts`.

## Deployment

Designed for **Vercel + Supabase Cloud**.

1. Push to GitHub
2. Import the repo on Vercel
3. Set the environment variables
4. Deploy

PayMob webhook URL: `https://<your-domain>/api/webhooks/paymob`
