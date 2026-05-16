import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PortfolioProject, Service } from "@/types/database";
import type { Metadata } from "next";

async function getProjectBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();
  return data as PortfolioProject | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return {};
  return {
    title: locale === "ar" ? p.title_ar : p.title_en,
    description: (locale === "ar" ? p.description_ar : p.description_en) ?? undefined,
    openGraph: { images: p.cover_image ? [p.cover_image] : [] },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const supabase = await createClient();
  const { data: serviceLinks } = await supabase
    .from("portfolio_services")
    .select("service_id, services(*)")
    .eq("portfolio_id", project.id);

  const services = ((serviceLinks ?? []) as unknown as { services: Service | null }[])
    .map((l) => l.services)
    .filter((s): s is Service => !!s && s.is_visible);

  return (
    <article className="container py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/portfolio">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {isAr ? "كل الأعمال" : "All projects"}
        </Link>
      </Button>

      <header className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold">
          {isAr ? project.title_ar : project.title_en}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {project.client_name && (
            <span>
              <strong>{isAr ? "العميل: " : "Client: "}</strong>
              {project.client_name}
            </span>
          )}
          {project.delivery_date && (
            <span>
              <strong>{isAr ? "تاريخ التسليم: " : "Delivered: "}</strong>
              {project.delivery_date}
            </span>
          )}
          {project.project_url && (
            <Button asChild variant="link" className="px-0 h-auto">
              <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                {isAr ? "زيارة المشروع" : "Visit project"}
              </a>
            </Button>
          )}
        </div>
      </header>

      {project.cover_image && (
        <div
          className="aspect-video rounded-lg bg-cover bg-center mb-8 shadow-md"
          style={{ backgroundImage: `url(${project.cover_image})` }}
        />
      )}

      {(isAr ? project.description_ar : project.description_en) && (
        <div className="prose max-w-none mb-12">
          <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
            {isAr ? project.description_ar : project.description_en}
          </p>
        </div>
      )}

      {services.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {isAr ? "الخدمات المستخدمة" : "Services used"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {services.map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`}>
                <Card className="h-full transition hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {isAr ? s.name_ar : s.name_en}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
