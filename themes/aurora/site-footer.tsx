import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
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
  ArrowUpRight,
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
  const description = site ? (isAr ? site.description_ar : site.description_en) : null;
  const address = isAr ? contact?.address_ar : contact?.address_en;
  const workingHoursNote = isAr ? contact?.working_hours_note_ar : contact?.working_hours_note_en;

  return (
    <footer className="relative border-t border-white/[0.06] mt-12">
      {/* gradient divider top */}
      <div
        className="absolute -top-px left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(236,72,153,0.4), rgba(6,182,212,0.4), transparent)",
        }}
        aria-hidden
      />
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand block */}
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 text-white text-xs font-bold">
                {(siteName || "S").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-lg font-semibold text-white">{siteName}</span>
            </Link>
            {description && (
              <p className="text-sm text-white/55 leading-relaxed max-w-md">
                {description}
              </p>
            )}
            {contact && (
              <ul className="text-sm text-white/65 space-y-2">
                {contact.email && (
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center gap-2 hover:text-white"
                      dir="ltr"
                    >
                      <Mail className="h-3.5 w-3.5 text-white/40" />
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-white/40" />
                    <span dir="ltr" className="aurora-mono">
                      {contact.phone}
                    </span>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-white/40 mt-0.5" />
                    {contact.address_link ? (
                      <a
                        href={contact.address_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        {address}
                      </a>
                    ) : (
                      <span>{address}</span>
                    )}
                  </li>
                )}
                {workingHoursNote && (
                  <li className="text-xs text-white/40">{workingHoursNote}</li>
                )}
              </ul>
            )}
          </div>

          {/* Three small columns */}
          <div className="md:col-span-2">
            <h4 className="aurora-eyebrow mb-4">{tc("services")}</h4>
            <ul className="space-y-2.5">
              <FooterLink href="/services">{tc("services")}</FooterLink>
              <FooterLink href="/portfolio">{tc("portfolio")}</FooterLink>
              <FooterLink href="/blog">{tc("blog")}</FooterLink>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="aurora-eyebrow mb-4">
              {isAr ? "روابط" : "Links"}
            </h4>
            <ul className="space-y-2.5">
              <FooterLink href="/about">{tc("about")}</FooterLink>
              <FooterLink href="/contact">{tc("contact")}</FooterLink>
              {footerPages.map((p) => (
                <FooterLink key={p.slug} href={`/p/${p.slug}`}>
                  {isAr ? p.title_ar : p.title_en}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="aurora-eyebrow mb-4">
              {isAr ? "تابعنا" : "Follow us"}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Social icon={Facebook} href={contact?.social?.facebook} label="Facebook" />
              <Social icon={Instagram} href={contact?.social?.instagram} label="Instagram" />
              <Social icon={Twitter} href={contact?.social?.twitter} label="Twitter" />
              <Social icon={Linkedin} href={contact?.social?.linkedin} label="LinkedIn" />
              <Social icon={Youtube} href={contact?.social?.youtube} label="YouTube" />
              <Social icon={Github} href={contact?.social?.github} label="GitHub" />
              <Social icon={Send} href={contact?.social?.telegram} label="Telegram" />
              <SocialText text="TT" href={contact?.social?.tiktok} label="TikTok" />
              <SocialText text="SC" href={contact?.social?.snapchat} label="Snapchat" />
              <SocialText text="Be" href={contact?.social?.behance} label="Behance" />
              <SocialText text="Dr" href={contact?.social?.dribbble} label="Dribbble" />
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} {siteName}
          </p>
          <p className="aurora-mono">
            {isAr ? "صُنع بـ ♥ في القاهرة" : "Built with ♥ in Cairo"}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white"
      >
        {children}
        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
      </Link>
    </li>
  );
}

function Social({
  icon: Icon,
  href,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  href: string | null | undefined;
  label: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid place-items-center h-9 w-9 rounded-lg border border-white/10 bg-white/[0.02] text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

function SocialText({ text, href, label }: { text: string; href: string | null | undefined; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid place-items-center h-9 w-9 rounded-lg border border-white/10 bg-white/[0.02] text-xs font-semibold text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors"
    >
      {text}
    </a>
  );
}
