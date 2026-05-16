import { NovaSection } from "../ui/section";
import { Copy } from "lucide-react";

export function NovaCodeFeature({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <NovaSection size="lg">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left copy */}
        <div className="space-y-6 max-w-xl">
          <span className="nova-eyebrow">{isAr ? "ابدأ في 5 دقائق" : "Get started in 5 min"}</span>
          <h2 className="nova-display text-3xl md:text-5xl">
            <span className="nova-grad-text">
              {isAr ? "انسخ، الصق، وانطلق" : "Just copy and ship"}
            </span>
          </h2>
          <p className="text-base md:text-lg text-white/55 leading-relaxed">
            {isAr
              ? "أضف الميزة الجديدة لتطبيقك بسطر واحد. SDK واضح، توثيق ممتاز، وأمثلة جاهزة لأكثر من 8 أطر عمل."
              : "Add the new capability to your app in a single line. A clean SDK, excellent docs, and ready-to-paste snippets for 8+ frameworks."}
          </p>

          {/* Tab pills */}
          <div className="nova-tabs flex gap-1">
            <span className="nova-tab" data-active="true">npm</span>
            <span className="nova-tab">pnpm</span>
            <span className="nova-tab">yarn</span>
            <span className="nova-tab">bun</span>
          </div>

          {/* Install line */}
          <div className="nova-code">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-xs text-white/40 nova-mono">$ install</span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white nova-mono transition-colors"
                aria-label="Copy"
              >
                <Copy className="h-3 w-3" />
                {isAr ? "نسخ" : "Copy"}
              </button>
            </div>
            <pre className="m-0 p-4 nova-mono text-sm" dir="ltr">
              <span style={{ color: "var(--nova-code-cmt)" }}>$ </span>
              <span style={{ color: "var(--nova-code-kw)" }}>npm</span>
              {" install "}
              <span style={{ color: "var(--nova-code-str)" }}>@novacorp/sdk</span>
            </pre>
          </div>
        </div>

        {/* Right code block */}
        <div className="nova-code">
          <div className="nova-code-titlebar">
            <span className="nova-code-dot bg-red-400/70" />
            <span className="nova-code-dot bg-yellow-400/70" />
            <span className="nova-code-dot bg-green-400/70" />
            <span className="ms-2 text-[11px] text-white/35 nova-mono">app/notify.ts</span>
          </div>
          <pre className="m-0 p-5 text-[13px] leading-7 nova-mono overflow-x-auto" dir="ltr">
{`import { `}<span style={{ color: "var(--nova-code-fn)" }}>{`Nova`}</span>{` } from `}<span style={{ color: "var(--nova-code-str)" }}>{`"@novacorp/sdk"`}</span>{`;

`}<span style={{ color: "var(--nova-code-kw)" }}>{`const`}</span>{` nova = `}<span style={{ color: "var(--nova-code-kw)" }}>{`new`}</span>{` `}<span style={{ color: "var(--nova-code-fn)" }}>{`Nova`}</span>{`({
  apiKey: process.env.`}<span style={{ color: "var(--nova-code-str)" }}>{`NOVA_KEY`}</span>{`!,
});

`}<span style={{ color: "var(--nova-code-cmt)" }}>{`// trigger any workflow`}</span>{`
`}<span style={{ color: "var(--nova-code-kw)" }}>{`await`}</span>{` nova.`}<span style={{ color: "var(--nova-code-fn)" }}>{`trigger`}</span>{`({
  to: { subscriberId: `}<span style={{ color: "var(--nova-code-str)" }}>{`"user_42"`}</span>{` },
  workflow: `}<span style={{ color: "var(--nova-code-str)" }}>{`"order-placed"`}</span>{`,
  payload: { amount: `}<span style={{ color: "var(--nova-code-num)" }}>{`250`}</span>{`, currency: `}<span style={{ color: "var(--nova-code-str)" }}>{`"USD"`}</span>{` },
});`}
          </pre>
        </div>
      </div>
    </NovaSection>
  );
}
