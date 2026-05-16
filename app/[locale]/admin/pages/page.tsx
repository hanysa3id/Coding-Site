import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, FileText, Eye, Lock } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPagination } from "@/components/admin/pagination";
import { parsePage, pageRange, totalPages } from "@/lib/pagination";
import type { CmsPage } from "@/types/database";

export default async function AdminPagesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  await requireAdmin();

  const sp = await searchParams;
  const page = parsePage(sp.page);
  const range = pageRange(page);

  const supabase = await createClient();
  const { data: rows, count } = await supabase
    .from("cms_pages")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(range.from, range.to);
  const total = count ?? 0;

  const pages = (rows as CmsPage[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold inline-flex items-center gap-2">
            <FileText className="h-7 w-7" />
            {isAr ? "صفحات الموقع" : "Site pages"}
          </h1>
          <p className="text-muted-foreground">
            {isAr
              ? "إدارة الصفحات الثابتة (سياسة الخصوصية، الشروط، إلخ)"
              : "Manage static pages (Privacy, Terms, etc.)"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4" />
            {isAr ? "صفحة جديدة" : "New page"}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {pages.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {isAr ? "لا توجد صفحات بعد" : "No pages yet"}
            </p>
          ) : (
            <ul className="divide-y">
              {pages.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {isAr ? p.title_ar : p.title_en}
                        </span>
                        <Badge variant={p.status === "published" ? "success" : "secondary"}>
                          {p.status === "published"
                            ? isAr ? "منشور" : "Published"
                            : isAr ? "مسودة" : "Draft"}
                        </Badge>
                        {p.show_in_footer && (
                          <Badge variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            {isAr ? "في الفوتر" : "In footer"}
                          </Badge>
                        )}
                        {p.is_system && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            {isAr ? "نظامية" : "System"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <code className="text-xs">/p/{p.slug}</code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.status === "published" && (
                      <Button asChild size="icon" variant="ghost" title={isAr ? "معاينة" : "Preview"}>
                        <Link href={`/p/${p.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="icon" variant="ghost">
                      <Link href={`/admin/pages/${p.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AdminPagination
        page={page}
        totalPages={totalPages(total)}
        totalItems={total}
        basePath="/admin/pages"
        locale={locale}
      />
    </div>
  );
}
