import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  getOrderForAdmin,
  listOrderMessages,
  listOrderMilestones,
  listOrderDeliverables,
  listOrderPayments,
} from "@/lib/queries/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { MessageThread } from "@/components/orders/message-thread";
import { CustomerAttachmentsDisplay } from "@/components/orders/customer-attachments-display";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { sendStaffMessageAction } from "../actions";
import { NegotiationPanel } from "./_components/negotiation-panel";
import { StatusChanger } from "./_components/status-changer";
import { StaffAssigner } from "./_components/staff-assigner";
import { MilestonesEditor } from "./_components/milestones-editor";
import { DeliverableUploader } from "./_components/deliverable-uploader";
import { DeliverableRow } from "./_components/deliverable-row";
import type { Profile } from "@/types/database";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";
  const profile = await requireStaff();

  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const [messages, milestones, deliverables, payments, staffProfiles] = await Promise.all([
    listOrderMessages(id),
    listOrderMilestones(id),
    listOrderDeliverables(id),
    listOrderPayments(id),
    listStaffProfiles(),
  ]);

  const finalAmount = order.final_price ?? order.estimated_price;

  return (
    <div className="space-y-6 max-w-6xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <code className="text-xs">{order.order_number}</code>
            <OrderStatusBadge status={order.status} locale={locale} />
          </div>
          <h1 className="text-2xl font-bold">
            {order.services
              ? isAr
                ? order.services.name_ar
                : order.services.name_en
              : "—"}
          </h1>
        </div>
        {order.customer?.whatsapp_number || order.customer?.phone ? (
          <WhatsAppButton
            variant="inline"
            phoneNumber={
              (order.customer.whatsapp_number || order.customer.phone) as string
            }
            context={{
              type: "order",
              orderNumber: order.order_number,
              serviceName: isAr ? order.services?.name_ar : order.services?.name_en,
            }}
            label={isAr ? "محادثة مع العميل" : "Chat with customer"}
          />
        ) : null}
      </header>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {isAr ? "العميل" : "Customer"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold truncate">{order.customer?.full_name ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate">{order.customer?.email}</p>
            {order.customer?.phone && (
              <p className="text-xs text-muted-foreground" dir="ltr">
                {order.customer.phone}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {isAr ? "السعر" : "Price"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg">
              {finalAmount
                ? formatCurrency(finalAmount, order.currency, isAr ? "ar-EG" : "en-US")
                : "—"}
            </p>
            {order.final_price && order.estimated_price !== order.final_price && (
              <p className="text-xs text-muted-foreground">
                {isAr ? "تقديري: " : "Est: "}
                {formatCurrency(order.estimated_price!, order.currency, isAr ? "ar-EG" : "en-US")}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {isAr ? "المدة" : "Duration"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg">
              {order.final_duration_days ?? order.estimated_duration_days ?? "—"}{" "}
              <span className="text-sm font-normal">{isAr ? "يوم" : "days"}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {isAr ? "الدفع" : "Payment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg">
              {payments.some((p) => p.status === "paid")
                ? isAr ? "مدفوع" : "Paid"
                : isAr ? "غير مدفوع" : "Unpaid"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage">
        <TabsList>
          <TabsTrigger value="manage">{isAr ? "إدارة" : "Manage"}</TabsTrigger>
          <TabsTrigger value="milestones">{isAr ? "المراحل" : "Milestones"}</TabsTrigger>
          <TabsTrigger value="deliverables">{isAr ? "التسليمات" : "Deliverables"}</TabsTrigger>
          <TabsTrigger value="messages">{isAr ? "المحادثة" : "Messages"}</TabsTrigger>
          <TabsTrigger value="info">{isAr ? "بيانات" : "Info"}</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isAr ? "التفاوض على السعر والمدة" : "Negotiate price & duration"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NegotiationPanel order={order} locale={locale} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isAr ? "تغيير الحالة" : "Change status"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatusChanger
                orderId={order.id}
                currentStatus={order.status}
                locale={locale}
              />
            </CardContent>
          </Card>

          {profile.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isAr ? "تعيين الفريق" : "Assign team"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StaffAssigner
                  orderId={order.id}
                  currentSalesId={order.sales_id}
                  currentStaffId={order.assigned_staff_id}
                  staffProfiles={staffProfiles}
                  locale={locale}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4 pt-4">
          <MilestonesEditor orderId={order.id} milestones={milestones} locale={locale} />
        </TabsContent>

        <TabsContent value="deliverables" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{isAr ? "رفع ملف" : "Upload file"}</CardTitle>
            </CardHeader>
            <CardContent>
              <DeliverableUploader orderId={order.id} locale={locale} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              {deliverables.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {isAr ? "لا توجد ملفات بعد" : "No files yet"}
                </p>
              ) : (
                <ul className="divide-y">
                  {deliverables.map((d) => (
                    <DeliverableRow
                      key={d.id}
                      deliverable={d}
                      orderId={order.id}
                      locale={locale}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <MessageThread
                orderId={order.id}
                currentUserId={profile.id}
                messages={messages}
                locale={locale}
                sendAction={sendStaffMessageAction}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="pt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isAr ? "رسالة العميل ومرفقاته" : "Customer message & attachments"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm whitespace-pre-line">
                {order.customer_message ?? "—"}
              </p>
              {(order.customer_attachments ?? []).length > 0 && (
                <CustomerAttachmentsDisplay
                  attachments={order.customer_attachments ?? []}
                  locale={locale}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isAr ? "المدفوعات" : "Payments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isAr ? "لا توجد مدفوعات" : "No payments"}
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {payments.map((p) => (
                    <li key={p.id} className="flex justify-between gap-2">
                      <span>
                        {formatCurrency(p.amount, p.currency, isAr ? "ar-EG" : "en-US")} · {p.method}
                      </span>
                      <span className="text-muted-foreground">
                        {p.status} · {formatDateTime(p.created_at, isAr ? "ar-EG" : "en-US")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{isAr ? "التواريخ" : "Timeline"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>
                <strong>{isAr ? "أُنشئ: " : "Created: "}</strong>
                {formatDateTime(order.created_at, isAr ? "ar-EG" : "en-US")}
              </p>
              <p>
                <strong>{isAr ? "آخر تحديث: " : "Updated: "}</strong>
                {formatDateTime(order.updated_at, isAr ? "ar-EG" : "en-US")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

async function listStaffProfiles() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["admin", "sales", "staff"]);
  return (data as unknown as Pick<Profile, "id" | "full_name" | "email" | "role">[]) ?? [];
}
