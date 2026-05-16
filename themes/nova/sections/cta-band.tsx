import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { NovaSection } from "../ui/section";
import { NovaButton } from "../ui/nova-button";

export function NovaCtaBand({
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
    <NovaSection size="xl">
      <div className="relative overflow-hidden rounded-3xl nova-card text-center px-6 py-16 md:py-24">
        {/* Background grad */}
        <div
          className="absolute inset-0 -z-0 opacity-60"
          style={{
            background:
              "radial-gradient(40rem 30rem at 50% 0%, rgba(139,92,246,0.30), transparent 60%), radial-gradient(30rem 20rem at 50% 100%, rgba(244,114,182,0.18), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="nova-display text-3xl md:text-5xl">
            <span className="nova-grad-text">
              {isAr ? "ابدأ مجاناً، انطلق بثقة" : "Free to start, ready to scale"}
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/55">
            {isAr
              ? "آلاف الفرق التطويرية تستخدم منتجاتنا. انضم إليهم اليوم."
              : "Thousands of dev teams already use our work. Join them today."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <NovaButton asChild size="lg" variant="primary">
              <Link href="/services">
                {isAr ? "ابدأ الآن" : "Get started"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </NovaButton>
            <NovaButton asChild size="lg" variant="secondary">
              <a href={waHref} target={whatsappNumber ? "_blank" : undefined} rel="noopener noreferrer">
                {isAr ? "احجز عرضاً تجريبياً" : "Book a demo"}
              </a>
            </NovaButton>
          </div>
        </div>
      </div>
    </NovaSection>
  );
}
