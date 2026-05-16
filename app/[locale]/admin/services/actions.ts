"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import {
  serviceExtendedSchema,
  type ServiceExtendedInput,
} from "@/lib/validators/service";
import { uploadToBucket } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };

function splitPayload(data: ServiceExtendedInput) {
  const { id, gallery, ...row } = data;
  return {
    id,
    gallery,
    row: {
      ...row,
      cover_image: row.cover_image || null,
      thumbnail_url: row.thumbnail_url || null,
      video_url: row.video_url || null,
    },
  };
}

async function syncGallery(
  serviceId: string,
  gallery: ServiceExtendedInput["gallery"]
) {
  const supabase = await createClient();
  await supabase.from("service_gallery").delete().eq("service_id", serviceId);
  if (gallery.length === 0) return;
  await supabase.from("service_gallery").insert(
    gallery.map((g, i) => ({
      service_id: serviceId,
      image_url: g.url,
      alt_text: g.alt_text ?? null,
      sort_order: i,
      media_type: g.media_type,
    }))
  );
}

export async function createServiceAction(
  input: ServiceExtendedInput
): Promise<Result> {
  await requireAdmin();
  const parsed = serviceExtendedSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { gallery, row } = splitPayload(parsed.data);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .insert(row)
    .select("id, slug")
    .single();
  if (error || !data) return { success: false, error: error?.message ?? "Insert failed" };

  await syncGallery(data.id, gallery);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${data.slug}`);
  return { success: true, id: data.id };
}

export async function updateServiceAction(
  input: ServiceExtendedInput
): Promise<Result> {
  await requireAdmin();
  const parsed = serviceExtendedSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, gallery, row } = splitPayload(parsed.data);
  if (!id) return { success: false, error: "Missing id" };

  const supabase = await createClient();
  const { error } = await supabase.from("services").update(row).eq("id", id);
  if (error) return { success: false, error: error.message };

  await syncGallery(id, gallery);

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath(`/services/${row.slug}`);
  return { success: true, id };
}

export async function deleteServiceAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

export async function uploadServiceImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false as const, error: "No file" };
  return uploadToBucket("service-images", file);
}
