import * as aurora from "./aurora";
import * as classic from "./classic";
import * as nova from "./nova";

export const themes = {
  classic,
  aurora,
  nova,
} as const;

export type ThemeId = keyof typeof themes;

// Classic is the safe, business-friendly default. Switch with NEXT_PUBLIC_SITE_THEME.
const DEFAULT_THEME: ThemeId = "classic";

function resolveThemeId(): ThemeId {
  const raw = process.env.NEXT_PUBLIC_SITE_THEME?.toLowerCase();
  if (raw && raw in themes) return raw as ThemeId;
  return DEFAULT_THEME;
}

export function getActiveTheme() {
  return themes[resolveThemeId()];
}

export function getActiveThemeId(): ThemeId {
  return resolveThemeId();
}
