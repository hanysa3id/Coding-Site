import { Link } from "@/i18n/routing";
import { ArrowRight, MessageCircle, Rocket } from "lucide-react";
import { MoonSection } from "../ui/section";
import { MoonButton } from "../ui/moon-button";
import { MoonOrbs } from "../ui/moon-orbs";

export function MoonCta({
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
    <MoonSection size="xl">
      <div className="relative overflow-hidden rounded-3xl moon-card text-center px-6 py-16 md:py-24">
        {/* Decorative orbs + starfield */}
        <div className="absolute inset-0 -z-0" aria-hidden>
          <MoonOrbs variant="soft" />
        </div>
        <div className="moon-stars" aria-hidden />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="moon-pill inline-flex items-center gap-2 px-3 py-1 text-xs">
            <Rocket className="h-3.5 w-3.5" />
            {isAr ? "ابدأ مشروعك اليوم" : "Start today"}
          </span>
          <h2 className="moon-display text-3xl md:text-5xl">
            <span className="moon-grad-silver">{isAr ? "جاهز لإطلاق " : "Ready to launch "}</span>
            <span className="moon-grad-text">
              {isAr ? "مشروعك التالي؟" : "your next project?"}
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/65 max-w-xl mx-auto">
            {isAr
              ? "تواصل معنا اليوم — محادثة استكشاف مجانية، عرض سعر شفاف، وبدء العمل خلال 48 ساعة."
              : "Reach out today — free scoping call, transparent quote, work starts in 48 hours."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <MoonButton asChild size="lg" variant="primary">
              <Link href="/contact">
                {isAr ? "ابدأ مشروعاً" : "Start a project"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </MoonButton>
            <MoonButton asChild size="lg" variant="secondary">
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                {isAr ? "محادثة واتس آب" : "Chat on WhatsApp"}
              </a>
            </MoonButton>
          </div>
        </div>
      </div>
    </MoonSection>
  );
}
