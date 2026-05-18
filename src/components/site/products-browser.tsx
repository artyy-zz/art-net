"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LocalizedCatalogProduct, LocalizedCategory } from "@/data/public-site";
import { cn } from "@/lib/utils";

type ProductsCopy = {
  allProducts: string;
  searchPlaceholder: string;
  advancedFilter: string;
  allSubcategories: string;
  viewDetails: string;
  previous: string;
  next: string;
  specifications: string;
  noResults: string;
  close: string;
};

type ProductModalProps = {
  product: LocalizedCatalogProduct | null;
  copy: ProductsCopy;
  locale: "sq" | "en";
  onClose: () => void;
};

function normalize(value: string) {
  return value.toLocaleLowerCase();
}

function productMatches(product: LocalizedCatalogProduct, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    product.name,
    product.description,
    product.categoryTitle,
    product.subcategoryTitle,
    ...product.specs,
    ...product.tags,
  ]
    .join(" ")
    .toLocaleLowerCase();

  return haystack.includes(query);
}

function ProductModal({ product, copy, locale, onClose }: ProductModalProps) {
  useEffect(() => {
    if (!product) {
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
  }, [onClose, product]);

  if (!product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,23,35,0.48)] p-3 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onMouseDown={onClose}
    >
      <div
        className="grid max-h-[calc(100vh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[34px] border border-white/40 bg-white shadow-[0_40px_120px_rgba(2,14,24,0.32)] md:grid-cols-[0.95fr_1.05fr]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-[320px] bg-[linear-gradient(180deg,#f8fcfe_0%,#e8f6fb_100%)] md:min-h-[560px]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 44vw, 100vw"
            className="object-contain p-10 sm:p-14"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center p-6 sm:p-9 md:p-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
                {product.categoryTitle} / {product.subcategoryTitle}
              </p>
              <h2 className="mt-4 break-words font-display text-4xl font-semibold leading-[1.04] text-[var(--color-foreground)] md:text-5xl">
                {product.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--color-foreground)] transition hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.18)]"
              aria-label={copy.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-6 text-base leading-8 text-[var(--color-muted)]">
            {product.description}
          </p>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {copy.specifications}
            </p>
            <div className="mt-4 grid gap-3">
              {product.specs.map((spec) => (
                <div
                  key={spec}
                  className="rounded-[20px] border border-black/8 bg-[#f8fcfe] px-4 py-3 text-sm font-medium leading-6 text-[var(--color-foreground)]"
                >
                  {spec}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {product.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/8 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="sr-only">
            {locale === "sq" ? "Detajet e produktit janë të hapura." : "Product details are open."}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  title,
  products,
  copy,
  locale,
  onOpen,
}: {
  title: string;
  products: LocalizedCatalogProduct[];
  copy: ProductsCopy;
  locale: "sq" | "en";
  onOpen: (product: LocalizedCatalogProduct) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(products.length / 4));
  const visiblePage = Math.min(page, pageCount - 1);

  function scrollRow(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const distance = Math.max(280, Math.min(scroller.clientWidth * 0.9, 760));
    scroller.scrollBy({ left: direction * distance, behavior: "smooth" });
    setPage((current) => Math.min(pageCount - 1, Math.max(0, current + direction)));
  }

  function updatePageFromScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const pageWidth = Math.max(1, scroller.clientWidth * 0.9);
    setPage(Math.min(pageCount - 1, Math.max(0, Math.round(scroller.scrollLeft / pageWidth))));
  }

  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [products]);

  return (
    <section className="border-t border-black/8 pt-8" id={`catalog-${products[0]?.categorySlug}`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold leading-tight text-[var(--color-foreground)] md:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {visiblePage + 1}/{pageCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollRow(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--color-foreground)] shadow-[0_10px_28px_rgba(8,27,42,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.16)]"
            aria-label={copy.previous}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollRow(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--color-foreground)] shadow-[0_10px_28px_rgba(8,27,42,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.16)]"
            aria-label={copy.next}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollerRef}
        onScroll={updatePageFromScroll}
        className="flex snap-x gap-4 overflow-x-auto pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onOpen(product)}
            className={cn(
              "group flex min-h-[300px] w-[78vw] max-w-[320px] shrink-0 snap-start flex-col rounded-[28px] border border-black/8 bg-white p-4 text-left shadow-[0_18px_54px_rgba(8,27,42,0.08)] transition duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(8,27,42,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.18)] sm:w-[300px] lg:w-[292px]",
              "motion-safe:animate-rise",
            )}
            style={{ animationDelay: `${index * 45}ms` }}
            aria-label={`${copy.viewDetails}: ${product.name}`}
          >
            <span className="relative block aspect-square w-full overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#f8fcfe_0%,#edf7fa_100%)]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="320px"
                className="object-contain p-8 transition duration-700 ease-out group-hover:scale-[1.05]"
              />
            </span>
            <span className="mt-5 block text-lg font-semibold leading-tight text-[var(--color-foreground)]">
              {product.name}
            </span>
            <span className="mt-2 block text-sm leading-6 text-[var(--color-muted)]">
              {product.subcategoryTitle}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        {Array.from({ length: pageCount }).map((_, index) => (
          <span
            key={`${title}-${index}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              visiblePage === index
                ? "w-8 bg-[var(--color-accent)]"
                : "w-3 bg-[rgba(6,23,35,0.14)]",
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="sr-only">
        {locale === "sq" ? "Rresht horizontal produktesh." : "Horizontal product row."}
      </p>
    </section>
  );
}

export function ProductsBrowser({
  categories,
  initialCategory = "all",
  copy,
  locale,
}: {
  categories: LocalizedCategory[];
  initialCategory?: string;
  copy: ProductsCopy;
  locale: "sq" | "en";
}) {
  const validInitialCategory = categories.some((category) => category.slug === initialCategory)
    ? initialCategory
    : "all";
  const [activeCategory, setActiveCategory] = useState(validInitialCategory);
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [query, setQuery] = useState("");
  const [activeProduct, setActiveProduct] = useState<LocalizedCatalogProduct | null>(null);

  const normalizedQuery = normalize(query.trim());

  const subcategoryOptions = useMemo(() => {
    const selectedCategories =
      activeCategory === "all"
        ? categories
        : categories.filter((category) => category.slug === activeCategory);

    return selectedCategories.flatMap((category) =>
      category.subcategories.map((subcategory) => ({
        id: `${category.slug}:${subcategory.id}`,
        label: subcategory.title,
      })),
    );
  }, [activeCategory, categories]);

  const visibleCategories = useMemo(() => {
    return categories
      .filter((category) => activeCategory === "all" || category.slug === activeCategory)
      .map((category) => ({
        ...category,
        subcategories: category.subcategories
          .filter(
            (subcategory) =>
              activeSubcategory === "all" ||
              activeSubcategory === `${category.slug}:${subcategory.id}`,
          )
          .map((subcategory) => ({
            ...subcategory,
            products: subcategory.products.filter((product) =>
              productMatches(product, normalizedQuery),
            ),
          }))
          .filter((subcategory) => subcategory.products.length > 0),
      }))
      .filter((category) => category.subcategories.length > 0);
  }, [activeCategory, activeSubcategory, categories, normalizedQuery]);

  function chooseCategory(slug: string) {
    setActiveCategory(slug);
    setActiveSubcategory("all");
  }

  return (
    <div className="space-y-10">
      <div className="sticky top-[70px] z-20 -mx-4 border-y border-black/8 bg-white/88 px-4 py-4 backdrop-blur-2xl sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => chooseCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                activeCategory === "all"
                  ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white"
                  : "border-black/10 bg-white text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]",
              )}
            >
              {copy.allProducts}
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => chooseCategory(category.slug)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  activeCategory === category.slug
                    ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white"
                    : "border-black/10 bg-white text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]",
                )}
              >
                {category.title}
              </button>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <span className="sr-only">{copy.searchPlaceholder}</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="h-13 w-full rounded-full border border-black/10 bg-white px-12 text-sm font-medium text-[var(--color-foreground)] shadow-[0_10px_26px_rgba(8,27,42,0.05)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(0,107,150,0.14)]"
              />
            </label>
            <label className="relative block min-w-0 lg:min-w-[300px]">
              <span className="sr-only">{copy.advancedFilter}</span>
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted)]" />
              <select
                value={activeSubcategory}
                onChange={(event) => setActiveSubcategory(event.target.value)}
                className="h-13 w-full appearance-none rounded-full border border-black/10 bg-white px-12 text-sm font-semibold text-[var(--color-foreground)] shadow-[0_10px_26px_rgba(8,27,42,0.05)] outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(0,107,150,0.14)]"
              >
                <option value="all">{copy.allSubcategories}</option>
                {subcategoryOptions.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {visibleCategories.length > 0 ? (
        <div className="mx-auto max-w-7xl space-y-14">
          {visibleCategories.map((category) => (
            <div key={category.slug} className="scroll-mt-36" id={category.slug}>
              <div className="mb-7 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
                    {category.shortTitle}
                  </p>
                  <h2 className="mt-3 break-words font-display text-4xl font-semibold leading-[1.04] text-[var(--color-foreground)] md:text-5xl">
                    {category.title}
                  </h2>
                </div>
                <p className="max-w-2xl text-base leading-8 text-[var(--color-muted)] md:justify-self-end">
                  {category.description}
                </p>
              </div>
              <div className="space-y-10">
                {category.subcategories.map((subcategory) => (
                  <ProductRow
                    key={`${category.slug}-${subcategory.id}`}
                    title={subcategory.title}
                    products={subcategory.products}
                    copy={copy}
                    locale={locale}
                    onOpen={setActiveProduct}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-7xl rounded-[30px] border border-black/8 bg-[#f8fcfe] p-8 text-center text-sm font-semibold text-[var(--color-muted)]">
          {copy.noResults}
        </div>
      )}

      <ProductModal
        product={activeProduct}
        copy={copy}
        locale={locale}
        onClose={() => setActiveProduct(null)}
      />
    </div>
  );
}
