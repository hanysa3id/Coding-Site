import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { Plus, Pencil } from "lucide-react";
import type { PortfolioProject } from "@/types/database";

export default async function AdminPortfolioPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? "معرض الأعمال" : "Portfolio"}</h1>
          <p className="text-muted-foreground">
            {isAr ? "إدارة المشاريع المنفذة" : "Manage completed projects"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/portfolio/new">
            <Plus className="h-4 w-4" />
            {isAr ? "مشروع جديد" : "New project"}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {!projects || projects.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {isAr ? "لا توجد مشاريع بعد" : "No projects yet"}
            </p>
          ) : (
            <ul className="divide-y">
              {(projects as PortfolioProject[]).map((p) => (
                <li key={p.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {p.cover_image && (
                      <div
                        className="h-12 w-12 shrink-0 rounded bg-cover bg-center"
                        style={{ backgroundImage: `url(${p.cover_image})` }}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {isAr ? p.title_ar : p.title_en}
                        </span>
                        {!p.is_visible && (
                          <Badge variant="secondary">{isAr ? "مخفي" : "Hidden"}</Badge>
                        )}
                        {p.is_featured && <Badge>{isAr ? "مميز" : "Featured"}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {p.client_name ?? "—"}
                        {p.delivery_date && ` · ${p.delivery_date}`}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/admin/portfolio/${p.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
