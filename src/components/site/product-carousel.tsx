"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ProductCarouselItem = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  image: string;
};

export function ProductCarousel({
  items,
  locale,
  label,
}: {
  items: ProductCarouselItem[];
  locale: "sq" | "en";
  label: string;
}) {
  const pageSize = 3;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const [page, setPage] = useState(0);
  const activeItems = useMemo(
    () => items.slice(page * pageSize, page * pageSize + pageSize),
    [items, page],
  );

  function previousPage() {
    setPage((current) => (current - 1 + pageCount) % pageCount);
  }

  function nextPage() {
    setPage((current) => (current + 1) % pageCount);
  }

  return (
    <div className="overflow-hidden">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            {label}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {page + 1}/{pageCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousPage}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--color-foreground)] shadow-[0_10px_28px_rgba(8,27,42,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.16)]"
            aria-label={locale === "sq" ? "Faqja e mëparshme" : "Previous page"}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextPage}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--color-foreground)] shadow-[0_10px_28px_rgba(8,27,42,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.16)]"
            aria-label={locale === "sq" ? "Faqja tjetër" : "Next page"}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeItems.map((item, index) => (
          <article
            key={item.id}
            className={cn(
              "group min-w-0 rounded-[28px] border border-black/8 bg-white p-4 shadow-[0_18px_54px_rgba(8,27,42,0.08)] transition duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(8,27,42,0.14)]",
              "motion-safe:animate-rise",
            )}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#f7fbfd_0%,#edf5f8_100%)]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 28vw, (min-width: 640px) 44vw, 100vw"
                className="object-contain p-7 transition duration-700 ease-out group-hover:scale-[1.05]"
              />
            </div>
            <div className="px-1 pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
                {item.eyebrow}
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-tight text-[var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {item.summary}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
