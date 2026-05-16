import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export async function getSetting<T = Json>(key: string): Promise<T | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();
  return (data?.value as T) ?? null;
}

export type SiteSettings = {
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  logo_url: string | null;
  favicon_url: string | null;
};

export type WhatsAppSettings = {
  business_number: string;
  show_floating_button: boolean;
  default_message_ar: string;
  default_message_en: string;
};

export type ContactSettings = {
  email: string;
  phone: string;
  address_ar: string;
  address_en: string;
  social: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
    youtube: string | null;
  };
};
