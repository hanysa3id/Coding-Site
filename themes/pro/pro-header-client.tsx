"use client";

import { useEffect, useState } from "react";

export function ProHeaderClient({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Run initial check
    if (window.scrollY > 20) {
      setScrolled(true);
    }

    const handleScroll = () => {
      // If mobile menu is open (locking overflow) we shouldn't hide the header
      if (
        document.body.style.overflow === "hidden" || 
        document.body.classList.contains("overflow-hidden")
      ) {
        return;
      }

      const currentScrollY = window.scrollY;

      // Scrolled state adds extra blur/compact styles
      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Hide/Show threshold and direction check
      if (currentScrollY <= 60) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down -> hide navbar smoothly
        setVisible(false);
      } else {
        // Scrolling up -> show navbar with glass effect
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`pro-header-container fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      } ${scrolled ? "pro-header-compact" : ""}`}
    >
      {children}
    </div>
  );
}
