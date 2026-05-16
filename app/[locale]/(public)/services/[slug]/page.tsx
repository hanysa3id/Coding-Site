import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/queries/services";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Clock, ArrowRight, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { JsonLd, serviceSchema } from "@/components/seo/json-ld";
import { getWhatsappNumber } from "@/lib/settings/get";
import type { Metadata } from "next";
import type { ServiceStage, Review, PortfolioProject } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  const isAr = locale === "ar";
  return {
    title: (isAr ? service.seo_title_ar : service.seo_title_en) ?? (isAr ? service.name_ar : service.name_en),
    description:
      (isAr ? service.seo_description_ar : service.seo_description_en) ??
      (isAr ? service.short_description_ar : service.short_description_en) ??
      undefined,
    keywords: service.seo_keywords ?? undefined,
    openGraph: {
      images: service.cover_image ? [service.cover_image] : [],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const t = await getTranslations("home");

  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const supabase = await createClient();
  const [{ data: stages }, { data: reviews }, { data: portfolioLinks }] = await Promise.all([
    supabase
      .from("service_stages")
      .select("*")
      .eq("service_id", service.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("reviews")
      .select("*")
      .eq("service_id", service.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("portfolio_services")
      .select("portfolio_id, portfolio_projects(*)")
      .eq("service_id", service.id),
  ]);

  const portfolioProjects = ((portfolioLinks ?? []) as unknown as { portfolio_projects: PortfolioProject | null }[])
    .map((l) => l.portfolio_projects)
    .filter((p): p is PortfolioProject => !!p && p.is_visible);

  const avgRating =
    (reviews as Review[] | null)?.length
      ? (reviews as Review[]).reduce((a, r) => a + r.rating, 0) / (reviews as Review[]).length
      : null;

  const priceLabel = (() => {
    if (!service.estimated_price_min) return null;
    const min = formatCurrency(service.estimated_price_min, service.currency, isAr ? "ar-EG" : "en-US");
    if (service.estimated_price_max && service.estimated_price_max !== service.estimated_price_min) {
      const max = formatCurrency(service.estimated_price_max, service.currency, isAr ? "ar-EG" : "en-US");
      return `${min} — ${max}`;
    }
    return `${isAr ? "من " : "From "}${min}`;
  })();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const schema = serviceSchema({
    name: isAr ? service.name_ar : service.name_en,
    description: (isAr ? service.short_description_ar : service.short_description_en) ?? undefined,
    image: service.cover_image,
    url: `${siteUrl}/${locale}/services/${service.slug}`,
    priceMin: service.estimated_price_min,
    priceMax: service.estimated_price_max,
    currency: service.currency,
    ratingValue: avgRating ?? undefined,
    ratingCount: (reviews as Review[] | null)?.length,
  });

  return (
    <article className="container py-12">
      <JsonLd data={schema} />
      {/* Hero */}
      <header className="grid gap-8 md:grid-cols-2 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {avgRating !== null && (
              <Badge variant="success" className="gap-1">
                <Star className="h-3 w-3" />
                {avgRating.toFixed(1)} ({(reviews ?? []).length})
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold">{isAr ? service.name_ar : service.name_en}</h1>
          <p className="text-lg text-muted-foreground">
            {isAr ? service.short_description_ar : service.short_description_en}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {priceLabel && (
              <div>
                <span className="text-muted-foreground">{isAr ? "السعر التقديري:" : "Estimated price:"}</span>{" "}
                <span className="font-semibold text-primary">{priceLabel}</span>
              </div>
            )}
            {service.estimated_duration_days && (
              <div className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {service.estimated_duration_days} {isAr ? "يوم" : "days"}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="lg">
              <Link href={`/orders/new?service=${service.id}`}>
                {isAr ? "اطلب الخدمة" : "Order this service"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <WhatsAppButton
              variant="hero"
              phoneNumber={await getWhatsappNumber()}
              context={{
                type: "service",
                serviceName: isAr ? service.name_ar : service.name_en,
                estimatedPrice: priceLabel ?? undefined,
              }}
              label={isAr ? "استفسار عبر واتس آب" : "Inquire via WhatsApp"}
            />
          </div>
        </div>
        <div>
          {service.cover_image ? (
            <div
              className="aspect-video rounded-lg bg-cover bg-center shadow-md"
              style={{ backgroundImage: `url(${service.cover_image})` }}
            />
          ) : (
            <div className="aspect-video rounded-lg bg-muted" />
          )}
        </div>
      </header>

      {/* Description */}
      {(isAr ? service.full_description_ar : service.full_description_en) && (
        <section className="prose max-w-none mb-12">
          <h2 className="text-2xl font-bold mb-4">
            {isAr ? "تفاصيل الخدمة" : "Service details"}
          </h2>
          <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
            {isAr ? service.full_description_ar : service.full_description_en}
          </p>
        </section>
      )}

      {/* Stages */}
      {(stages as ServiceStage[] | null)?.length ? (
        <>
          <Separator className="my-12" />
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {isAr ? "مراحل التنفيذ" : "Implementation stages"}
            </h2>
            <ol className="grid gap-4 md:grid-cols-2">
              {(stages as ServiceStage[]).map((stage, i) => (
                <li key={stage.id} className="flex gap-4 rounded-lg border p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">
                      {isAr ? stage.title_ar : stage.title_en}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isAr ? stage.description_ar : stage.description_en}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : null}

      {/* Portfolio examples */}
      {portfolioProjects.length > 0 && (
        <>
          <Separator className="my-12" />
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {isAr ? "أعمال سابقة" : "Previous work"}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {portfolioProjects.map((p) => (
                <Link key={p.id} href={`/portfolio/${p.slug}`}>
                  <Card className="h-full transition hover:shadow-md">
                    {p.cover_image && (
                      <div
                        className="h-40 rounded-t-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${p.cover_image})` }}
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="text-base">
                        {isAr ? p.title_ar : p.title_en}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Reviews */}
      {(reviews as Review[] | null)?.length ? (
        <>
          <Separator className="my-12" />
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {isAr ? "آراء العملاء" : "Customer reviews"}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(reviews as Review[]).map((r) => (
                <Card key={r.id}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm">{r.comment}</p>}
                    {r.admin_reply && (
                      <div className="rounded-md border-s-2 border-primary bg-muted/50 p-3 text-sm">
                        <p className="font-medium mb-1">{isAr ? "رد الإدارة:" : "Reply:"}</p>
                        <p>{r.admin_reply}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </article>
  );
}
