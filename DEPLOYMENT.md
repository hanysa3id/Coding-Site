# Deploying to Vercel

This guide walks you through deploying the Company Platform to Vercel + Supabase Cloud.

## Prerequisites

- A GitHub account (Vercel imports from Git)
- A [Vercel](https://vercel.com) account (free tier works)
- A [Supabase](https://supabase.com) project with migrations applied (see [`supabase/README.md`](supabase/README.md))
- (Optional) PayMob merchant account, Resend account, a custom domain

## Step 1 — Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"

# Create a new repo on GitHub (no README, no .gitignore — we have them)
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

⚠️ **Never commit `.env.local`** — it's already in `.gitignore`.

## Step 2 — Import the project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** and select your repo
3. **Framework Preset**: Next.js (auto-detected)
4. **Build Command**: `next build` (default)
5. **Output Directory**: `.next` (default)
6. **Install Command**: `npm install` (default)
7. **Root Directory**: `./` (default)

Do **not** click "Deploy" yet — first set the environment variables.

## Step 3 — Set environment variables

In Vercel project → **Settings** → **Environment Variables**, add these for **Production**, **Preview**, and **Development**:

### Required

| Key | Value source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (keep secret!) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` (or `https://your-project.vercel.app` initially) |

### Optional but recommended

| Key | When needed |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Fallback for WhatsApp links; can also be set in `/admin/settings` → WhatsApp |
| `RESEND_API_KEY` | If you want transactional emails (order updates) |
| `RESEND_FROM_EMAIL` | Verified sender (e.g. `no-reply@yourdomain.com`) |
| `RECAPTCHA_SECRET_KEY` | If using reCAPTCHA on forms |

### PayMob (only if accepting card payments)

| Key | Value source |
|---|---|
| `PAYMOB_API_KEY` | PayMob dashboard → API |
| `PAYMOB_INTEGRATION_ID_CARD` | PayMob → Payment integrations → Card ID |
| `PAYMOB_INTEGRATION_ID_WALLET` | PayMob → Payment integrations → Wallet ID (optional) |
| `PAYMOB_IFRAME_ID` | PayMob → Iframes → ID |
| `PAYMOB_HMAC_SECRET` | PayMob → Settings → HMAC secret (for webhook validation) |

## Step 4 — Deploy

Click **Deploy**. The first build takes 2-3 minutes. When done, Vercel gives you a `*.vercel.app` URL.

## Step 5 — Configure Supabase to allow your Vercel URL

In Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: `https://your-domain.com` (or your `*.vercel.app` URL)
- **Redirect URLs**: add `https://your-domain.com/**` (catch-all)

This is required for password reset emails and OAuth callbacks to work.

## Step 6 — Configure PayMob webhook (if using PayMob)

In PayMob dashboard → **Developers** → **Webhooks**:

- **Transaction Processed Callback URL**: `https://your-domain.com/api/webhooks/paymob`
- **Transaction Response Callback URL**: `https://your-domain.com/api/webhooks/paymob`

## Step 7 — Custom domain (optional)

1. Vercel → project → **Settings** → **Domains** → add `yourdomain.com`
2. Update DNS records as instructed by Vercel (usually adding A/CNAME records)
3. Update **environment variable** `NEXT_PUBLIC_SITE_URL` to the new domain
4. Update **Supabase redirect URLs** to the new domain
5. Update **PayMob webhook URL** to the new domain
6. Trigger a redeploy (Vercel → Deployments → click the latest → Redeploy)

## Step 8 — Create the first admin

After the first deploy:

1. Register a normal account via `/register` on your live site
2. In Supabase → **SQL Editor**, run:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your-admin-email@example.com';
   ```
3. Log out and back in. You should see the admin panel at `/admin`.

## Continuous deployment

- Every push to `main` deploys to **Production** automatically
- Every PR creates a **Preview deployment** with its own URL
- Preview deployments share the same env vars (so be careful with destructive operations on the main DB)

## Common issues

### Build fails with "Missing NEXT_PUBLIC_SUPABASE_URL"
You forgot to set the env var in Vercel. Settings → Environment Variables → re-add → Redeploy.

### "Invalid `next.config.ts`"
Make sure Next.js is at least 15.0+ (`npm list next`). Older versions don't support `.ts` configs.

### Password reset links go to `localhost`
You forgot to set `NEXT_PUBLIC_SITE_URL` to your production URL.

### Images from Supabase Storage are blocked
Make sure the bucket is **public** in Supabase Studio, or use a signed URL.

### "Hydration mismatch" warnings
Usually caused by analytics scripts. They're loaded with `strategy="afterInteractive"` so they should not cause SSR mismatches.

## Monitoring

- **Vercel Analytics**: enable from Vercel dashboard (free for hobby)
- **Function logs**: Vercel → project → **Logs**
- **Error tracking**: integrate Sentry by adding `@sentry/nextjs` (not pre-configured)

## Rolling back

If a deploy is broken: Vercel → **Deployments** → find the last working one → click **⋯** → **Promote to Production**.
