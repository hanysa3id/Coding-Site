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
import { ProjectTimeline } from "@/components/orders/project-timeline";
import { DeliverablesList } from "@/components/orders/deliverables-list";
import { CustomerAttachmentsDisplay } from "@/components/orders/customer-attachments-display";
import { PaymentStatusCard } from "@/components/orders/payment-status-card";
import { PaymentHistoryList } from "@/components/orders/payment-history-list";
import { summarizePayments } from "@/lib/orders/payment-summary";
import { signStorageUrls } from "@/lib/storage/sign-url";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import type { Payment, OrderAttachment, PaymentInstallment } from "@/types/database";
import { getWhatsappNumber } from "@/lib/settings/get";
import { Link } from "@/i18n/routing";
import { CheckCircle, XCircle, CreditCard, Star, MessageSquare, FileText } from "lucide-react";
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

  // Sign the customer-uploaded attachment URLs so the inline <audio src>
  // and download links work whether the storage bucket is public or private.
  const customerAttachments: OrderAttachment[] = await (async () => {
    const raw = order.customer_attachments ?? [];
    if (raw.length === 0) return [];
    const signed = await signStorageUrls(raw.map((a) => a.url));
    return raw.map((a, i) => ({ ...a, url: signed[i] }));
  })();

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
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/orders/${order.id}/invoice`}>
              <FileText className="h-4 w-4" />
              {isAr ? "الفاتورة" : "Invoice"}
            </Link>
          </Button>
          <WhatsAppButton
            variant="inline"
            phoneNumber={await getWhatsappNumber()}
            context={{ type: "order", orderNumber: order.order_number, serviceName: isAr ? order.services?.name_ar : order.services?.name_en }}
            label={isAr ? "تواصل عبر واتس آب" : "Chat on WhatsApp"}
          />
        </div>
      </header>

      {/* Order summary cards */}
      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      {/* Payment status (rich card) */}
      <PaymentStatusCard
        summary={summarizePayments(order, (payments as Payment[]) ?? [])}
        currency={order.currency}
        locale={locale}
        orderId={order.id}
        orderStatus={order.status}
      />

      {/* Installment payment plan */}
      {order.payment_plan && (order.payment_plan as unknown as PaymentInstallment[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isAr ? "خطة الدفع" : "Payment plan"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(order.payment_plan as unknown as PaymentInstallment[]).map((inst, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg border p-3 ${inst.paid ? "bg-green-50 dark:bg-green-950/20 border-green-200" : ""}`}
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">
                      {isAr ? inst.label_ar : inst.label_en}
                    </p>
                    {inst.due_date && (
                      <p className="text-xs text-muted-foreground">
                        {isAr ? "تاريخ الاستحقاق: " : "Due: "}
                        {formatDate(inst.due_date, isAr ? "ar-EG" : "en-US")}
                      </p>
                    )}
                  </div>
                  <div className="text-end">
                    <p className="font-bold tabular-nums">
                      {formatCurrency(inst.amount, order.currency, isAr ? "ar-EG" : "en-US")}
                    </p>
                    <p className={`text-xs ${inst.paid ? "text-green-600" : "text-muted-foreground"}`}>
                      {inst.paid ? (isAr ? "✓ مدفوع" : "✓ Paid") : (isAr ? "غير مدفوع" : "Pending")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <PaymentHistoryList payments={(payments as Payment[]) ?? []} locale={locale} />

      {/* Actions — payment button lives in PaymentStatusCard above */}
      {(canApprove || canCancel || canReview) && (
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

      {/* Customer message + attachments */}
      {(order.customer_message || customerAttachments.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isAr ? "رسالتك ومرفقاتك" : "Your message & attachments"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.customer_message && (
              <p className="text-sm whitespace-pre-line">{order.customer_message}</p>
            )}
            {customerAttachments.length > 0 && (
              <CustomerAttachmentsDisplay
                attachments={customerAttachments}
                locale={locale}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Milestones — Visual Timeline */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isAr ? "مراحل التنفيذ" : "Execution stages"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectTimeline
              milestones={milestones}
              orderId={order.id}
              locale={locale}
              canApprove={["in_progress", "delivered", "completed"].includes(order.status)}
            />
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
