import { getLocale } from "next-intl/server";
import { listAllCategoriesForAdmin } from "@/lib/queries/services";
import { ServiceForm } from "../service-form";

export default async function NewServicePage() {
  const locale = await getLocale();
  const categories = await listAllCategoriesForAdmin();
  const isAr = locale === "ar";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{isAr ? "خدمة جديدة" : "New service"}</h1>
        <p className="text-muted-foreground">
          {isAr ? "أنشئ خدمة جديدة لعرضها على المنصة" : "Create a new service to offer on the platform"}
        </p>
      </div>
      {categories.length === 0 ? (
        <p className="text-muted-foreground">
          {isAr
            ? "أنشئ قسماً أولاً قبل إضافة خدمات"
            : "Create a category first before adding services"}
        </p>
      ) : (
        <ServiceForm categories={categories} locale={locale} />
      )}
    </div>
  );
}
