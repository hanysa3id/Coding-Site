"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Target, Eye, X, User } from "lucide-react";
import type { TeamMember, AboutSettings } from "@/types/database";
import type { LandingSettings } from "@/lib/validators/settings";
import { resolveSectionContent } from "@/lib/landing/section-resolver";

type DisplayMember = {
  id: string;
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  avatar_url: string | null;
};

const FALLBACK_TEAM: DisplayMember[] = [
  {
    id: "pro-fb-1",
    name_ar: "هاني ع.",
    name_en: "Hany A.",
    role_ar: "مؤسس و قائد التقنية",
    role_en: "Founder & CTO",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "pro-fb-2",
    name_ar: "سارة م.",
    name_en: "Sara M.",
    role_ar: "مديرة تصميم واجهات المستخدم",
    role_en: "UX/UI Design Director",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "pro-fb-3",
    name_ar: "كريم ر.",
    name_en: "Karim R.",
    role_ar: "مهندس برمجيات أول",
    role_en: "Senior Lead Engineer",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "pro-fb-4",
    name_ar: "نور ع.",
    name_en: "Nour A.",
    role_ar: "مطورة واجهات أمامية",
    role_en: "Frontend Architect",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "pro-fb-5",
    name_ar: "أحمد س.",
    name_en: "Ahmed S.",
    role_ar: "مهندس بنية خلفية",
    role_en: "Backend & Systems Lead",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "pro-fb-6",
    name_ar: "ليلى ح.",
    name_en: "Layla H.",
    role_ar: "مديرة تسويق رقمي",
    role_en: "Growth & SEO Marketing Lead",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "pro-fb-7",
    name_ar: "يوسف خ.",
    name_en: "Yousef K.",
    role_ar: "مهندس استضافات سحابية",
    role_en: "Cloud DevOps Architect",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: "pro-fb-8",
    name_ar: "هبة س.",
    name_en: "Heba S.",
    role_ar: "مديرة نجاح وتنسيق المشاريع",
    role_en: "Operations & Delivery Lead",
    avatar_url: "https://images.unsplash.com/photo-1534751516642-a131ffd103fd?auto=format&fit=crop&w=400&h=400&q=80",
  },
];

/* ── 3D Tilt Card Component ───────────────────────────────────────────────── */
function TeamCard({
  member,
  isAr,
  onOpen,
}: {
  member: DisplayMember;
  isAr: boolean;
  onOpen: (m: DisplayMember) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el) return;
    if (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      el.style.transform = `perspective(600px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) scale(1.04)`;
    });
  }, []);

  const handlePointerEnter = useCallback(() => setHovered(true), []);

  const handlePointerLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
    setHovered(false);
  }, []);

  const name = isAr ? member.name_ar : member.name_en;
  const role = isAr ? member.role_ar : member.role_en;

  return (
    <div
      ref={cardRef}
      className="pro-team-card p-5 text-center select-none"
      style={{ transition: "transform 0.15s ease, box-shadow 0.3s ease" }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={() => onOpen(member)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === "Enter" && onOpen(member)}
      aria-label={`View ${name} profile`}
    >
      {/* Photo — scales gently on hover */}
      <div className="relative mx-auto mb-4 h-28 w-28 rounded-full overflow-hidden bg-slate-900 border-2 border-white/10"
        style={{
          transition: "border-color 0.4s ease, transform 0.4s ease",
          borderColor: hovered ? "rgba(6,182,212,0.5)" : undefined,
          transform: hovered ? "scale(1.06)" : "scale(1)",
        }}
      >
        {member.avatar_url ? (
          <Image
            src={member.avatar_url}
            alt={name}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-[color:var(--pro-primary)]/20 to-[color:var(--pro-secondary)]/20 flex items-center justify-center">
            <span className="text-2xl font-black text-white">
              {name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info — always visible */}
      <div className="space-y-1">
        <div className="font-bold text-white text-sm leading-tight"
          style={{ color: hovered ? "var(--pro-primary)" : undefined, transition: "color 0.3s ease" }}
        >
          {name}
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {role}
        </div>
      </div>

      {/* View Profile Button — slides up from below text on hover */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: hovered ? "48px" : "0px",
          opacity: hovered ? 1 : 0,
          marginTop: hovered ? "10px" : "0px",
          transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease, margin-top 0.4s ease",
        }}
      >
        <button
          className="pro-shimmer-btn w-full text-center"
          onClick={(e) => { e.stopPropagation(); onOpen(member); }}
          tabIndex={-1}
        >
          {isAr ? "عرض الملف الشخصي" : "View Profile"}
        </button>
      </div>
    </div>
  );
}

/* ── Profile Overlay Component ───────────────────────────────────────────── */
function ProfileOverlay({
  member,
  isAr,
  onClose,
}: {
  member: DisplayMember;
  isAr: boolean;
  onClose: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const name = isAr ? member.name_ar : member.name_en;
  const role = isAr ? member.role_ar : member.role_en;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 320);
  }, [onClose]);

  // Set portal target synchronously before first paint (avoids null on first render)
  useLayoutEffect(() => {
    setPortalTarget(document.body);
  }, []);

  // Scroll lock + ESC key listener
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [handleClose]);

  // Wait until we have a valid client-side portal target
  if (!portalTarget) return null;

  return createPortal(
    /* Fixed overlay — full screen, scrollable on mobile */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch" as never,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "1rem",
        paddingTop: "env(safe-area-inset-top, 1rem)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} profile`}
    >
      {/* Blurred backdrop */}
      <div
        onClick={handleClose}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2,4,10,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 0,
        }}
      />

      {/* Panel — scrolls independently */}
      <div
        className={`pro-profile-panel ${isExiting ? "exiting" : "entering"}`}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "640px",
          margin: "auto",
          marginTop: "2rem",
          marginBottom: "2rem",
          borderRadius: "20px",
          background: "rgba(8,13,22,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(6,182,212,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
          animation: isExiting ? "pro-overlay-out 0.32s ease forwards" : "pro-overlay-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "1rem",
            insetInlineEnd: "1rem",
            height: "36px",
            width: "36px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
          aria-label="Close"
        >
          <X style={{ width: "16px", height: "16px" }} />
        </button>

        <div style={{ padding: "2rem" }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "2rem" }}>
            {/* Animated gradient ring */}
            <div style={{
              padding: "3px",
              borderRadius: "50%",
              background: "conic-gradient(from 0deg, #06b6d4, #6366f1, #06b6d4)",
              animation: "pro-ring-spin 4s linear infinite",
              marginBottom: "1.25rem",
            }}>
              <div style={{ height: "96px", width: "96px", borderRadius: "50%", overflow: "hidden", background: "#0d1117", position: "relative" }}>
                {member.avatar_url ? (
                  <Image src={member.avatar_url} alt={name} fill sizes="96px" style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(99,102,241,0.3))",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <User style={{ width: "40px", height: "40px", color: "#06b6d4" }} />
                  </div>
                )}
              </div>
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>{name}</h2>
            <p style={{ color: "#06b6d4", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>{role}</p>
            <div style={{ marginTop: "1.5rem", width: "64px", height: "1px", background: "linear-gradient(90deg, #06b6d4, #6366f1)" }} />
          </div>

          {/* Expertise */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "12px" }}>
              <span style={{ height: "6px", width: "6px", borderRadius: "50%", background: "#06b6d4", display: "inline-block" }} />
              {isAr ? "مجال الخبرة" : "Expertise Area"}
            </div>
            <p style={{ fontSize: "0.875rem", color: "#cbd5e1", lineHeight: "1.75" }}>
              {isAr
                ? `${name} متخصص في ${role}، يعمل ضمن فريق متكامل من الخبراء لتقديم أفضل الحلول التقنية والإبداعية لعملائنا.`
                : `${name} specializes in ${role}, working as part of a senior cross-functional team delivering high-quality digital solutions.`}
            </p>
          </div>

          {/* CTA — fully hardcoded so portal doesn't need CSS vars */}
          <a
            href="/contact"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "14px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(6,182,212,0.35)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {isAr ? "تواصل مع الفريق" : "Get in Touch"}
          </a>
        </div>
      </div>
    </div>,
    portalTarget
  );
}

/* ── Main ProTeam Component ──────────────────────────────────────────────── */
export function ProTeam({
  locale,
  team,
  about,
  landing,
}: {
  locale: string;
  team: TeamMember[];
  about: AboutSettings | null;
  landing?: LandingSettings | null;
}) {
  const isAr = locale === "ar";

  const MIN = 8;
  const realMembers: DisplayMember[] = team.slice(0, MIN).map((m) => ({
    id: m.id,
    name_ar: m.name_ar,
    name_en: m.name_en,
    role_ar: m.role_ar,
    role_en: m.role_en,
    avatar_url: m.avatar_url,
  }));

  const visibleTeam: DisplayMember[] =
    realMembers.length >= MIN
      ? realMembers
      : [...realMembers, ...FALLBACK_TEAM].slice(0, MIN);

  const [selectedMember, setSelectedMember] = useState<DisplayMember | null>(null);

  // IntersectionObserver for animated underline on mission/vision blocks
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blocks = [missionRef.current, visionRef.current].filter(Boolean);
    if (!blocks.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("revealed")),
      { threshold: 0.3 }
    );
    blocks.forEach((b) => b && obs.observe(b));
    return () => obs.disconnect();
  }, []);

  // Fallback content for mission/vision if DB fields are empty
  const missionText = isAr
    ? (about?.mission_ar || "نحن نؤمن بأن كل مشروع رقمي يستحق أن يُبنى بأعلى معايير الجودة والابتكار، لنكون الشريك الموثوق الذي يحوّل أفكارك إلى منتجات رقمية ناجحة.")
    : (about?.mission_en || "We believe every digital project deserves to be built with the highest standards of quality and innovation, as the trusted partner that transforms your ideas into successful digital products.");

  const visionText = isAr
    ? (about?.vision_ar || "أن نكون المرجع الأول في المنطقة لبناء وتطوير وتسويق المنتجات الرقمية، وأن نُسهم في تشكيل مستقبل الاقتصاد الرقمي العربي.")
    : (about?.vision_en || "To be the leading digital agency in the region for building, developing, and marketing digital products, contributing to shaping the future of the Arab digital economy.");

  const content = resolveSectionContent(landing, "team", locale, {
    title_ar: "وجوه وعقول تقف خلف نجاح كل مشروع",
    title_en: "The Brains Behind Modern Delivery",
    subtitle_ar: "فريق الخبراء",
    subtitle_en: "Senior Engineering Squad",
    description_ar: "نجمع الكفاءات والخبرات البرمجية والتسويقية لنحقق أعلى درجات الجودة والسرعة والأمان لمشروعك.",
    description_en: "A distributed senior team of developers, UX specialists, systems architects, and growth leaders.",
  });

  return (
    <section id="team" className="relative py-20 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 relative">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-xs font-bold tracking-widest text-[color:var(--pro-primary)] uppercase">
            {content.subtitle}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {content.title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Mission / Vision — always shown with fallback text */}
        <div className="grid gap-6 md:grid-cols-2 mb-16">
          <div ref={missionRef} className="pro-card pro-mission-block p-8 text-start relative overflow-hidden hover:border-[color:var(--pro-primary)]/30">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? "رسالتنا" : "Our Mission"}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {missionText}
            </p>
          </div>
          <div ref={visionRef} className="pro-card pro-mission-block p-8 text-start relative overflow-hidden hover:border-[color:var(--pro-secondary)]/30">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? "رؤيتنا" : "Our Vision"}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {visionText}
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleTeam.map((m) => (
            <TeamCard
              key={m.id}
              member={m}
              isAr={isAr}
              onOpen={setSelectedMember}
            />
          ))}
        </div>
      </div>

      {/* Profile Overlay */}
      {selectedMember && (
        <ProfileOverlay
          member={selectedMember}
          isAr={isAr}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </section>
  );
}
