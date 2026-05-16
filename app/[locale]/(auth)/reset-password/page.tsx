import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إعادة تعيين كلمة المرور" : "Reset password",
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isAr ? "إعادة تعيين كلمة المرور" : "Reset your password"}
        </CardTitle>
        <CardDescription>
          {isAr
            ? "أدخل كلمة مرور جديدة لحسابك"
            : "Enter a new password for your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm locale={locale} />
      </CardContent>
    </Card>
  );
}
