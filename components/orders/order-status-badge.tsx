import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";
import type { OrderStatus } from "@/types/database";

export function OrderStatusBadge({
  status,
  locale,
}: {
  status: OrderStatus;
  locale: string;
}) {
  const meta = ORDER_STATUS_LABELS[status];
  return (
    <Badge variant={meta.variant}>{locale === "ar" ? meta.ar : meta.en}</Badge>
  );
}
