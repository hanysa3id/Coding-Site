"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validators/profile";
import { updateProfileAction } from "./actions";

export function ProfileForm({
  initial,
  locale,
}: {
  initial: UpdateProfileInput;
  locale: string;
}) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: initial,
  });

  const lang = watch("locale") ?? "ar";

  function onSubmit(data: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{isAr ? "الاسم الكامل" : "Full name"}</Label>
        <Input {...register("full_name")} disabled={isPending} />
        {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "رقم الهاتف" : "Phone number"}</Label>
          <Input {...register("phone")} dir="ltr" disabled={isPending} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "رقم الواتس آب" : "WhatsApp number"}</Label>
          <Input {...register("whatsapp_number")} dir="ltr" disabled={isPending} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{isAr ? "لغة الواجهة المفضلة" : "Preferred interface language"}</Label>
        <Select
          value={lang ?? "ar"}
          onValueChange={(v) => setValue("locale", v as "ar" | "en")}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </form>
  );
}
