import { getTranslations } from "next-intl/server";
import { getWhatsappSettings, getSiteName } from "@/lib/settings/get";
import { WhatsAppButton } from "./whatsapp-button";

/**
 * Server-rendered wrapper that reads WhatsApp + site settings and decides
 * whether to render the floating button. Drop it in any layout.
 */
export async function WhatsAppFloatingButton({ locale }: { locale: string }) {
  const wa = await getWhatsappSettings();

  // Hide if disabled or no number configured
  if (wa && wa.show_floating_button === false) return null;
  const phoneNumber = wa?.business_number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!phoneNumber) return null;

  const tc = await getTranslations("whatsapp");
  const siteName = await getSiteName(locale);

  return (
    <WhatsAppButton
      variant="floating"
      phoneNumber={phoneNumber}
      defaultMessage={siteName}
      label={tc("openChat")}
    />
  );
}
