"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  telegramSettingsSchema,
  type TelegramSettingsInput,
} from "@/lib/validators/settings";
import { saveTelegramSettingsAction, testTelegramConnectionAction } from "../actions";

const EVENTS: { key: keyof TelegramSettingsInput["events"]; ar: string; en: string; placeholders: string }[] = [
  { key: "new_order",                  ar: "طلب جديد",                en: "New order",                  placeholders: "{order_number} {customer_name} {service_name} {estimated_price} {currency} {order_url}" },
  { key: "order_status_changed",       ar: "تحديث حالة طلب",          en: "Order status changed",       placeholders: "{order_number} {customer_name} {new_status} {old_status}" },
  { key: "payment_received",           ar: "دفعة جديدة",              en: "Payment received",           placeholders: "{order_number} {customer_name} {amount} {currency} {method}" },
  { key: "payment_failed",             ar: "فشل دفعة",                en: "Payment failed",             placeholders: "{order_number} {customer_name} {reason}" },
  { key: "new_review",                 ar: "تقييم جديد",              en: "New review",                 placeholders: "{order_number} {customer_name} {rating} {comment}" },
  { key: "new_message_from_customer",  ar: "رسالة جديدة من عميل",      en: "New message from customer",  placeholders: "{order_number} {customer_name} {preview}" },
  { key: "order_cancelled",            ar: "تم إلغاء طلب",            en: "Order cancelled",            placeholders: "{order_number} {customer_name}" },
];

const DEFAULT_TEMPLATES: Record<string, string> = {
  new_order: "🆕 *طلب جديد*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nالخدمة: {service_name}\nالسعر التقديري: {estimated_price} {currency}\n\n[فتح الطلب]({order_url})",
  order_status_changed: "🔄 *تحديث حالة الطلب*\n\n`{order_number}`\nالحالة الجديدة: *{new_status}*\nالعميل: {customer_name}",
  payment_received: "💰 *دفعة جديدة*\n\nرقم الطلب: `{order_number}`\nالمبلغ: *{amount} {currency}*\nالعميل: {customer_name}\nطريقة الدفع: {method}",
  payment_failed: "❌ *فشل دفع*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nسبب الفشل: {reason}",
  new_review: "⭐ *تقييم جديد*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\nالتقييم: {rating}/5\n\n{comment}",
  new_message_from_customer: "💬 *رسالة جديدة من عميل*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}\n\n{preview}",
  order_cancelled: "🚫 *تم إلغاء طلب*\n\nرقم الطلب: `{order_number}`\nالعميل: {customer_name}",
};

function defaultTelegramInput(): TelegramSettingsInput {
  return {
    enabled: false,
    bot_token: "",
    admin_chat_id: "",
    events: Object.fromEntries(EVENTS.map((e) => [e.key, true])) as TelegramSettingsInput["events"],
    templates: DEFAULT_TEMPLATES as TelegramSettingsInput["templates"],
  };
}

export function TelegramSettingsForm({
  initial,
  locale,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();
  const [testResult, setTestResult] = useState<null | "ok" | "fail">(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TelegramSettingsInput>({
    resolver: zodResolver(telegramSettingsSchema),
    defaultValues: (initial as TelegramSettingsInput | null) ?? defaultTelegramInput(),
  });

  function onSubmit(data: TelegramSettingsInput) {
    startTransition(async () => {
      const result = await saveTelegramSettingsAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
    });
  }

  async function onTest() {
    const token = watch("bot_token") ?? "";
    const chatId = watch("admin_chat_id") ?? "";
    setTestResult(null);
    const res = await testTelegramConnectionAction({ bot_token: token, admin_chat_id: chatId });
    if (res.success) {
      setTestResult("ok");
      toast.success(isAr ? "تم إرسال رسالة اختبار" : "Test message sent");
    } else {
      setTestResult("fail");
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="rounded-md border border-blue-200/60 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900/60 p-4 text-sm space-y-1">
        <p className="font-medium">{isAr ? "كيف أحصل على بيانات البوت؟" : "How to get the bot data?"}</p>
        <ol className="list-decimal ms-5 space-y-1 text-muted-foreground">
          <li>{isAr ? "افتح Telegram وتحدث إلى @BotFather واطلب /newbot ثم انسخ الـ token." : "Open Telegram, message @BotFather, send /newbot and copy the token."}</li>
          <li>{isAr ? "ابدأ محادثة مع البوت الجديد (اضغط Start)." : "Start a chat with your new bot (press Start)."}</li>
          <li>{isAr ? "افتح https://api.telegram.org/bot<TOKEN>/getUpdates ثم انسخ chat.id من الناتج." : "Visit https://api.telegram.org/bot<TOKEN>/getUpdates and copy chat.id from the result."}</li>
        </ol>
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="enabled"
          render={({ field }) => (
            <Checkbox
              id="tg_enabled"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
        <Label htmlFor="tg_enabled" className="cursor-pointer">
          {isAr ? "تفعيل إشعارات Telegram" : "Enable Telegram notifications"}
        </Label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Bot Token</Label>
          <Input {...register("bot_token")} dir="ltr" type="password" placeholder="123456:ABC-DEF..." />
          {errors.bot_token && <p className="text-sm text-destructive">{errors.bot_token.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Admin Chat ID</Label>
          <Input {...register("admin_chat_id")} dir="ltr" placeholder="123456789" />
          {errors.admin_chat_id && <p className="text-sm text-destructive">{errors.admin_chat_id.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={onTest} disabled={isPending}>
          <Send className="h-4 w-4" />
          {isAr ? "إرسال رسالة اختبار" : "Send test message"}
        </Button>
        {testResult === "ok" && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            {isAr ? "تم الاتصال" : "Connected"}
          </span>
        )}
        {testResult === "fail" && (
          <span className="inline-flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {isAr ? "فشل الاتصال" : "Failed"}
          </span>
        )}
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="font-semibold text-sm">{isAr ? "الأحداث وقوالب الرسائل" : "Events & message templates"}</h3>
        <p className="text-xs text-muted-foreground">
          {isAr
            ? "اختر الأحداث التي تريد إشعاراً عنها وعدّل قوالب الرسائل. تدعم القوالب Markdown."
            : "Toggle events you want notifications for and edit the message templates. Templates support Markdown."}
        </p>

        <div className="border rounded-md divide-y">
          {EVENTS.map((e) => (
            <details key={e.key} className="group">
              <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-muted/40">
                <Controller
                  control={control}
                  name={`events.${e.key}` as const}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onClick={(ev) => ev.stopPropagation()}
                    />
                  )}
                />
                <span className="text-sm flex-1">{isAr ? e.ar : e.en}</span>
                <span className="text-xs text-muted-foreground group-open:hidden">
                  {isAr ? "تعديل القالب" : "Edit template"}
                </span>
                <span className="text-xs text-muted-foreground hidden group-open:inline">
                  {isAr ? "إخفاء" : "Hide"}
                </span>
              </summary>
              <div className="px-4 pb-3 space-y-2">
                <Label className="text-xs">{isAr ? "قالب الرسالة" : "Message template"}</Label>
                <Textarea
                  {...register(`templates.${e.key}` as const)}
                  rows={5}
                  dir="auto"
                  className="font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  {isAr ? "المتغيرات المتاحة: " : "Available placeholders: "}
                  <code className="select-all">{e.placeholders}</code>
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </form>
  );
}
