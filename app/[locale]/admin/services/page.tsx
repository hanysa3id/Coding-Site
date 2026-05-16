import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { Plus, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Service, Category } from "@/types/database";

export default async function AdminServicesPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const supabase = await createClient();

  const [{ data: services }, { data: categories }] = await Promise.all([
    supabase.from("services").select("*").order("sort_order", { ascending: true }),
    supabase.from("categories").select("*"),
  ]);

  const catMap = new Map<string, Category>(
    ((categories as Category[]) ?? []).map((c) => [c.id, c])
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? "الخدمات" : "Services"}</h1>
          <p className="text-muted-foreground">
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

      <Card>
        <CardContent className="p-0">
          {!services || services.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {isAr ? "لا توجد خدمات بعد" : "No services yet"}
            </p>
          ) : (
            <ul className="divide-y">
              {(services as Service[]).map((s) => {
                const cat = catMap.get(s.category_id);
                return (
                  <li key={s.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {s.cover_image && (
                        <div
                          className="h-12 w-12 shrink-0 rounded bg-cover bg-center"
                          style={{ backgroundImage: `url(${s.cover_image})` }}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {isAr ? s.name_ar : s.name_en}
                          </span>
                          {!s.is_visible && (
                            <Badge variant="secondary">{isAr ? "مخفي" : "Hidden"}</Badge>
                          )}
                          {s.is_featured && (
                            <Badge>{isAr ? "مميز" : "Featured"}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cat ? (isAr ? cat.name_ar : cat.name_en) : "—"}
                          {s.estimated_price_min &&
                            ` · ${formatCurrency(s.estimated_price_min, s.currency, isAr ? "ar-EG" : "en-US")}`}
                          {s.estimated_duration_days && ` · ${s.estimated_duration_days} ${isAr ? "يوم" : "days"}`}
                        </p>
                      </div>
                    </div>
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
