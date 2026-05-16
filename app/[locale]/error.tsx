"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";

  useEffect(() => {
    console.error("[locale-error]", error);
  }, [error]);

  return (
    <main className="container py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto inline-flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{isAr ? "حدث خطأ" : "Something went wrong"}</CardTitle>
          <CardDescription>
            {isAr
              ? "حصل خطأ غير متوقع أثناء تحميل الصفحة. حاول مرة أخرى."
              : "An unexpected error occurred while loading this page. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error.digest && (
            <p className="text-center text-xs text-muted-foreground font-mono">
              {error.digest}
            </p>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={() => reset()}>
              <RefreshCw className="h-4 w-4" />
              {isAr ? "إعادة المحاولة" : "Try again"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="h-4 w-4" />
                {isAr ? "الرئيسية" : "Home"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
