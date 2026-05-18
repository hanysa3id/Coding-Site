import { Link } from "@/i18n/routing";
import { ArrowRight, MessageCircle } from "lucide-react";
import { HanyButton } from "../ui/hany-button";

export function HanyCta({
  locale,
  whatsappNumber,
}: {
  locale: string;
  whatsappNumber: string | null;
}) {
  const isAr = locale === "ar";
  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        isAr ? "أرغب ببدء مشروع جديد." : "I'd like to start a new project."
      )}`
    : null;

  return (
    <section id="cta" className="py-16 md:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-[var(--hany-grad)]" aria-hidden />
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3), transparent 40%)",
            }}
            aria-hidden
          />
          <div className="relative max-w-2xl mx-auto text-white">
            <h2 className="hany-display text-3xl md:text-5xl">
              {isAr ? "جاهز تبدأ مشروعك الرقمي؟" : "Ready to start your digital project?"}
            </h2>
            <p className="mt-4 text-base md:text-lg text-white/85">
              {isAr
                ? "محادثة مجانية، عرض سعر خلال 24 ساعة، وفريق محترف يستمع لك."
                : "Free consultation, a quote within 24 hours, and a professional team that listens."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <HanyButton asChild size="lg" variant="accent">
                <Link href="/contact">
                  {isAr ? "ابدأ مشروعك الآن" : "Start your project"}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </HanyButton>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-base font-medium bg-white/15 hover:bg-white/25 text-white border border-white/30 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isAr ? "واتساب" : "WhatsApp"}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
