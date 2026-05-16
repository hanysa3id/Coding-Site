"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Printer, ArrowLeft } from "lucide-react";

export function InvoicePrintButton({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href="/orders">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {isAr ? "رجوع" : "Back"}
        </Link>
      </Button>
      <Button size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        {isAr ? "طباعة / PDF" : "Print / Save PDF"}
      </Button>
    </div>
  );
}
