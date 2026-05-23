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
    <footer className="relative mt-20 border-t border-[color:var(--pro-border-soft)] bg-[#02040a]/80 backdrop-blur-md">
      {/* Animated shimmer gradient top accent */}
      <div className="pro-footer-shimmer" aria-hidden />

      <div className="container mx-auto max-w-7xl py-16 px-6">
        {/* Top brand header */}
        <div className="grid gap-8 md:grid-cols-2 mb-12 pb-12 border-b border-[color:var(--pro-border-soft)]">
          <div className="max-w-md space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span
                className="grid place-items-center h-9 w-9 rounded-xl text-slate-950 font-bold shadow-lg"
                style={{ background: "linear-gradient(135deg, var(--pro-primary), var(--pro-secondary))" }}
              >
                {(siteName || "P").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-xl font-extrabold text-white">{siteName}</span>
            </Link>
            {description && (
              <p className="text-sm text-[color:var(--pro-fg-muted)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <div className="md:text-end space-y-3">
            <h3 className="text-lg font-bold text-white">
              {isAr ? "جاهز لإطلاق مشروعك الفريد؟" : "Ready to launch your product?"}
            </h3>
            <p className="text-sm text-[color:var(--pro-fg-muted)]">
              {isAr ? "محادثة مجانية لبدء التخطيط وتحديد المتطلبات فوراً" : "Claim your free scoping call and map your roadmap today."}
            </p>
            <Link 
              href="/contact"
              className="pro-btn pro-btn-primary inline-flex mt-2 text-slate-950 font-bold"
              style={{ color: "#000" }}
            >
              {isAr ? "تواصل معنا الآن" : "Book Discovery Session"}
            </Link>
          </div>
        </div>

        {/* Columns info */}
        <div className="grid gap-10 md:grid-cols-12">
          {/* Contact coordinates */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-[color:var(--pro-primary)] uppercase">
              {isAr ? "اتصال" : "Contact"}
            </h4>
            <div className="space-y-3">
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-sm text-[color:var(--pro-fg-muted)] hover:text-white transition-colors"
                >
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/5 border border-white/5 text-[color:var(--pro-primary)]">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <span dir="ltr">{contact.email}</span>
                </a>
              )}
              {contact?.phone && (
                <div className="flex items-center gap-3 text-sm text-[color:var(--pro-fg-muted)]">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/5 border border-white/5 text-[color:var(--pro-primary)]">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <span dir="ltr">{contact.phone}</span>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-3 text-sm text-[color:var(--pro-fg-muted)]">
                  <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-white/5 border border-white/5 text-[color:var(--pro-primary)] mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  {contact?.address_link ? (
                    <a href={contact.address_link} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      {address}
                    </a>
                  ) : (
                    <span>{address}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Services routes */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold tracking-widest text-[color:var(--pro-primary)] uppercase mb-4">
              {tc("services")}
            </h4>
            <ul className="space-y-2.5">
              {rootCats.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/services?category=${c.slug}`}
                    className="text-sm text-[color:var(--pro-fg-muted)] hover:text-white transition-colors"
                  >
                    {isAr ? c.name_ar : c.name_en}
                  </Link>
                </li>
              ))}
              {rootCats.length === 0 && (
                <li>
                  <Link href="/services" className="text-sm text-[color:var(--pro-fg-muted)] hover:text-white transition-colors">
                    {tc("services")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company structure */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold tracking-widest text-[color:var(--pro-primary)] uppercase mb-4">
              {isAr ? "الشركة" : "Company"}
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/about"     className="text-sm text-[color:var(--pro-fg-muted)] hover:text-white transition-colors">{tc("about")}</Link></li>
              <li><Link href="/portfolio" className="text-sm text-[color:var(--pro-fg-muted)] hover:text-white transition-colors">{tc("portfolio")}</Link></li>
              <li><Link href="/blog"      className="text-sm text-[color:var(--pro-fg-muted)] hover:text-white transition-colors">{tc("blog")}</Link></li>
              <li><Link href="/contact"   className="text-sm text-[color:var(--pro-fg-muted)] hover:text-white transition-colors">{tc("contact")}</Link></li>
            </ul>
          </div>

          {/* CMS page links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold tracking-widest text-[color:var(--pro-primary)] uppercase">
              {isAr ? "صفحات قانونية" : "Legal"}
            </h4>
            <ul className="space-y-2.5">
              {footerPages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/p/${p.slug}`} className="text-sm text-[color:var(--pro-fg-muted)] hover:text-white transition-colors">
                    {isAr ? p.title_ar : p.title_en}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
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

        {/* Bottom copyright details */}
        <div className="mt-16 pt-8 border-t border-[color:var(--pro-border-soft)] flex flex-wrap items-center justify-between gap-4 text-xs text-[color:var(--pro-fg-subtle)]">
          <p>
            © {new Date().getFullYear()} {siteName}.{" "}
            {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <p>
            {isAr ? "صُنع بكل إتقان واحترافية" : "Crafted with engineering excellence."}
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
      className="pro-social-icon grid place-items-center h-9 w-9 rounded-xl bg-white/5 border border-white/5 text-[color:var(--pro-fg-muted)]"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
