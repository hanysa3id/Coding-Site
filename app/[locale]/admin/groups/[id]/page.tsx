import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupForm } from "../group-form";
import { GroupMembers } from "../group-members";
import type { UserGroup, Profile } from "@/types/database";

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";

  const supabase = await createClient();
  const { data: groupData } = await supabase
    .from("user_groups")
    .select("*")
    .eq("id", id)
    .single();

  const group = groupData as UserGroup | null;
  if (!group) notFound();

  // Members: join via user_group_members → profiles
  const { data: memberRows } = await supabase
    .from("user_group_members")
    .select("user_id, profiles!user_group_members_user_id_fkey(id, full_name, email, role)")
    .eq("group_id", id);

  type MemberRow = {
    user_id: string;
    profiles: { id: string; full_name: string | null; email: string | null; role: Profile["role"] } | null;
  };
  const members =
    (memberRows as unknown as MemberRow[] | null)
      ?.map((r) => r.profiles)
      .filter((p): p is NonNullable<MemberRow["profiles"]> => !!p) ?? [];

  // Candidates: all profiles (limit to 500 for the dropdown; UI has filter)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .limit(500);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold">
        {isAr ? "المجموعة: " : "Group: "}
        {isAr ? group.name_ar : group.name_en}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isAr ? "بيانات المجموعة" : "Group details"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GroupForm initial={group} locale={locale} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isAr ? "أعضاء المجموعة" : "Members"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GroupMembers
              groupId={group.id}
              members={members}
              candidates={(profiles as Profile[]) ?? []}
              locale={locale}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
