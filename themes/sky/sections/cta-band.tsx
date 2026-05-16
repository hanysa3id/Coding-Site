import { Link } from "@/i18n/routing";
import { ArrowRight, MessageCircle, Rocket } from "lucide-react";
import { SkySection } from "../ui/section";
import { SkyButton } from "../ui/sky-button";

export function CtaBand({
  locale,
  whatsappNumber,
}: {
  locale: string;
  whatsappNumber: string | null;
}) {
  const isAr = locale === "ar";
  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : "/contact";

  return (
    <SkySection size="lg">
      <div
        className="relative overflow-hidden rounded-3xl text-center px-6 py-16 md:py-24 text-white"
        style={{
          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
        }}
      >
        {/* Decorative orbs */}
        <span
          className="sky-cloud sky-float"
          style={{
            top: "-4rem",
            insetInlineStart: "-4rem",
            width: "18rem",
            height: "18rem",
            background: "rgba(255,255,255,0.18)",
          }}
        />
        <span
          className="sky-cloud sky-float"
          style={{
            bottom: "-4rem",
            insetInlineEnd: "-4rem",
            width: "20rem",
            height: "20rem",
            background: "rgba(255,255,255,0.14)",
            animationDelay: "-3s",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs text-white border border-white/30">
            <Rocket className="h-3.5 w-3.5" />
            {isAr ? "ابدأ مشروعك اليوم" : "Start today"}
          </span>
          <h2 className="sky-display text-3xl md:text-5xl">
            {isAr ? "جاهز لإطلاق " : "Ready to launch "}
            <span className="text-amber-300">{isAr ? "مشروعك التالي؟" : "your next project?"}</span>
          </h2>
          <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto">
            {isAr
              ? "تواصل معنا اليوم — محادثة استكشاف مجانية، عرض سعر شفاف، وبدء العمل خلال 48 ساعة."
              : "Reach out today — free scoping call, transparent quote, work starts in 48 hours."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <SkyButton asChild size="lg" variant="secondary" className="!bg-white !text-slate-900 hover:!bg-slate-50">
              <Link href="/contact">
                {isAr ? "ابدأ مشروعاً" : "Start a project"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </SkyButton>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium text-white bg-white/15 border border-white/30 hover:bg-white/25 transition"
            >
              <MessageCircle className="h-4 w-4" />
              {isAr ? "محادثة واتس آب" : "Chat on WhatsApp"}
            </a>
          </div>
        </div>
      </div>
    </SkySection>
  );
}
