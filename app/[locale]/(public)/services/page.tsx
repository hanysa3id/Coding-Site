import { setRequestLocale, getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listVisibleCategories, listVisibleServices } from "@/lib/queries/services";
import { formatCurrency } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الخدمات" : "Services",
    description: locale === "ar"
      ? "تصفح خدمات البرمجة والتصميم"
      : "Browse our programming and design services",
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const tc = await getTranslations("common");

  const [services, categories] = await Promise.all([
    listVisibleServices(),
    listVisibleCategories(),
  ]);

  // Group services by category (only root categories, but show all services under them)
  const rootCats = categories.filter((c) => !c.parent_id);
  const byCategory = new Map<string, typeof services>();
  for (const s of services) {
    const arr = byCategory.get(s.category_id) ?? [];
    arr.push(s);
    byCategory.set(s.category_id, arr);
  }

  return (
    <div className="container py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{tc("services")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {isAr
            ? "تصفح خدماتنا واختر ما يناسب احتياجاتك"
            : "Browse our services and pick what fits your needs"}
        </p>
      </header>

      {services.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {isAr ? "لا توجد خدمات معروضة حالياً" : "No services available right now"}
        </p>
      ) : (
        <div className="space-y-12">
          {rootCats.map((cat) => {
            const subCats = categories.filter((c) => c.parent_id === cat.id);
            const directServices = byCategory.get(cat.id) ?? [];
            const allCatIds = [cat.id, ...subCats.map((s) => s.id)];
            const allServices = allCatIds.flatMap((id) => byCategory.get(id) ?? []);
            if (allServices.length === 0) return null;

            return (
              <section key={cat.id}>
                <h2 className="text-2xl font-bold mb-6">
                  {isAr ? cat.name_ar : cat.name_en}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allServices.map((s) => (
                    <Link key={s.id} href={`/services/${s.slug}`} className="block">
                      <Card className="h-full transition hover:shadow-md">
                        {s.cover_image && (
                          <div
                            className="h-48 rounded-t-lg bg-cover bg-center"
                            style={{ backgroundImage: `url(${s.cover_image})` }}
                          />
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {isAr ? s.name_ar : s.name_en}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {isAr ? s.short_description_ar : s.short_description_en}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            {s.estimated_price_min && (
                              <span className="font-medium text-primary">
                                {isAr ? "من " : "From "}
                                {formatCurrency(
                                  s.estimated_price_min,
                                  s.currency,
                                  isAr ? "ar-EG" : "en-US"
                                )}
                              </span>
                            )}
                            {s.estimated_duration_days && (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {s.estimated_duration_days} {isAr ? "يوم" : "days"}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
