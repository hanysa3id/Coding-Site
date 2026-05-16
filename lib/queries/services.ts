import { createClient } from "@/lib/supabase/server";
import type { Service, Category } from "@/types/database";

export async function listVisibleServices(limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("services")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (limit) query = query.limit(limit);
  const { data } = await query;
  return (data as Service[]) ?? [];
}

export async function listFeaturedServices(limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_visible", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  return (data as Service[]) ?? [];
}

export async function getServiceBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();
  return data as Service | null;
}

export async function searchVisibleServices(q: string) {
  const supabase = await createClient();
  const term = q.trim();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_visible", true)
    .or(
      `name_ar.ilike.%${term}%,name_en.ilike.%${term}%,short_description_ar.ilike.%${term}%,short_description_en.ilike.%${term}%`
    )
    .order("sort_order", { ascending: true });
  return (data as Service[]) ?? [];
}

export async function listVisibleCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return (data as Category[]) ?? [];
}

export async function listAllCategoriesForAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Category[]) ?? [];
}
