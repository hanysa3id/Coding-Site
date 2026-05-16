"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  integrationsSettingsSchema,
  type IntegrationsSettings,
} from "@/lib/validators/settings";
import { saveIntegrationsSettingsAction } from "../actions";

type Field = {
  name: keyof IntegrationsSettings;
  labelAr: string;
  labelEn: string;
  placeholder: string;
  hintAr?: string;
  hintEn?: string;
};

type Section = { titleAr: string; titleEn: string; fields: Field[] };

const SECTIONS: Section[] = [
  {
    titleAr: "Google",
    titleEn: "Google",
    fields: [
      {
        name: "ga4_measurement_id",
        labelAr: "Google Analytics 4 — Measurement ID",
        labelEn: "Google Analytics 4 — Measurement ID",
        placeholder: "G-XXXXXXXXXX",
        hintAr: "من analytics.google.com",
        hintEn: "From analytics.google.com",
      },
      {
        name: "gtm_id",
        labelAr: "Google Tag Manager — Container ID",
        labelEn: "Google Tag Manager — Container ID",
        placeholder: "GTM-XXXXXXX",
        hintAr: "من tagmanager.google.com",
        hintEn: "From tagmanager.google.com",
      },
      {
        name: "google_site_verification",
        labelAr: "Google Search Console — Verification token",
        labelEn: "Google Search Console — Verification token",
        placeholder: "abcdef1234567890...",
        hintAr: "محتوى meta tag للتحقق من ملكية الموقع",
        hintEn: "Content of the verification meta tag",
      },
      {
        name: "google_ads_id",
        labelAr: "Google Ads Conversion ID",
        labelEn: "Google Ads Conversion ID",
        placeholder: "AW-XXXXXXXXX",
      },
      {
        name: "google_maps_api_key",
        labelAr: "Google Maps API Key (لعرض الخرائط)",
        labelEn: "Google Maps API Key (for embedded maps)",
        placeholder: "AIzaSy...",
        hintAr: "قم بتقييد المفتاح بـ HTTP referrer لمنع إساءة الاستخدام",
        hintEn: "Restrict by HTTP referrer to prevent abuse",
      },
    ],
  },
  {
    titleAr: "Meta (Facebook & Instagram)",
    titleEn: "Meta (Facebook & Instagram)",
    fields: [
      {
        name: "facebook_pixel_id",
        labelAr: "Facebook Pixel ID",
        labelEn: "Facebook Pixel ID",
        placeholder: "123456789012345",
      },
      {
        name: "facebook_app_id",
        labelAr: "Facebook App ID (للمشاركة)",
        labelEn: "Facebook App ID (for sharing)",
        placeholder: "123456789012345",
      },
    ],
  },
  {
    titleAr: "Microsoft",
    titleEn: "Microsoft",
    fields: [
      {
        name: "microsoft_clarity_id",
        labelAr: "Microsoft Clarity Project ID",
        labelEn: "Microsoft Clarity Project ID",
        placeholder: "abc1d2e3f4",
        hintAr: "خرائط حرارية وتسجيل جلسات مجاناً من clarity.microsoft.com",
        hintEn: "Free heatmaps & session recordings from clarity.microsoft.com",
      },
      {
        name: "bing_site_verification",
        labelAr: "Bing Webmaster — Verification token",
        labelEn: "Bing Webmaster — Verification token",
        placeholder: "ABC123...",
      },
    ],
  },
  {
    titleAr: "تحليلات أخرى",
    titleEn: "Other analytics",
    fields: [
      {
        name: "hotjar_id",
        labelAr: "Hotjar Site ID",
        labelEn: "Hotjar Site ID",
        placeholder: "1234567",
      },
    ],
  },
  {
    titleAr: "إعلانات (MENA)",
    titleEn: "Ads (MENA)",
    fields: [
      {
        name: "tiktok_pixel_id",
        labelAr: "TikTok Pixel ID",
        labelEn: "TikTok Pixel ID",
        placeholder: "C12ABCDEF...",
      },
      {
        name: "snap_pixel_id",
        labelAr: "Snap Pixel ID",
        labelEn: "Snap Pixel ID",
        placeholder: "00000000-1234-...",
      },
    ],
  },
  {
    titleAr: "حماية النماذج",
    titleEn: "Form protection",
    fields: [
      {
        name: "recaptcha_site_key",
        labelAr: "reCAPTCHA v3 Site Key (الجزء العام)",
        labelEn: "reCAPTCHA v3 Site Key (public part)",
        placeholder: "6Lc...",
        hintAr: "ضع الـ Secret Key في .env.local وليس هنا",
        hintEn: "Put the secret key in .env.local — not here",
      },
    ],
  },
  {
    titleAr: "الدردشة المباشرة",
    titleEn: "Live chat",
    fields: [
      {
        name: "intercom_app_id",
        labelAr: "Intercom App ID",
        labelEn: "Intercom App ID",
        placeholder: "abc1de2f",
      },
      {
        name: "tawk_to_id",
        labelAr: "Tawk.to ID",
        labelEn: "Tawk.to ID",
        placeholder: "1abc23d4e5f6g7h8i9/1jklmno0p",
        hintAr: "يأخذ شكل widget-id/embed-id",
        hintEn: "Format: widget-id/embed-id",
      },
      {
        name: "crisp_website_id",
        labelAr: "Crisp Website ID",
        labelEn: "Crisp Website ID",
        placeholder: "12345678-abcd-...",
      },
    ],
  },
];

export function IntegrationsSettingsForm({
  initial,
  locale,
}: {
  initial: Record<string, unknown> | null;
  locale: string;
}) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit } = useForm<IntegrationsSettings>({
    resolver: zodResolver(integrationsSettingsSchema),
    defaultValues: (initial as IntegrationsSettings | null) ?? {},
  });

  function onSubmit(data: IntegrationsSettings) {
    startTransition(async () => {
      const result = await saveIntegrationsSettingsAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم الحفظ" : "Saved");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm">
        <p className="font-medium text-amber-900 dark:text-amber-200 mb-1">
          {isAr ? "ملاحظة أمنية" : "Security note"}
        </p>
        <p className="text-amber-800 dark:text-amber-300 text-xs">
          {isAr
            ? "هذه الإعدادات تحتوي على معرّفات عامة فقط (يتم حقنها في scripts على المتصفح). لا تضع أي مفتاح سري هنا — السكريت keys (مثل reCAPTCHA secret) ضعها في .env.local."
            : "These settings contain public IDs only (injected into browser scripts). Never put secret keys here — put secrets (like reCAPTCHA secret) in .env.local."}
        </p>
      </div>

      {SECTIONS.map((section, sIdx) => (
        <div key={section.titleAr}>
          {sIdx > 0 && <Separator className="my-6" />}
          <h3 className="font-semibold text-sm mb-3">
            {isAr ? section.titleAr : section.titleEn}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label>{isAr ? f.labelAr : f.labelEn}</Label>
                <Input
                  {...register(f.name)}
                  dir="ltr"
                  placeholder={f.placeholder}
                  disabled={isPending}
                />
                {(isAr ? f.hintAr : f.hintEn) && (
                  <p className="text-xs text-muted-foreground">
                    {isAr ? f.hintAr : f.hintEn}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isPending}>
          {isPending ? (isAr ? "جارٍ الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
        </Button>
      </div>
    </form>
  );
}
