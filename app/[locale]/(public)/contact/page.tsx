import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Mail, Phone, MessageCircle, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { getContactSettings, getWhatsappNumber } from "@/lib/settings/get";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "تواصل معنا" : "Contact" };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const tc = await getTranslations("common");
  const [contact, waNumber] = await Promise.all([getContactSettings(), getWhatsappNumber()]);
  const address = isAr ? contact?.address_ar : contact?.address_en;
  const socials = [
    { url: contact?.social?.facebook, Icon: Facebook, label: "Facebook" },
    { url: contact?.social?.instagram, Icon: Instagram, label: "Instagram" },
    { url: contact?.social?.twitter, Icon: Twitter, label: "Twitter / X" },
    { url: contact?.social?.linkedin, Icon: Linkedin, label: "LinkedIn" },
    { url: contact?.social?.youtube, Icon: Youtube, label: "YouTube" },
  ].filter((s) => !!s.url);

  return (
    <div className="container py-12">
      <header className="mb-12 text-center relative">
        <div className="inline-flex items-center gap-2 pro-badge pro-badge-glow mb-4">
          <MessageCircle className="h-3.5 w-3.5" />
          {isAr ? "تواصل معنا" : "Contact Us"}
        </div>
        <h1 className="pro-heading-glow pro-text-gradient-animate text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          {tc("contact")}
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {isAr
            ? "نسعد بالتواصل معك — اختر الطريقة الأنسب"
            : "We'd love to hear from you — pick the most convenient way"}
        </p>
      </header>

      <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-3">
        <Card className="pro-card pro-card-highlight border-0 bg-transparent h-full">
          <CardContent className="pt-6 text-center space-y-3">
            <MessageCircle className="h-10 w-10 mx-auto" style={{ color: "var(--pro-secondary, #10b981)" }} />
            <h2 className="font-bold" style={{ color: "var(--pro-fg, #f8fafc)" }}>WhatsApp</h2>
            <p className="text-sm text-muted-foreground">
              {isAr ? "محادثة فورية ومجانية" : "Free instant chat"}
            </p>
            <WhatsAppButton variant="default" label="WhatsApp" phoneNumber={waNumber} />
          </CardContent>
        </Card>

        {contact?.email && (
          <Card className="pro-card pro-card-highlight border-0 bg-transparent h-full">
            <CardContent className="pt-6 text-center space-y-3">
              <Mail className="h-10 w-10 mx-auto" style={{ color: "var(--pro-primary, #06b6d4)" }} />
              <h2 className="font-bold" style={{ color: "var(--pro-fg, #f8fafc)" }}>{isAr ? "البريد" : "Email"}</h2>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm hover:underline break-all"
                style={{ color: "var(--pro-primary, #06b6d4)" }}
                dir="ltr"
              >
                {contact.email}
              </a>
            </CardContent>
          </Card>
        )}

        {contact?.phone && (
          <Card className="pro-card pro-card-highlight border-0 bg-transparent h-full">
            <CardContent className="pt-6 text-center space-y-3">
              <Phone className="h-10 w-10 mx-auto" style={{ color: "var(--pro-primary, #06b6d4)" }} />
              <h2 className="font-bold" style={{ color: "var(--pro-fg, #f8fafc)" }}>{isAr ? "الهاتف" : "Phone"}</h2>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="text-sm hover:underline"
                style={{ color: "var(--pro-primary, #06b6d4)" }}
                dir="ltr"
              >
                {contact.phone}
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {(address || socials.length > 0) && (
        <div className="mx-auto max-w-4xl mt-12 space-y-8">
          <Separator />
          {address && (
            <div className="text-center">
              <h3 className="font-semibold mb-3 inline-flex items-center gap-2 justify-center">
                <MapPin className="h-5 w-5" />
                {isAr ? "العنوان" : "Address"}
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{address}</p>
            </div>
          )}
          {socials.length > 0 && (
            <div className="text-center">
              <h3 className="font-semibold mb-3">{isAr ? "تابعنا على" : "Follow us"}</h3>
              <div className="flex justify-center gap-4">
                {socials.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="rounded-full border p-3 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
