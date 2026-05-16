import * as aurora from "./aurora";
import * as classic from "./classic";
import * as nova from "./nova";
import { getThemeSettings } from "@/lib/settings/get";

export const themes = {
  classic,
  aurora,
  nova,
} as const;

export type ThemeId = keyof typeof themes;

const DEFAULT_THEME: ThemeId = "classic";

function envThemeId(): ThemeId | null {
  const raw = process.env.NEXT_PUBLIC_SITE_THEME?.toLowerCase();
  if (raw && raw in themes) return raw as ThemeId;
  return null;
}

/**
 * Resolution order:
 *   1. DB setting (admins toggle this from /admin/settings → Theme)
 *   2. NEXT_PUBLIC_SITE_THEME env var (build-time override)
 *   3. DEFAULT_THEME ("classic")
 *
 * Uses React cache via getThemeSettings(), so calling this multiple times per
 * request does a single DB read.
 */
async function resolveThemeId(): Promise<ThemeId> {
  try {
    const settings = await getThemeSettings();
    const id = settings?.active;
    if (id && id in themes) return id as ThemeId;
  } catch {
    // ignore — fall through to env/default
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
