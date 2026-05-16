import { getLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { NewOrderForm } from "./new-order-form";
import { formatCurrency } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { Service } from "@/types/database";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service: serviceId } = await searchParams;
  if (!serviceId) notFound();

  const locale = await getLocale();
  const isAr = locale === "ar";
  const profile = await requireUser();

  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("is_visible", true)
    .single();

  if (!service) notFound();

  const s = service as Service;
  const priceLabel = s.estimated_price_min
    ? formatCurrency(s.estimated_price_min, s.currency, isAr ? "ar-EG" : "en-US")
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">
          {isAr ? "طلب خدمة جديدة" : "Request a new service"}
        </h1>
        <p className="text-muted-foreground">
          {isAr ? "أدخل تفاصيل طلبك وسنرد عليك خلال 24 ساعة" : "Tell us about your request and we'll respond within 24 hours"}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{isAr ? s.name_ar : s.name_en}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isAr ? s.short_description_ar : s.short_description_en}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm mb-6 p-3 rounded-md bg-muted/30">
            {priceLabel && (
              <div>
                <span className="text-muted-foreground">
                  {isAr ? "السعر التقديري: " : "Estimated price: "}
                </span>
                <span className="font-semibold">{priceLabel}</span>
              </div>
            )}
            {s.estimated_duration_days && (
              <div className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {s.estimated_duration_days} {isAr ? "يوم" : "days"}
              </div>
            )}
          </div>

          <NewOrderForm
            serviceId={s.id}
            customerName={profile.full_name ?? ""}
            customerWhatsapp={profile.whatsapp_number ?? profile.phone ?? ""}
            locale={locale}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        {isAr
          ? "الأسعار والمدة المعروضة تقديرية. سيتم الاتفاق على القيم النهائية بعد مراجعة طلبك."
          : "Prices and duration shown are estimates. Final values will be agreed after reviewing your request."}
      </p>
    </div>
  );
}
