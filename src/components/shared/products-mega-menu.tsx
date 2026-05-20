"use client";

import Link from "next/link";
import { ChevronDown, Grid2X2, PackageSearch } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type ProductMenuCategory = {
  name: string;
  slug: string;
  productCount: number;
  subcategories: {
    name: string;
    slug: string;
  }[];
};

export function ProductsMegaMenu({
  locale,
  label,
  categories,
  active = false,
}: {
  locale: Locale;
  label: string;
  categories: ProductMenuCategory[];
  active?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const allProductsLabel = locale === "sq" ? "Të gjitha produktet" : "All Products";
  const categoryLabel = locale === "sq" ? "Kategori" : "Categories";
  const productCountLabel = locale === "sq" ? "produkte" : "products";

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "premium-nav-link inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.16)]",
          (active || isOpen) && "is-active text-[var(--color-foreground)]",
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-1/2 top-full z-50 w-[min(860px,calc(100vw-3rem))] -translate-x-1/2 pt-3">
          <div className="rounded-lg border border-[var(--color-line)] bg-white p-3 text-left shadow-[0_28px_80px_rgba(8,27,42,0.18)]">
            <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
              <Link
                href={`/${locale}/products`}
                onClick={() => setIsOpen(false)}
                className="group flex min-h-[156px] flex-col justify-between rounded-lg border border-[var(--color-line)] bg-[#f7fafc] p-4 transition hover:border-[rgba(0,107,150,0.28)] hover:bg-[var(--color-accent-soft)]"
              >
                <span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-[var(--color-accent-strong)] shadow-[0_10px_24px_rgba(8,27,42,0.08)]">
                    <PackageSearch className="h-5 w-5" />
                  </span>
                  <span className="mt-4 block text-base font-semibold text-[var(--color-foreground)]">
                    {allProductsLabel}
                  </span>
                </span>
                <span className="text-xs font-semibold uppercase text-[var(--color-muted)]">
                  {categories.reduce((sum, category) => sum + category.productCount, 0).toLocaleString()}{" "}
                  {productCountLabel}
                </span>
              </Link>

              <div>
                <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  <Grid2X2 className="h-3.5 w-3.5" />
                  {categoryLabel}
                </div>
                <div className="grid gap-x-3 sm:grid-cols-2">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/${locale}/products/${category.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg border border-transparent border-t-[var(--color-line)] px-3 py-2.5 transition first:border-t-transparent hover:border-[var(--color-line)] hover:bg-[#f7fafc] sm:[&:nth-child(-n+2)]:border-t-transparent"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[var(--color-foreground)]">
                          {category.name}
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-[var(--color-muted)]">
                          {category.productCount}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-[var(--color-muted)]">
                        {category.subcategories
                          .slice(0, 3)
                          .map((subcategory) => subcategory.name)
                          .join(" / ")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
