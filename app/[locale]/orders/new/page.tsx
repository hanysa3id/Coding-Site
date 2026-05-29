import { getLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { NewOrderForm } from "./new-order-form";
import { formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Zap,
} from "lucide-react";
import type { Service } from "@/types/database";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service: serviceId } = await searchParams;
  if (!serviceId) notFound();

  const locale = await getLocale();
  const isAr = locale === "ar";
  const profile = await requireUser();

  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("is_visible", true)
    .single();

  if (!service) notFound();

  const s = service as Service;
  const priceLabel = s.estimated_price_min
    ? formatCurrency(
        s.estimated_price_min,
        s.currency,
        isAr ? "ar-EG" : "en-US"
      )
    : null;

  const serviceName = isAr ? s.name_ar : s.name_en;
  const serviceDesc = isAr ? s.short_description_ar : s.short_description_en;

  const steps = isAr
    ? [
        { icon: MessageSquare, label: "أرسل تفاصيل طلبك" },
        { icon: Zap, label: "نراجع ونتواصل معك" },
        { icon: ShieldCheck, label: "نبدأ التنفيذ" },
      ]
    : [
        { icon: MessageSquare, label: "Submit your request" },
        { icon: Zap, label: "We review & contact you" },
        { icon: ShieldCheck, label: "We start execution" },
      ];

  return (
    <div className="container pb-20 pt-6">
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav
        className="flex items-center gap-2 text-xs mb-8"
        style={{ color: "var(--pro-fg-subtle, #64748b)" }}
        aria-label={isAr ? "مسار التنقل" : "Breadcrumb"}
      >
        <Link
          href="/services"
          className="hover:text-white transition-colors"
        >
          {isAr ? "الخدمات" : "Services"}
        </Link>
        <ArrowRight className="h-3 w-3 rtl:rotate-180 shrink-0" />
        <Link
          href={`/services/${s.slug}`}
          className="truncate max-w-[160px] hover:text-white transition-colors"
        >
          {serviceName}
        </Link>
        <ArrowRight className="h-3 w-3 rtl:rotate-180 shrink-0" />
        <span style={{ color: "var(--pro-primary, #06b6d4)" }}>
          {isAr ? "طلب جديد" : "New request"}
        </span>
      </nav>

      {/* ── Page hero ──────────────────────────────────────────────────── */}
      <header className="mb-10 text-center relative">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 flex justify-center"
        >
          <div
            className="h-48 w-[28rem] rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse, var(--pro-primary, #06b6d4), transparent 70%)",
            }}
          />
        </div>

        <div
          className="inline-flex items-center gap-2 pro-badge pro-badge-glow mb-4"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {isAr ? "طلب خدمة" : "Service request"}
        </div>

        <h1
          className="pro-heading-glow pro-text-gradient-animate mb-3"
        >
          {isAr ? "طلب خدمة جديدة" : "Request a new service"}
        </h1>

        <p
          className="max-w-xl mx-auto text-base"
          style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
        >
          {isAr
            ? "أدخل تفاصيل طلبك وسنرد عليك خلال 24 ساعة"
            : "Tell us about your request and we'll respond within 24 hours"}
        </p>
      </header>

      {/* ── How it works steps ─────────────────────────────────────────── */}
      <div className="flex justify-center gap-0 mb-10 max-w-lg mx-auto">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background:
                      "color-mix(in srgb, var(--pro-primary, #06b6d4) 12%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 30%, transparent)",
                    color: "var(--pro-primary, #06b6d4)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className="text-[10px] font-medium text-center leading-tight"
                  style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="h-px flex-1 mb-4 mx-1"
                  style={{
                    background:
                      "linear-gradient(to right, color-mix(in srgb, var(--pro-primary, #06b6d4) 40%, transparent), color-mix(in srgb, var(--pro-primary, #06b6d4) 10%, transparent))",
                  }}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] max-w-5xl mx-auto">
        {/* ── Form card ────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background:
              "linear-gradient(145deg, rgba(8,13,22,0.92), rgba(13,21,34,0.88))",
            border:
              "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 15%, transparent)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* Top accent line */}
          <div
            className="h-[2px] -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 rounded-t-2xl"
            style={{
              background:
                "linear-gradient(90deg, var(--pro-primary, #06b6d4), var(--pro-secondary, #10b981))",
            }}
            aria-hidden
          />

          <NewOrderForm
            serviceId={s.id}
            customerName={profile.full_name ?? ""}
            customerWhatsapp={profile.whatsapp_number ?? profile.phone ?? ""}
            locale={locale}
          />
        </div>

        {/* ── Service summary sidebar ───────────────────────────────────── */}
        <aside className="space-y-4">
          {/* Service card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(8,13,22,0.85)",
              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Cover image */}
            {s.cover_image && (
              <div className="relative aspect-video">
                <Image
                  src={s.cover_image}
                  alt={serviceName}
                  fill
                  sizes="340px"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(8,13,22,0.8) 0%, transparent 60%)",
                  }}
                  aria-hidden
                />
              </div>
            )}

            <div className="p-5">
              {/* Featured badge */}
              {s.is_featured && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-3 text-black"
                  style={{
                    background: "var(--pro-accent, #fbbf24)",
                  }}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  {isAr ? "مميزة" : "Featured"}
                </span>
              )}

              <h2
                className="text-lg font-bold mb-1.5"
                style={{ color: "var(--pro-fg, #f8fafc)" }}
              >
                {serviceName}
              </h2>

              {serviceDesc && (
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
                >
                  {serviceDesc}
                </p>
              )}

              {/* Price + Duration */}
              <div
                className="flex flex-wrap gap-3 pt-4"
                style={{
                  borderTop:
                    "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {priceLabel && (
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[10px] uppercase tracking-widest font-semibold mb-0.5"
                      style={{ color: "var(--pro-fg-subtle, #64748b)" }}
                    >
                      {isAr ? "السعر التقديري" : "Est. price"}
                    </p>
                    <p
                      className="text-lg font-bold"
                      style={{ color: "var(--pro-primary, #06b6d4)" }}
                    >
                      {isAr ? `من ${priceLabel}` : `From ${priceLabel}`}
                    </p>
                  </div>
                )}
                {s.estimated_duration_days && (
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[10px] uppercase tracking-widest font-semibold mb-0.5"
                      style={{ color: "var(--pro-fg-subtle, #64748b)" }}
                    >
                      {isAr ? "المدة التقديرية" : "Est. duration"}
                    </p>
                    <p
                      className="text-lg font-bold inline-flex items-center gap-1.5"
                      style={{ color: "var(--pro-fg, #f8fafc)" }}
                    >
                      <Clock
                        className="h-4 w-4"
                        style={{ color: "var(--pro-secondary, #10b981)" }}
                      />
                      {s.estimated_duration_days}{" "}
                      {isAr ? "يوم" : "days"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guarantee card */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{
              background:
                "color-mix(in srgb, var(--pro-secondary, #10b981) 5%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--pro-secondary, #10b981) 20%, transparent)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--pro-secondary, #10b981)" }}
            >
              {isAr ? "ضماناتنا" : "Our guarantees"}
            </p>
            {(isAr
              ? [
                  "رد خلال 24 ساعة",
                  "أسعار واضحة ومتفق عليها",
                  "مراجعات مجانية حتى رضاك",
                ]
              : [
                  "Response within 24 hours",
                  "Clear, agreed-upon pricing",
                  "Free revisions until satisfied",
                ]
            ).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <ShieldCheck
                  className="h-4 w-4 shrink-0"
                  style={{ color: "var(--pro-secondary, #10b981)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--pro-fg-muted, #94a3b8)" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p
            className="text-xs text-center leading-relaxed px-2"
            style={{ color: "var(--pro-fg-subtle, #64748b)" }}
          >
            {isAr
              ? "الأسعار والمدة المعروضة تقديرية. سيتم الاتفاق على القيم النهائية بعد مراجعة طلبك."
              : "Prices and duration shown are estimates. Final values will be agreed after reviewing your request."}
          </p>
        </aside>
      </div>
    </div>
  );
}
