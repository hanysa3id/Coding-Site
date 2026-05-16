"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import {
  userGroupSchema,
  userGroupMemberSchema,
  type UserGroupInput,
  type UserGroupMemberInput,
} from "@/lib/validators/user-groups";
import { revalidatePath } from "next/cache";

type Result =
  | { success: true; id?: string }
  | { success: false; error: string };

export async function createUserGroupAction(input: UserGroupInput): Promise<Result> {
  await requireAdmin();
  const parsed = userGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { id: _ignore, color, ...rest } = parsed.data;
  const payload: Record<string, unknown> = {
    ...rest,
    color: color || null,
  };
  const { data, error } = await supabase
    .from("user_groups")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/groups");
  return { success: true, id: data.id };
}

export async function updateUserGroupAction(input: UserGroupInput): Promise<Result> {
  await requireAdmin();
  const parsed = userGroupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!parsed.data.id) return { success: false, error: "Missing id" };
  const supabase = await createClient();
  const { id, color, ...rest } = parsed.data;
  const { error } = await supabase
    .from("user_groups")
    .update({ ...rest, color: color || null })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${id}`);
  return { success: true, id };
}

export async function deleteUserGroupAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("user_groups")
    .select("is_system")
    .eq("id", id)
    .single();
  if ((row as { is_system?: boolean } | null)?.is_system) {
    return { success: false, error: "System group cannot be deleted" };
  }
  const { error } = await supabase.from("user_groups").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/groups");
  return { success: true };
}

export async function addGroupMemberAction(input: UserGroupMemberInput): Promise<Result> {
  const me = await requireAdmin();
  const parsed = userGroupMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("user_group_members").upsert(
    {
      group_id: parsed.data.group_id,
      user_id: parsed.data.user_id,
      added_by: me.id,
    },
    { onConflict: "group_id,user_id" }
  );
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/groups/${parsed.data.group_id}`);
  return { success: true };
}

export async function removeGroupMemberAction(input: UserGroupMemberInput): Promise<Result> {
  await requireAdmin();
  const parsed = userGroupMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_group_members")
    .delete()
    .eq("group_id", parsed.data.group_id)
    .eq("user_id", parsed.data.user_id);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/groups/${parsed.data.group_id}`);
  return { success: true };
}
