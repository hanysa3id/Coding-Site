# Aurora — Design System

Single source of truth for every visual decision in the Aurora theme.
Anything that does not follow these rules should be refactored, not extended.

---

## 1. Design tokens

All tokens live in [`theme.css`](./theme.css) as CSS variables scoped under
`.theme-aurora`. **Never hardcode values** — pick a token.

### Color

| Token | Value | Use for |
|-------|-------|---------|
| `--aurora-bg` | `#07070d` | Page background |
| `--aurora-bg-soft` | `#0b0b14` | Slightly elevated bands (stats, dividers) |
| `--aurora-surface` | `#11111b` | Glass card base |
| `--aurora-border` | `rgba(255,255,255,.08)` | Default borders |
| `--aurora-border-2` | `rgba(255,255,255,.14)` | Emphasis borders |
| `--aurora-fg` | `rgba(255,255,255,.96)` | Primary text |
| `--aurora-fg-muted` | `rgba(255,255,255,.62)` | Body text |
| `--aurora-fg-dim` | `rgba(255,255,255,.42)` | Captions, eyebrow |
| `--aurora-grad-1` | `#8b5cf6` (violet) | Brand gradient stop A |
| `--aurora-grad-2` | `#ec4899` (pink) | Brand gradient stop B |
| `--aurora-grad-3` | `#06b6d4` (cyan) | Brand gradient stop C |

**Discipline rule:** the page uses **3 brand colors only** (violet → pink → cyan).
No emerald, amber, or other accents in product surfaces. Status colors (error,
success) are reserved for forms and feedback only.

### Spacing scale

Use Tailwind's default spacing scale, but **section padding** follows this fixed
rhythm:

| Token | Tailwind class | Use for |
|-------|----------------|---------|
| `section-sm` | `py-12 md:py-16` | Thin bands (stats, logo cloud, newsletter) |
| `section-md` | `py-20 md:py-28` | Standard section |
| `section-lg` | `py-28 md:py-36` | Hero, CTA band |

Use the `<Section>` primitive to enforce this — never write `py-*` ad-hoc on
section elements.

### Typography scale

| Token | Tailwind | Use for |
|-------|----------|---------|
| `display-xl` | `text-5xl md:text-6xl lg:text-7xl` | Hero H1 |
| `display-lg` | `text-4xl md:text-5xl` | CTA band, big numbers |
| `display-md` | `text-3xl md:text-4xl` | Section H2 |
| `display-sm` | `text-xl md:text-2xl` | Card titles, sub-headings |
| `body-lg` | `text-base md:text-lg` | Lead paragraph |
| `body` | `text-sm md:text-base` | Body copy |
| `body-sm` | `text-xs md:text-sm` | Card body, captions |
| `mono` | `aurora-mono text-xs` | Eyebrow, badges, status |

Use `<H1>` `<H2>` `<H3>` `<Lead>` `<Body>` `<Mono>` primitives from
[`ui/typography.tsx`](./ui/typography.tsx). They enforce the scale and apply
correct color tokens.

### Radius

| Token | Tailwind | Use for |
|-------|----------|---------|
| `radius-sm` | `rounded-md` | Inline pills, mono chips |
| `radius` | `rounded-lg` | Icon containers |
| `radius-lg` | `rounded-xl` | Inputs, small cards |
| `radius-xl` | `rounded-2xl` | Main cards, panels |
| `radius-pill` | `rounded-full` | Pills, buttons |

### Motion

| Token | Duration | Easing |
|-------|----------|--------|
| `motion-quick` | `150ms` | `ease-out` (hover, focus) |
| `motion-base` | `300ms` | `cubic-bezier(0.16, 1, 0.3, 1)` (panels, accordions) |
| `motion-slow` | `700ms` | `cubic-bezier(0.16, 1, 0.3, 1)` (fade-up reveal) |

Respect `prefers-reduced-motion` — already enforced in `theme.css`.

---

## 2. Component primitives

| Component | File | Use for |
|-----------|------|---------|
| `<Section>` | [`ui/section.tsx`](./ui/section.tsx) | Outer wrapper, applies spacing token |
| `<H1>` `<H2>` `<H3>` `<Lead>` `<Body>` `<Mono>` | [`ui/typography.tsx`](./ui/typography.tsx) | Typography scale |
| `<Eyebrow>` | [`ui/eyebrow.tsx`](./ui/eyebrow.tsx) | Mono section kicker |
| `<SectionHeading>` | [`ui/section-heading.tsx`](./ui/section-heading.tsx) | kicker + title + description triad |
| `<AuroraButton>` | [`ui/aurora-button.tsx`](./ui/aurora-button.tsx) | All buttons — 3 variants × 2 sizes |
| `<GlassCard>` | [`ui/glass-card.tsx`](./ui/glass-card.tsx) | All card surfaces |
| `<GradientOrbs>` | [`ui/gradient-orbs.tsx`](./ui/gradient-orbs.tsx) | Decorative background orbs |

### Button variants

| Variant | When to use |
|---------|------------|
| `primary` | Single hero/section CTA |
| `secondary` | Companion CTA next to primary |
| `ghost` | Tertiary links inside cards or headers |

**One primary per section.** Multiple primaries fight for attention.

### Card states

| State | Visual |
|-------|--------|
| Default | `aurora-glass` background + `border-white/8` |
| Hover (`asLink`) | -0.5px lift + border-glow via `::after` |
| Active link | `border-violet-400/40` |

---

## 3. Patterns

### Section structure

Every section follows this order:

```
<Section>
  <SectionHeading kicker="…" title="…" description="…" />
  <ContentGrid />
  <FooterCTA? />
</Section>
```

### Bilingual content

Components that render bilingual data must accept `locale` and select via
`isAr`. Never use ternaries inside the JSX tree — assign to `const` first
for readability.

### RTL

Use logical Tailwind classes: `ps-*` `pe-*` `start-*` `end-*` `me-*` `ms-*`,
and `rtl:` prefix for direction-specific things (e.g. `rtl:rotate-180`
on arrows).

---

## 4. Homepage composition

The canonical order of sections on `/`:

1. **Hero** — gradient orbs + headline + dual CTAs + mock product card
2. **Logo cloud** — trust band, single row marquee
3. **Bento features** — 6-cell why-us
4. **Stats band** — 4 numbers
5. **Services grid** — featured offerings
6. **Process steps** — 4-stage delivery
7. **Portfolio strip** — recent work
8. **Testimonials** — customer quotes
9. **Pricing teaser** — 3 tiers
10. **Blog highlight** — latest 3 posts
11. **FAQ** — anticipated questions
12. **Newsletter** — single-field signup
13. **CTA band** — final push

Skip a section gracefully if the underlying data is empty — never render an
empty heading.

---

## 5. Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use `<Section>` for outer spacing | Write `py-24` inline |
| Use `<H2>` for section headings | Use `text-3xl font-bold` ad-hoc |
| Use `<AuroraButton>` for every action | Mix shadcn `Button` and `AuroraButton` |
| Pick from violet/pink/cyan | Add new accent colors |
| Cap a section to one `primary` CTA | Stack multiple `primary` buttons |
| Test in both AR and EN locales | Assume LTR — RTL breaks late |
| Document new components in this file | Ship undocumented one-offs |

---

## 6. Audit checklist (run before merging visual changes)

- [ ] No hardcoded hex / rgba values added
- [ ] No `text-*xl` outside the typography primitives
- [ ] No `py-*` on section root elements (use `<Section size="…">`)
- [ ] No new accent color introduced
- [ ] Section has both AR and EN strings
- [ ] Section uses logical RTL classes
- [ ] Card uses `aurora-glass` or wrapper primitive
- [ ] Single primary CTA per section
- [ ] Reduced-motion respected (no autoplay > 1s without pause)
