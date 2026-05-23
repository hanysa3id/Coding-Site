import * as pro from "./pro";
import { cookies } from "next/headers";
import { getThemeSettings } from "@/lib/settings/get";

export const themes = {
  pro,
} as const;

export type ThemeId = keyof typeof themes;

const DEFAULT_THEME: ThemeId = "pro";

function envThemeId(): ThemeId | null {
  const raw = process.env.NEXT_PUBLIC_SITE_THEME?.toLowerCase();
  if (raw && raw in themes) return raw as ThemeId;
  return null;
}

async function resolveThemeId(): Promise<ThemeId> {
  // Resolution order: preview cookie (Theme Builder iframe) → DB setting →
  // env var → safe default. The preview cookie is set by proxy.ts when the
  // admin opens /admin/themes/:id and is scoped to the iframe session only.
  try {
    const store = await cookies();
    const preview = store.get("hany_preview_theme")?.value;
    if (preview && preview in themes) return preview as ThemeId;
  } catch {
    /* outside a request context (e.g. build time) */
  }
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
