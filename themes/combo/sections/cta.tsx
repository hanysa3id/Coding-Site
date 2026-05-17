import { Link } from "@/i18n/routing";
import { ArrowUpRight, MessageCircle, Rocket } from "lucide-react";
import { ComboSection } from "../ui/section";
import { ComboButton } from "../ui/combo-button";

export function ComboCta({
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
    <ComboSection size="xl" id="cta">
      <div className="combo-card combo-card-glow is-active relative p-8 md:p-16 text-center overflow-hidden">
        <span
          className="combo-orb"
          aria-hidden
          style={{
            top: "-20%",
            insetInlineStart: "-10%",
            width: "26rem",
            height: "26rem",
            background: "radial-gradient(closest-side, rgba(139,92,246,0.55), transparent)",
          }}
        />
        <span
          className="combo-orb"
          aria-hidden
          style={{
            bottom: "-20%",
            insetInlineEnd: "-10%",
            width: "22rem",
            height: "22rem",
            background: "radial-gradient(closest-side, rgba(6,182,212,0.45), transparent)",
            animationDelay: "-6s",
          }}
        />

        <div className="relative max-w-3xl mx-auto space-y-6">
          <span className="combo-pill inline-flex items-center gap-2 px-3 py-1.5 text-xs">
            <Rocket className="h-3.5 w-3.5" />
            {isAr ? "ابدأ مشروعك اليوم" : "Start today"}
          </span>
          <h2 className="combo-display text-4xl md:text-6xl text-white">
            {isAr ? "جاهز لإطلاق " : "Ready to launch "}
            <span className="combo-grad-text">
              {isAr ? "مشروعك التالي؟" : "your next move?"}
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/75 max-w-xl mx-auto">
            {isAr
              ? "محادثة استكشاف مجانية، عرض سعر شفاف، وبدء العمل خلال 48 ساعة."
              : "Free scoping call, transparent quote, work starts within 48 hours."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <ComboButton asChild size="lg" variant="primary">
              <Link href="/contact">
                {isAr ? "ابدأ مشروعاً" : "Start a project"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </ComboButton>
            <ComboButton asChild size="lg" variant="secondary">
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                {isAr ? "محادثة واتس آب" : "WhatsApp us"}
              </a>
            </ComboButton>
          </div>
        </div>
      </div>
    </ComboSection>
  );
}
