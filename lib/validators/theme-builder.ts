import { z } from "zod";
import { themeIdSchema } from "./settings";

/**
 * Theme Builder — admin-driven customization layered on top of a base theme.
 *
 * Every field is optional so the builder is purely additive: a fresh
 * customization renders identical to the underlying theme. The public
 * layout converts saved customizations into CSS variables (--app-*) that
 * themes opt-in to. Sections + animations + sounds are pure data; the
 * public runtime maps them to existing CSS classes / Audio elements.
 */

// ── Color stops (5 brand + ink/paper) ──────────────────────────────────────
const colorOrEmpty = z
  .string()
  .regex(
    /^(#([0-9a-fA-F]{3,4}){1,2}|rgb(a)?\([^)]+\)|hsl(a)?\([^)]+\))$/,
    "Use #hex, rgb() or hsl()"
  )
  .or(z.literal(""));

export const themeColorsSchema = z
  .object({
    primary: colorOrEmpty,
    accent: colorOrEmpty,
    accent_2: colorOrEmpty,
    surface: colorOrEmpty,
    ink: colorOrEmpty,
    paper: colorOrEmpty,
  })
  .partial();
export type ThemeColors = z.infer<typeof themeColorsSchema>;

// ── Typography ─────────────────────────────────────────────────────────────
export const themeTypographySchema = z
  .object({
    /** Heading font (Google Fonts family name). */
    heading_font: z.string().nullable().optional().or(z.literal("")),
    /** Body font (Google Fonts family name). */
    body_font: z.string().nullable().optional().or(z.literal("")),
    /** Base font scale multiplier (0.85..1.25). */
    scale: z.number().min(0.85).max(1.25).optional(),
  })
  .partial();
export type ThemeTypography = z.infer<typeof themeTypographySchema>;

// ── Shape (radius) ─────────────────────────────────────────────────────────
export const themeShapeSchema = z
  .object({
    /** 0 = sharp · 8 = soft · 16 = rounded · 9999 = pill. */
    radius: z.number().min(0).max(32).optional(),
  })
  .partial();
export type ThemeShape = z.infer<typeof themeShapeSchema>;

// ── Per-section behaviour ──────────────────────────────────────────────────
export const sectionAnimationSchema = z.enum([
  "none",
  "fade-up",
  "fade-in",
  "slide-up",
  "slide-in",
  "zoom-in",
  "blur-in",
]);
export type SectionAnimation = z.infer<typeof sectionAnimationSchema>;

export const sectionConfigSchema = z.object({
  id: z.string().min(1), // matches LandingSectionId
  visible: z.boolean().default(true),
  animation: sectionAnimationSchema.default("fade-up"),
  /** Animation playback duration in milliseconds (200..2000). */
  duration_ms: z.number().int().min(200).max(2000).default(700),
  /** Entry delay multiplier — staggers items inside the section. */
  stagger_ms: z.number().int().min(0).max(400).default(60),
});
export type SectionConfig = z.infer<typeof sectionConfigSchema>;

// ── UI sounds ─────────────────────────────────────────────────────────────
export const soundPresetSchema = z.enum(["none", "soft-click", "pop", "swoosh", "blip"]);
export type SoundPreset = z.infer<typeof soundPresetSchema>;

export const themeSoundsSchema = z.object({
  enabled: z.boolean().default(false),
  click: soundPresetSchema.default("soft-click"),
  hover: soundPresetSchema.default("none"),
  volume: z.number().min(0).max(1).default(0.35),
});
export type ThemeSounds = z.infer<typeof themeSoundsSchema>;

// ── Effects (cursor + ambient) ─────────────────────────────────────────────
export const themeEffectsSchema = z.object({
  /** Spotlight cursor halo follows the pointer. */
  spotlight_cursor: z.boolean().default(false),
  /** Fine SVG grain overlay across the whole page. */
  grain: z.boolean().default(false),
  /** Ambient floating gradient blobs. */
  blobs: z.boolean().default(false),
  /** Subtle scanline overlay. */
  scanlines: z.boolean().default(false),
});
export type ThemeEffects = z.infer<typeof themeEffectsSchema>;

// ── Root customization document ────────────────────────────────────────────
export const themeCustomizationSchema = z.object({
  /** Base theme this customization layers on top of. */
  base_theme: themeIdSchema,
  /** Human-readable label, shown in the admin builder. */
  display_name: z.string().min(1).default("My custom theme"),
  colors: themeColorsSchema.default({}),
  typography: themeTypographySchema.default({}),
  shape: themeShapeSchema.default({}),
  effects: themeEffectsSchema.default({
    spotlight_cursor: false,
    grain: false,
    blobs: false,
    scanlines: false,
  }),
  sounds: themeSoundsSchema.default({
    enabled: false,
    click: "soft-click",
    hover: "none",
    volume: 0.35,
  }),
  /** Ordered section list — drives both order and per-section settings. */
  sections: z.array(sectionConfigSchema).default([]),
});
export type ThemeCustomization = z.infer<typeof themeCustomizationSchema>;

/**
 * Bag of customizations keyed by base theme id, so an admin can keep
 * separate tweaks for each theme without overwriting each other.
 */
export const themeCustomizationsBagSchema = z.record(
  themeIdSchema,
  themeCustomizationSchema
);
export type ThemeCustomizationsBag = z.infer<typeof themeCustomizationsBagSchema>;

// ── Helper: produce CSS-variable map from a customization ──────────────────
export function toCssVariables(c: ThemeCustomization): Record<string, string> {
  const v: Record<string, string> = {};
  const set = (k: string, x: string | undefined) => {
    if (x && x.trim()) v[k] = x;
  };
  set("--app-primary", c.colors.primary);
  set("--app-accent", c.colors.accent);
  set("--app-accent-2", c.colors.accent_2);
  set("--app-surface", c.colors.surface);
  set("--app-ink", c.colors.ink);
  set("--app-paper", c.colors.paper);

  if (typeof c.shape.radius === "number") {
    v["--app-radius"] = `${c.shape.radius}px`;
  }
  if (typeof c.typography.scale === "number") {
    v["--app-scale"] = String(c.typography.scale);
  }
  if (c.typography.heading_font) {
    v["--app-font-heading"] = `"${c.typography.heading_font}"`;
  }
  if (c.typography.body_font) {
    v["--app-font-body"] = `"${c.typography.body_font}"`;
  }
  return v;
}

/**
 * Map an animation preset id to the runtime CSS class theme.css ships with.
 * Themes can also implement their own .app-anim-* classes that look up
 * `--app-anim-duration` and `--app-anim-stagger`.
 */
export function animationClass(a: SectionAnimation): string {
  switch (a) {
    case "fade-up": return "app-anim-fade-up";
    case "fade-in": return "app-anim-fade-in";
    case "slide-up": return "app-anim-slide-up";
    case "slide-in": return "app-anim-slide-in";
    case "zoom-in": return "app-anim-zoom-in";
    case "blur-in": return "app-anim-blur-in";
    default: return "";
  }
}
