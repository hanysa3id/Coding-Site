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

const EMPTY_SOCIAL = {
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  youtube: "",
  tiktok: "",
  snapchat: "",
  github: "",
  behance: "",
  dribbble: "",
  telegram: "",
};

export function ContactSettingsForm({
  initial,
  locale,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const initialValues = (initial as ContactSettings | null) ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactSettings>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: initialValues
      ? { ...initialValues, social: { ...EMPTY_SOCIAL, ...initialValues.social } }
      : {
          email: "",
          phone: "",
          address_ar: "",
          address_en: "",
          address_link: "",
          working_hours_note_ar: "",
          working_hours_note_en: "",
          social: EMPTY_SOCIAL,
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

      <div className="space-y-2">
        <Label>{isAr ? "رابط الخريطة (Google Maps)" : "Map link (Google Maps)"}</Label>
        <Input
          {...register("address_link")}
          dir="ltr"
          placeholder="https://maps.google.com/?q=..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isAr ? "ملاحظة ساعات العمل (AR)" : "Working hours note (AR)"}</Label>
          <Input {...register("working_hours_note_ar")} dir="rtl" placeholder={isAr ? "السبت — الخميس · 9 صباحاً - 6 مساءً" : ""} />
        </div>
        <div className="space-y-2">
          <Label>{isAr ? "ملاحظة ساعات العمل (EN)" : "Working hours note (EN)"}</Label>
          <Input {...register("working_hours_note_en")} dir="ltr" placeholder={!isAr ? "Sat-Thu · 9am - 6pm" : ""} />
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="font-semibold text-sm">
          {isAr ? "الشبكات الاجتماعية" : "Social media"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isAr
            ? "اترك أي حقل فارغاً ليُخفى تلقائياً من الفوتر."
            : "Leave any field blank to hide it from the footer automatically."}
        </p>
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
            <Label>X (Twitter) URL</Label>
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
          <div className="space-y-1.5">
            <Label>TikTok URL</Label>
            <Input {...register("social.tiktok")} dir="ltr" placeholder="https://tiktok.com/@..." />
          </div>
          <div className="space-y-1.5">
            <Label>Snapchat URL</Label>
            <Input {...register("social.snapchat")} dir="ltr" placeholder="https://snapchat.com/add/..." />
          </div>
          <div className="space-y-1.5">
            <Label>GitHub URL</Label>
            <Input {...register("social.github")} dir="ltr" placeholder="https://github.com/..." />
          </div>
          <div className="space-y-1.5">
            <Label>Behance URL</Label>
            <Input {...register("social.behance")} dir="ltr" placeholder="https://behance.net/..." />
          </div>
          <div className="space-y-1.5">
            <Label>Dribbble URL</Label>
            <Input {...register("social.dribbble")} dir="ltr" placeholder="https://dribbble.com/..." />
          </div>
          <div className="space-y-1.5">
            <Label>Telegram URL</Label>
            <Input {...register("social.telegram")} dir="ltr" placeholder="https://t.me/..." />
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
