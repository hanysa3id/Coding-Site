import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listVisibleServices, listVisibleCategories } from "@/lib/queries/services";
import { getWhatsappNumber, getLandingSettings } from "@/lib/settings/get";
import { isSectionVisible } from "@/lib/landing/helpers";
import type {
  PortfolioProject,
  BlogPost,
  TeamMember,
  AboutSettings,
  Review,
} from "@/types/database";
import type { LandingSectionId } from "@/lib/validators/settings";

import { HeroSlider } from "./sections/hero-slider";
import { LogoMarquee } from "./sections/logo-marquee";
import { ServicesByCategory } from "./sections/services-by-category";
import { PortfolioShowcase } from "./sections/portfolio-showcase";
import { SkyTestimonials, type SkyReviewItem } from "./sections/testimonials";
import { TeamStats } from "./sections/team-stats";
import { CtaBand } from "./sections/cta-band";
import { BlogStrip } from "./sections/blog-strip";
import { SkyFaq } from "./sections/faq";

export async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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
        .limit(8);
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

  async function loadTeam(): Promise<TeamMember[]> {
    try {
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });
      return (data as TeamMember[] | null) ?? [];
    } catch {
      return [];
    }
  }

  async function loadAbout(): Promise<AboutSettings | null> {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "about")
        .maybeSingle();
      return (data?.value as AboutSettings | undefined) ?? null;
    } catch {
      return null;
    }
  }

  async function loadReviews(): Promise<SkyReviewItem[]> {
    try {
      const { data } = await supabase
        .from("reviews")
        .select(
          "id, rating, comment, created_at, customer:profiles!customer_id(full_name), service:services!service_id(name_ar, name_en)"
        )
        .eq("is_visible", true)
        .gte("rating", 4)
        .not("comment", "is", null)
        .order("created_at", { ascending: false })
        .limit(6);
      type Row = Review & {
        customer: { full_name: string | null } | null;
        service: { name_ar: string; name_en: string } | null;
      };
      const rows = (data as Row[] | null) ?? [];
      const isAr = locale === "ar";
      return rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        customer_name: r.customer?.full_name ?? null,
        service_name: r.service ? (isAr ? r.service.name_ar : r.service.name_en) : null,
      }));
    } catch {
      return [];
    }
  }

  const [services, categories, projects, posts, team, about, reviews, waNumber, landing] =
    await Promise.all([
      listVisibleServices().catch(() => []),
      listVisibleCategories().catch(() => []),
      loadPortfolio(),
      loadBlog(),
      loadTeam(),
      loadAbout(),
      loadReviews(),
      getWhatsappNumber().catch(() => null),
      getLandingSettings().catch(() => null),
    ]);

  const show = (id: LandingSectionId) => isSectionVisible(landing, id);

  return (
    <>
      {show("hero") && <HeroSlider locale={locale} landing={landing} />}
      {show("logo_cloud") && (
        <LogoMarquee locale={locale} projects={projects} logos={landing?.logos ?? []} />
      )}
      {show("services") && (
        <ServicesByCategory locale={locale} services={services} categories={categories} />
      )}
      {show("portfolio") && <PortfolioShowcase locale={locale} projects={projects} />}
      {show("cta") && <CtaBand locale={locale} whatsappNumber={waNumber} />}
      {show("testimonials") && <SkyTestimonials locale={locale} reviews={reviews} />}
      {show("team") && <TeamStats locale={locale} team={team} about={about} />}
      {show("blog") && <BlogStrip locale={locale} posts={posts} />}
      {show("faq") && <SkyFaq locale={locale} faqs={landing?.faqs ?? []} />}
      {show("cta") && <CtaBand locale={locale} whatsappNumber={waNumber} />}
    </>
  );
}
