"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { Globe } from "lucide-react";

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const nextLocale = currentLocale === "ar" ? "en" : "ar";
  const label = currentLocale === "ar" ? "EN" : "ع";

  function onClick() {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- pathname type is dynamic
        { pathname, params },
        { locale: nextLocale }
      );
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-label="Toggle language"
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
    >
      <Globe className="h-4 w-4" />
      {label}
    </button>
  );
}
