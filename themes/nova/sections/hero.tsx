import { Link } from "@/i18n/routing";
import { ArrowRight, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { NovaBleedSection } from "../ui/section";
import { NovaButton } from "../ui/nova-button";

export function NovaHero({
  locale,
  siteName,
  whatsappNumber,
}: {
  locale: string;
  siteName: string;
  whatsappNumber: string | null;
}) {
  const isAr = locale === "ar";
  const docsHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : "/contact";

  return (
    <NovaBleedSection size="lg" className="overflow-hidden">
      <div className="container relative z-10">
        {/* Announcement pill */}
        <div className="flex justify-center">
          <a
            href="/blog"
            className="nova-pill inline-flex items-center gap-2 px-3 py-1 text-xs text-white/70 hover:text-white transition-colors group"
          >
            <span className="nova-mono inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500/30 to-pink-500/30 px-2 py-0.5 text-[10px] text-white border border-violet-400/30">
              {isAr ? "جديد" : "NEW"}
            </span>
            <span>{isAr ? "نسخة 2026 — كل ما هو جديد" : "2026 release — what's new"}</span>
            <ArrowRight className="h-3 w-3 rtl:rotate-180 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Headline */}
        <div className="mt-10 text-center max-w-4xl mx-auto space-y-7">
          <h1
            className="nova-display nova-fade-up text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.04]"
            style={{ "--nova-delay": "0ms" } as React.CSSProperties}
          >
            <span className="nova-grad-text">
              {isAr ? "بنية رقمية " : "Digital infrastructure "}
            </span>
            <br />
            <span className="nova-grad-violet">
              {isAr ? "للمنتجات الحديثة" : "for modern products"}
            </span>
          </h1>

          <p
            className="nova-fade-up text-base md:text-lg lg:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed"
            style={{ "--nova-delay": "100ms" } as React.CSSProperties}
          >
            {isAr
              ? `${siteName} يبني تطبيقاتك وبنيتها التحتية بسرعة مذهلة — من فكرة إلى منتج منشور في أسابيع، بأدوات حديثة وتجربة استخدام لا تُنسى.`
              : `${siteName} builds your apps and their infrastructure at remarkable speed — from idea to shipped product in weeks, with modern tooling and unforgettable UX.`}
          </p>

          <div
            className="nova-fade-up flex flex-wrap items-center justify-center gap-3"
            style={{ "--nova-delay": "200ms" } as React.CSSProperties}
          >
            <NovaButton asChild size="lg" variant="primary">
              <Link href="/services">
                {isAr ? "ابدأ مشروعاً" : "Get started"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </NovaButton>
            <NovaButton asChild size="lg" variant="secondary">
              <a href={docsHref} target={whatsappNumber ? "_blank" : undefined} rel="noopener noreferrer">
                {isAr ? "تحدّث معنا" : "Talk to us"}
              </a>
            </NovaButton>
          </div>
        </div>

        {/* Floating product mockup */}
        <div
          className="nova-fade-up relative mx-auto mt-20 max-w-5xl nova-floating-glow"
          style={{ "--nova-delay": "300ms" } as React.CSSProperties}
        >
          <NovaProductMockup locale={locale} />
        </div>
      </div>
    </NovaBleedSection>
  );
}

// 3-panel mockup: phone (left) + inbox panel (center) + code-ish accent (right)
function NovaProductMockup({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const notifs = [
    {
      icon: Bell,
      title: isAr ? "تم استلام طلبك" : "Order received",
      meta: isAr ? "منذ 2 دقيقة" : "2 min ago",
      tint: "from-violet-500/30 to-purple-500/30",
    },
    {
      icon: Mail,
      title: isAr ? "بريد ترحيب جديد" : "Welcome email sent",
      meta: isAr ? "منذ 5 دقائق" : "5 min ago",
      tint: "from-pink-500/30 to-rose-500/30",
    },
    {
      icon: MessageSquare,
      title: isAr ? "رسالة من العميل" : "Customer message",
      meta: isAr ? "منذ 12 دقيقة" : "12 min ago",
      tint: "from-cyan-500/30 to-blue-500/30",
    },
    {
      icon: Smartphone,
      title: isAr ? "إشعار Push" : "Push notification",
      meta: isAr ? "منذ 25 دقيقة" : "25 min ago",
      tint: "from-emerald-500/30 to-green-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-3 md:gap-4">
      {/* Left phone */}
      <div className="col-span-12 sm:col-span-3 hidden sm:block">
        <div className="nova-card aspect-[9/19] p-3 relative overflow-hidden">
          <div className="absolute inset-x-0 top-2 mx-auto h-1 w-12 rounded-full bg-white/10" />
          <div className="mt-6 space-y-2">
            <div className="text-[10px] text-white/40 px-1">{isAr ? "اليوم" : "Today"}</div>
            <div className="nova-notif p-2.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span className="text-[10px] font-semibold text-white">{isAr ? "تم إرسال الفاتورة" : "Invoice sent"}</span>
              </div>
              <p className="text-[9px] text-white/45 leading-relaxed">
                {isAr ? "إلى أحمد محمود — 2,500 ج.م" : "To Ahmed M. — $250"}
              </p>
            </div>
            <div className="nova-notif p-2.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-pink-400" />
                <span className="text-[10px] font-semibold text-white">{isAr ? "بريد ترحيبي" : "Welcome email"}</span>
              </div>
              <p className="text-[9px] text-white/45 leading-relaxed">
                {isAr ? "إلى 12 مشتركاً جديداً" : "To 12 new subscribers"}
              </p>
            </div>
            <div className="nova-notif p-2.5 space-y-1 nova-card-glow">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span className="text-[10px] font-semibold text-white">{isAr ? "تنبيه إدارة" : "Admin alert"}</span>
              </div>
              <p className="text-[9px] text-white/45 leading-relaxed">
                {isAr ? "خادم الإنتاج بنسبة 78%" : "Production server at 78%"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Center inbox panel */}
      <div className="col-span-12 sm:col-span-6">
        <div className="nova-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <span className="nova-tag text-xs">&lt;Inbox /&gt;</span>
            <span className="text-xs text-white/40">{isAr ? "4 جديدة" : "4 new"}</span>
            <span className="ms-auto inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <ul className="divide-y divide-white/[0.04]">
            {notifs.map((n, i) => {
              const Icon = n.icon;
              return (
                <li
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <span
                    className={`grid place-items-center h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br ${n.tint} border border-white/10`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{n.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{n.meta}</p>
                  </div>
                  {i === 0 && (
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-violet-400" />
                  )}
                </li>
              );
            })}
          </ul>
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-white/40 nova-mono">notifications · live</span>
            <span className="inline-flex items-center gap-1 text-emerald-400/90 nova-mono">
              <span className="relative h-1.5 w-1.5">
                <span className="absolute inset-0 nova-pulse rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              connected
            </span>
          </div>
        </div>
      </div>

      {/* Right code accent */}
      <div className="col-span-12 sm:col-span-3 hidden sm:block">
        <div className="nova-code aspect-[9/19] overflow-hidden">
          <div className="nova-code-titlebar">
            <span className="nova-code-dot bg-red-400/70" />
            <span className="nova-code-dot bg-yellow-400/70" />
            <span className="nova-code-dot bg-green-400/70" />
            <span className="ms-2 text-[10px] text-white/35 nova-mono">notify.ts</span>
          </div>
          <pre className="m-0 p-3 text-[10px] leading-5 nova-mono text-white/80" dir="ltr">
            <span style={{ color: "var(--nova-code-cmt)" }}>{`// trigger`}</span>
            {"\n"}
            <span style={{ color: "var(--nova-code-kw)" }}>{`await`}</span>
            {" "}
            <span style={{ color: "var(--nova-code-fn)" }}>{`notify`}</span>
            {"({\n"}
            {"  to: "}
            <span style={{ color: "var(--nova-code-str)" }}>{`"user_42"`}</span>
            {",\n"}
            {"  event: "}
            <span style={{ color: "var(--nova-code-str)" }}>{`"order"`}</span>
            {",\n"}
            {"  data: {\n"}
            {"    amount: "}
            <span style={{ color: "var(--nova-code-num)" }}>{`250`}</span>
            {",\n"}
            {"  },\n"}
            {"});\n\n"}
            <span style={{ color: "var(--nova-code-cmt)" }}>{`// fanout to all`}</span>
            {"\n"}
            <span style={{ color: "var(--nova-code-cmt)" }}>{`// channels...`}</span>
          </pre>
        </div>
      </div>
    </div>
  );
}
