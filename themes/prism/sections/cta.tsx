import { Link } from "@/i18n/routing";
import { ArrowUpRight, MessageCircle, Rocket } from "lucide-react";
import { PrismSection } from "../ui/section";
import { PrismButton } from "../ui/prism-button";
import { PrismMarqueeStrip } from "../ui/prism-marquee";

export function PrismCta({
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
    <>
      <PrismMarqueeStrip
        items={
          isAr
            ? ["جاهز؟", "ابدأ الآن", "نتائج فعلية", "خدمات متكاملة", "شركاء النمو"]
            : ["READY?", "START NOW", "REAL RESULTS", "FULL STACK", "GROWTH PARTNERS"]
        }
        tone="dark"
      />

      <PrismSection size="xl" id="cta">
        <div className="prism-card-outline relative p-8 md:p-16 text-center overflow-hidden">
          {/* decorative blobs */}
          <span
            className="prism-blob"
            aria-hidden
            style={{ top: "-20%", insetInlineStart: "-10%", width: "26rem", height: "26rem", background: "var(--p-magenta)" }}
          />
          <span
            className="prism-blob"
            aria-hidden
            style={{ bottom: "-20%", insetInlineEnd: "-10%", width: "22rem", height: "22rem", background: "var(--p-cyan)", animationDelay: "-6s" }}
          />

          <div className="relative max-w-3xl mx-auto space-y-6">
            <span className="prism-sticker is-magenta">
              <Rocket className="h-3.5 w-3.5" />
              {isAr ? "ابدأ مشروعك اليوم" : "Start today"}
            </span>
            <h2 className="prism-display text-4xl md:text-6xl text-white">
              {isAr ? "جاهز لإطلاق " : "Ready to launch "}
              <span className="prism-grad-text">
                {isAr ? "مشروعك التالي؟" : "your next move?"}
              </span>
            </h2>
            <p className="text-base md:text-lg text-white/75 max-w-xl mx-auto">
              {isAr
                ? "محادثة استكشاف مجانية، عرض سعر شفاف، وبدء العمل خلال 48 ساعة."
                : "Free scoping call, transparent quote, work starts within 48 hours."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <PrismButton asChild size="lg" variant="primary">
                <Link href="/contact">
                  {isAr ? "ابدأ مشروعاً" : "Start a project"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </PrismButton>
              <PrismButton asChild size="lg" variant="secondary">
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  {isAr ? "محادثة واتس آب" : "WhatsApp us"}
                </a>
              </PrismButton>
            </div>
          </div>
        </div>
      </PrismSection>
    </>
  );
}
