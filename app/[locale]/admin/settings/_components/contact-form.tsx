"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactSettingsSchema,
  type ContactSettings,
} from "@/lib/validators/settings";
import { saveContactSettingsAction } from "../actions";

export function ContactSettingsForm({
  initial,
  locale,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactSettings>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: (initial as ContactSettings | null) ?? {
      email: "",
      social: { facebook: "", instagram: "", twitter: "", linkedin: "", youtube: "" },
    },
  });

  function onSubmit(data: ContactSettings) {
    startTransition(async () => {
      const result = await saveContactSettingsAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label>
          <Input {...register("email")} type="email" dir="ltr" />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "رقم الهاتف" : "Phone"}</Label>
          <Input {...register("phone")} dir="ltr" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "العنوان (AR)" : "Address (AR)"}</Label>
          <Textarea {...register("address_ar")} dir="rtl" rows={2} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "العنوان (EN)" : "Address (EN)"}</Label>
          <Textarea {...register("address_en")} dir="ltr" rows={2} />
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="font-semibold text-sm">{isAr ? "الشبكات الاجتماعية" : "Social media"}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Facebook URL</Label>
            <Input {...register("social.facebook")} dir="ltr" placeholder="https://facebook.com/..." />
          </div>
          <div className="space-y-1.5">
            <Label>Instagram URL</Label>
            <Input {...register("social.instagram")} dir="ltr" placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-1.5">
            <Label>Twitter / X URL</Label>
            <Input {...register("social.twitter")} dir="ltr" placeholder="https://x.com/..." />
          </div>
          <div className="space-y-1.5">
            <Label>LinkedIn URL</Label>
            <Input {...register("social.linkedin")} dir="ltr" placeholder="https://linkedin.com/..." />
          </div>
          <div className="space-y-1.5">
            <Label>YouTube URL</Label>
            <Input {...register("social.youtube")} dir="ltr" placeholder="https://youtube.com/..." />
          </div>
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
