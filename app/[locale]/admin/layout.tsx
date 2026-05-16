import { requireStaff } from "@/lib/auth/guards";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await requireStaff();

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader profile={profile} />
      <div className="flex flex-1">
        <AdminSidebar role={profile.role} locale={locale} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
