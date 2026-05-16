import * as aurora from "./aurora";
import * as classic from "./classic";

export const themes = {
  aurora,
  classic,
} as const;

export type ThemeId = keyof typeof themes;

const DEFAULT_THEME: ThemeId = "aurora";

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
