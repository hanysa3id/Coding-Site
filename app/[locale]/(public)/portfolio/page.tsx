import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioProject } from "@/types/database";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "معرض الأعمال" : "Portfolio",
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const tc = await getTranslations("common");

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="container py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{tc("portfolio")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {isAr ? "نماذج من أعمالنا السابقة" : "Samples of our previous work"}
        </p>
      </header>

      {!projects || projects.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {isAr ? "لا توجد مشاريع معروضة حالياً" : "No projects to display yet"}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(projects as PortfolioProject[]).map((p) => (
            <Link key={p.id} href={`/portfolio/${p.slug}`}>
              <Card className="h-full overflow-hidden transition hover:shadow-md">
                {p.cover_image ? (
                  <div className="relative aspect-video">
                    <Image
                      src={p.cover_image}
                      alt={isAr ? p.title_ar : p.title_en}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted" />
                )}
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isAr ? p.title_ar : p.title_en}
                  </CardTitle>
                  {p.client_name && (
                    <p className="text-sm text-muted-foreground">{p.client_name}</p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
