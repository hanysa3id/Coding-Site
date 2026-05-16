"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validators/profile";

export function ResetPasswordForm({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase exchanges the recovery token from the URL hash automatically.
    // We wait briefly then check if a session was established.
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(!!data.session);
    };

    // Listen for PASSWORD_RECOVERY event which fires after the hash is processed
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasSession(true);
      }
    });

    check();
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  function onSubmit(data: ResetPasswordInput) {
    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password: data.new_password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(
        isAr ? "تم تحديث كلمة المرور. جارٍ تحويلك..." : "Password updated. Redirecting..."
      );
      router.push(`/${locale}/dashboard`);
      router.refresh();
    });
  }

  if (hasSession === false) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-destructive">
          {isAr
            ? "رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً."
            : "The reset link is invalid or expired. Request a new one."}
        </p>
        <Button asChild variant="outline">
          <a href={`/${locale}/forgot-password`}>
            {isAr ? "طلب رابط جديد" : "Request new link"}
          </a>
        </Button>
      </div>
    );
  }

  if (hasSession === null) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4">
        {isAr ? "جارٍ التحقق..." : "Verifying..."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? (isAr ? "جارٍ التحديث..." : "Updating...")
          : isAr ? "تحديث كلمة المرور" : "Update password"}
      </Button>
    </form>
  );
}
