"use client";

import { useEffect } from "react";

function storageKey(pathname: string) {
  return `artnet:product-scroll:${pathname}`;
}

function restoreScrollPosition(pathname: string) {
  const savedPosition = sessionStorage.getItem(storageKey(pathname));

  if (!savedPosition) {
    return;
  }

  const top = Number.parseInt(savedPosition, 10);

  if (!Number.isFinite(top) || top < 0) {
    return;
  }

  requestAnimationFrame(() => {
    window.scrollTo({ top, behavior: "auto" });
    window.setTimeout(() => window.scrollTo({ top, behavior: "auto" }), 120);
  });
}

function saveScrollPosition(pathname: string) {
  sessionStorage.setItem(storageKey(pathname), String(window.scrollY));
}

export function ProductScrollRestoration() {
  useEffect(() => {
    const { pathname } = window.location;
    const previousScrollRestoration =
      "scrollRestoration" in window.history ? window.history.scrollRestoration : null;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    restoreScrollPosition(pathname);

    function handlePageHide() {
      saveScrollPosition(pathname);
    }

    function handleProductLinkClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest("a[href]");

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const target = new URL(link.href);
      const isSameOriginProductLink =
        target.origin === window.location.origin &&
        target.pathname.startsWith(`${pathname.replace(/\/$/, "")}/`);

      if (isSameOriginProductLink) {
        saveScrollPosition(pathname);
      }
    }

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("click", handleProductLinkClick, { capture: true });

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("click", handleProductLinkClick, { capture: true });

      if (previousScrollRestoration) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  return null;
}
