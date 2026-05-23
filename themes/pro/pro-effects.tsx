"use client";

import { useEffect, useRef } from "react";

export function ProEffects() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch devices or small screens
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isMobile = window.innerWidth < 768;

    if (isTouch || isMobile) {
      if (dotRef.current) dotRef.current.style.display = "none";
      if (ringRef.current) ringRef.current.style.display = "none";
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };

    let animationFrameId: number;
    const lerpSpeed = 0.12;

    const updateRing = () => {
      ringX += (mouseX - ringX) * lerpSpeed;
      ringY += (mouseY - ringY) * lerpSpeed;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      animationFrameId = requestAnimationFrame(updateRing);
    };

    window.addEventListener("mousemove", onMouseMove);
    animationFrameId = requestAnimationFrame(updateRing);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = 
        target.closest("a") || 
        target.closest("button") || 
        target.closest(".pro-btn") || 
        target.closest(".pro-card") || 
        target.closest("summary") ||
        target.closest("[role='button']");

      if (isInteractive) {
        ring.classList.add("pro-cursor-hover");
        dot.classList.add("pro-cursor-hover");
      } else {
        ring.classList.remove("pro-cursor-hover");
        dot.classList.remove("pro-cursor-hover");
      }
    };

    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Scroll reveals trigger
  useEffect(() => {
    const reveals = document.querySelectorAll(
      ".pro-reveal, .pro-reveal-left, .pro-reveal-right, .pro-section-reveal"
    );

    if (reveals.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pro-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.05,
      }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => {
      reveals.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Scroll depth tracking
  useEffect(() => {
    const progressBar = document.querySelector(".pro-scroll-progress") as HTMLDivElement;
    if (!progressBar) return;

    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="pro-scroll-progress" aria-hidden="true" />
      <div ref={dotRef} className="pro-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="pro-cursor-ring" aria-hidden="true" />
    </>
  );
}
