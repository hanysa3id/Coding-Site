import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import {
  getOrderForCustomer,
  listOrderMessages,
  listOrderMilestones,
  listOrderDeliverables,
  listOrderPayments,
} from "@/lib/queries/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { MessageThread } from "@/components/orders/message-thread";
import { MilestonesList } from "@/components/orders/milestones-list";
import { DeliverablesList } from "@/components/orders/deliverables-list";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getWhatsappNumber } from "@/lib/settings/get";
import { Link } from "@/i18n/routing";
import { CheckCircle, XCircle, CreditCard, Star, MessageSquare } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { sendCustomerMessageAction } from "../actions";
import { OrderActionsClient } from "./order-actions-client";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const isAr = locale === "ar";
  const profile = await requireUser();

  const order = await getOrderForCustomer(id, profile.id);
  if (!order) notFound();

  const [messages, milestones, deliverables, payments] = await Promise.all([
    listOrderMessages(id),
    listOrderMilestones(id),
    listOrderDeliverables(id),
    listOrderPayments(id),
  ]);

  const canApprove = order.status === "awaiting_customer_approval";
  const canPay = order.status === "awaiting_payment";
  const canCancel = ["pending_review", "under_negotiation", "awaiting_customer_approval"].includes(
    order.status
  );
  const canReview = ["delivered", "completed"].includes(order.status);
  const finalAmount = order.final_price ?? order.estimated_price;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
          <p className="text-sm text-muted-foreground mt-1">
            {isAr ? "تم الإنشاء " : "Created "}
            {formatDate(order.created_at, isAr ? "ar-EG" : "en-US")}
          </p>
        </div>
        <WhatsAppButton
          variant="inline"
          phoneNumber={await getWhatsappNumber()}
          context={{ type: "order", orderNumber: order.order_number, serviceName: isAr ? order.services?.name_ar : order.services?.name_en }}
          label={isAr ? "تواصل عبر واتس آب" : "Chat on WhatsApp"}
        />
      </header>

      {/* Order summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isAr ? "السعر النهائي" : "Final price"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {finalAmount
                ? formatCurrency(finalAmount, order.currency, isAr ? "ar-EG" : "en-US")
                : "—"}
            </p>
            {order.final_price && order.estimated_price !== order.final_price && (
              <p className="text-xs text-muted-foreground line-through">
                {formatCurrency(order.estimated_price!, order.currency, isAr ? "ar-EG" : "en-US")}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isAr ? "المدة المتفق عليها" : "Agreed duration"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {order.final_duration_days ?? order.estimated_duration_days ?? "—"}{" "}
              <span className="text-base font-normal text-muted-foreground">
                {isAr ? "يوم" : "days"}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {isAr ? "حالة الدفع" : "Payment status"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {payments.some((p) => p.status === "paid")
                ? isAr ? "مدفوع" : "Paid"
                : isAr ? "غير مدفوع" : "Unpaid"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {(canApprove || canPay || canCancel || canReview) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isAr ? "الإجراءات المتاحة" : "Available actions"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {canApprove && (
              <OrderActionsClient orderId={order.id} action="approve" locale={locale}>
                <CheckCircle className="h-4 w-4" />
                {isAr ? "تأكيد التعاقد" : "Confirm contract"}
              </OrderActionsClient>
            )}
            {canPay && (
              <Button asChild>
                <Link href={`/orders/${order.id}/pay`}>
                  <CreditCard className="h-4 w-4" />
                  {isAr ? "ادفع الآن" : "Pay now"}
                </Link>
              </Button>
            )}
            {canReview && (
              <Button asChild variant="outline">
                <Link href={`/orders/${order.id}/review`}>
                  <Star className="h-4 w-4" />
                  {isAr ? "تقييم الخدمة" : "Rate service"}
                </Link>
              </Button>
            )}
            {canCancel && (
              <OrderActionsClient orderId={order.id} action="cancel" locale={locale} destructive>
                <XCircle className="h-4 w-4" />
                {isAr ? "إلغاء الطلب" : "Cancel order"}
              </OrderActionsClient>
            )}
          </CardContent>
        </Card>
      )}

      {/* Customer message */}
      {order.customer_message && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isAr ? "رسالتك الأصلية" : "Your original message"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{order.customer_message}</p>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isAr ? "مراحل التنفيذ" : "Execution stages"}</CardTitle>
          </CardHeader>
          <CardContent>
            <MilestonesList milestones={milestones} locale={locale} />
          </CardContent>
        </Card>
      )}

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isAr ? "ملفات التسليم" : "Deliverables"}</CardTitle>
          </CardHeader>
          <CardContent>
            <DeliverablesList deliverables={deliverables} locale={locale} />
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {isAr ? "المحادثة" : "Conversation"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MessageThread
            orderId={order.id}
            currentUserId={profile.id}
            messages={messages}
            locale={locale}
            sendAction={sendCustomerMessageAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}
