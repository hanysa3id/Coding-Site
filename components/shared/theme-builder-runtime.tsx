"use client";

import { useEffect, useRef } from "react";
import {
  animationClass,
  type ThemeCustomization,
  type SoundPreset,
} from "@/lib/validators/theme-builder";

/**
 * Runtime side of the Theme Builder. Lives in the public layout so it can
 * observe DOM changes across any route.
 *
 * Responsibilities
 * ────────────────
 * 1. Tag each top-level <section> with the animation class chosen for its
 *    landing-section id, and trigger the entry once it scrolls into view.
 * 2. Maintain the `--app-anim-duration` / `--app-anim-stagger` CSS vars per
 *    section so animations honour the admin-picked timing.
 * 3. Optional UI sounds — synthesized on the fly via WebAudio (no asset
 *    download required) — wired to clicks and hovers on actionable elements.
 * 4. Spotlight cursor halo that follows the pointer when the effect is on.
 * 5. Live-preview hook: listens for `theme-builder:vars` messages and swaps
 *    the injected style block on the fly so the iframe in the admin updates
 *    without a reload.
 */
export function ThemeBuilderRuntime({
  customization,
}: {
  customization: ThemeCustomization | null;
}) {
  const audioRef = useRef<AudioContext | null>(null);

  // ── 1 & 2: section animations ─────────────────────────────────────────────
  useEffect(() => {
    if (!customization || customization.sections.length === 0) return;
    const sectionById = new Map(customization.sections.map((s) => [s.id, s]));

    const targets: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>("section[id]").forEach((el) => {
      const cfg = sectionById.get(el.id);
      if (!cfg) return;
      if (cfg.animation === "none") return;
      el.classList.add(animationClass(cfg.animation), "app-anim-paused");
      el.style.setProperty("--app-anim-duration", `${cfg.duration_ms}ms`);
      el.style.setProperty("--app-anim-stagger", `${cfg.stagger_ms}ms`);
      targets.push(el);
    });

    if (targets.length === 0) return;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.remove("app-anim-paused");
              io.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "-15% 0px" }
      );
      targets.forEach((t) => io.observe(t));
      return () => io.disconnect();
    }
    targets.forEach((t) => t.classList.remove("app-anim-paused"));
  }, [customization]);

  // ── 3: UI sounds ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!customization?.sounds.enabled) return;
    const { click, hover, volume } = customization.sounds;
    if (click === "none" && hover === "none") return;

    function ensureCtx(): AudioContext | null {
      if (audioRef.current) return audioRef.current;
      try {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioRef.current = new AC();
        return audioRef.current;
      } catch {
        return null;
      }
    }

    function play(preset: SoundPreset) {
      if (preset === "none") return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime;
      g.gain.setValueAtTime(volume, t);
      switch (preset) {
        case "soft-click":
          o.type = "sine";
          o.frequency.setValueAtTime(880, t);
          o.frequency.exponentialRampToValueAtTime(440, t + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
          o.start(t);
          o.stop(t + 0.1);
          break;
        case "pop":
          o.type = "triangle";
          o.frequency.setValueAtTime(640, t);
          o.frequency.exponentialRampToValueAtTime(180, t + 0.12);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
          o.start(t);
          o.stop(t + 0.15);
          break;
        case "swoosh":
          o.type = "sawtooth";
          o.frequency.setValueAtTime(120, t);
          o.frequency.exponentialRampToValueAtTime(1600, t + 0.18);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
          o.start(t);
          o.stop(t + 0.21);
          break;
        case "blip":
          o.type = "square";
          o.frequency.setValueAtTime(1320, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
          o.start(t);
          o.stop(t + 0.07);
          break;
      }
    }

    function isActionable(el: EventTarget | null): boolean {
      if (!(el instanceof Element)) return false;
      return !!el.closest('button, a[href], [role="button"]');
    }

    function onClick(e: MouseEvent) {
      if (click !== "none" && isActionable(e.target)) play(click);
    }
    function onOver(e: PointerEvent) {
      if (hover !== "none" && isActionable(e.target)) {
        // Avoid retriggering on every pointermove — only on enter
        const tgt = (e.target as Element).closest("button,a,[role=button]");
        if (tgt && !tgt.hasAttribute("data-app-sound-hovered")) {
          tgt.setAttribute("data-app-sound-hovered", "1");
          play(hover);
          setTimeout(() => tgt.removeAttribute("data-app-sound-hovered"), 250);
        }
      }
    }
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("pointerenter", onOver, { passive: true, capture: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerenter", onOver, true);
    };
  }, [customization]);

  // ── 4: spotlight cursor ────────────────────────────────────────────────────
  useEffect(() => {
    if (!customization?.effects.spotlight_cursor) return;
    const spot = document.getElementById("app-spotlight");
    if (!spot) return;
    let raf = 0;
    function onMove(e: PointerEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!spot) return;
        spot.style.setProperty("--mx", `${e.clientX}px`);
        spot.style.setProperty("--my", `${e.clientY}px`);
        spot.style.opacity = "1";
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [customization]);

  // ── 5: live-preview hook (admin Theme Builder iframe) ──────────────────────
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data;
      if (data && data.type === "theme-builder:vars" && typeof data.css === "string") {
        let el = document.getElementById("app-theme-vars-preview") as HTMLStyleElement | null;
        if (!el) {
          el = document.createElement("style");
          el.id = "app-theme-vars-preview";
          document.head.appendChild(el);
        }
        el.textContent = data.css;
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return null;
}
