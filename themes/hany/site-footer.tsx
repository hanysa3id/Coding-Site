import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getContactSettings, getSiteSettings } from "@/lib/settings/get";
import { listVisibleCategories } from "@/lib/queries/services";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Send,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { HanyButton } from "./ui/hany-button";
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
  const [contact, site, footerPages, allCategories] = await Promise.all([
    getContactSettings(),
    getSiteSettings(),
    loadFooterPages(),
    listVisibleCategories(),
  ]);

  const siteName = site ? (isAr ? site.name_ar : site.name_en) : tc("siteName");
  const description = site ? (isAr ? site.description_ar : site.description_en) : null;
  const address = isAr ? contact?.address_ar : contact?.address_en;
  const rootCats = allCategories.filter((c) => !c.parent_id).slice(0, 6);

  return (
    <footer className="relative mt-12 border-t border-[color:var(--hany-border-soft)] bg-white/60 backdrop-blur-sm">
      <div className="h-1 w-full" style={{ background: "var(--hany-grad)" }} />

      <div className="container py-14">
        {/* Top: brand + CTA */}
        <div className="grid gap-8 md:grid-cols-2 mb-10 pb-10 border-b border-[color:var(--hany-border-soft)]">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span
                className="grid place-items-center h-9 w-9 rounded-xl text-white font-bold shadow-md"
                style={{ background: "var(--hany-grad)" }}
              >
                {(siteName || "H").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-xl font-bold">{siteName}</span>
            </Link>
            {description && (
              <p className="mt-4 text-sm text-[color:var(--hany-fg-muted)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <div className="md:text-end">
            <h3 className="text-lg font-bold mb-2">
              {isAr ? "ابدأ مشروعك معنا" : "Start your project with us"}
            </h3>
            <p className="text-sm text-[color:var(--hany-fg-muted)] mb-4">
              {isAr ? "محادثة مجانية، عرض سعر خلال 24 ساعة" : "Free chat, quote within 24h"}
            </p>
            <HanyButton asChild size="md" variant="primary">
              <Link href="/contact">{isAr ? "تواصل معنا" : "Contact us"}</Link>
            </HanyButton>
          </div>
        </div>

        {/* Columns */}
        <div className="grid gap-10 md:grid-cols-12">
          {/* Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="hany-eyebrow">{isAr ? "تواصل" : "Contact"}</h4>
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-sm text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)]"
              >
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-[var(--hany-grad-soft)] text-[color:var(--hany-brand)]">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span dir="ltr">{contact.email}</span>
              </a>
            )}
            {contact?.phone && (
              <div className="flex items-center gap-2 text-sm text-[color:var(--hany-fg-muted)]">
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-[var(--hany-grad-soft)] text-[color:var(--hany-brand)]">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <span dir="ltr">{contact.phone}</span>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-2 text-sm text-[color:var(--hany-fg-muted)]">
                <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-[var(--hany-grad-soft)] text-[color:var(--hany-brand)] mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                {contact?.address_link ? (
                  <a href={contact.address_link} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--hany-brand)]">
                    {address}
                  </a>
                ) : (
                  <span>{address}</span>
                )}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="md:col-span-3">
            <h4 className="hany-eyebrow mb-3">{tc("services")}</h4>
            <ul className="space-y-2.5">
              {rootCats.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/services?category=${c.slug}`}
                    className="text-sm text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)]"
                  >
                    {isAr ? c.name_ar : c.name_en}
                  </Link>
                </li>
              ))}
              {rootCats.length === 0 && (
                <li>
                  <Link href="/services" className="text-sm text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)]">
                    {tc("services")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="hany-eyebrow mb-3">{isAr ? "الشركة" : "Company"}</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about"     className="text-sm text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)]">{tc("about")}</Link></li>
              <li><Link href="/portfolio" className="text-sm text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)]">{tc("portfolio")}</Link></li>
              <li><Link href="/blog"      className="text-sm text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)]">{tc("blog")}</Link></li>
              <li><Link href="/contact"   className="text-sm text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)]">{tc("contact")}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-3">
            <h4 className="hany-eyebrow mb-3">{isAr ? "روابط" : "Resources"}</h4>
            <ul className="space-y-2.5">
              {footerPages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/p/${p.slug}`} className="text-sm text-[color:var(--hany-fg-muted)] hover:text-[color:var(--hany-brand)]">
                    {isAr ? p.title_ar : p.title_en}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Social icon={Facebook}  href={contact?.social?.facebook}  label="Facebook" />
              <Social icon={Instagram} href={contact?.social?.instagram} label="Instagram" />
              <Social icon={Twitter}   href={contact?.social?.twitter}   label="Twitter" />
              <Social icon={Linkedin}  href={contact?.social?.linkedin}  label="LinkedIn" />
              <Social icon={Youtube}   href={contact?.social?.youtube}   label="YouTube" />
              <Social icon={Github}    href={contact?.social?.github}    label="GitHub" />
              <Social icon={Send}      href={contact?.social?.telegram}  label="Telegram" />
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-[color:var(--hany-border-soft)] flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--hany-fg-subtle)]">
          <p>
            © {new Date().getFullYear()} {siteName} —{" "}
            {isAr ? "كل الحقوق محفوظة" : "All rights reserved"}
          </p>
          <p>{isAr ? "صُنع بـ ♥ في القاهرة" : "Built with ♥ in Cairo"}</p>
        </div>
      </div>
    </footer>
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
      className="grid place-items-center h-9 w-9 rounded-xl bg-white border border-[color:var(--hany-border-soft)] text-[color:var(--hany-fg-muted)] hover:text-white hover:border-transparent transition-all"
      style={{
        backgroundImage: "none",
      }}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
