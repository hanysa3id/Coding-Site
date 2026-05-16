import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listFeaturedServices } from "@/lib/queries/services";
import { getWhatsappNumber, getLandingSettings } from "@/lib/settings/get";
import { isSectionVisible, resolveHero } from "@/lib/landing/helpers";
import type { LandingSectionId } from "@/lib/validators/settings";
import type { PortfolioProject, BlogPost } from "@/types/database";

import { AuroraHero } from "./sections/hero";
import { AuroraLogoCloud } from "./sections/logo-cloud";
import { AuroraBentoFeatures } from "./sections/bento-features";
import { AuroraStatsBand } from "./sections/stats-band";
import { AuroraServicesGrid } from "./sections/services-grid";
import { AuroraProcessSteps } from "./sections/process-steps";
import { AuroraPortfolioStrip } from "./sections/portfolio-strip";
import { AuroraTestimonials } from "./sections/testimonials";
import { AuroraPricingTeaser } from "./sections/pricing-teaser";
import { AuroraBlogHighlight } from "./sections/blog-highlight";
import { AuroraFaq } from "./sections/faq";
import { AuroraNewsletter } from "./sections/newsletter";
import { AuroraCtaBand } from "./sections/cta-band";

// Canonical homepage composition for the Aurora theme.
// Order must match the table in themes/aurora/DESIGN_SYSTEM.md §4.
export async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const isAr = locale === "ar";

  const rawTitle = t("heroTitle");
  const heroTitle =
    rawTitle.includes("|")
      ? rawTitle
      : isAr
      ? `حلول رقمية|تحقق أهداف عملك`
      : `Digital solutions|that ship`;

  const supabase = await createClient();
  const now = new Date().toISOString();

  async function loadPortfolio(): Promise<PortfolioProject[]> {
    try {
      const { data } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("is_visible", true)
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(6);
      return (data as PortfolioProject[] | null) ?? [];
    } catch {
      return [];
    }
  }

  async function loadBlog(): Promise<BlogPost[]> {
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
        .order("published_at", { ascending: false })
        .limit(3);
      return (data as BlogPost[] | null) ?? [];
    } catch {
      return [];
    }
  }

  const [services, projects, posts, waNumber, landing] = await Promise.all([
    listFeaturedServices(6).catch(() => []),
    loadPortfolio(),
    loadBlog(),
    getWhatsappNumber().catch(() => null),
    getLandingSettings().catch(() => null),
  ]);

  const show = (id: LandingSectionId) => isSectionVisible(landing, id);
  const hero = resolveHero(landing, locale, {
    badge: isAr ? "نُطلق منتجات رقمية مذهلة" : "We ship digital products",
    title: heroTitle,
    subtitle: t("heroSubtitle"),
    primaryLabel: t("ctaServices"),
    primaryHref: "/services",
    secondaryLabel: t("ctaContact"),
    secondaryHref: "/contact",
  });

  return (
    <>
      {show("hero") && (
        <AuroraHero
          locale={locale}
          title={hero.title}
          subtitle={hero.subtitle}
          badge={hero.badge}
          primaryCta={{ label: hero.primary.label, href: hero.primary.href }}
          secondaryCta={{ label: hero.secondary.label, href: hero.secondary.href }}
        />
      )}

      {show("logo_cloud") && <AuroraLogoCloud locale={locale} />}

      {show("features") && <AuroraBentoFeatures locale={locale} />}

      {show("stats") && <AuroraStatsBand locale={locale} />}

      {show("services") && <AuroraServicesGrid locale={locale} services={services} />}

      {show("process") && <AuroraProcessSteps locale={locale} />}

      {show("portfolio") && <AuroraPortfolioStrip locale={locale} projects={projects} />}

      {show("testimonials") && <AuroraTestimonials locale={locale} />}

      {show("pricing") && <AuroraPricingTeaser locale={locale} />}

      {show("blog") && <AuroraBlogHighlight locale={locale} posts={posts} />}

      {show("faq") && <AuroraFaq locale={locale} />}

      {show("newsletter") && <AuroraNewsletter locale={locale} />}

      {show("cta") && <AuroraCtaBand locale={locale} whatsappNumber={waNumber} />}
    </>
  );
}
