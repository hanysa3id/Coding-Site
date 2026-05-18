import * as aurora from "./aurora";
import * as classic from "./classic";
import * as nova from "./nova";
import * as sky from "./sky";
import * as moon from "./moon";
import * as prism from "./prism";
import * as combo from "./combo";
import * as hany from "./hany";
import { getThemeSettings } from "@/lib/settings/get";

export const themes = {
  classic,
  aurora,
  nova,
  sky,
  moon,
  prism,
  combo,
  hany,
} as const;

export type ThemeId = keyof typeof themes;

const DEFAULT_THEME: ThemeId = "classic";

function envThemeId(): ThemeId | null {
  const raw = process.env.NEXT_PUBLIC_SITE_THEME?.toLowerCase();
  if (raw && raw in themes) return raw as ThemeId;
  return null;
}

async function resolveThemeId(): Promise<ThemeId> {
  // Resolution order: DB setting → env var → safe default.
  // The admin theme picker writes to settings.theme, so that wins by default;
  // env var is the build-time escape hatch when no DB is reachable.
  try {
    const settings = await getThemeSettings();
    const id = settings?.active;
    if (id && id in themes) return id as ThemeId;
  } catch {
    // fall through
  }
  return envThemeId() ?? DEFAULT_THEME;
}

export async function getActiveTheme() {
  const id = await resolveThemeId();
  return themes[id];
}

export async function getActiveThemeId(): Promise<ThemeId> {
  return resolveThemeId();
}
