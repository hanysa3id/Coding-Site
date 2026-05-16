import { getLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayMobPayPanel } from "./paymob-panel";
import { OfflinePayPanel } from "./offline-panel";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Banknote } from "lucide-react";
import { getPaymentsSettings } from "@/lib/settings/get";
import type { BankAccount } from "@/types/database";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const isAr = locale === "ar";
  const profile = await requireUser();

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, final_price, estimated_price, currency, customer_id, services(name_ar, name_en)")
    .eq("id", id)
    .single();

  if (!order || order.customer_id !== profile.id) notFound();
  if (order.status !== "awaiting_payment") {
    redirect(`/${locale}/orders/${id}`);
  }

  const amount = order.final_price ?? order.estimated_price ?? 0;
  const svc = (order as unknown as { services: { name_ar: string; name_en: string } | null }).services;

  const { data: banks } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  // PayMob is enabled only if admin turned it on AND the env credentials are present
  const paymentsCfg = await getPaymentsSettings();
  const paymobEnabled =
    (paymentsCfg?.paymob_enabled ?? false) && !!process.env.PAYMOB_INTEGRATION_ID_CARD;
  const offlineEnabled = paymentsCfg?.offline_enabled ?? true;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "إتمام الدفع" : "Complete payment"}</CardTitle>
          <CardDescription>
            <span className="block">
              <code className="text-xs">{order.order_number}</code>
              {svc && (
                <>
                  {" · "}
                  {isAr ? svc.name_ar : svc.name_en}
                </>
              )}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-md bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              {isAr ? "المبلغ المطلوب" : "Amount due"}
            </p>
            <p className="text-3xl font-bold mt-1">
              {formatCurrency(amount, order.currency, isAr ? "ar-EG" : "en-US")}
            </p>
          </div>

          {!paymobEnabled && !offlineEnabled && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm">
              {isAr
                ? "لا توجد طرق دفع متاحة حالياً. تواصل مع الإدارة."
                : "No payment methods are available right now. Please contact support."}
            </div>
          )}

          <Tabs defaultValue={paymobEnabled ? "paymob" : "offline"}>
            <TabsList className="w-full">
              {paymobEnabled && (
                <TabsTrigger value="paymob" className="flex-1 gap-2">
                  <CreditCard className="h-4 w-4" />
                  {isAr ? "بطاقة ائتمان" : "Card"}
                </TabsTrigger>
              )}
              {offlineEnabled && (
                <TabsTrigger value="offline" className="flex-1 gap-2">
                  <Banknote className="h-4 w-4" />
                  {isAr ? "تحويل / كاش" : "Transfer / Cash"}
                </TabsTrigger>
              )}
            </TabsList>

            {paymobEnabled && (
              <TabsContent value="paymob" className="pt-4">
                <PayMobPayPanel orderId={id} locale={locale} />
              </TabsContent>
            )}

            {offlineEnabled && (
            <TabsContent value="offline" className="pt-4 space-y-4">
              {banks && banks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {isAr ? "حسابات الاستلام" : "Receiving accounts"}
                  </p>
                  <div className="space-y-2">
                    {(banks as BankAccount[]).map((b) => (
                      <div key={b.id} className="rounded-md border p-3 text-sm">
                        <p className="font-semibold">{isAr ? b.name_ar : b.name_en}</p>
                        <p className="text-muted-foreground">{b.bank_name}</p>
                        {b.account_number && (
                          <p dir="ltr" className="font-mono text-xs">{b.account_number}</p>
                        )}
                        {b.iban && (
                          <p dir="ltr" className="font-mono text-xs">IBAN: {b.iban}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <OfflinePayPanel orderId={id} locale={locale} />
            </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
