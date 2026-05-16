"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Shield, Mic, Square, Trash2 } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

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
  const isStaff = m.sender?.role && m.sender.role !== "customer";
  const initials = (m.sender?.full_name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasAudio = m.attachment_kind === "audio" && m.attachment_url;
  const hasText = !!m.content;

  return (
    <div className={cn("flex gap-3", isMine && "flex-row-reverse")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isStaff ? "bg-primary text-primary-foreground" : ""}>
          {isStaff ? <Shield className="h-4 w-4" /> : initials}
        </AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[75%] space-y-1", isMine && "items-end")}>
        {hasAudio && (
          <div
            className={cn(
              "rounded-lg p-2",
              isMine ? "bg-primary text-primary-foreground" : "bg-background border"
            )}
          >
            <audio
              src={m.attachment_url!}
              controls
              preload="metadata"
              className={cn(
                "h-10 max-w-full",
                // Force a consistent look across browsers
                isMine && "[&::-webkit-media-controls-panel]:bg-primary"
              )}
            />
            {m.attachment_size && (
              <p className={cn("text-[10px] mt-1 text-end", isMine ? "opacity-80" : "text-muted-foreground")}>
                {formatBytes(m.attachment_size)}
              </p>
            )}
          </div>
        )}
        {hasText && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
              isMine ? "bg-primary text-primary-foreground" : "bg-background border"
            )}
          >
            {m.content}
          </div>
        )}
        <div className={cn("text-xs text-muted-foreground", isMine && "text-end")}>
          {m.sender?.full_name ?? "—"} ·{" "}
          {formatDateTime(m.created_at, isAr ? "ar-EG" : "en-US")}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
