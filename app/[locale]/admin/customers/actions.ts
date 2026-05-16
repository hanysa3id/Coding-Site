"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/types/database";

type Result = { success: true } | { success: false; error: string };

const ALLOWED_ROLES: UserRole[] = ["customer", "sales", "staff", "admin"];

export async function changeUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<Result> {
  const me = await requireAdmin();
  if (userId === me.id) {
    return { success: false, error: "Cannot change your own role" };
  }
  if (!ALLOWED_ROLES.includes(newRole)) {
    return { success: false, error: "Invalid role" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/customers");
  return { success: true };
}
