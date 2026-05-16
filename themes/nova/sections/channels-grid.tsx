import { NovaSection, NovaSectionHeading } from "../ui/section";
import { Mail, Bell, MessageSquare, Smartphone, Inbox, Webhook } from "lucide-react";

const CHANNELS = [
  { icon: Inbox, ar: "صندوق الوارد", en: "In-app inbox" },
  { icon: Mail, ar: "بريد إلكتروني", en: "Email" },
  { icon: Bell, ar: "إشعارات Push", en: "Push" },
  { icon: MessageSquare, ar: "محادثات", en: "Chat" },
  { icon: Smartphone, ar: "SMS", en: "SMS" },
  { icon: Webhook, ar: "ويب هوكس", en: "Webhooks" },
];

export function NovaChannelsGrid({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <NovaSection size="lg">
      <NovaSectionHeading
        kicker={isAr ? "كل القنوات" : "All channels"}
        title={isAr ? "كل قنواتك في منصة واحدة" : "All your channels in one platform"}
        description={
          isAr
            ? "اكتب مرة، أرسل في كل مكان — بريد، إشعارات، SMS، محادثات، ومزيد."
            : "Author once, deliver everywhere — email, push, SMS, chat, and more."
        }
      />

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CHANNELS.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="nova-card p-5 flex items-center gap-4 hover:border-violet-400/30 transition-colors"
            >
              <span className="grid place-items-center h-10 w-10 rounded-lg nova-tile">
                <Icon className="h-5 w-5 text-violet-200" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {isAr ? c.ar : c.en}
                </p>
                <p className="text-xs text-white/45 mt-0.5 nova-mono">/v1/channels/{c.en.toLowerCase().replace(/\s+/g, "-")}</p>
              </div>
            </div>
          );
        })}
      </div>
    </NovaSection>
  );
}
