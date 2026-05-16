import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PortfolioForm } from "../portfolio-form";
import type { PortfolioProject } from "@/types/database";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const isAr = locale === "ar";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "تعديل مشروع" : "Edit project"}</h1>
        <p className="text-muted-foreground font-mono text-sm">
          {(project as PortfolioProject).slug}
        </p>
      </div>
      <PortfolioForm initial={project as PortfolioProject} locale={locale} />
    </div>
  );
}
