"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { LocalizedCategory } from "@/data/public-site";
import type { Locale } from "@/lib/i18n";
import { isRemoteImage } from "@/lib/image-utils";

type HomeCategoryCopy = {
  detailsButton: string;
  productsButton: string;
};

function CategoryModal({
  category,
  locale,
  onClose,
}: {
  category: LocalizedCategory | null;
  locale: Locale;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!category) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [category, onClose]);

  if (!category) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,23,35,0.48)] p-3 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={category.title}
      onMouseDown={onClose}
    >
      <div
        className="grid max-h-[calc(100vh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[34px] border border-white/40 bg-white shadow-[0_40px_120px_rgba(2,14,24,0.32)] md:grid-cols-[0.9fr_1.1fr]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-[300px] md:min-h-[560px]">
          <Image
            src={category.image}
            alt={category.title}
            fill
            unoptimized={isRemoteImage(category.image)}
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-contain p-8 sm:p-12"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center p-6 sm:p-9 md:p-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
                {locale === "sq" ? "Kategori" : "Category"}
              </p>
              <h2 className="mt-4 break-words font-display text-4xl font-semibold leading-[1.04] text-[var(--color-foreground)] md:text-5xl">
                {category.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--color-foreground)] transition hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.18)]"
              aria-label={locale === "sq" ? "Mbyll" : "Close"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-6 text-base leading-8 text-[var(--color-muted)]">
            {category.description}
          </p>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {locale === "sq" ? "Nënkategoritë" : "Subcategories"}
            </p>
            <div className="mt-4 grid gap-3">
              {category.subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="rounded-[20px] border border-black/8 bg-[#f8fcfe] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-[var(--color-foreground)]">
                    {subcategory.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                    {subcategory.products.map((product) => product.name).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeCategorySections({
  categories,
  locale,
  copy,
}: {
  categories: LocalizedCategory[];
  locale: Locale;
  copy: HomeCategoryCopy;
}) {
  const [activeCategory, setActiveCategory] = useState<LocalizedCategory | null>(null);

  return (
    <>
      <div className="space-y-10 bg-white py-10 md:space-y-14 md:py-14">
        {categories.map((category, index) => (
          <section
            key={category.slug}
            id={`category-${category.slug}`}
            className="scroll-mt-28 px-4 py-12 sm:px-6 md:px-10 md:py-16"
          >
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                <h2 className="max-w-3xl break-words font-display text-6xl font-semibold leading-[0.96] text-[var(--color-foreground)] md:text-8xl">
                  {category.title}
                </h2>
                <p className="mt-7 max-w-2xl text-lg leading-9 text-[var(--color-muted)] md:text-xl">
                  {category.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className="inline-flex min-h-14 max-w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0078a8_0%,#006b96_48%,#003f63_100%)] px-7 py-3 text-center text-base font-semibold leading-tight !text-white shadow-[0_16px_38px_rgba(0,107,150,0.24)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,107,150,0.32)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.24)]"
                  >
                    {copy.detailsButton}
                  </button>
                  <Link
                    href={`/${locale}/products/${category.slug}`}
                    className="inline-flex min-h-14 max-w-full items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-white/80 px-7 py-3 text-center text-base font-medium leading-tight text-[var(--color-foreground)] transition duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.2)]"
                  >
                    {copy.productsButton}
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[380px] sm:min-h-[520px] lg:min-h-[590px]">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  unoptimized={isRemoteImage(category.image)}
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-contain p-3 transition duration-700 ease-out hover:scale-[1.03] sm:p-6"
                />
              </div>
            </div>
          </section>
        ))}
      </div>
      <CategoryModal
        category={activeCategory}
        locale={locale}
        onClose={() => setActiveCategory(null)}
      />
    </>
  );
}
