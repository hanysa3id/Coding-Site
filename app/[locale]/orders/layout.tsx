export const dynamic = 'force-dynamic';
import { requireUser } from "@/lib/auth/guards";
import { SiteHeader } from "@/components/public/site-header";

export default async function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <>
      <SiteHeader />
      <main className="container py-8">{children}</main>
    </>
  );
}
