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
import { FolderTree, ChevronDown, Sparkles, Layers } from "lucide-react";
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
    <div className="container pb-16 pt-8">
      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <header className="mb-14 text-center relative">
        {/* Ambient glow behind heading */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 flex justify-center"
        >
          <div
            className="h-48 w-96 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, var(--pro-primary, #06b6d4), transparent 70%)",
            }}
          />
        </div>

        <div className="inline-flex items-center gap-2 pro-badge pro-badge-glow mb-4">
          <Layers className="h-3.5 w-3.5" />
          {isAr ? "خدماتنا" : "Our Services"}
        </div>

        <h1 className="pro-heading-glow pro-text-gradient-animate mb-4">
          {tc("services")}
        </h1>

        <p
          className="mt-3 max-w-2xl mx-auto text-lg"
          style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
        >
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
          <p
            className="text-sm mb-6"
            style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
          >
            {isAr
              ? `${services.length} نتيجة لـ "${query}"`
              : `${services.length} result${services.length !== 1 ? "s" : ""} for "${query}"`}
          </p>
          {services.length === 0 ? (
            <div className="text-center py-20">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{
                  background:
                    "color-mix(in srgb, var(--pro-primary, #06b6d4) 8%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 20%, transparent)",
                }}
              >
                <FolderTree
                  className="h-7 w-7"
                  style={{ color: "var(--pro-primary, #06b6d4)" }}
                />
              </div>
              <p style={{ color: "var(--pro-fg-muted, #94a3b8)" }}>
                {isAr ? "لا توجد خدمات تطابق بحثك" : "No services match your search"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCardMini key={s.id} service={s} locale={locale} />
              ))}
            </div>
          )}
        </div>
      ) : services.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
        >
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
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background:
                      "color-mix(in srgb, var(--pro-primary, #06b6d4) 6%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 20%, transparent)",
                    color: "var(--pro-fg-muted, #94a3b8)",
                  }}
                >
                  <FolderTree className="h-3.5 w-3.5" />
                  {isAr ? cat.name_ar : cat.name_en}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background:
                        "color-mix(in srgb, var(--pro-primary, #06b6d4) 15%, transparent)",
                      color: "var(--pro-primary, #06b6d4)",
                    }}
                  >
                    {allServicesUnder(cat.id).length}
                  </span>
                </a>
              ))}
            </nav>
          )}

          {/* Featured services strip */}
          {featured.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
                  style={{ color: "var(--pro-accent, #fbbf24)" }}
                >
                  <Sparkles className="h-4 w-4" />
                  {isAr ? "الخدمات المميزة" : "Featured services"}
                </div>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--pro-accent, #fbbf24) 30%, transparent), transparent)" }} />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  {/* Category heading with gradient underline */}
                  <div className="flex items-center gap-4 mb-8 pb-5" style={{ borderBottom: "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 20%, transparent)" }}>
                    {rootCat.image_url && (
                      <div
                        className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden"
                        style={{
                          border: "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 25%, transparent)",
                          boxShadow: "0 0 20px color-mix(in srgb, var(--pro-primary, #06b6d4) 10%, transparent)",
                        }}
                      >
                        <Image
                          src={rootCat.image_url}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--pro-fg, #f8fafc)" }}>
                        {isAr ? rootCat.name_ar : rootCat.name_en}
                      </h2>
                      {(isAr ? rootCat.description_ar : rootCat.description_en) && (
                        <p className="text-sm mt-1" style={{ color: "var(--pro-fg-muted, #94a3b8)" }}>
                          {isAr ? rootCat.description_ar : rootCat.description_en}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{
                        background: "color-mix(in srgb, var(--pro-primary, #06b6d4) 10%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 25%, transparent)",
                        color: "var(--pro-primary, #06b6d4)",
                      }}
                    >
                      {allServicesUnder(rootCat.id).length}{" "}
                      {isAr ? "خدمة" : "services"}
                    </span>
                  </div>

                  {directServices.length > 0 && (
                    <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {directServices.map((s) => (
                        <ServiceCardMini key={s.id} service={s} locale={locale} />
                      ))}
                    </div>
                  )}

                  {subs.map((sub) => {
                    const subServices = servicesByCat.get(sub.id) ?? [];
                    if (subServices.length === 0) return null;
                    const subDesc = isAr ? sub.description_ar : sub.description_en;
                    return (
                      <div key={sub.id} className="mb-8">
                        <div
                          className="flex items-start gap-3 mb-4 ps-4 py-2 rounded-lg"
                          style={{
                            borderInlineStart: "3px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 50%, transparent)",
                            background: "color-mix(in srgb, var(--pro-primary, #06b6d4) 4%, transparent)",
                          }}
                        >
                          {sub.image_url && (
                            <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={sub.image_url}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold inline-flex items-center gap-2" style={{ color: "var(--pro-fg, #f8fafc)" }}>
                              <ChevronDown className="h-4 w-4" style={{ color: "var(--pro-primary, #06b6d4)" }} />
                              {isAr ? sub.name_ar : sub.name_en}
                              <span
                                className="text-xs font-normal px-2 py-0.5 rounded-full"
                                style={{
                                  background: "color-mix(in srgb, var(--pro-secondary, #10b981) 10%, transparent)",
                                  color: "var(--pro-secondary, #10b981)",
                                }}
                              >
                                {subServices.length}
                              </span>
                            </h3>
                            {subDesc && (
                              <p className="text-xs mt-0.5" style={{ color: "var(--pro-fg-subtle, #64748b)" }}>
                                {subDesc}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ps-4">
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

            {/* Uncategorized services */}
            {uncategorized.length > 0 && (
              <section className="scroll-mt-20">
                <div
                  className="flex items-center gap-4 mb-8 pb-5"
                  style={{ borderBottom: "1px solid color-mix(in srgb, var(--pro-fg-subtle, #64748b) 20%, transparent)" }}
                >
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--pro-fg, #f8fafc)" }}>
                      {isAr ? "خدمات أخرى" : "Other services"}
                    </h2>
                  </div>
                  <Badge variant="secondary">{uncategorized.length} {isAr ? "خدمة" : "services"}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
