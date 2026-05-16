"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  X,
  ChevronDown,
  Filter,
  Download,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";
import type { OrderStatus } from "@/types/database";
import type { OrderSort } from "@/lib/queries/orders";

type Option = { id: string; name: string };

type Props = {
  locale: string;
  services: Option[];
  staff: Option[];
  /** Used to colour the export-CSV button as a download link. */
  exportHref: string;
};

const ALL_STATUSES: OrderStatus[] = [
  "pending_review",
  "under_negotiation",
  "awaiting_customer_approval",
  "awaiting_payment",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
];

function parseStatusList(raw: string | null): OrderStatus[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is OrderStatus => ALL_STATUSES.includes(s as OrderStatus));
}

export function OrdersFilters({ locale, services, staff, exportHref }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [, startTransition] = useTransition();
  const isAr = locale === "ar";

  // Local state mirrors the URL so the UI feels instant; pushing to the URL
  // triggers the server re-fetch.
  const [q, setQ] = useState(search.get("q") ?? "");
  const [statuses, setStatuses] = useState<OrderStatus[]>(
    parseStatusList(search.get("statuses"))
  );
  const [serviceId, setServiceId] = useState(search.get("service") ?? "");
  const [staffId, setStaffId] = useState(search.get("staff") ?? "");
  const [payment, setPayment] = useState(search.get("payment") ?? "any");
  const [dateFrom, setDateFrom] = useState(search.get("from") ?? "");
  const [dateTo, setDateTo] = useState(search.get("to") ?? "");
  const [sort, setSort] = useState<OrderSort>(
    (search.get("sort") as OrderSort) ?? "newest"
  );
  const [advancedOpen, setAdvancedOpen] = useState(
    Boolean(
      search.get("service") ||
        search.get("staff") ||
        search.get("from") ||
        search.get("to") ||
        search.get("payment")
    )
  );

  // Sync local q with URL — debounce-pushed.
  useEffect(() => {
    const id = setTimeout(() => {
      const current = search.get("q") ?? "";
      if (q !== current) pushUrl({ q });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function pushUrl(patch: Record<string, string | string[] | undefined>) {
    const params = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
        params.delete(k);
      } else if (Array.isArray(v)) {
        params.set(k, v.join(","));
      } else {
        params.set(k, v);
      }
    }
    params.delete("page"); // any filter change resets pagination
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function toggleStatus(s: OrderStatus) {
    const next = statuses.includes(s)
      ? statuses.filter((x) => x !== s)
      : [...statuses, s];
    setStatuses(next);
    pushUrl({ statuses: next });
  }

  function resetAll() {
    setQ("");
    setStatuses([]);
    setServiceId("");
    setStaffId("");
    setPayment("any");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
    startTransition(() => router.replace(pathname));
  }

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (q) n += 1;
    if (statuses.length) n += 1;
    if (serviceId) n += 1;
    if (staffId) n += 1;
    if (payment !== "any" && payment !== "") n += 1;
    if (dateFrom || dateTo) n += 1;
    return n;
  }, [q, statuses, serviceId, staffId, payment, dateFrom, dateTo]);

  return (
    <div className="space-y-3">
      {/* Top row: search + sort + advanced toggle + export */}
      <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              isAr
                ? "بحث برقم الطلب أو اسم العميل أو البريد..."
                : "Search by order number, customer name or email..."
            }
            className="ps-10 pe-9"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={isAr ? "مسح البحث" : "Clear search"}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v as OrderSort);
            pushUrl({ sort: v });
          }}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{isAr ? "الأحدث أولاً" : "Newest first"}</SelectItem>
            <SelectItem value="oldest">{isAr ? "الأقدم أولاً" : "Oldest first"}</SelectItem>
            <SelectItem value="price_desc">{isAr ? "السعر: الأعلى" : "Price: highest"}</SelectItem>
            <SelectItem value="price_asc">{isAr ? "السعر: الأدنى" : "Price: lowest"}</SelectItem>
            <SelectItem value="status_priority">
              {isAr ? "الحالة (أولوية)" : "Status (priority)"}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="md:w-auto justify-center"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {isAr ? "خيارات متقدمة" : "Advanced"}
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ms-1 px-1.5 py-0 text-[10px] tabular-nums">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
        </Button>

        <Button asChild variant="outline">
          <a href={exportHref} download>
            <Download className="h-4 w-4" />
            {isAr ? "تصدير CSV" : "Export CSV"}
          </a>
        </Button>
      </div>

      {/* Status chips — always visible */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <button
          type="button"
          onClick={() => {
            setStatuses([]);
            pushUrl({ statuses: [] });
          }}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            statuses.length === 0
              ? "bg-primary text-primary-foreground border-primary"
              : "hover:bg-muted"
          }`}
        >
          {isAr ? "الكل" : "All"}
        </button>
        {ALL_STATUSES.map((s) => {
          const active = statuses.includes(s);
          const meta = ORDER_STATUS_LABELS[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggleStatus(s)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted"
              }`}
            >
              {isAr ? meta.ar : meta.en}
            </button>
          );
        })}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="ms-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            {isAr ? "إعادة التعيين" : "Reset"}
          </button>
        )}
      </div>

      {/* Advanced panel */}
      {advancedOpen && (
        <div className="rounded-lg border bg-muted/30 p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "الخدمة" : "Service"}</Label>
            <Select
              value={serviceId || "all"}
              onValueChange={(v) => {
                const next = v === "all" ? "" : v;
                setServiceId(next);
                pushUrl({ service: next });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "كل الخدمات" : "All services"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isAr ? "كل الخدمات" : "All services"}</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "الموظف المعيّن" : "Assigned staff"}</Label>
            <Select
              value={staffId || "all"}
              onValueChange={(v) => {
                const next = v === "all" ? "" : v;
                setStaffId(next);
                pushUrl({ staff: next });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={isAr ? "أي شخص" : "Anyone"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isAr ? "أي شخص" : "Anyone"}</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "حالة الدفع" : "Payment status"}</Label>
            <Select
              value={payment}
              onValueChange={(v) => {
                setPayment(v);
                pushUrl({ payment: v === "any" ? "" : v });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{isAr ? "أي حالة" : "Any"}</SelectItem>
                <SelectItem value="paid">{isAr ? "مدفوع" : "Paid"}</SelectItem>
                <SelectItem value="unpaid">{isAr ? "غير مدفوع" : "Unpaid"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{isAr ? "نطاق التاريخ" : "Date range"}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  pushUrl({ from: e.target.value });
                }}
                className="font-mono text-xs"
                aria-label={isAr ? "من" : "From"}
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  pushUrl({ to: e.target.value });
                }}
                className="font-mono text-xs"
                aria-label={isAr ? "إلى" : "To"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
