"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function swapLocale(pathname: string, target: Locale) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return `/${target}`;
  }

  if (locales.includes(segments[0] as Locale)) {
    segments[0] = target;
    return `/${segments.join("/")}`;
  }

  return `/${target}/${segments.join("/")}`;
}

export function LanguageSwitcher({
  locale,
  labels = "short",
  inverse = false,
}: {
  locale: Locale;
  labels?: "short" | "full";
  inverse?: boolean;
}) {
  const pathname = usePathname() || "/";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border p-1 text-xs font-semibold uppercase tracking-[0.16em]",
        inverse
          ? "border-white/14 bg-white/8 text-white/78"
          : "border-black/10 bg-white/88 text-[var(--color-muted)]",
      )}
    >
      {locales.map((target) => {
        const href = swapLocale(pathname, target);
        const label =
          labels === "full" ? (target === "sq" ? "Shqip" : "English") : target === "sq" ? "AL" : "EN";

        return (
          <Link
            key={target}
            href={href}
            aria-current={locale === target ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-2 transition",
              locale === target
                ? inverse
                  ? "!bg-white !text-[var(--color-panel)]"
                  : "!bg-[var(--color-foreground)] !text-white"
                : inverse
                  ? "!text-white/78 hover:bg-white/12 hover:!text-white"
                  : "!text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:!text-[var(--color-foreground)]",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
