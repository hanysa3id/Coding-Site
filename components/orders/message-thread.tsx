"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Shield, Mic, Square, Trash2, User } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { AudioPlayer, type AudioTone } from "@/components/orders/audio-player";

type Sender = {
  id: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
} | null;

export type ThreadMessage = {
  id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_kind?: "audio" | "image" | "file" | null;
  attachment_mime?: string | null;
  attachment_size?: number | null;
  attachment_name?: string | null;
  created_at: string;
  sender: Sender;
};

type Props = {
  orderId: string;
  currentUserId: string;
  messages: ThreadMessage[];
  locale: string;
  /** Server action — accepts FormData with `order_id`, optional `content`, optional `audio` File. */
  sendAction: (
    formData: FormData
  ) => Promise<{ success: true } | { success: false; error: string }>;
};

type RecordState = "idle" | "recording";
const MAX_SECONDS = 300;

export function MessageThread({
  orderId,
  currentUserId,
  messages,
  locale,
  sendAction,
}: Props) {
  const isAr = locale === "ar";
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  // Recording state
  const [recState, setRecState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function sendText(e: React.FormEvent) {
    e.preventDefault();
    if (recState === "recording") return;
    const trimmed = content.trim();
    if (!trimmed) return;
    const fd = new FormData();
    fd.append("order_id", orderId);
    fd.append("content", trimmed);
    startTransition(async () => {
      const result = await sendAction(fd);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setContent("");
    });
  }

  function sendVoiceBlob(blob: Blob) {
    const mime = blob.type || "audio/webm";
    const ext = mime.includes("ogg") ? "ogg" : mime.includes("mp4") ? "m4a" : "webm";
    const filename = `voice-${Date.now()}.${ext}`;
    const file = new File([blob], filename, { type: mime });
    const fd = new FormData();
    fd.append("order_id", orderId);
    fd.append("audio", file);
    startTransition(async () => {
      const result = await sendAction(fd);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        isAr ? "متصفحك لا يدعم تسجيل الصوت" : "Browser doesn't support voice recording"
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType =
        ["audio/webm", "audio/ogg", "audio/mp4"].find((t) =>
          window.MediaRecorder?.isTypeSupported?.(t)
        ) ?? undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      cancelledRef.current = false;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecState("idle");
        setElapsed(0);

        if (cancelledRef.current) {
          chunksRef.current = [];
          return;
        }
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType ?? "audio/webm" });
          chunksRef.current = [];
          sendVoiceBlob(blob);
        }
      };

      recorder.start(1000);
      recorderRef.current = recorder;
      setRecState("recording");
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= MAX_SECONDS) {
            stopAndSend();
            return e + 1;
          }
          return e + 1;
        });
      }, 1000);
    } catch (err) {
      const e = err as DOMException;
      if (e?.name === "NotAllowedError") {
        toast.error(
          isAr
            ? "تم رفض إذن الميكروفون. فعّله من إعدادات الموقع في المتصفح."
            : "Microphone permission denied. Enable it in browser site settings."
        );
      } else if (e?.name === "NotFoundError") {
        toast.error(isAr ? "لا يوجد ميكروفون متصل" : "No microphone connected");
      } else {
        toast.error(
          isAr ? `تعذّر التسجيل: ${e?.message ?? e?.name}` : `Recording failed: ${e?.message ?? e?.name}`
        );
      }
    }
  }

  function stopAndSend() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      cancelledRef.current = false;
      recorderRef.current.stop();
    }
  }

  function cancelRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      cancelledRef.current = true;
      recorderRef.current.stop();
    }
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {isAr ? "ابدأ المحادثة بإرسال رسالتك الأولى" : "Start the conversation"}
          </p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMine={m.sender_id === currentUserId}
              locale={locale}
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="border-t bg-background">
        {recState === "recording" ? (
          <RecordingBar
            elapsed={elapsed}
            onCancel={cancelRecording}
            onSend={stopAndSend}
            isPending={isPending}
            locale={locale}
          />
        ) : (
          <form onSubmit={sendText} className="flex gap-2 p-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isAr ? "اكتب رسالتك..." : "Type your message..."}
              rows={2}
              disabled={isPending}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText(e as unknown as React.FormEvent);
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={startRecording}
              disabled={isPending}
              aria-label={isAr ? "تسجيل ملاحظة صوتية" : "Record voice note"}
              title={isAr ? "تسجيل ملاحظة صوتية" : "Record voice note"}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !content.trim()}
              aria-label={isAr ? "إرسال" : "Send"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────── Subcomponents ────────────────────────────── */

function RecordingBar({
  elapsed,
  onCancel,
  onSend,
  isPending,
  locale,
}: {
  elapsed: number;
  onCancel: () => void;
  onSend: () => void;
  isPending: boolean;
  locale: string;
}) {
  const isAr = locale === "ar";
  return (
    <div className="flex items-center gap-3 p-3 bg-destructive/5">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onCancel}
        disabled={isPending}
        className="text-destructive"
        aria-label={isAr ? "إلغاء التسجيل" : "Cancel recording"}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="flex-1 inline-flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <span className="font-mono text-sm">{formatTime(elapsed)}</span>
        <span className="text-xs text-muted-foreground">
          / {formatTime(MAX_SECONDS)}
        </span>
        <span className="ms-auto text-xs text-muted-foreground hidden sm:inline">
          {isAr ? "اضغط ⏹️ للإرسال أو 🗑️ للإلغاء" : "Press stop to send or trash to cancel"}
        </span>
      </div>
      <Button
        type="button"
        size="icon"
        onClick={onSend}
        disabled={isPending}
        aria-label={isAr ? "إيقاف وإرسال" : "Stop and send"}
      >
        <Square className="h-4 w-4 fill-current" />
      </Button>
    </div>
  );
}

function MessageBubble({
  message: m,
  isMine,
  locale,
}: {
  message: ThreadMessage;
  isMine: boolean;
  locale: string;
}) {
  const isAr = locale === "ar";
  const isStaff = !!m.sender?.role && m.sender.role !== "customer";
  const role = m.sender?.role ?? "customer";

  const initials = (m.sender?.full_name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hasAudio = m.attachment_kind === "audio" && m.attachment_url;
  const hasText = !!m.content;

  // Color scheme is driven by SENDER ROLE (not by who's viewing) so that an
  // admin's bubble looks the same whether the customer or another admin is
  // reading the thread — clear visual attribution.
  const audioTone: AudioTone = isStaff ? "admin" : "customer";
  const bubble = isStaff
    ? "bg-primary text-primary-foreground"
    : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 border border-emerald-200/60 dark:border-emerald-800/60";

  // Container for audio-only messages: same shape/color as the text bubble
  // so the sender's role is always visually obvious even without a text body.
  const audioBubble = isStaff
    ? "bg-primary/10 border border-primary/25 dark:bg-primary/15"
    : "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60";

  const roleLabel = roleLabelFor(role, locale);

  return (
    <div className={cn("flex gap-2.5", isMine && "flex-row-reverse")}>
      <Avatar
        className={cn(
          "h-9 w-9 shrink-0 ring-2",
          isStaff ? "ring-primary/20" : "ring-emerald-400/30"
        )}
      >
        {m.sender?.avatar_url && (
          <AvatarImage src={m.sender.avatar_url} alt={m.sender.full_name ?? ""} />
        )}
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            isStaff
              ? "bg-primary text-primary-foreground"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
          )}
        >
          {isStaff && !m.sender?.avatar_url ? (
            <Shield className="h-4 w-4" />
          ) : initials ? (
            initials
          ) : (
            <User className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className={cn("max-w-[85%] sm:max-w-[75%] space-y-1.5", isMine && "items-end")}>
        {/* Header: name + role chip — same side as bubble */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-[11px]",
            isMine ? "justify-end" : "justify-start"
          )}
        >
          <span className="font-semibold text-foreground">
            {m.sender?.full_name ?? (isAr ? "مجهول" : "Unknown")}
          </span>
          {roleLabel && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                isStaff
                  ? "bg-primary/10 text-primary"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              )}
            >
              {roleLabel}
            </span>
          )}
        </div>

        {hasAudio && (
          <div
            className={cn(
              "rounded-2xl p-2.5 shadow-sm",
              isMine ? "rounded-tr-sm" : "rounded-tl-sm",
              audioBubble
            )}
          >
            <AudioPlayer
              src={m.attachment_url!}
              tone={audioTone}
              sizeBytes={m.attachment_size}
            />
          </div>
        )}

        {hasText && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words shadow-sm",
              isMine ? "rounded-tr-sm" : "rounded-tl-sm",
              bubble
            )}
          >
            {m.content}
          </div>
        )}

        <div
          className={cn(
            "text-[10px] text-muted-foreground px-1 tabular-nums",
            isMine && "text-end"
          )}
        >
          {formatDateTime(m.created_at, isAr ? "ar-EG" : "en-US")}
        </div>
      </div>
    </div>
  );
}

function roleLabelFor(role: string, locale: string): string | null {
  const isAr = locale === "ar";
  switch (role) {
    case "admin":
      return isAr ? "مدير" : "Admin";
    case "sales":
      return isAr ? "مبيعات" : "Sales";
    case "staff":
      return isAr ? "فريق العمل" : "Team";
    case "customer":
      return isAr ? "عميل" : "Customer";
    default:
      return null;
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
