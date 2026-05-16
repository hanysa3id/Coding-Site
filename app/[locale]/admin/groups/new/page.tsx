import { getLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/guards";
import { GroupForm } from "../group-form";

export default async function NewGroupPage() {
  await requireAdmin();
  const locale = await getLocale();
  const isAr = locale === "ar";
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold">{isAr ? "مجموعة جديدة" : "New group"}</h1>
      <GroupForm locale={locale} />
    </div>
  );
}
