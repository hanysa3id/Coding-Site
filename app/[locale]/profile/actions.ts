"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { uploadToBucket } from "@/lib/storage/upload";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "@/lib/validators/profile";
import { revalidatePath } from "next/cache";

type Result = { success: true } | { success: false; error: string };
type ResultWith<T> = ({ success: true } & T) | { success: false; error: string };

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<Result> {
  const profile = await requireUser();
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone ?? null,
      whatsapp_number: parsed.data.whatsapp_number ?? null,
      locale: parsed.data.locale ?? null,
    })
    .eq("id", profile.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function changePasswordAction(
  input: ChangePasswordInput
): Promise<Result> {
  await requireUser();
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  // 1) Re-authenticate with the current password so a hijacked session can't
  //    silently rotate the password. We need the user's email for this, and
  //    we use a one-off non-cookie client so the verification call doesn't
  //    mutate the user's live session cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email;
  if (!email) {
    return { success: false, error: "Could not resolve account email" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { success: false, error: "Auth is not configured" };
  }
  const { createClient: createPlainClient } = await import("@supabase/supabase-js");
  const verifier = createPlainClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email,
    password: parsed.data.current_password,
  });
  if (verifyError) {
    return { success: false, error: "Current password is incorrect" };
  }

  // 2) Now rotate to the new password on the real session client.
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function uploadAvatarAction(
  formData: FormData
): Promise<ResultWith<{ url: string }>> {
  const profile = await requireUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "No file" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "Max 2MB" };
  }
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Must be an image" };
  }

  const upload = await uploadToBucket("avatars", file, `${profile.id}/`);
  if (!upload.success) return upload;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: upload.url })
    .eq("id", profile.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true, url: upload.url };
}
