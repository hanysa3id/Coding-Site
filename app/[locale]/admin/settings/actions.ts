"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import {
  siteSettingsSchema,
  whatsappSettingsSchema,
  seoSettingsSchema,
  contactSettingsSchema,
  paymentsSettingsSchema,
  bankAccountSchema,
  integrationsSettingsSchema,
  type SiteSettings,
  type WhatsappSettings,
  type SeoSettings,
  type ContactSettings,
  type PaymentsSettings,
  type BankAccountInput,
  type IntegrationsSettings,
} from "@/lib/validators/settings";

type Result = { success: true } | { success: false; error: string };

async function upsertSetting(key: string, value: unknown): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveSiteSettingsAction(input: SiteSettings) {
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  return upsertSetting("site", parsed.data);
}

export async function saveWhatsappSettingsAction(input: WhatsappSettings) {
  const parsed = whatsappSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  return upsertSetting("whatsapp", parsed.data);
}

export async function saveSeoSettingsAction(input: SeoSettings) {
  const parsed = seoSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  return upsertSetting("seo", parsed.data);
}

export async function saveContactSettingsAction(input: ContactSettings) {
  const parsed = contactSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  return upsertSetting("contact", parsed.data);
}

export async function savePaymentsSettingsAction(input: PaymentsSettings) {
  const parsed = paymentsSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  return upsertSetting("payments", parsed.data);
}

export async function saveIntegrationsSettingsAction(input: IntegrationsSettings) {
  const parsed = integrationsSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  return upsertSetting("integrations", parsed.data);
}

export async function upsertBankAccountAction(
  input: BankAccountInput
): Promise<Result> {
  await requireAdmin();
  const parsed = bankAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { id, ...payload } = parsed.data;
  if (id) {
    const { error } = await supabase.from("bank_accounts").update(payload).eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("bank_accounts").insert(payload);
    if (error) return { success: false, error: error.message };
  }
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteBankAccountAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/settings");
  return { success: true };
}
