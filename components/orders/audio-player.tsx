"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AudioTone = "admin" | "customer" | "neutral";

type Props = {
  src: string;
  /** Drives the color scheme — admin messages get one tone, customer another. */
  tone?: AudioTone;
  /** Size in bytes — shown subtly when known. */
  sizeBytes?: number | null;
  className?: string;
};

/**
 * WhatsApp-style audio bubble: a single inline player with a play/pause
 * button, a tappable progress bar, live time-counter, and tone-aware
 * colors. Replaces the native `<audio controls>` which looks inconsistent
 * across browsers.
 */
export function AudioPlayer({ src, tone = "neutral", sizeBytes, className }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (!seeking) setCurrentTime(audio.currentTime);
    };
    const onMeta = () => {
      // Some webm blobs report duration as Infinity until they play through
      // once. Force a load to resolve actual duration when possible.
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onDuration = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    const onErr = () => setLoadError(true);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onErr);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onErr);
    };
  }, [seeking]);

  // Reset state when the src changes
  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setLoadError(false);
  }, [src]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      // Use Promise form to catch autoplay rejections
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const palette = palettes[tone];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 p-2.5 pe-3.5 rounded-xl min-w-[240px] sm:min-w-[280px] max-w-full",
        palette.bg,
        className
      )}
    >
      {/* Play / Pause */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={loadError}
        className={cn(
          "shrink-0 h-10 w-10 rounded-full inline-flex items-center justify-center transition shadow-sm",
          palette.button,
          loadError && "opacity-50 cursor-not-allowed"
        )}
        aria-label={playing ? "Pause" : "Play"}
      >
        {loadError ? (
          <AlertCircle className="h-4 w-4" />
        ) : playing ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current ms-0.5" />
        )}
      </button>

      {/* Progress + times */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="relative h-1.5">
          {/* Track background */}
          <div className={cn("absolute inset-0 rounded-full", palette.track)} />
          {/* Filled portion */}
          <div
            className={cn("absolute inset-y-0 start-0 rounded-full transition-[width]", palette.fill)}
            style={{ width: `${progress}%` }}
          />
          {/* Interactive overlay */}
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={Math.min(currentTime, duration || 0)}
            onChange={onSeek}
            onPointerDown={() => setSeeking(true)}
            onPointerUp={() => setSeeking(false)}
            disabled={loadError || duration === 0}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Audio progress"
          />
        </div>
        <div className={cn("flex justify-between items-center text-[10px] tabular-nums", palette.text)}>
          <span>{formatTime(currentTime)}</span>
          {loadError ? (
            <span className="text-destructive">
              Failed
            </span>
          ) : (
            <span className="opacity-80">{formatTime(duration)}</span>
          )}
        </div>
      </div>

      {/* Hidden audio element drives playback */}
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
}

const palettes: Record<
  AudioTone,
  { bg: string; button: string; track: string; fill: string; text: string }
> = {
  admin: {
    bg: "bg-primary text-primary-foreground",
    button: "bg-white/15 hover:bg-white/25 text-primary-foreground",
    track: "bg-white/20",
    fill: "bg-white",
    text: "text-primary-foreground/80",
  },
  customer: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 border border-emerald-200/60 dark:border-emerald-800/60",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    track: "bg-emerald-200 dark:bg-emerald-800/60",
    fill: "bg-emerald-600 dark:bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  neutral: {
    bg: "bg-muted",
    button: "bg-primary hover:bg-primary/90 text-primary-foreground",
    track: "bg-foreground/10",
    fill: "bg-primary",
    text: "text-muted-foreground",
  },
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
