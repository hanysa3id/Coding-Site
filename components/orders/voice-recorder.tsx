"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Play, Pause, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  /** Current recorded blob (or null if nothing recorded). */
  value: Blob | null;
  onChange: (blob: Blob | null) => void;
  locale: string;
  disabled?: boolean;
  /** Max recording length in seconds. Default 5 minutes. */
  maxSeconds?: number;
};

type State = "idle" | "recording" | "recorded";
type PermissionState = "unknown" | "prompt" | "granted" | "denied" | "unsupported";

const SUPPORTED_MIME_TYPES = ["audio/webm", "audio/ogg", "audio/mp4"];

export function VoiceRecorder({
  value,
  onChange,
  locale,
  disabled,
  maxSeconds = 300,
}: Props) {
  const isAr = locale === "ar";
  const [state, setState] = useState<State>(value ? "recorded" : "idle");
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("unknown");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // `audioUrl` must be state (not a ref) so the <audio> element re-renders
  // when the URL is created — otherwise the playback element never appears.
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Detect current permission state up-front so we can show a helpful hint
  // before the user clicks "Start recording" — saves them a confusing prompt
  // if they previously denied access.
  useEffect(() => {
    let cancelled = false;
    async function probe() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setPermission("unsupported");
        return;
      }
      // Safari < 16 doesn't support navigator.permissions.query for microphone.
      // Best-effort: try, fall back to "unknown" so user can still click.
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perm = await (navigator.permissions as any)?.query?.({
          name: "microphone" as PermissionName,
        });
        if (!perm) {
          if (!cancelled) setPermission("unknown");
          return;
        }
        if (!cancelled) {
          setPermission(perm.state as PermissionState);
        }
        perm.onchange = () => {
          if (!cancelled) setPermission(perm.state as PermissionState);
        };
      } catch {
        if (!cancelled) setPermission("unknown");
      }
    }
    probe();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build playback URL whenever the blob changes. Using state (instead of a
  // ref) is the whole point — the <audio> element below needs a re-render
  // when the URL is ready, otherwise it stays empty even though the blob
  // exists.
  useEffect(() => {
    if (!value) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setAudioUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [value]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function pickMimeType(): string | undefined {
    if (typeof window === "undefined") return undefined;
    for (const t of SUPPORTED_MIME_TYPES) {
      if (window.MediaRecorder?.isTypeSupported?.(t)) return t;
    }
    return undefined;
  }

  async function startRecording() {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error(
        isAr ? "متصفحك لا يدعم تسجيل الصوت" : "Your browser doesn't support audio recording"
      );
      setPermission("unsupported");
      return;
    }

    // Some browsers only expose getUserMedia on https or localhost.
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      toast.error(
        isAr
          ? "تسجيل الصوت يحتاج اتصال HTTPS. لن يعمل على HTTP."
          : "Voice recording requires HTTPS. It won't work on plain HTTP."
      );
      return;
    }

    try {
      // This call triggers the browser's native permission prompt the first
      // time. On subsequent loads it either resolves immediately (granted)
      // or rejects with NotAllowedError (denied — user must change browser
      // settings manually).
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermission("granted");
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType ?? "audio/webm",
        });
        onChange(blob);
        setState("recorded");
        chunksRef.current = [];
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start(1000); // collect chunks every second
      recorderRef.current = recorder;
      setState("recording");
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= maxSeconds) {
            stopRecording();
            return e + 1;
          }
          return e + 1;
        });
      }, 1000);
    } catch (err) {
      const e = err as DOMException;
      const name = e?.name ?? "";

      // Map the common DOMException names to friendly Arabic + English text.
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        // User actively denied OR the site never had permission. Either way
        // the next call won't prompt again unless the user resets it.
        setPermission("denied");
        toast.error(
          isAr
            ? "تم رفض إذن الميكروفون. افتح إعدادات الموقع في المتصفح وامنح صلاحية الميكروفون ثم حاول مرة أخرى."
            : "Microphone access denied. Open browser site settings, allow microphone access, then try again."
        );
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        toast.error(
          isAr
            ? "لا يوجد ميكروفون متصل بجهازك"
            : "No microphone connected to your device"
        );
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        toast.error(
          isAr
            ? "تعذّر استخدام الميكروفون — قد يكون مستخدماً بواسطة تطبيق آخر"
            : "Could not access the microphone — it may be used by another application"
        );
      } else if (name === "SecurityError") {
        // Most likely Permissions-Policy is blocking, or HTTP without
        // localhost — both server-config issues.
        toast.error(
          isAr
            ? "المتصفح حجب الميكروفون لأسباب أمنية. تأكد أن الموقع يعمل عبر HTTPS."
            : "Browser blocked microphone for security reasons. Make sure the site runs over HTTPS."
        );
      } else {
        toast.error(
          isAr
            ? `تعذّر بدء التسجيل: ${e?.message ?? name}`
            : `Failed to start recording: ${e?.message ?? name}`
        );
      }
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  function clearRecording() {
    onChange(null);
    setState("idle");
    setElapsed(0);
    setIsPlaying(false);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {state === "idle" && (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            variant="outline"
            size="sm"
          >
            <Mic className="h-4 w-4" />
            {isAr ? "بدء التسجيل الصوتي" : "Start voice note"}
          </Button>
        )}

        {state === "recording" && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="font-mono">{formatTime(elapsed)}</span>
              <span className="text-muted-foreground">
                / {formatTime(maxSeconds)}
              </span>
            </div>
            <Button
              type="button"
              onClick={stopRecording}
              variant="destructive"
              size="sm"
            >
              <Square className="h-4 w-4" />
              {isAr ? "إيقاف" : "Stop"}
            </Button>
          </>
        )}

        {state === "recorded" && value && (
          <>
            <Button
              type="button"
              onClick={togglePlay}
              variant="outline"
              size="sm"
              disabled={disabled}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause") : isAr ? "تشغيل" : "Play"}
            </Button>
            <span className="text-xs text-muted-foreground">
              {formatBytes(value.size)}
            </span>
            <Button
              type="button"
              onClick={clearRecording}
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {isAr ? "حذف وإعادة" : "Delete & redo"}
            </Button>
          </>
        )}
      </div>

      {state === "recorded" && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
          controls
          preload="metadata"
        />
      )}

      {state === "idle" && permission !== "denied" && permission !== "unsupported" && (
        <p className="text-xs text-muted-foreground inline-flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            {isAr
              ? "اضغط الزر — سيطلب المتصفح إذنك لاستخدام الميكروفون. اضغط ‹سماح› ثم سيبدأ التسجيل (حد أقصى ٥ دقائق)."
              : "Click the button — your browser will ask for microphone permission. Click ‘Allow’ and recording will start (max 5 minutes)."}
          </span>
        </p>
      )}

      {/* Loud, helpful banner when permission was previously denied */}
      {permission === "denied" && state === "idle" && (
        <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {isAr
                  ? "إذن الميكروفون مرفوض حالياً"
                  : "Microphone is currently blocked"}
              </p>
              <p className="text-amber-800 dark:text-amber-300 text-xs mt-1">
                {isAr
                  ? "اتبع هذه الخطوات لتفعيله ثم اضغط الزر مرة أخرى:"
                  : "Follow these steps to enable it, then click the button again:"}
              </p>
            </div>
          </div>
          <ol className="text-xs text-amber-800 dark:text-amber-300 list-decimal ps-7 space-y-0.5">
            <li>
              {isAr
                ? "اضغط على أيقونة القفل 🔒 (أو ⓘ) بجانب رابط الموقع في شريط العنوان"
                : "Click the lock 🔒 (or ⓘ) icon beside the site URL in the address bar"}
            </li>
            <li>
              {isAr
                ? "اختر «الميكروفون» (Microphone)"
                : "Find “Microphone” in the permissions list"}
            </li>
            <li>
              {isAr
                ? "غيّر الإعداد إلى «السماح» (Allow)"
                : "Switch it to “Allow”"}
            </li>
            <li>
              {isAr
                ? "أعد تحميل الصفحة ثم اضغط زر بدء التسجيل"
                : "Reload the page and click Start again"}
            </li>
          </ol>
          <p className="text-xs text-amber-700 dark:text-amber-400 ps-7 italic">
            {isAr
              ? "بدلاً من ذلك: استخدم زر «استفسار عبر واتس آب» وأرسل ملاحظتك الصوتية مباشرة هناك."
              : "Alternatively: use the WhatsApp button and send a voice note there."}
          </p>
        </div>
      )}

      {permission === "unsupported" && state === "idle" && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 inline-flex items-start gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            {isAr
              ? "متصفحك لا يدعم تسجيل الصوت. جرّب Chrome، Edge، أو Safari الحديث."
              : "Your browser doesn't support audio recording. Try a recent Chrome, Edge, or Safari."}
          </span>
        </div>
      )}
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
