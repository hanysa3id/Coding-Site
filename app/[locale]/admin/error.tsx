"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isAr = locale === "ar";

  useEffect(() => {
    console.error("[admin-error]", error);
  }, [error]);

  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto inline-flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">
          {isAr ? "خطأ في لوحة الإدارة" : "Admin error"}
        </h2>
        <p className="text-muted-foreground">
          {isAr
            ? "تعذر تحميل هذه الصفحة. الخطأ مسجل وسنراجعه."
            : "Unable to load this page. The error has been logged."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">{error.digest}</p>
        )}
        {error.message && process.env.NODE_ENV !== "production" && (
          <p className="text-sm text-destructive/80 font-mono text-start whitespace-pre-wrap bg-destructive/5 p-3 rounded">
            {error.message}
          </p>
        )}
        <Button onClick={() => reset()}>
          <RefreshCw className="h-4 w-4" />
          {isAr ? "إعادة المحاولة" : "Try again"}
        </Button>
      </div>
    </div>
  );
}
