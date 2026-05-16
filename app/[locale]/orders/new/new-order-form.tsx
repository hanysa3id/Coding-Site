"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "@/lib/validators/orders";
import { createOrderAction } from "../actions";

export function NewOrderForm({
  serviceId,
  customerName,
  customerWhatsapp,
}: {
  serviceId: string;
  customerName: string;
  customerWhatsapp: string;
}) {
  const tc = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { service_id: serviceId, customer_message: "" },
  });

  function onSubmit(data: CreateOrderInput) {
    startTransition(async () => {
      const result = await createOrderAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(`Order ${result.orderNumber} created`);
      router.push(`/orders/${result.orderId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("service_id")} />

      <div className="space-y-2">
        <Label htmlFor="customer_message">رسالتك / Your message</Label>
        <Textarea
          id="customer_message"
          {...register("customer_message")}
          rows={6}
          placeholder="صف متطلباتك بالتفصيل... أهداف المشروع، الميزات المطلوبة، الموعد المفضل، أي ملاحظات."
          disabled={isPending}
        />
        {errors.customer_message && (
          <p className="text-sm text-destructive">
            {errors.customer_message.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          سنتواصل معك على رقم: <span dir="ltr">{customerWhatsapp || "—"}</span>
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? tc("loading") : tc("submit")}
        </Button>
      </div>
    </form>
  );
}
