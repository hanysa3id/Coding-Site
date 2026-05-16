import { getLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReviewForm } from "./review-form";

export default async function ReviewPage({
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
    .select("id, status, customer_id, services(name_ar, name_en)")
    .eq("id", id)
    .single();

  if (!order || order.customer_id !== profile.id) notFound();
  if (!["delivered", "completed"].includes(order.status as string)) {
    redirect(`/${locale}/orders/${id}`);
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", id)
    .maybeSingle();

  if (existing) {
    redirect(`/${locale}/orders/${id}`);
  }

  const svc = (order as unknown as { services: { name_ar: string; name_en: string } | null }).services;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "تقييم الخدمة" : "Rate the service"}</CardTitle>
          <CardDescription>
            {svc ? (isAr ? svc.name_ar : svc.name_en) : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewForm orderId={id} locale={locale} />
        </CardContent>
      </Card>
    </div>
  );
}
