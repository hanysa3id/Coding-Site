"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SearchBarInner({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  const pushUrl = useCallback(
    (q: string) => {
      const sp = new URLSearchParams(params.toString());
      if (q) sp.set("q", q);
      else sp.delete("q");
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, pathname, params]
  );

  useEffect(() => {
    const t = setTimeout(() => pushUrl(value), 350);
    return () => clearTimeout(t);
  }, [value, pushUrl]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="ps-9 pe-9"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute end-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => setValue("")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <Suspense
      fallback={
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={placeholder} className="ps-9" disabled />
        </div>
      }
    >
      <SearchBarInner placeholder={placeholder} />
    </Suspense>
  );
}
