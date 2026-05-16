import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Users, Lock } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import type { UserGroup } from "@/types/database";

type GroupWithCount = UserGroup & { members_count: number };

export default async function AdminGroupsPage() {
  await requireAdmin();
  const locale = await getLocale();
  const isAr = locale === "ar";
  const supabase = await createClient();

  const { data: groups } = await supabase
    .from("user_groups")
    .select("*")
    .order("name_en", { ascending: true });

  // Member counts in a second query (avoids needing a complex select join)
  const ids = (groups as UserGroup[] | null)?.map((g) => g.id) ?? [];
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: memberRows } = await supabase
      .from("user_group_members")
      .select("group_id")
      .in("group_id", ids);
    for (const r of (memberRows as { group_id: string }[] | null) ?? []) {
      counts.set(r.group_id, (counts.get(r.group_id) ?? 0) + 1);
    }
  }

  const list: GroupWithCount[] = ((groups as UserGroup[]) ?? []).map((g) => ({
    ...g,
    members_count: counts.get(g.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold inline-flex items-center gap-2">
            <Users className="h-7 w-7" />
            {isAr ? "مجموعات المستخدمين" : "User groups"}
          </h1>
          <p className="text-muted-foreground">
            {isAr
              ? "أنشئ مجموعات مخصصة لإدارة الصلاحيات أو وسم العملاء"
              : "Create groups to tag customers or grant fine-grained permissions"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/groups/new">
            <Plus className="h-4 w-4" />
            {isAr ? "مجموعة جديدة" : "New group"}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">
              {isAr ? "لا توجد مجموعات بعد" : "No groups yet"}
            </p>
          ) : (
            <ul className="divide-y">
              {list.map((g) => (
                <li key={g.id} className="flex items-center justify-between p-4 hover:bg-muted/30">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ background: g.color ?? "#6b7280" }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {isAr ? g.name_ar : g.name_en}
                        </span>
                        {g.is_system && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            {isAr ? "نظامية" : "System"}
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {g.members_count} {isAr ? "عضو" : "members"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <code>{g.slug}</code>
                        {(g.description_en || g.description_ar) && (
                          <> · {isAr ? g.description_ar : g.description_en}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/admin/groups/${g.id}`}>
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
