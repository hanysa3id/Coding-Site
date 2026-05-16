"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
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

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Build playback URL whenever the blob changes
  useEffect(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (value) {
      audioUrlRef.current = URL.createObjectURL(value);
    }
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
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
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        isAr ? "متصفحك لا يدعم تسجيل الصوت" : "Your browser doesn't support audio recording"
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
      const msg = (err as Error).message ?? "";
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
        toast.error(
          isAr
            ? "صلاحية الميكروفون مرفوضة. فعّلها من إعدادات المتصفح."
            : "Microphone permission denied. Enable it in browser settings."
        );
      } else {
        toast.error(
          isAr ? `تعذّر بدء التسجيل: ${msg}` : `Failed to start recording: ${msg}`
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

      {state === "recorded" && audioUrlRef.current && (
        <audio
          ref={audioRef}
          src={audioUrlRef.current}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
          controls
        />
      )}

      {state === "idle" && (
        <p className="text-xs text-muted-foreground">
          {isAr
            ? "اضغط الزر للسماح بالميكروفون ثم سجل ملاحظة صوتية (حد أقصى ٥ دقائق)"
            : "Click the button to allow microphone access and record a voice note (max 5 minutes)"}
        </p>
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
