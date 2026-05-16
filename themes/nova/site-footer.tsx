import { Link } from "@/i18n/routing";
import { getTranslations, getLocale } from "next-intl/server";
import { getContactSettings, getSiteSettings } from "@/lib/settings/get";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  Instagram,
  Send,
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
  const [contact, site, footerPages] = await Promise.all([
    getContactSettings(),
    getSiteSettings(),
    loadFooterPages(),
  ]);

  const siteName = site ? (isAr ? site.name_ar : site.name_en) : tc("siteName");

  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-white text-xs font-bold">
                {(siteName || "N").slice(0, 1).toUpperCase()}
              </span>
              <span className="text-base font-semibold text-white">{siteName}</span>
            </Link>
            {site && (
              <p className="text-sm text-white/55 max-w-sm">
                {isAr ? site.description_ar : site.description_en}
              </p>
            )}
            <div className="flex items-center gap-2 pt-2">
              <Social icon={Github} href={contact?.social?.github} label="GitHub" />
              <Social icon={Twitter} href={contact?.social?.twitter} label="Twitter" />
              <Social icon={Linkedin} href={contact?.social?.linkedin} label="LinkedIn" />
              <Social icon={Youtube} href={contact?.social?.youtube} label="YouTube" />
              <Social icon={Facebook} href={contact?.social?.facebook} label="Facebook" />
              <Social icon={Instagram} href={contact?.social?.instagram} label="Instagram" />
              <Social icon={Send} href={contact?.social?.telegram} label="Telegram" />
            </div>
          </div>

          <FooterCol label={tc("services")} className="md:col-span-2">
            <FooterLink href="/services">{tc("services")}</FooterLink>
            <FooterLink href="/portfolio">{tc("portfolio")}</FooterLink>
            <FooterLink href="/blog">{tc("blog")}</FooterLink>
          </FooterCol>

          <FooterCol label={isAr ? "الشركة" : "Company"} className="md:col-span-2">
            <FooterLink href="/about">{tc("about")}</FooterLink>
            <FooterLink href="/contact">{tc("contact")}</FooterLink>
            {footerPages.map((p) => (
              <FooterLink key={p.slug} href={`/p/${p.slug}`}>
                {isAr ? p.title_ar : p.title_en}
              </FooterLink>
            ))}
          </FooterCol>

          <FooterCol label={isAr ? "المطورين" : "Developers"} className="md:col-span-2">
            <FooterLink href="/contact">{isAr ? "الدعم" : "Support"}</FooterLink>
            <FooterLink href="/blog">{isAr ? "التوثيق" : "Docs"}</FooterLink>
            <FooterLink href="/blog">{isAr ? "أمثلة" : "Examples"}</FooterLink>
          </FooterCol>

          <FooterCol label={isAr ? "الإعدادات" : "Resources"} className="md:col-span-2">
            <FooterLink href="/blog">{isAr ? "تغيير اللوج" : "Changelog"}</FooterLink>
            <FooterLink href="/blog">{isAr ? "وضع الحالة" : "Status"}</FooterLink>
            <FooterLink href="/contact">{isAr ? "اتصل بفريق المبيعات" : "Talk to sales"}</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} {siteName}
          </p>
          <p className="nova-mono">
            {isAr ? "صُنع بـ ♥ في القاهرة" : "Built with ♥ in Cairo"}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <h4 className="nova-eyebrow mb-4">{label}</h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors">
        {children}
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
      className="grid place-items-center h-8 w-8 rounded-lg border border-white/10 bg-white/[0.02] text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
    </a>
  );
}
