import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamManager } from "./team-manager";
import { AboutSettingsForm } from "./about-settings-form";
import type { TeamMember, AboutSettings } from "@/types/database";

const DEFAULT_ABOUT: AboutSettings = {
  mission_ar: "",
  mission_en: "",
  vision_ar: "",
  vision_en: "",
  stats: [],
};

export default async function AdminTeamPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  await requireAdmin();

  const supabase = await createClient();
  const [{ data: members }, { data: aboutSetting }] = await Promise.all([
    supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("settings").select("value").eq("key", "about").single(),
  ]);

  const about: AboutSettings = (aboutSetting?.value as unknown as AboutSettings) ?? DEFAULT_ABOUT;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "الفريق وصفحة About" : "Team & About page"}</h1>
        <p className="text-muted-foreground text-sm">
          {isAr
            ? "إدارة أعضاء الفريق ومحتوى صفحة من نحن"
            : "Manage team members and About page content"}
        </p>
      </div>

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">{isAr ? "الفريق" : "Team"}</TabsTrigger>
          <TabsTrigger value="about">{isAr ? "إعدادات الصفحة" : "Page settings"}</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="pt-4">
          <TeamManager
            initialMembers={(members as TeamMember[]) ?? []}
            locale={locale}
          />
        </TabsContent>

        <TabsContent value="about" className="pt-4">
          <AboutSettingsForm initial={about} locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
