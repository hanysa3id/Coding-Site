import { getLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth/guards";
import { listCustomerOrders } from "@/lib/queries/orders";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight, ShoppingCart } from "lucide-react";

export default async function CustomerOrdersPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const profile = await requireUser();
  const orders = await listCustomerOrders(profile.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">{isAr ? "طلباتي" : "My orders"}</h1>
        <p className="text-muted-foreground">
          {isAr ? `${orders.length} طلب` : `${orders.length} orders`}
        </p>
      </header>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              {isAr ? "لا توجد طلبات بعد" : "No orders yet"}
            </p>
            <Button asChild>
              <Link href="/services">{isAr ? "تصفح الخدمات" : "Browse services"}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {orders.map((o) => (
                <li key={o.id} className="p-4 hover:bg-muted/30">
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {o.services?.cover_image && (
                        <div
                          className="h-14 w-14 shrink-0 rounded bg-cover bg-center"
                          style={{ backgroundImage: `url(${o.services.cover_image})` }}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <code className="text-xs">{o.order_number}</code>
                          <OrderStatusBadge status={o.status} locale={locale} />
                        </div>
                        <p className="font-medium truncate">
                          {o.services
                            ? isAr
                              ? o.services.name_ar
                              : o.services.name_en
                            : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(o.created_at, isAr ? "ar-EG" : "en-US")}
                        </p>
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      {(o.final_price ?? o.estimated_price) && (
                        <p className="font-semibold">
                          {formatCurrency(
                            o.final_price ?? o.estimated_price!,
                            o.currency,
                            isAr ? "ar-EG" : "en-US"
                          )}
                        </p>
                      )}
                      <ArrowRight className="h-4 w-4 mt-1 ms-auto rtl:rotate-180 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
