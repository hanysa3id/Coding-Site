import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/queries/services";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { VideoEmbed } from "@/components/portfolio/video-embed";
import { ReviewCard } from "@/components/public/review-card";
import { Clock, ArrowRight, Star, CheckCircle2, Gift, Sparkles } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { JsonLd, serviceSchema } from "@/components/seo/json-ld";
import { getWhatsappNumber, getSiteName } from "@/lib/settings/get";
import type { Metadata } from "next";
import type {
  PortfolioProject,
  ServiceGalleryMedia,
  TimelineStep,
} from "@/types/database";

type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  admin_reply: string | null;
  created_at: string;
  customer: { full_name: string | null; avatar_url: string | null } | null;
};

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
    title:
      (isAr ? service.seo_title_ar : service.seo_title_en) ??
      (isAr ? service.name_ar : service.name_en),
    description:
      (isAr ? service.seo_description_ar : service.seo_description_en) ??
      (isAr ? service.short_description_ar : service.short_description_en) ??
      undefined,
    keywords: service.seo_keywords ?? undefined,
    openGraph: {
      title: isAr ? service.name_ar : service.name_en,
      images: service.cover_image ? [service.cover_image] : [],
      type: "website",
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

  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const supabase = await createClient();
  const [{ data: gallery }, { data: reviews }, { data: portfolioLinks }, waNumber] =
    await Promise.all([
      supabase
        .from("service_gallery")
        .select("*")
        .eq("service_id", service.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("reviews")
        .select(
          "id, rating, comment, admin_reply, created_at, customer:profiles!reviews_customer_id_fkey(full_name, avatar_url)"
        )
        .eq("service_id", service.id)
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("portfolio_services")
        .select("portfolio_id, portfolio_projects(*)")
        .eq("service_id", service.id),
      getWhatsappNumber(),
    ]);

  const galleryItems = (gallery as ServiceGalleryMedia[]) ?? [];
  const portfolioProjects = (
    (portfolioLinks ?? []) as unknown as { portfolio_projects: PortfolioProject | null }[]
  )
    .map((l) => l.portfolio_projects)
    .filter((p): p is PortfolioProject => !!p && p.is_visible);

  const reviewsList = (reviews as unknown as PublicReview[] | null) ?? [];
  const avgRating = reviewsList.length
    ? reviewsList.reduce((a, r) => a + r.rating, 0) / reviewsList.length
    : null;
  const brandName = await getSiteName(locale);

  const features = isAr ? service.features_ar : service.features_en;
  const deliverables = isAr ? service.deliverables_ar : service.deliverables_en;
  const timeline = isAr ? service.timeline_ar : service.timeline_en;

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
    description:
      (isAr ? service.short_description_ar : service.short_description_en) ?? undefined,
    image: service.cover_image,
    url: `${siteUrl}/${locale}/services/${service.slug}`,
    priceMin: service.estimated_price_min,
    priceMax: service.estimated_price_max,
    currency: service.currency,
    ratingValue: avgRating ?? undefined,
    ratingCount: reviewsList.length,
  });

  return (
    <article className="container py-12">
      <JsonLd data={schema} />

      {/* Hero */}
      <header className="grid gap-8 md:grid-cols-5 mb-12 items-start">
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {service.is_featured && (
              <Badge className="gap-1">
                <Sparkles className="h-3 w-3" />
                {isAr ? "خدمة مميزة" : "Featured"}
              </Badge>
            )}
            {avgRating !== null && (
              <Badge variant="success" className="gap-1">
                <Star className="h-3 w-3" />
                {avgRating.toFixed(1)} ({reviewsList.length})
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold inline-flex items-start gap-3">
            {service.thumbnail_url && (
              <span className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={service.thumbnail_url}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
            )}
            <span>{isAr ? service.name_ar : service.name_en}</span>
          </h1>

          {(isAr ? service.short_description_ar : service.short_description_en) && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isAr ? service.short_description_ar : service.short_description_en}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm pt-2">
            {priceLabel && (
              <div>
                <span className="text-muted-foreground">
                  {isAr ? "السعر التقديري:" : "Est. price:"}
                </span>{" "}
                <span className="font-bold text-primary text-base">{priceLabel}</span>
              </div>
            )}
            {service.estimated_duration_days && (
              <div className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {service.estimated_duration_days} {isAr ? "يوم" : "days"}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild size="lg">
              <Link href={`/orders/new?service=${service.id}`}>
                {isAr ? "اطلب الخدمة الآن" : "Order this service"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <WhatsAppButton
              variant="hero"
              phoneNumber={waNumber}
              context={{
                type: "service",
                serviceName: isAr ? service.name_ar : service.name_en,
                estimatedPrice: priceLabel ?? undefined,
              }}
              label={isAr ? "استفسار عبر واتس آب" : "Inquire via WhatsApp"}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          {service.cover_image ? (
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-md bg-muted">
              <Image
                src={service.cover_image}
                alt={isAr ? service.name_ar : service.name_en}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
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
          <p className="whitespace-pre-line text-muted-foreground leading-relaxed text-base">
            {isAr ? service.full_description_ar : service.full_description_en}
          </p>
        </section>
      )}

      {/* Featured video */}
      {service.video_url && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">
            {isAr ? "فيديو الخدمة" : "Service video"}
          </h2>
          <div className="rounded-lg overflow-hidden">
            <VideoEmbed url={service.video_url} title={isAr ? service.name_ar : service.name_en} />
          </div>
        </section>
      )}

      {/* Features + Deliverables side by side */}
      {(features.length > 0 || deliverables.length > 0) && (
        <section className="grid gap-6 md:grid-cols-2 mb-12">
          {features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {isAr ? "مميزات الخدمة" : "Service features"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  {isAr ? "ما الذي ستحصل عليه" : "What you'll get"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {deliverables.map((d, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {isAr ? "مراحل تنفيذ الخدمة" : "Implementation timeline"}
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

      {/* Gallery */}
      {galleryItems.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {isAr ? "معرض الصور والفيديوهات" : "Image & video gallery"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {galleryItems.map((item) => (
              <div key={item.id}>
                {item.media_type === "video" ? (
                  <VideoEmbed url={item.image_url} title={item.alt_text ?? undefined} />
                ) : (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                    <Image
                      src={item.image_url}
                      alt={item.alt_text ?? ""}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
                {item.alt_text && (
                  <p className="text-xs text-muted-foreground mt-1 px-1">{item.alt_text}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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
                  <Card className="h-full overflow-hidden transition hover:shadow-md hover:border-primary/50">
                    {p.cover_image && (
                      <div className="relative aspect-video">
                        <Image
                          src={p.cover_image}
                          alt={isAr ? p.title_ar : p.title_en}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
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
      {reviewsList.length > 0 && (
        <>
          <Separator className="my-12" />
          <section>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <h2 className="text-2xl font-bold">
                {isAr ? "آراء العملاء" : "Customer reviews"}
              </h2>
              {avgRating !== null && (
                <div className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-600">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({reviewsList.length} {isAr ? "تقييم" : "reviews"})
                  </span>
                </div>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {reviewsList.map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  locale={locale}
                  brandName={brandName}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Bottom CTA */}
      <Separator className="my-12" />
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">
          {isAr ? "هل أنت مستعد للبدء؟" : "Ready to get started?"}
        </h2>
        <p className="text-muted-foreground">
          {isAr
            ? "اطلب الخدمة الآن أو تواصل معنا للاستفسار"
            : "Order now or contact us with any questions"}
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button asChild size="lg">
            <Link href={`/orders/new?service=${service.id}`}>
              {isAr ? "اطلب الخدمة الآن" : "Order this service"}
            </Link>
          </Button>
          <WhatsAppButton
            variant="hero"
            phoneNumber={waNumber}
            context={{
              type: "service",
              serviceName: isAr ? service.name_ar : service.name_en,
              estimatedPrice: priceLabel ?? undefined,
            }}
            label={isAr ? "استفسار عبر واتس آب" : "Inquire via WhatsApp"}
          />
        </div>
      </section>
    </article>
  );
}
