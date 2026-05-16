import { getLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/public/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import { AvatarUploader } from "./avatar-uploader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Mail } from "lucide-react";

export default async function ProfilePage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const profile = await requireUser();

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("final_price, estimated_price, status")
    .eq("customer_id", profile.id);

  const stats = (
    (orders as Array<{ final_price: number | null; estimated_price: number | null; status: string }>) ?? []
  ).reduce(
    (a, o) => {
      a.total += 1;
      if (["completed", "delivered", "in_progress"].includes(o.status)) {
        a.spent += Number(o.final_price ?? o.estimated_price ?? 0);
      }
      if (o.status === "completed") a.completed += 1;
      if (["in_progress", "awaiting_payment", "under_negotiation", "pending_review"].includes(o.status))
        a.active += 1;
      return a;
    },
    { total: 0, active: 0, completed: 0, spent: 0 }
  );

  return (
    <>
      <SiteHeader />
      <main className="container py-8 max-w-4xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold">{isAr ? "ملفي الشخصي" : "My profile"}</h1>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                {isAr ? "إجمالي الطلبات" : "Total orders"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                {isAr ? "النشطة" : "Active"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                {isAr ? "المكتملة" : "Completed"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">
                {isAr ? "إجمالي المنفق" : "Total spent"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.spent, "EGP", isAr ? "ar-EG" : "en-US")}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>{profile.full_name ?? "—"}</CardTitle>
                <CardDescription className="inline-flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span dir="ltr">{profile.email}</span>
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {isAr ? "انضم في " : "Joined "}
                {formatDate(profile.created_at, isAr ? "ar-EG" : "en-US")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <AvatarUploader
              currentUrl={profile.avatar_url}
              fullName={profile.full_name}
              locale={locale}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">
              {isAr ? "المعلومات الشخصية" : "Personal info"}
            </TabsTrigger>
            <TabsTrigger value="password">
              {isAr ? "كلمة المرور" : "Password"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <ProfileForm
                  initial={{
                    full_name: profile.full_name ?? "",
                    phone: profile.phone,
                    whatsapp_number: profile.whatsapp_number,
                    locale: (profile.locale ?? "ar") as "ar" | "en",
                  }}
                  locale={locale}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <ChangePasswordForm locale={locale} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
