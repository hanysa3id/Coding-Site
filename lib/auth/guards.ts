import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import type { UserRole, Profile } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

export async function requireUser() {
  const profile = await getCurrentProfile();
  if (!profile) {
    const locale = await getLocale();
    redirect({ href: "/login", locale });
  }
  return profile!;
}

export async function requireRole(allowed: UserRole[]) {
  const profile = await requireUser();
  if (!allowed.includes(profile.role)) {
    const locale = await getLocale();
    redirect({ href: "/dashboard", locale });
  }
  return profile;
}

export async function requireAdmin() {
  return requireRole(["admin"]);
}

export async function requireStaff() {
  return requireRole(["admin", "sales", "staff"]);
}
