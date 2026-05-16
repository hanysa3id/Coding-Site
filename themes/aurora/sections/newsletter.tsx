import { Section } from "../ui/section";
import { AuroraButton } from "../ui/aurora-button";
import { Mono, H3 } from "../ui/typography";
import { Mail, ArrowRight } from "lucide-react";

// Simple newsletter band. Submits to /api/newsletter (placeholder route).
// Wire to a real provider (Mailchimp/Brevo/Resend Audiences) when ready.
export function AuroraNewsletter({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <Section size="sm" bordered band>
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="space-y-2 max-w-lg">
          <Mono>{isAr ? "النشرة الأسبوعية" : "Weekly newsletter"}</Mono>
          <H3>
            {isAr ? "أفكار ودروس مفيدة — مرة كل أسبوع" : "Useful ideas and field notes — once a week"}
          </H3>
          <p className="text-sm text-white/55">
            {isAr
              ? "دروس عملية من مشاريعنا في التطوير والتصميم والتسويق. بدون spam، إلغاء بنقرة."
              : "Practical lessons from our development, design, and growth work. No spam, one-click unsubscribe."}
          </p>
        </div>

        <form
          action="/api/newsletter"
          method="post"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur"
        >
          <span className="grid place-items-center h-9 w-9 shrink-0 text-white/40">
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
          <AuroraButton type="submit" variant="primary" size="md">
            {isAr ? "اشترك" : "Subscribe"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </AuroraButton>
        </form>
      </div>
    </Section>
  );
}
