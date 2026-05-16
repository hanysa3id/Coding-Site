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
import { MoonButton } from "./ui/moon-button";
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
    <footer className="relative mt-12 border-t border-white/[0.06]">
      <div
        className="h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(96,165,250,0.55), rgba(129,140,248,0.50), rgba(45,212,191,0.45), transparent)",
        }}
      />

      <div className="container py-16">
        {/* Top row: brand + cta */}
        <div className="grid gap-8 md:grid-cols-2 mb-12 pb-12 border-b border-white/[0.04]">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-bold shadow-md">
                {(siteName || "M").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-xl font-bold text-white">{siteName}</span>
            </Link>
            {description && (
              <p className="mt-4 text-sm text-white/55 leading-relaxed">{description}</p>
            )}
          </div>
          <div className="md:text-end">
            <h3 className="text-lg font-bold text-white mb-2">
              {isAr ? "ابدأ مشروعك معنا" : "Start your project with us"}
            </h3>
            <p className="text-sm text-white/55 mb-4">
              {isAr ? "محادثة مجانية، عرض سعر خلال 24 ساعة" : "Free chat, quote within 24h"}
            </p>
            <MoonButton asChild size="md" variant="primary">
              <Link href="/contact">{isAr ? "تواصل معنا" : "Contact us"}</Link>
            </MoonButton>
          </div>
        </div>

        {/* Columns */}
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 space-y-3">
            <h4 className="moon-eyebrow">{isAr ? "تواصل" : "Contact"}</h4>
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-sm text-white/75 hover:text-white"
              >
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/[0.04] border border-white/10 text-sky-300">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span dir="ltr">{contact.email}</span>
              </a>
            )}
            {contact?.phone && (
              <div className="flex items-center gap-2 text-sm text-white/75">
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/[0.04] border border-white/10 text-sky-300">
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <span dir="ltr" className="moon-mono">
                  {contact.phone}
                </span>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-2 text-sm text-white/75">
                <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-white/[0.04] border border-white/10 text-sky-300 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                {contact?.address_link ? (
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
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            <h4 className="moon-eyebrow mb-3">{tc("services")}</h4>
            <ul className="space-y-2.5">
              {rootCats.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/services?category=${c.slug}`}
                    className="text-sm text-white/55 hover:text-white"
                  >
                    {isAr ? c.name_ar : c.name_en}
                  </Link>
                </li>
              ))}
              {rootCats.length === 0 && (
                <li>
                  <Link href="/services" className="text-sm text-white/55 hover:text-white">
                    {tc("services")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="moon-eyebrow mb-3">{isAr ? "الشركة" : "Company"}</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-white/55 hover:text-white">
                  {tc("about")}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-sm text-white/55 hover:text-white">
                  {tc("portfolio")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-white/55 hover:text-white">
                  {tc("blog")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/55 hover:text-white">
                  {tc("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="moon-eyebrow mb-3">{isAr ? "روابط" : "Resources"}</h4>
            <ul className="space-y-2.5">
              {footerPages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/p/${p.slug}`} className="text-sm text-white/55 hover:text-white">
                    {isAr ? p.title_ar : p.title_en}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Social icon={Facebook} href={contact?.social?.facebook} label="Facebook" />
              <Social icon={Instagram} href={contact?.social?.instagram} label="Instagram" />
              <Social icon={Twitter} href={contact?.social?.twitter} label="Twitter" />
              <Social icon={Linkedin} href={contact?.social?.linkedin} label="LinkedIn" />
              <Social icon={Youtube} href={contact?.social?.youtube} label="YouTube" />
              <Social icon={Github} href={contact?.social?.github} label="GitHub" />
              <Social icon={Send} href={contact?.social?.telegram} label="Telegram" />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} {siteName}
          </p>
          <p className="moon-mono">
            {isAr ? "صُنع بـ ♥ تحت ضوء القمر" : "Crafted under the moonlight"}
          </p>
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
      className="grid place-items-center h-9 w-9 rounded-xl bg-white/[0.04] border border-white/10 text-white/65 hover:text-white hover:bg-gradient-to-br hover:from-sky-500 hover:to-indigo-500 hover:border-transparent transition-all"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
