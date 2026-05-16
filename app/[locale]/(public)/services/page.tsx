import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  listVisibleCategories,
  listVisibleServices,
  searchVisibleServices,
} from "@/lib/queries/services";
import { ServiceCardMini } from "@/components/public/service-card-mini";
import { SearchBar } from "@/components/public/search-bar";
import { FolderTree, ChevronDown } from "lucide-react";
import type { Category, Service } from "@/types/database";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الخدمات" : "Services",
    description:
      locale === "ar"
        ? "تصفح خدمات البرمجة والتصميم"
        : "Browse our programming and design services",
  };
}

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const tc = await getTranslations("common");

  const query = q?.trim() ?? "";
  const isSearching = query.length > 0;

  const [services, categories] = await Promise.all([
    isSearching ? searchVisibleServices(query) : listVisibleServices(),
    isSearching ? Promise.resolve([]) : listVisibleCategories(),
  ]);

  // ── Category hierarchy (only used when not searching) ──────────────────────
  const childrenOf = new Map<string | null, Category[]>();
  for (const c of categories) {
    const key = c.parent_id ?? null;
    const arr = childrenOf.get(key) ?? [];
    arr.push(c);
    childrenOf.set(key, arr);
  }

  const servicesByCat = new Map<string, Service[]>();
  const uncategorized: Service[] = [];
  for (const s of services) {
    if (!s.category_id) {
      uncategorized.push(s);
      continue;
    }
    const arr = servicesByCat.get(s.category_id) ?? [];
    arr.push(s);
    servicesByCat.set(s.category_id, arr);
  }

  function allServicesUnder(catId: string): Service[] {
    const direct = servicesByCat.get(catId) ?? [];
    const subs = childrenOf.get(catId) ?? [];
    return [...direct, ...subs.flatMap((c) => allServicesUnder(c.id))];
  }

  const rootCats = (childrenOf.get(null) ?? []).filter(
    (c) => allServicesUnder(c.id).length > 0
  );

  const featured = services.filter((s) => s.is_featured).slice(0, 6);

  return (
    <div className="container py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">{tc("services")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {isAr
            ? "تصفح كل خدماتنا منظّمة حسب القسم — اضغط على أي خدمة لمعرفة التفاصيل"
            : "Browse all our services organized by category — click any service for details"}
        </p>
      </header>

      {/* Search bar */}
      <div className="mb-10 max-w-md mx-auto">
        <SearchBar
          placeholder={isAr ? "ابحث في الخدمات..." : "Search services..."}
        />
      </div>

      {/* ── Search results ────────────────────────────────────────────────── */}
      {isSearching ? (
        <div>
          <p className="text-sm text-muted-foreground mb-6">
            {isAr
              ? `${services.length} نتيجة لـ "${query}"`
              : `${services.length} result${services.length !== 1 ? "s" : ""} for "${query}"`}
          </p>
          {services.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {isAr ? "لا توجد خدمات تطابق بحثك" : "No services match your search"}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCardMini key={s.id} service={s} locale={locale} />
              ))}
            </div>
          )}
        </div>
      ) : services.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {isAr ? "لا توجد خدمات معروضة حالياً" : "No services available yet"}
        </p>
      ) : (
        <>
          {/* Quick anchors to main categories */}
          {rootCats.length > 1 && (
            <nav className="mb-12 flex flex-wrap justify-center gap-2">
              {rootCats.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-1.5 text-sm font-medium hover:bg-muted transition"
                >
                  <FolderTree className="h-3.5 w-3.5" />
                  {isAr ? cat.name_ar : cat.name_en}
                  <span className="text-xs text-muted-foreground">
                    ({allServicesUnder(cat.id).length})
                  </span>
                </a>
              ))}
            </nav>
          )}

          {/* Featured services strip */}
          {featured.length > 0 && (
            <section className="mb-14">
              <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2">
                ⭐ {isAr ? "الخدمات المميزة" : "Featured services"}
              </h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((s) => (
                  <ServiceCardMini key={s.id} service={s} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {/* Hierarchy: main category → sub-category → services */}
          <div className="space-y-16">
            {rootCats.map((rootCat) => {
              const subs = childrenOf.get(rootCat.id) ?? [];
              const directServices = servicesByCat.get(rootCat.id) ?? [];

              return (
                <section key={rootCat.id} id={`cat-${rootCat.slug}`} className="scroll-mt-20">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-primary/20">
                    {rootCat.image_url && (
                      <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={rootCat.image_url}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold">
                        {isAr ? rootCat.name_ar : rootCat.name_en}
                      </h2>
                      {(isAr ? rootCat.description_ar : rootCat.description_en) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {isAr ? rootCat.description_ar : rootCat.description_en}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ms-auto">
                      {allServicesUnder(rootCat.id).length}{" "}
                      {isAr ? "خدمة" : "services"}
                    </Badge>
                  </div>

                  {directServices.length > 0 && (
                    <div className="mb-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {directServices.map((s) => (
                        <ServiceCardMini key={s.id} service={s} locale={locale} />
                      ))}
                    </div>
                  )}

                  {subs.map((sub) => {
                    const subServices = servicesByCat.get(sub.id) ?? [];
                    if (subServices.length === 0) return null;
                    return (
                      <div key={sub.id} className="mb-8">
                        <div className="flex items-center gap-2 mb-3 ps-2 border-s-4 border-primary/40">
                          <h3 className="text-lg font-semibold inline-flex items-center gap-2">
                            <ChevronDown className="h-4 w-4 text-primary" />
                            {isAr ? sub.name_ar : sub.name_en}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            ({subServices.length})
                          </span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 ps-6">
                          {subServices.map((s) => (
                            <ServiceCardMini key={s.id} service={s} locale={locale} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </section>
              );
            })}

            {/* Uncategorized services (orphaned when their category was deleted) */}
            {uncategorized.length > 0 && (
              <section className="scroll-mt-20">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-muted-foreground/20">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {isAr ? "خدمات أخرى" : "Other services"}
                    </h2>
                  </div>
                  <Badge variant="secondary" className="ms-auto">
                    {uncategorized.length} {isAr ? "خدمة" : "services"}
                  </Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {uncategorized.map((s) => (
                    <ServiceCardMini key={s.id} service={s} locale={locale} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
