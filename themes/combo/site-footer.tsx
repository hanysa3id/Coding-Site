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
  ArrowUpRight,
} from "lucide-react";
import { ComboButton } from "./ui/combo-button";
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
    <footer className="relative mt-20">
      <div className="combo-divider" />

      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 mb-12 pb-12 border-b border-white/[0.06]">
          <div className="max-w-md space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span
                className="grid place-items-center h-12 w-12 rounded-2xl text-white text-lg font-bold shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)",
                  boxShadow: "0 12px 28px -10px rgba(139,92,246,0.65)",
                }}
              >
                {(siteName || "C").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-2xl font-bold text-white tracking-tight">{siteName}</span>
            </Link>
            {description && (
              <p className="text-sm text-white/60 leading-relaxed">{description}</p>
            )}
          </div>
          <div className="md:text-end">
            <h3 className="combo-display text-3xl md:text-4xl text-white">
              {isAr ? "ابدأ مع " : "Start with "}
              <span className="combo-grad-text">
                {isAr ? "فريق هندسي." : "an engineering team."}
              </span>
            </h3>
            <p className="text-sm text-white/55 mt-3 mb-5">
              {isAr
                ? "محادثة مجانية، عرض سعر خلال 24 ساعة."
                : "Free chat, quote within 24 hours."}
            </p>
            <ComboButton asChild size="lg" variant="primary">
              <Link href="/contact">
                {isAr ? "ابدأ مشروعاً" : "Start a project"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </ComboButton>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 space-y-3">
            <h4 className="combo-eyebrow">{isAr ? "تواصل" : "Contact"}</h4>
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-3 text-sm text-white/80 hover:text-white"
              >
                <span className="grid place-items-center h-9 w-9 rounded-xl bg-white/[0.04] border border-white/15 text-fuchsia-300">
                  <Mail className="h-4 w-4" />
                </span>
                <span dir="ltr" className="combo-mono">{contact.email}</span>
              </a>
            )}
            {contact?.phone && (
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="grid place-items-center h-9 w-9 rounded-xl bg-white/[0.04] border border-white/15 text-violet-300">
                  <Phone className="h-4 w-4" />
                </span>
                <span dir="ltr" className="combo-mono">{contact.phone}</span>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-3 text-sm text-white/80">
                <span className="grid place-items-center h-9 w-9 shrink-0 rounded-xl bg-white/[0.04] border border-white/15 text-cyan-300 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </span>
                {contact?.address_link ? (
                  <a href={contact.address_link} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {address}
                  </a>
                ) : (
                  <span>{address}</span>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            <h4 className="combo-eyebrow mb-3">{tc("services")}</h4>
            <ul className="space-y-2.5">
              {rootCats.map((c) => (
                <li key={c.id}>
                  <Link href={`/services?category=${c.slug}`} className="text-sm text-white/60 hover:text-white">
                    {isAr ? c.name_ar : c.name_en}
                  </Link>
                </li>
              ))}
              {rootCats.length === 0 && (
                <li>
                  <Link href="/services" className="text-sm text-white/60 hover:text-white">
                    {tc("services")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="combo-eyebrow mb-3">{isAr ? "الشركة" : "Company"}</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm text-white/60 hover:text-white">{tc("about")}</Link></li>
              <li><Link href="/portfolio" className="text-sm text-white/60 hover:text-white">{tc("portfolio")}</Link></li>
              <li><Link href="/blog" className="text-sm text-white/60 hover:text-white">{tc("blog")}</Link></li>
              <li><Link href="/contact" className="text-sm text-white/60 hover:text-white">{tc("contact")}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="combo-eyebrow mb-3">{isAr ? "روابط" : "Resources"}</h4>
            <ul className="space-y-2.5">
              {footerPages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/p/${p.slug}`} className="text-sm text-white/60 hover:text-white">
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

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
          <p>© {new Date().getFullYear()} {siteName}</p>
          <p className="combo-mono">{isAr ? "صُنع بحب الهندسة" : "Engineered with care"}</p>
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
      className="grid place-items-center h-10 w-10 rounded-xl bg-white/[0.04] border border-white/15 text-white/70 hover:bg-white hover:text-[#0a0418] hover:border-white transition"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
