import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { listFeaturedServices } from "@/lib/queries/services";
import { getWhatsappNumber, getLandingSettings } from "@/lib/settings/get";
import { isSectionVisible, resolveHero } from "@/lib/landing/helpers";
import type { LandingSectionId } from "@/lib/validators/settings";
import { ArrowRight, Sparkles, Clock, Award, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Classic theme homepage — wired to landing settings so admins can toggle
// any section off and override the hero copy. CTA shows when CTA is visible.
export async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const isAr = locale === "ar";

  let featured: Awaited<ReturnType<typeof listFeaturedServices>> = [];
  try {
    featured = await listFeaturedServices(6);
  } catch {
    featured = [];
  }
  const [waNumber, landing] = await Promise.all([
    getWhatsappNumber(),
    getLandingSettings().catch(() => null),
  ]);

  const show = (id: LandingSectionId) => isSectionVisible(landing, id);
  const hero = resolveHero(landing, locale, {
    badge: isAr ? "خدمات رقمية احترافية" : "Professional digital services",
    title: t("heroTitle"),
    subtitle: t("heroSubtitle"),
    primaryLabel: t("ctaServices"),
    primaryHref: "/services",
    secondaryLabel: t("ctaContact"),
    secondaryHref: "/contact",
  });

  return (
    <>
      {show("hero") && (
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{hero.badge}</span>
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">{hero.title}</h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">{hero.subtitle}</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href={hero.primary.href}>
                  {hero.primary.label}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <WhatsAppButton variant="hero" label={hero.secondary.label} phoneNumber={waNumber} />
            </div>
          </div>
        </section>
      )}

      {show("features") && (
        <section className="container py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">{isAr ? "تسليم في الوقت المحدد" : "On-time delivery"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {isAr ? "نلتزم بالمواعيد المتفق عليها مع متابعة دقيقة لكل مرحلة" : "We honor agreed deadlines with careful tracking at every stage."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">{isAr ? "جودة احترافية" : "Professional quality"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {isAr ? "فريق خبراء يقدم حلولاً متكاملة بأفضل المعايير" : "An expert team delivering complete solutions to the highest standards."}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-lg">{isAr ? "دفع آمن" : "Secure payment"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {isAr ? "بوابات دفع موثوقة مع إمكانية التحويل البنكي" : "Trusted payment gateways plus bank-transfer support."}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {show("services") && featured.length > 0 && (
        <section className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-bold">{t("featuredServices")}</h2>
            <Button asChild variant="ghost">
              <Link href="/services">
                {tc("services")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`} className="block">
                <Card className="h-full transition hover:shadow-md">
                  {s.cover_image && (
                    <div className="h-40 w-full rounded-t-lg bg-cover bg-center" style={{ backgroundImage: `url(${s.cover_image})` }} />
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{isAr ? s.name_ar : s.name_en}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {isAr ? s.short_description_ar : s.short_description_en}
                    </p>
                    {s.estimated_price_min && (
                      <p className="text-sm font-medium text-primary">
                        {isAr ? "ابتداءً من " : "Starts from "}
                        {formatCurrency(s.estimated_price_min, s.currency, isAr ? "ar-EG" : "en-US")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {show("cta") && (
        <section className="container py-16">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-4xl font-bold">
              {isAr ? "جاهز لإطلاق مشروعك التالي؟" : "Ready for your next project?"}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              {isAr ? "تواصل معنا اليوم — محادثة استكشاف مجانية، وعرض سعر شفاف." : "Reach out today — free scoping call, transparent quote."}
            </p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Button asChild size="lg">
                <Link href="/contact">
                  {isAr ? "تواصل معنا" : "Contact us"}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <WhatsAppButton variant="inline" label={isAr ? "واتس آب" : "WhatsApp"} phoneNumber={waNumber} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
