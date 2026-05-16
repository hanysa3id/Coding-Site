import { Link } from "@/i18n/routing";
import { ArrowRight, MessageCircle } from "lucide-react";
import { AuroraButton } from "../ui/aurora-button";
import { GradientOrbs } from "../ui/gradient-orbs";
import { Section } from "../ui/section";

export function AuroraCtaBand({
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
    <Section size="lg">
      <div className="relative overflow-hidden rounded-3xl aurora-glass p-10 md:p-16 text-center">
        <div className="absolute inset-0 -z-10" aria-hidden>
          <GradientOrbs variant="soft" />
        </div>

        <h2 className="aurora-display text-3xl md:text-5xl text-white max-w-2xl mx-auto">
          {isAr ? "جاهز لإطلاق " : "Ready to launch "}
          <span className="aurora-grad-text">
            {isAr ? "مشروعك التالي؟" : "your next project?"}
          </span>
        </h2>
        <p className="mt-4 text-base md:text-lg text-white/60 max-w-xl mx-auto">
          {isAr
            ? "تحدّث مع فريقنا في 24 ساعة. عرض سعر مجاني ومحادثة استكشاف بدون التزام."
            : "Talk to our team within 24 hours. Free scoping call, no commitment required."}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <AuroraButton asChild size="lg" variant="primary">
            <Link href="/contact">
              {isAr ? "ابدأ مشروعاً" : "Start a project"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </AuroraButton>
          <AuroraButton asChild size="lg" variant="secondary">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              {isAr ? "محادثة واتس آب" : "Chat on WhatsApp"}
            </a>
          </AuroraButton>
        </div>
      </div>
    </Section>
  );
}
