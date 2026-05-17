"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validators/profile";
import { changePasswordAction } from "./actions";

export function ChangePasswordForm({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  function onSubmit(data: ChangePasswordInput) {
    startTransition(async () => {
      const result = await changePasswordAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم تغيير كلمة المرور" : "Password changed");
      reset();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label>{isAr ? "كلمة المرور الحالية" : "Current password"}</Label>
        <Input
          type="password"
          autoComplete="current-password"
          {...register("current_password")}
          disabled={isPending}
        />
        {errors.current_password && (
          <p className="text-sm text-destructive">
            {isAr ? "كلمة المرور الحالية مطلوبة" : errors.current_password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "كلمة المرور الجديدة" : "New password"}</Label>
        <Input
          type="password"
          autoComplete="new-password"
          {...register("new_password")}
          disabled={isPending}
        />
        {errors.new_password && (
          <p className="text-sm text-destructive">{errors.new_password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "تأكيد كلمة المرور" : "Confirm password"}</Label>
        <Input
          type="password"
          autoComplete="new-password"
          {...register("confirm_password")}
          disabled={isPending}
        />
        {errors.confirm_password && (
          <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? (isAr ? "جارٍ الحفظ..." : "Saving...")
            : isAr ? "تغيير كلمة المرور" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
