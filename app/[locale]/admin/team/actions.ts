"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { uploadToBucket } from "@/lib/storage/upload";

export async function uploadTeamAvatarAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false as const, error: "No file" };
  // Namespaced under team/ to keep admin-managed team photos separate from
  // user-uploaded self-avatars (which live in {auth.uid()}/...).
  return uploadToBucket("avatars", file, "team/");
}

export async function createTeamMemberAction(data: {
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  bio_ar: string;
  bio_en: string;
  avatar_url: string;
  sort_order: number;
  is_visible: boolean;
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("team_members").insert(data);
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true as const };
}

export async function updateTeamMemberAction(
  id: string,
  data: {
    name_ar?: string;
    name_en?: string;
    role_ar?: string;
    role_en?: string;
    bio_ar?: string;
    bio_en?: string;
    avatar_url?: string;
    sort_order?: number;
    is_visible?: boolean;
  }
) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("team_members").update(data).eq("id", id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true as const };
}

export async function deleteTeamMemberAction(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true as const };
}

export async function updateAboutSettingsAction(value: {
  mission_ar: string;
  mission_en: string;
  vision_ar: string;
  vision_en: string;
  stats: { label_ar: string; label_en: string; value: string }[];
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "about", value: value as unknown as Record<string, unknown> });
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/admin/team");
  revalidatePath("/about");
  return { success: true as const };
}
