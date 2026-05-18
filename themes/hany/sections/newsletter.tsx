import { Mail } from "lucide-react";

export function HanyNewsletter({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <section id="newsletter" className="py-14 md:py-16">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-white border border-[color:var(--hany-border-soft)] shadow-[var(--hany-shadow-sm)]">
          <div className="absolute -top-20 -end-20 w-72 h-72 rounded-full bg-[var(--hany-grad-soft)] blur-3xl" aria-hidden />
          <div className="relative grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="hany-icon-tile mb-3"><Mail className="h-5 w-5" /></div>
              <h3 className="text-2xl md:text-3xl font-bold">
                {isAr ? "اشترك في النشرة الأسبوعية" : "Subscribe to our weekly newsletter"}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--hany-fg-muted)]">
                {isAr
                  ? "أحدث المقالات والنصائح في عالم البرمجة والتصميم والتسويق — مرة كل أسبوع."
                  : "Latest articles and tips on programming, design, and marketing — once a week."}
              </p>
            </div>
            {/* Form intentionally posts via mailto to avoid backend changes. */}
            <form
              action={`mailto:newsletter@example.com`}
              method="post"
              encType="text/plain"
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                name="email"
                required
                placeholder={isAr ? "بريدك الإلكتروني" : "Your email address"}
                className="flex-1 h-12 px-4 rounded-full border border-[color:var(--hany-border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--hany-brand)]/40"
              />
              <button
                type="submit"
                className="hany-btn-primary inline-flex items-center justify-center h-12 px-6 rounded-full text-sm font-medium"
              >
                {isAr ? "اشترك" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
