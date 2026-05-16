import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import type { UserRole, Profile } from "@/types/database";

/**
 * Returns the current Supabase auth user, or null. Never throws.
 * Safe to call from layouts that render for anonymous visitors.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[guards] getCurrentUser failed:", err);
    }
    return null;
  }
}

/**
 * Returns the current user's profile, or null. Never throws.
 * Safe to call from layouts. Returns null for anonymous users
 * or when Supabase is unreachable / misconfigured.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
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
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[guards] getCurrentProfile failed:", err);
    }
    return null;
  }
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
