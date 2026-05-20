"use client";

import { useEffect, useState } from "react";

export function SiteHeaderChrome({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function updateScrolled() {
      setScrolled(window.scrollY > 8);
    }

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <header
      className={`site-header sticky top-0 z-30 border-b transition duration-300 ${
        scrolled
          ? "border-black/10 bg-white/88 shadow-[0_14px_42px_rgba(8,27,42,0.08)] backdrop-blur-2xl"
          : "border-black/6 bg-white/76 backdrop-blur-xl"
      }`}
    >
      {children}
    </header>
  );
}
