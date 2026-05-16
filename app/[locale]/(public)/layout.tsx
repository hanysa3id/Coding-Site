import { getLocale } from "next-intl/server";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { WhatsAppFloatingButton } from "@/components/shared/whatsapp-floating";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloatingButton locale={locale} />
    </>
  );
}
