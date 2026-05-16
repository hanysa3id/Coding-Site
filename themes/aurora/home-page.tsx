import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listFeaturedServices } from "@/lib/queries/services";
import { getWhatsappNumber } from "@/lib/settings/get";
import type { PortfolioProject, BlogPost } from "@/types/database";
import { AuroraHero } from "./sections/hero";
import { AuroraBentoFeatures } from "./sections/bento-features";
import { AuroraStatsBand } from "./sections/stats-band";
import { AuroraServicesGrid } from "./sections/services-grid";
import { AuroraPortfolioStrip } from "./sections/portfolio-strip";
import { AuroraProcessSteps } from "./sections/process-steps";
import { AuroraBlogHighlight } from "./sections/blog-highlight";
import { AuroraCtaBand } from "./sections/cta-band";

export async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const isAr = locale === "ar";

  // Build the hero title — single string, split with "|" to render the second
  // line as gradient text. Falls back if the locale file does not include "|".
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

  // Fetch everything in parallel; failures degrade to empty arrays.
  const [services, portfolioRes, blogRes, waNumber] = await Promise.all([
    listFeaturedServices(6).catch(() => []),
    loadPortfolio(),
    loadBlog(),
    getWhatsappNumber().catch(() => null),
  ]);

  return (
    <>
      <AuroraHero
        locale={locale}
        title={heroTitle}
        subtitle={t("heroSubtitle")}
        badge={isAr ? "نُطلق منتجات رقمية مذهلة" : "We ship digital products"}
        primaryCta={{ label: t("ctaServices"), href: "/services" }}
        secondaryCta={{ label: t("ctaContact"), href: "/contact" }}
      />

      <AuroraBentoFeatures locale={locale} />

      <AuroraStatsBand locale={locale} />

      <AuroraServicesGrid locale={locale} services={services} />

      <AuroraPortfolioStrip locale={locale} projects={portfolioRes} />

      <AuroraProcessSteps locale={locale} />

      <AuroraBlogHighlight locale={locale} posts={blogRes} />

      <AuroraCtaBand locale={locale} whatsappNumber={waNumber} />
    </>
  );
}
