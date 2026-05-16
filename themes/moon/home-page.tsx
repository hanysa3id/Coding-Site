import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listVisibleServices, listVisibleCategories } from "@/lib/queries/services";
import { getWhatsappNumber, getLandingSettings } from "@/lib/settings/get";
import { isSectionVisible } from "@/lib/landing/helpers";
import type { LandingSectionId } from "@/lib/validators/settings";
import type {
  PortfolioProject,
  BlogPost,
  TeamMember,
  AboutSettings,
  Review,
} from "@/types/database";

import { MoonHero } from "./sections/hero-slider";
import { MoonLogoCloud } from "./sections/logo-cloud";
import { MoonFeatures } from "./sections/features";
import { MoonStatsBand } from "./sections/stats-band";
import { MoonServices } from "./sections/services";
import { MoonProcess } from "./sections/process";
import { MoonPortfolio } from "./sections/portfolio";
import { MoonTestimonials, type MoonReviewItem } from "./sections/testimonials";
import { MoonPricing } from "./sections/pricing";
import { MoonTeam } from "./sections/team";
import { MoonBlog } from "./sections/blog";
import { MoonFaq } from "./sections/faq";
import { MoonNewsletter } from "./sections/newsletter";
import { MoonCta } from "./sections/cta";

// Moon homepage — most comprehensive: every canonical section wired,
// every admin /admin/landing toggle and override respected.
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

  async function loadReviews(): Promise<MoonReviewItem[]> {
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
      {show("hero") && <MoonHero locale={locale} landing={landing} />}
      {show("logo_cloud") && (
        <MoonLogoCloud locale={locale} projects={projects} logos={landing?.logos ?? []} />
      )}
      {show("features") && <MoonFeatures locale={locale} />}
      {show("stats") && <MoonStatsBand locale={locale} customStats={landing?.stats ?? []} />}
      {show("services") && (
        <MoonServices locale={locale} services={services} categories={categories} />
      )}
      {show("process") && <MoonProcess locale={locale} />}
      {show("portfolio") && <MoonPortfolio locale={locale} projects={projects} />}
      {show("testimonials") && <MoonTestimonials locale={locale} reviews={reviews} />}
      {show("pricing") && <MoonPricing locale={locale} />}
      {show("team") && (
        <MoonTeam
          locale={locale}
          team={team}
          about={about}
          customStats={landing?.stats ?? []}
        />
      )}
      {show("blog") && <MoonBlog locale={locale} posts={posts} />}
      {show("faq") && <MoonFaq locale={locale} faqs={landing?.faqs ?? []} />}
      {show("newsletter") && <MoonNewsletter locale={locale} />}
      {show("cta") && <MoonCta locale={locale} whatsappNumber={waNumber} />}
    </>
  );
}
