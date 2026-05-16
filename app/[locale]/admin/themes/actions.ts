"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import {
  themeCustomizationSchema,
  themeCustomizationsBagSchema,
  type ThemeCustomization,
} from "@/lib/validators/theme-builder";
import { themeIdSchema, type ThemeId } from "@/lib/validators/settings";

type Result = { success: true } | { success: false; error: string };

async function loadBag(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "theme_customizations")
    .maybeSingle();
  return (data?.value as Record<string, unknown>) ?? {};
}

export async function saveThemeCustomizationAction(
  themeId: ThemeId,
  input: ThemeCustomization
): Promise<Result> {
  await requireAdmin();
  const parsedTheme = themeIdSchema.safeParse(themeId);
  if (!parsedTheme.success) {
    return { success: false, error: "Invalid theme id" };
  }
  const parsed = themeCustomizationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const bag = await loadBag();
  bag[parsedTheme.data] = parsed.data;
  const finalBag = themeCustomizationsBagSchema.safeParse(bag);
  if (!finalBag.success) {
    return { success: false, error: "Bag validation failed" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "theme_customizations", value: finalBag.data }, { onConflict: "key" });
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/themes");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function resetThemeCustomizationAction(themeId: ThemeId): Promise<Result> {
  await requireAdmin();
  const bag = await loadBag();
  delete bag[themeId];

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "theme_customizations", value: bag }, { onConflict: "key" });
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/themes");
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Switch the active theme (so the builder can "Apply" a customized base
 * to the live site from a single click without bouncing through Settings).
 */
export async function activateThemeAction(themeId: ThemeId): Promise<Result> {
  await requireAdmin();
  const parsed = themeIdSchema.safeParse(themeId);
  if (!parsed.success) return { success: false, error: "Invalid theme id" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "theme", value: { active: parsed.data } }, { onConflict: "key" });
  if (error) return { success: false, error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}
