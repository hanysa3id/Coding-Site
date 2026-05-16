import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listAllCategoriesForAdmin } from "@/lib/queries/services";
import { ServiceForm } from "../service-form";
import { notFound } from "next/navigation";
import type { Service } from "@/types/database";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const [{ data: service }, categories] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).single(),
    listAllCategoriesForAdmin(),
  ]);

  if (!service) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "تعديل خدمة" : "Edit service"}</h1>
        <p className="text-muted-foreground font-mono text-sm">{(service as Service).slug}</p>
      </div>
      <ServiceForm
        initial={service as Service}
        categories={categories}
        locale={locale}
      />
    </div>
  );
}
