import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CsvPanel } from "@/components/admin/csv-panel";
import { AdminPagination } from "@/components/admin/pagination";
import { parsePage, pageRange, totalPages } from "@/lib/pagination";
import {
  exportBlogAction,
  importBlogAction,
  templateBlogAction,
} from "./csv-actions";
import type { BlogPost } from "@/types/database";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const range = pageRange(page);

  const supabase = await createClient();
  const { data: posts, count } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(range.from, range.to);
  const total = count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? "المدونة" : "Blog"}</h1>
          <p className="text-muted-foreground">
            {isAr ? "إدارة المقالات" : "Manage articles"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" />
            {isAr ? "مقالة جديدة" : "New post"}
          </Link>
        </Button>
      </div>

      <CsvPanel
        resourceAr="المدونة"
        resourceEn="blog"
        locale={locale}
        exportAction={exportBlogAction}
        templateAction={templateBlogAction}
        importAction={importBlogAction}
      />

      <Card>
        <CardContent className="p-0">
          {!posts || posts.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {isAr ? "لا توجد مقالات" : "No posts"}
            </p>
          ) : (
            <ul className="divide-y">
              {(posts as BlogPost[]).map((p) => (
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
                        <Badge variant={p.status === "published" ? "success" : "secondary"}>
                          {p.status === "published"
                            ? isAr ? "منشور" : "Published"
                            : isAr ? "مسودة" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <code className="text-xs">{p.slug}</code>
                        {p.published_at && (
                          <> · {formatDate(p.published_at, isAr ? "ar-EG" : "en-US")}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/admin/blog/${p.id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
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
        basePath="/admin/blog"
        locale={locale}
      />
    </div>
  );
}
