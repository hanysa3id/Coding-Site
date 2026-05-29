"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { FileAttachmentsInput } from "@/components/orders/file-attachments-input";
import { VoiceRecorder } from "@/components/orders/voice-recorder";
import { Paperclip, Mic, MessageSquare, Send, ArrowLeft } from "lucide-react";
import { createOrderAction } from "../actions";

export function NewOrderForm({
  serviceId,
  customerName,
  customerWhatsapp,
  locale,
}: {
  serviceId: string;
  customerName: string;
  customerWhatsapp: string;
  locale: string;
}) {
  const isAr = locale === "ar";
  const tc = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [voice, setVoice] = useState<Blob | null>(null);

  const charCount = message.trim().length;
  const isValid = charCount >= 10;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError(
        isAr
          ? "اكتب على الأقل 10 أحرف في رسالتك"
          : "Please write at least 10 characters"
      );
      return;
    }

    const fd = new FormData();
    fd.append("service_id", serviceId);
    fd.append("customer_message", message.trim());
    for (const f of files) fd.append("files", f);
    if (voice) {
      const ext = guessAudioExt(voice.type);
      const filename = `voice-note-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.${ext}`;
      fd.append("voice", new File([voice], filename, { type: voice.type }));
    }

    startTransition(async () => {
      const result = await createOrderAction(fd);
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(
        isAr
          ? `✅ تم إنشاء طلب ${result.orderNumber}`
          : `✅ Order ${result.orderNumber} created`
      );
      router.push(`/orders/${result.orderId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7" dir={isAr ? "rtl" : "ltr"}>
      {/* ── Message ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="customer_message"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--pro-fg, #f8fafc)" }}
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{
                background:
                  "color-mix(in srgb, var(--pro-primary, #06b6d4) 12%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 25%, transparent)",
                color: "var(--pro-primary, #06b6d4)",
              }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </span>
            {isAr ? "رسالتك ومتطلباتك" : "Your message & requirements"}
          </label>
          <span
            className="text-xs tabular-nums"
            style={{
              color:
                charCount < 10
                  ? "var(--pro-fg-subtle, #64748b)"
                  : "var(--pro-secondary, #10b981)",
            }}
          >
            {charCount} {isAr ? "حرف" : "chars"}
          </span>
        </div>

        <Textarea
          id="customer_message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={7}
          placeholder={
            isAr
              ? "اشرح متطلباتك بالتفصيل... أهداف المشروع، الميزات المطلوبة، الموعد المفضل، أي ملاحظات."
              : "Describe your requirements in detail... project goals, features, preferred timeline, any notes."
          }
          disabled={isPending}
          className="resize-none text-sm"
          style={{
            background: "rgba(255,255,255,0.03)",
            border:
              "1px solid color-mix(in srgb, var(--pro-primary, #06b6d4) 15%, transparent)",
            color: "var(--pro-fg, #f8fafc)",
            borderRadius: "12px",
          }}
        />

        {customerWhatsapp && (
          <p
            className="text-xs"
            style={{ color: "var(--pro-fg-subtle, #64748b)" }}
          >
            {isAr
              ? `📱 سنتواصل معك على: ${customerWhatsapp}`
              : `📱 We'll contact you on: ${customerWhatsapp}`}
          </p>
        )}
      </section>

      {/* ── Attachments ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <label
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--pro-fg, #f8fafc)" }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{
              background:
                "color-mix(in srgb, var(--pro-secondary, #10b981) 12%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--pro-secondary, #10b981) 25%, transparent)",
              color: "var(--pro-secondary, #10b981)",
            }}
          >
            <Paperclip className="h-3.5 w-3.5" />
          </span>
          {isAr ? "مرفقات الطلب" : "Attachments"}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "var(--pro-fg-subtle, #64748b)",
            }}
          >
            {isAr ? "اختياري" : "optional"}
          </span>
        </label>
        <p
          className="text-xs"
          style={{ color: "var(--pro-fg-subtle, #64748b)" }}
        >
          {isAr
            ? "ارفق ملفات مرجعية: brief، مخططات، صور، مستندات سابقة، إلخ"
            : "Attach reference files: briefs, mockups, images, prior documents, etc."}
        </p>
        <FileAttachmentsInput
          value={files}
          onChange={setFiles}
          locale={locale}
          disabled={isPending}
        />
      </section>

      {/* ── Voice note ──────────────────────────────────────────────── */}
      <section className="space-y-3">
        <label
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--pro-fg, #f8fafc)" }}
        >
          <span
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{
              background:
                "color-mix(in srgb, var(--pro-accent, #fbbf24) 12%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--pro-accent, #fbbf24) 25%, transparent)",
              color: "var(--pro-accent, #fbbf24)",
            }}
          >
            <Mic className="h-3.5 w-3.5" />
          </span>
          {isAr ? "ملاحظة صوتية" : "Voice note"}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "var(--pro-fg-subtle, #64748b)",
            }}
          >
            {isAr ? "اختياري" : "optional"}
          </span>
        </label>
        <p
          className="text-xs"
          style={{ color: "var(--pro-fg-subtle, #64748b)" }}
        >
          {isAr
            ? "أحياناً يكون شرح المتطلبات بالصوت أوضح من الكتابة. سجّل حتى ٥ دقائق."
            : "Sometimes it's easier to explain by voice. Record up to 5 minutes."}
        </p>
        <VoiceRecorder
          value={voice}
          onChange={setVoice}
          locale={locale}
          disabled={isPending}
        />
      </section>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-start gap-2 rounded-xl p-3 text-sm"
          role="alert"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
          }}
        >
          <span className="shrink-0 mt-0.5">⚠</span>
          {error}
        </div>
      )}

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--pro-primary, #06b6d4) 20%, transparent), transparent)",
        }}
        aria-hidden
      />

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--pro-fg-muted, #94a3b8)",
          }}
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {tc("cancel")}
        </button>

        <button
          type="submit"
          disabled={isPending || !isValid}
          className="pro-btn pro-btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isPending ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
              {isAr ? "جارٍ الإرسال..." : "Submitting..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {isAr ? "إرسال الطلب" : "Submit request"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function guessAudioExt(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mp3") || mime.includes("mpeg")) return "mp3";
  return "webm";
}
