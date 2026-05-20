"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function formatCounterValue(original: string, value: number) {
  const match = original.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);

  if (!match) {
    return original;
  }

  const [, prefix, , suffix] = match;
  return `${prefix}${Math.round(value).toLocaleString()}${suffix}`;
}

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-counter]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const target = entry.target as HTMLElement;
          target.classList.add("is-visible");

          if (target.dataset.counter && !target.dataset.counted) {
            target.dataset.counted = "true";
            const original = target.dataset.counterValue ?? target.textContent?.trim() ?? "";
            const match = original.match(/\d+(?:[.,]\d+)?/);

            if (match) {
              const end = Number.parseFloat(match[0].replace(",", "."));
              const start = performance.now();
              const duration = 850;

              function tick(now: number) {
                const progress = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                target.textContent = formatCounterValue(original, end * eased);

                if (progress < 1) {
                  requestAnimationFrame(tick);
                } else {
                  target.textContent = original;
                }
              }

              requestAnimationFrame(tick);
            }
          }

          observer.unobserve(target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));
    counters.forEach((counter) => observer.observe(counter));

    let frame = 0;
    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));

    function updateParallax() {
      frame = 0;
      for (const item of parallaxItems) {
        const rect = item.getBoundingClientRect();
        const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.035;
        item.style.setProperty("--parallax-y", `${Math.max(-18, Math.min(18, offset))}px`);
      }
    }

    function onScroll() {
      if (!frame) {
        frame = requestAnimationFrame(updateParallax);
      }
    }

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [pathname]);

  return null;
}

export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main key={pathname} className="page-transition">
      {children}
    </main>
  );
}
