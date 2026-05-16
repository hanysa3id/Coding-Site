import { MoonSection } from "../ui/section";
import { MoonButton } from "../ui/moon-button";
import { Mail, ArrowRight } from "lucide-react";

export function MoonNewsletter({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <MoonSection size="sm" className="border-y border-white/[0.06]">
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="space-y-2 max-w-lg">
          <p className="moon-eyebrow">
            {isAr ? "النشرة الأسبوعية" : "Weekly newsletter"}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-white moon-display">
            <span className="moon-grad-silver">
              {isAr ? "أفكار ودروس مفيدة — مرة كل أسبوع" : "Useful ideas and field notes — once a week"}
            </span>
          </h3>
          <p className="text-sm text-white/55">
            {isAr
              ? "دروس عملية من مشاريعنا في التطوير والتصميم والتسويق. بدون spam، إلغاء بنقرة."
              : "Practical lessons from our development, design, and growth work. No spam, one-click unsubscribe."}
          </p>
        </div>

        <form
          action="/api/newsletter"
          method="post"
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] p-1.5 backdrop-blur"
        >
          <span className="grid place-items-center h-9 w-9 shrink-0 text-white/45">
            <Mail className="h-4 w-4" />
          </span>
          <input
            type="email"
            name="email"
            required
            placeholder={isAr ? "بريدك الإلكتروني" : "you@example.com"}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            dir="ltr"
          />
          <MoonButton type="submit" variant="primary" size="md">
            {isAr ? "اشترك" : "Subscribe"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </MoonButton>
        </form>
      </div>
    </MoonSection>
  );
}
