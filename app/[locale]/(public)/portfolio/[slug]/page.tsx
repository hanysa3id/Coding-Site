import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, Wrench, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/portfolio/video-embed";
import { JsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/utils";
import type {
  PortfolioProject,
  PortfolioGalleryItem,
  Service,
  TimelineStep,
} from "@/types/database";
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
  const isAr = locale === "ar";
  const title =
    (isAr ? p.seo_title_ar : p.seo_title_en) ||
    (isAr ? p.title_ar : p.title_en);
  const description =
    (isAr ? p.seo_description_ar : p.seo_description_en) ||
    (isAr ? p.description_ar : p.description_en) ||
    undefined;
  return {
    title,
    description,
    keywords: p.seo_keywords ?? undefined,
    openGraph: {
      title,
      description: description ?? undefined,
      images: p.cover_image ? [p.cover_image] : [],
      type: "article",
    },
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
  const [{ data: serviceLinks }, { data: gallery }] = await Promise.all([
    supabase
      .from("portfolio_services")
      .select("service_id, services(*)")
      .eq("portfolio_id", project.id),
    supabase
      .from("portfolio_gallery")
      .select("*")
      .eq("portfolio_id", project.id)
      .order("sort_order", { ascending: true }),
  ]);

  const services = ((serviceLinks ?? []) as unknown as { services: Service | null }[])
    .map((l) => l.services)
    .filter((s): s is Service => !!s && s.is_visible);

  const galleryItems = (gallery as PortfolioGalleryItem[]) ?? [];
  const features = isAr ? project.features_ar : project.features_en;
  const problems = isAr ? project.problems_solved_ar : project.problems_solved_en;
  const timeline = isAr ? project.timeline_ar : project.timeline_en;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: isAr ? project.title_ar : project.title_en,
    description:
      (isAr ? project.description_ar : project.description_en) ?? undefined,
    image: project.cover_image ?? undefined,
    url: `${siteUrl}/${locale}/portfolio/${project.slug}`,
    dateCreated: project.delivery_date ?? undefined,
    keywords: project.seo_keywords ?? undefined,
  };

  return (
    <article className="container py-12">
      <JsonLd data={schema} />

      <Button asChild variant="ghost" className="mb-6">
        <Link href="/portfolio">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {isAr ? "كل الأعمال" : "All projects"}
        </Link>
      </Button>

      {/* Hero */}
      <header className="space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold">
          {isAr ? project.title_ar : project.title_en}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {project.client_name && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <strong>{isAr ? "العميل:" : "Client:"}</strong>
              {project.client_name}
            </span>
          )}
          {project.delivery_date && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <strong>{isAr ? "تاريخ التسليم:" : "Delivered:"}</strong>
              {formatDate(project.delivery_date, isAr ? "ar-EG" : "en-US")}
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

      {/* Cover */}
      {project.cover_image && (
        <div
          className="aspect-video rounded-lg bg-cover bg-center mb-12 shadow-md"
          style={{ backgroundImage: `url(${project.cover_image})` }}
          role="img"
          aria-label={isAr ? project.title_ar : project.title_en}
        />
      )}

      {/* Description */}
      {(isAr ? project.description_ar : project.description_en) && (
        <section className="prose max-w-none mb-12 text-lg">
          <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
            {isAr ? project.description_ar : project.description_en}
          </p>
        </section>
      )}

      {/* Features + Problems (side-by-side on desktop) */}
      {(features.length > 0 || problems.length > 0) && (
        <section className="grid gap-6 md:grid-cols-2 mb-12">
          {features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {isAr ? "مميزات المشروع" : "Project features"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {problems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  {isAr ? "المشاكل التي يحلها" : "Problems solved"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {problems.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Technologies */}
      {project.technologies.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 inline-flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {isAr ? "التقنيات المستخدمة" : "Technologies used"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {isAr ? "مراحل تنفيذ المشروع" : "Execution timeline"}
          </h2>
          <ol className="relative border-s-2 border-primary/30 space-y-6 ms-2">
            {timeline.map((step: TimelineStep, idx) => (
              <li key={idx} className="ms-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full -start-4 ring-4 ring-background text-sm font-bold">
                  {idx + 1}
                </span>
                <div className="rounded-md border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    {step.date && (
                      <time className="text-xs text-muted-foreground">
                        {formatDate(step.date, isAr ? "ar-EG" : "en-US")}
                      </time>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {step.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Gallery: images + videos */}
      {galleryItems.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {isAr ? "معرض المشروع" : "Project gallery"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {galleryItems.map((item) => (
              <div key={item.id}>
                {item.media_type === "video" ? (
                  <VideoEmbed url={item.image_url} title={item.alt_text ?? undefined} />
                ) : (
                  <div
                    className="aspect-video bg-cover bg-center bg-muted border rounded-lg overflow-hidden"
                    style={{ backgroundImage: `url(${item.image_url})` }}
                    role="img"
                    aria-label={item.alt_text ?? ""}
                  />
                )}
                {item.alt_text && (
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {item.alt_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Linked services */}
      {services.length > 0 && (
        <>
          <Separator className="my-12" />
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {isAr ? "الخدمات التي يشملها المشروع" : "Services in this project"}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {services.map((s) => (
                <Link key={s.id} href={`/services/${s.slug}`}>
                  <Card className="h-full transition hover:shadow-md hover:border-primary/50">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {isAr ? s.name_ar : s.name_en}
                      </CardTitle>
                    </CardHeader>
                    {(isAr ? s.short_description_ar : s.short_description_en) && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {isAr ? s.short_description_ar : s.short_description_en}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
