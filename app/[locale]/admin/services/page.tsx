import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import {
  Plus,
  Pencil,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  Layers,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CsvPanel } from "@/components/admin/csv-panel";
import { ServicesFilters } from "./services-filters";
import { ServiceToggleButtons } from "./service-toggle-buttons";
import {
  exportServicesAction,
  importServicesAction,
  templateServicesAction,
} from "./csv-actions";
import type { Service, Category } from "@/types/database";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const intlLocale = isAr ? "ar-EG" : "en-US";
  const sp = await searchParams;

  const q = (sp.q ?? "").toLowerCase();
  const filterCat = sp.cat && sp.cat !== "all" ? sp.cat : null;
  const filterVisibility = sp.visibility && sp.visibility !== "all" ? sp.visibility : null;
  const filterFeatured = sp.featured && sp.featured !== "all" ? sp.featured : null;

  const supabase = await createClient();

  const [{ data: services }, { data: categories }] = await Promise.all([
    supabase.from("services").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  const allServices = (services as Service[]) ?? [];
  const allCategories = (categories as Category[]) ?? [];

  const catMap = new Map<string, Category>(allCategories.map((c) => [c.id, c]));

  // Stats from full dataset
  const totalServices = allServices.length;
  const visibleCount = allServices.filter((s) => s.is_visible).length;
  const hiddenCount = totalServices - visibleCount;
  const featuredCount = allServices.filter((s) => s.is_featured).length;

  // Apply filters in JS (dataset is small enough)
  let filtered = allServices;
  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.name_ar.toLowerCase().includes(q) ||
        s.name_en.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }
  if (filterCat) filtered = filtered.filter((s) => s.category_id === filterCat);
  if (filterVisibility === "visible") filtered = filtered.filter((s) => s.is_visible);
  if (filterVisibility === "hidden") filtered = filtered.filter((s) => !s.is_visible);
  if (filterFeatured === "yes") filtered = filtered.filter((s) => s.is_featured);
  if (filterFeatured === "no") filtered = filtered.filter((s) => !s.is_featured);

  const categoryOptions = allCategories.map((c) => ({
    id: c.id,
    name: isAr ? c.name_ar : c.name_en,
  }));

  const stats = [
    {
      label: isAr ? "إجمالي الخدمات" : "Total services",
      value: totalServices,
      icon: Layers,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: isAr ? "مرئية" : "Visible",
      value: visibleCount,
      icon: Eye,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: isAr ? "مخفية" : "Hidden",
      value: hiddenCount,
      icon: EyeOff,
      accent: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    },
    {
      label: isAr ? "مميزة" : "Featured",
      value: featuredCount,
      icon: Star,
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? "الخدمات" : "Services"}</h1>
          <p className="text-muted-foreground text-sm">
            {isAr ? "إدارة الخدمات المعروضة" : "Manage offered services"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="h-4 w-4" />
            {isAr ? "خدمة جديدة" : "New service"}
          </Link>
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-lg p-2 ${t.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t.label}</p>
                  <p className="text-xl font-bold mt-0.5 tabular-nums">
                    {t.value.toLocaleString(intlLocale)}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ServicesFilters
        locale={locale}
        categories={categoryOptions}
        totalShowing={filtered.length}
        total={totalServices}
      />

      <CsvPanel
        resourceAr="الخدمات"
        resourceEn="services"
        locale={locale}
        exportAction={exportServicesAction}
        templateAction={templateServicesAction}
        importAction={importServicesAction}
      />

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>{isAr ? "لا توجد خدمات تطابق الفلاتر" : "No services match the filters"}</p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((s) => {
                const cat = s.category_id ? catMap.get(s.category_id) : undefined;
                return (
                  <li
                    key={s.id}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/30 transition ${
                      !s.is_visible ? "opacity-60" : ""
                    }`}
                  >
                    {/* Cover image */}
                    <div
                      className="h-12 w-12 shrink-0 rounded-md bg-muted bg-cover bg-center border"
                      style={
                        s.cover_image
                          ? { backgroundImage: `url(${s.cover_image})` }
                          : undefined
                      }
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-medium truncate">
                          {isAr ? s.name_ar : s.name_en}
                        </span>
                        {s.is_featured && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        )}
                        {!s.is_visible && (
                          <span className="text-[10px] rounded border border-dashed px-1.5 text-muted-foreground">
                            {isAr ? "مخفي" : "hidden"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {cat ? (
                          <span>{isAr ? cat.name_ar : cat.name_en}</span>
                        ) : (
                          <span className="rounded border border-dashed border-amber-400 px-1.5 text-amber-600">
                            {isAr ? "بدون قسم" : "Uncategorized"}
                          </span>
                        )}
                        {s.estimated_price_min && (
                          <>
                            <span>·</span>
                            <span>
                              {isAr ? "من " : "from "}
                              {formatCurrency(
                                s.estimated_price_min,
                                s.currency,
                                intlLocale
                              )}
                            </span>
                          </>
                        )}
                        {s.estimated_duration_days && (
                          <>
                            <span>·</span>
                            <span>
                              {s.estimated_duration_days}{" "}
                              {isAr ? "يوم" : "days"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quick toggles */}
                    <ServiceToggleButtons
                      id={s.id}
                      isVisible={s.is_visible}
                      isFeatured={!!s.is_featured}
                      locale={locale}
                    />

                    {/* Edit link */}
                    <Button asChild size="icon" variant="ghost">
                      <Link href={`/admin/services/${s.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
