import { NovaSection, NovaSectionHeading } from "../ui/section";
import { Mail } from "lucide-react";

// Beautiful email composer mockup — recreates the novu "Beautiful Emails" panel.
export function NovaEmailPreview({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <NovaSection size="lg">
      <NovaSectionHeading
        kicker={isAr ? "محرر البريد" : "Email editor"}
        title={isAr ? "إيميلات جميلة، لا جداول HTML" : "Beautiful emails, not HTML tables"}
        description={
          isAr
            ? "محرر بصري حديث ينتج بريداً يبدو ممتازاً في كل عميل بريد — Gmail, Outlook, Apple Mail."
            : "A modern visual editor that produces emails that look great in every client — Gmail, Outlook, Apple Mail."
        }
      />

      <div className="mt-14 nova-card overflow-hidden max-w-4xl mx-auto">
        {/* Tabs row */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 bg-white/[0.01]">
          <button type="button" className="text-xs nova-mono px-2.5 py-1 rounded-md bg-white/[0.06] text-white">
            {isAr ? "نموذج" : "Template"}
          </button>
          <button type="button" className="text-xs nova-mono px-2.5 py-1 rounded-md text-white/40 hover:text-white/70">
            {isAr ? "صفحة تسجيل" : "Login page"}
          </button>
          <button type="button" className="text-xs nova-mono px-2.5 py-1 rounded-md text-white/40 hover:text-white/70">
            {isAr ? "تسجيل" : "Sign in"}
          </button>
          <span className="ms-auto inline-flex items-center gap-1 text-xs text-white/40">
            <Mail className="h-3 w-3" />
            <span className="nova-mono">live</span>
          </span>
        </div>

        {/* Mock email body */}
        <div className="bg-gradient-to-br from-violet-950/40 to-black/60 p-8 md:p-12">
          <div className="bg-white rounded-2xl shadow-2xl mx-auto max-w-md p-8 text-zinc-800">
            <div className="flex items-center gap-2 mb-6">
              <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
                N
              </span>
              <span className="text-base font-semibold text-zinc-900">Nova</span>
            </div>

            <h3 className="text-xl font-bold text-zinc-900 mb-3">
              {isAr ? "سجّل دخولك إلى حسابك" : "Log in to your account"}
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
              {isAr
                ? "اضغط على الزر بالأسفل لتسجيل الدخول إلى حسابك. هذا الرابط ينتهي بعد 30 دقيقة."
                : "Click the button below to sign in. This link expires in 30 minutes."}
            </p>

            <button
              type="button"
              className="w-full bg-zinc-900 text-white text-sm font-medium rounded-xl h-11 hover:bg-zinc-800 transition-colors"
            >
              {isAr ? "تسجيل الدخول" : "LOG IN"}
            </button>

            <p className="text-xs text-zinc-500 mt-6 leading-relaxed">
              {isAr ? "أو الصق الرابط في متصفحك: " : "Or paste this in your browser: "}
              <span className="text-violet-600 break-all">https://nova.app/login/xyz</span>
            </p>

            <div className="mt-6 pt-6 border-t border-zinc-100">
              <p className="text-xs text-zinc-400">
                {isAr ? "إذا لم تكن أنت من طلب هذا، تجاهل البريد." : "If you didn't request this, ignore this email."}
              </p>
            </div>
          </div>
        </div>

        {/* Email metadata strip */}
        <div className="border-t border-white/[0.06] px-4 py-3 flex items-center justify-between text-[11px] text-white/40 nova-mono">
          <span>{isAr ? "من: " : "From: "}team@nova.app</span>
          <span>{isAr ? "محرّك Nova Email" : "Nova Email Engine"}</span>
        </div>
      </div>
    </NovaSection>
  );
}
