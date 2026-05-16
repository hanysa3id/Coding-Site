"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import {
  portfolioExtendedSchema,
  type PortfolioExtendedInput,
} from "@/lib/validators/portfolio";
import { uploadToBucket } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";

type Result = { success: true; id?: string } | { success: false; error: string };

/**
 * Splits the validated input into:
 *  - main fields stored directly on `portfolio_projects`
 *  - junction data (service_ids, gallery) handled in separate tables
 */
function splitPayload(data: PortfolioExtendedInput) {
  const { id, service_ids, gallery, ...row } = data;
  // Normalize empty strings to null for URL columns
  const normalized = {
    ...row,
    cover_image: row.cover_image || null,
    project_url: row.project_url || null,
    delivery_date: row.delivery_date || null,
  };
  return { id, service_ids, gallery, row: normalized };
}

async function syncServices(portfolioId: string, serviceIds: string[]) {
  const supabase = await createClient();
  await supabase.from("portfolio_services").delete().eq("portfolio_id", portfolioId);
  if (serviceIds.length === 0) return;
  await supabase.from("portfolio_services").insert(
    serviceIds.map((service_id) => ({ portfolio_id: portfolioId, service_id }))
  );
}

async function syncGallery(
  portfolioId: string,
  gallery: PortfolioExtendedInput["gallery"]
) {
  const supabase = await createClient();
  // Replace strategy: delete all then re-insert with fresh sort_order.
  // Acceptable because gallery items are short-lived edits, not heavily
  // referenced elsewhere.
  await supabase.from("portfolio_gallery").delete().eq("portfolio_id", portfolioId);
  if (gallery.length === 0) return;
  await supabase.from("portfolio_gallery").insert(
    gallery.map((g, i) => ({
      portfolio_id: portfolioId,
      image_url: g.url,
      alt_text: g.alt_text ?? null,
      sort_order: i,
      media_type: g.media_type,
    }))
  );
}

export async function createPortfolioAction(
  input: PortfolioExtendedInput
): Promise<Result> {
  await requireAdmin();
  const parsed = portfolioExtendedSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { service_ids, gallery, row } = splitPayload(parsed.data);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert(row)
    .select("id, slug")
    .single();
  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to create" };
  }

  await syncServices(data.id, service_ids);
  await syncGallery(data.id, gallery);

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${data.slug}`);
  return { success: true, id: data.id };
}

export async function updatePortfolioAction(
  input: PortfolioExtendedInput
): Promise<Result> {
  await requireAdmin();
  const parsed = portfolioExtendedSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, service_ids, gallery, row } = splitPayload(parsed.data);
  if (!id) return { success: false, error: "Missing id" };

  const supabase = await createClient();
  const { error } = await supabase.from("portfolio_projects").update(row).eq("id", id);
  if (error) return { success: false, error: error.message };

  await syncServices(id, service_ids);
  await syncGallery(id, gallery);

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${row.slug}`);
  return { success: true, id };
}

export async function deletePortfolioAction(id: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  return { success: true };
}

export async function uploadPortfolioImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { success: false as const, error: "No file" };
  return uploadToBucket("portfolio-images", file);
}
