import { Fragment } from "react";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { listVisibleServices, listVisibleCategories } from "@/lib/queries/services";
import { getWhatsappNumber, getLandingSettings, getThemeCustomizationsRaw } from "@/lib/settings/get";
import { isSectionVisible } from "@/lib/landing/helpers";
import { themeCustomizationSchema } from "@/lib/validators/theme-builder";
import type {
  PortfolioProject,
  BlogPost,
  TeamMember,
  AboutSettings,
  Review,
} from "@/types/database";
import type { LandingSectionId, LandingFaqItem } from "@/lib/validators/settings";

import { ProEffects } from "./pro-effects";
import { ProHero } from "./sections/hero";
import { ProLogoCloud } from "./sections/logo-cloud";
import { ProFeatures } from "./sections/features";
import { ProStats } from "./sections/stats";
import { ProServices } from "./sections/services";
import { ProProcess } from "./sections/process";
import { ProPortfolio } from "./sections/portfolio";
import { ProTestimonials, type ProReviewItem } from "./sections/testimonials";
import { ProPricing } from "./sections/pricing";
import { ProTeam } from "./sections/team";
import { ProBlog } from "./sections/blog";
import { ProFaq } from "./sections/faq";
import { ProNewsletter } from "./sections/newsletter";
import { ProCta } from "./sections/cta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isAr = locale === "ar";
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Helper functions matching landing contract
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
        .limit(6);
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

  async function loadReviews(): Promise<ProReviewItem[]> {
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
      return rows.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? "",
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

  const customizationsRaw = await getThemeCustomizationsRaw().catch(() => null);
  const rawCustomization = customizationsRaw?.["pro"];
  const parsed = rawCustomization ? themeCustomizationSchema.safeParse(rawCustomization) : null;
  const customization = parsed?.success ? parsed.data : null;

  const show = (id: LandingSectionId) => isSectionVisible(landing, id);

  const sectionsMap: Record<string, React.ReactNode> = {
    hero: <ProHero locale={locale} landing={landing} />,
    logo_cloud: <ProLogoCloud locale={locale} logos={landing?.logos ?? []} landing={landing} />,
    features: <ProFeatures locale={locale} landing={landing} />,
    stats: <ProStats locale={locale} customStats={landing?.stats ?? []} landing={landing} />,
    services: <ProServices locale={locale} services={services} categories={categories} landing={landing} />,
    process: <ProProcess locale={locale} landing={landing} />,
    portfolio: <ProPortfolio locale={locale} projects={projects} landing={landing} />,
    testimonials: <ProTestimonials locale={locale} reviews={reviews} landing={landing} />,
    pricing: <ProPricing locale={locale} landing={landing} />,
    team: <ProTeam locale={locale} team={team} about={about} landing={landing} />,
    blog: <ProBlog locale={locale} posts={posts} landing={landing} />,
    faq: <ProFaq locale={locale} customFaqs={landing?.faqs ?? []} landing={landing} />,
    newsletter: <ProNewsletter locale={locale} landing={landing} />,
    cta: <ProCta locale={locale} landing={landing} />,
  };

  // Compile section elements in order and respect visibility toggles
  let renderedSections: {
    id: string;
    element: React.ReactNode;
    animation: string;
    durationMs: number;
  }[] = [];
  
  if (customization && customization.sections && customization.sections.length > 0) {
    customization.sections.forEach((sec) => {
      const el = sectionsMap[sec.id];
      if (el && sec.visible && show(sec.id as any)) {
        renderedSections.push({
          id: sec.id,
          element: el,
          animation: sec.animation || "fade-up",
          durationMs: sec.duration_ms ?? 700,
        });
      }
    });
  } else {
    // Default fallback order
    const defaultOrder = Object.keys(sectionsMap);
    defaultOrder.forEach((id) => {
      if (show(id as any)) {
        renderedSections.push({
          id,
          element: sectionsMap[id],
          animation: "fade-up",
          durationMs: 700,
        });
      }
    });
  }

  return (
    <div className="theme-pro overflow-x-hidden min-h-screen">
      {/* Fixed animated ambient orbs — layered depth lighting */}
      <div className="pro-ambient-orb pro-ambient-orb-1" aria-hidden />
      <div className="pro-ambient-orb pro-ambient-orb-2" aria-hidden />
      <div className="pro-ambient-orb pro-ambient-orb-3" aria-hidden />

      {/* Grid dot pattern overlay */}
      <div className="pro-mesh animate-pulse" aria-hidden />
      <div className="pro-grid" aria-hidden />

      {/* Global interactive motion controller */}
      <ProEffects />

      {/* Compiled Sections List */}
      <div id="sections-container" className="w-full">
        {renderedSections.map((sec) => (
          <div
            key={sec.id}
            className={`pro-section-reveal pro-anim-${sec.animation}`}
            style={{ "--pro-anim-duration": `${sec.durationMs}ms` } as React.CSSProperties}
          >
            {sec.element}
          </div>
        ))}
      </div>
    </div>
  );
}
