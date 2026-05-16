import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  Github,
} from "lucide-react";
import { getContactSettings, getSiteSettings } from "@/lib/settings/get";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CmsPage } from "@/types/database";

async function loadFooterPages(): Promise<CmsPage[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("cms_pages")
      .select("slug, title_ar, title_en, status, show_in_footer, sort_order")
      .eq("status", "published")
      .eq("show_in_footer", true)
      .order("sort_order", { ascending: true });
    return (data as CmsPage[]) ?? [];
  } catch {
    return [];
  }
}

export async function SiteFooter() {
  const tc = await getTranslations("common");
  const locale = await getLocale();
  const isAr = locale === "ar";
  const [contact, site, footerPages] = await Promise.all([
    getContactSettings(),
    getSiteSettings(),
    loadFooterPages(),
  ]);

  const siteName = site ? (isAr ? site.name_ar : site.name_en) : tc("siteName");
  const address = isAr ? contact?.address_ar : contact?.address_en;
  const workingHoursNote = isAr ? contact?.working_hours_note_ar : contact?.working_hours_note_en;

  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="font-bold text-lg">{siteName}</h3>
            {site && (
              <p className="text-sm text-muted-foreground">
                {isAr ? site.description_ar : site.description_en}
              </p>
            )}
            {contact && (
              <ul className="text-sm text-muted-foreground space-y-1.5 mt-2">
                {contact.email && (
                  <li className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${contact.email}`} className="hover:text-foreground" dir="ltr">
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.phone && (
                  <li className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span dir="ltr">{contact.phone}</span>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {contact.address_link ? (
                      <a
                        href={contact.address_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground"
                      >
                        {address}
                      </a>
                    ) : (
                      <span>{address}</span>
                    )}
                  </li>
                )}
                {workingHoursNote && (
                  <li className="text-xs">{workingHoursNote}</li>
                )}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-3">{tc("services")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-foreground">
                  {tc("services")}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-foreground">
                  {tc("portfolio")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  {tc("blog")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{isAr ? "روابط مفيدة" : "Useful links"}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  {tc("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  {tc("contact")}
                </Link>
              </li>
              {footerPages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/p/${p.slug}`} className="hover:text-foreground">
                    {isAr ? p.title_ar : p.title_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{isAr ? "تابعنا" : "Follow us"}</h4>
            <div className="flex flex-wrap items-center gap-3">
              {contact?.social?.facebook && (
                <a href={contact.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {contact?.social?.instagram && (
                <a href={contact.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {contact?.social?.twitter && (
                <a href={contact.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {contact?.social?.linkedin && (
                <a href={contact.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {contact?.social?.youtube && (
                <a href={contact.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <Youtube className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {contact?.social?.github && (
                <a href={contact.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {contact?.social?.telegram && (
                <a href={contact.social.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  <Send className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {contact?.social?.tiktok && (
                <a
                  href={contact.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  TT
                </a>
              )}
              {contact?.social?.snapchat && (
                <a
                  href={contact.social.snapchat}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snapchat"
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  SC
                </a>
              )}
              {contact?.social?.behance && (
                <a
                  href={contact.social.behance}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Behance"
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  Be
                </a>
              )}
              {contact?.social?.dribbble && (
                <a
                  href={contact.social.dribbble}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dribbble"
                  className="text-muted-foreground hover:text-foreground text-sm font-bold"
                >
                  Dr
                </a>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteName}
        </p>
      </div>
    </footer>
  );
}
