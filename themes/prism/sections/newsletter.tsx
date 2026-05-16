import { Mail, Send } from "lucide-react";
import { PrismSection } from "../ui/section";

export function PrismNewsletter({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <PrismSection size="md" id="newsletter">
      <div className="prism-card-outline p-8 md:p-12 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div className="space-y-3">
            <span className="prism-sticker is-amber">
              <Mail className="h-3.5 w-3.5" />
              {isAr ? "نشرة" : "Newsletter"}
            </span>
            <h3 className="prism-display text-3xl md:text-4xl text-white">
              {isAr ? "نصائح " : "Real-world "}
              <span className="prism-grad-text">
                {isAr ? "حقيقية كل أسبوعين." : "tips every two weeks."}
              </span>
            </h3>
            <p className="text-sm md:text-base text-white/65 max-w-md">
              {isAr
                ? "تطوير، تصميم، تسويق رقمي. لا spam — إلغاء الاشتراك بنقرة."
                : "Dev, design, marketing. No spam — unsubscribe in one click."}
            </p>
          </div>
          <form className="space-y-3">
            <label htmlFor="prism-news-email" className="sr-only">
              Email
            </label>
            <input
              id="prism-news-email"
              type="email"
              required
              placeholder={isAr ? "بريدك الإلكتروني" : "your@email.com"}
              className="w-full h-12 rounded-full bg-white/[0.04] border-2 border-white/15 px-5 text-sm text-white placeholder-white/35 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.06] transition"
            />
            <button type="submit" className="prism-btn-primary w-full h-12 inline-flex items-center justify-center gap-2 text-sm">
              <Send className="h-4 w-4" />
              {isAr ? "اشترك الآن" : "Subscribe"}
            </button>
            <p className="text-[11px] text-white/40 text-center prism-mono">
              {isAr ? "نحترم خصوصيتك" : "We respect your inbox"}
            </p>
          </form>
        </div>
      </div>
    </PrismSection>
  );
}
