import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteSettingsForm } from "./_components/site-form";
import { WhatsappSettingsForm } from "./_components/whatsapp-form";
import { SeoSettingsForm } from "./_components/seo-form";
import { ContactSettingsForm } from "./_components/contact-form";
import { PaymentsSettingsForm } from "./_components/payments-form";
import { BankAccountsManager } from "./_components/bank-accounts-manager";
import { IntegrationsSettingsForm } from "./_components/integrations-form";
import { TelegramSettingsForm } from "./_components/telegram-form";
import { OrdersPolicyForm } from "./_components/orders-policy-form";
import { BusinessHoursForm } from "./_components/business-hours-form";
import { ThemeSettingsForm } from "./_components/theme-form";
import type { BankAccount } from "@/types/database";

export default async function AdminSettingsPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  await requireAdmin();

  const supabase = await createClient();
  const [{ data: settings }, { data: banks }] = await Promise.all([
    supabase.from("settings").select("key, value"),
    supabase.from("bank_accounts").select("*").order("sort_order", { ascending: true }),
  ]);

  const settingsMap = new Map<string, Record<string, unknown>>();
  for (const s of (settings as Array<{ key: string; value: Record<string, unknown> }>) ?? []) {
    settingsMap.set(s.key, s.value);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-3xl font-bold">{isAr ? "الإعدادات" : "Settings"}</h1>
        <p className="text-muted-foreground">
          {isAr ? "إدارة إعدادات الموقع" : "Manage site configuration"}
        </p>
      </header>

      <Tabs defaultValue="site">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="site">{isAr ? "الموقع" : "Site"}</TabsTrigger>
          <TabsTrigger value="theme">{isAr ? "المظهر" : "Theme"}</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="contact">{isAr ? "التواصل" : "Contact"}</TabsTrigger>
          <TabsTrigger value="hours">{isAr ? "ساعات العمل" : "Business hours"}</TabsTrigger>
          <TabsTrigger value="payments">{isAr ? "الدفع" : "Payments"}</TabsTrigger>
          <TabsTrigger value="banks">{isAr ? "الحسابات البنكية" : "Bank accounts"}</TabsTrigger>
          <TabsTrigger value="orders">{isAr ? "سياسة الطلبات" : "Orders policy"}</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="integrations">{isAr ? "التكاملات" : "Integrations"}</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "تصميم الموقع العام" : "Public site theme"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSettingsForm
                initial={settingsMap.get("theme") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "معلومات الموقع" : "Site information"}</CardTitle>
            </CardHeader>
            <CardContent>
              <SiteSettingsForm
                initial={settingsMap.get("site") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "إعدادات واتس آب" : "WhatsApp settings"}</CardTitle>
            </CardHeader>
            <CardContent>
              <WhatsappSettingsForm
                initial={settingsMap.get("whatsapp") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "معلومات التواصل" : "Contact information"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactSettingsForm
                initial={settingsMap.get("contact") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "إعدادات الدفع" : "Payment settings"}</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentsSettingsForm
                initial={settingsMap.get("payments") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banks" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "الحسابات البنكية" : "Bank accounts"}</CardTitle>
            </CardHeader>
            <CardContent>
              <BankAccountsManager
                accounts={(banks as BankAccount[]) ?? []}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "إعدادات SEO الافتراضية" : "Default SEO settings"}</CardTitle>
            </CardHeader>
            <CardContent>
              <SeoSettingsForm
                initial={settingsMap.get("seo") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "التكاملات والتحليلات" : "Integrations & analytics"}</CardTitle>
            </CardHeader>
            <CardContent>
              <IntegrationsSettingsForm
                initial={settingsMap.get("integrations") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "ساعات العمل" : "Business hours"}</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessHoursForm
                initial={settingsMap.get("business_hours") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "سياسة الطلبات" : "Orders policy"}</CardTitle>
            </CardHeader>
            <CardContent>
              <OrdersPolicyForm
                initial={settingsMap.get("orders_policy") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telegram" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isAr ? "إشعارات Telegram" : "Telegram notifications"}</CardTitle>
            </CardHeader>
            <CardContent>
              <TelegramSettingsForm
                initial={settingsMap.get("telegram") ?? null}
                locale={locale}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
