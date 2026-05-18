"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  ImageIcon,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { AssmannCategory, AssmannProduct } from "@/data/assmann-catalog";
import {
  getPrimaryPlacement,
  getProductDetailHref,
  getProductImage,
} from "@/data/assmann-catalog";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const copy = {
  sq: {
    search: "Kerko ne te gjithe katalogun me emer, SKU, kategori ose nenkategori",
    filter: "Filtro",
    allProducts: "Te gjitha produktet",
    categories: "Kategorite",
    subcategories: "Nenkategorite",
    filters: "Opsionet",
    withImages: "Vetem me imazhe",
    officialOnly: "Vetem me faqe zyrtare",
    clear: "Pastro",
    results: "rezultate",
    noResults: "Nuk u gjet asnje produkt.",
    imageMissing: "Pa imazh",
    suggestions: "Sugjerime",
  },
  en: {
    search: "Search the full catalog by name, SKU, category, or subcategory",
    filter: "Filter",
    allProducts: "All Products",
    categories: "Categories",
    subcategories: "Subcategories",
    filters: "Filtering options",
    withImages: "Only with images",
    officialOnly: "Only official pages",
    clear: "Clear",
    results: "results",
    noResults: "No products found.",
    imageMissing: "No image",
    suggestions: "Suggestions",
  },
} as const;

type SectionKey = "categories" | "subcategories" | "filters";

type ProductSection = {
  id: string;
  title: string;
  eyebrow: string;
  categorySlug: string;
  products: AssmannProduct[];
};

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function productMatches(product: AssmannProduct, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    product.sku,
    product.title,
    product.documentName,
    product.description,
    ...product.specifications,
    ...product.placements.flatMap((placement) => [placement.category, placement.subcategory]),
  ].join(" ");

  return normalize(haystack).includes(query);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ value, query }: { value: string; query: string }) {
  const trimmed = query.trim();

  if (!trimmed) {
    return <>{value}</>;
  }

  const parts = value.split(new RegExp(`(${escapeRegExp(trimmed)})`, "i"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLocaleLowerCase() === trimmed.toLocaleLowerCase() ? (
          <mark
            key={`${part}-${index}`}
            className="rounded-sm bg-[rgba(0,107,150,0.14)] px-0.5 text-[var(--color-accent-strong)]"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function ProductImagePlaceholder({ label }: { label: string }) {
  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#eef3f6] text-center text-xs font-semibold text-[var(--color-muted)]">
      <ImageIcon className="h-7 w-7" />
      <span>{label}</span>
    </span>
  );
}

function ProductCard({
  product,
  locale,
  categorySlug,
  query,
  imageMissingLabel,
}: {
  product: AssmannProduct;
  locale: Locale;
  categorySlug: string;
  query: string;
  imageMissingLabel: string;
}) {
  const image = getProductImage(product);
  const title = product.title || product.documentName;

  return (
    <Link
      href={getProductDetailHref(locale, product, categorySlug)}
      className="group flex min-h-[318px] w-full min-w-0 flex-col rounded-lg border border-[var(--color-line)] bg-white shadow-[0_14px_36px_rgba(8,27,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(0,107,150,0.3)] hover:shadow-[0_22px_54px_rgba(8,27,42,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.16)]"
    >
      <span className="relative block aspect-[4/3] overflow-hidden rounded-t-lg border-b border-[var(--color-line)] bg-white">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            loading="lazy"
            sizes="280px"
            className="object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <ProductImagePlaceholder label={imageMissingLabel} />
        )}
      </span>
      <span className="flex grow flex-col p-4">
        <span className="text-xs font-semibold uppercase text-[var(--color-accent-strong)]">
          <Highlight value={product.sku} query={query} />
        </span>
        <span className="mt-3 line-clamp-3 text-sm font-semibold leading-5 text-[var(--color-foreground)]">
          <Highlight value={title} query={query} />
        </span>
      </span>
    </Link>
  );
}

function SidebarSection({
  title,
  section,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  section: SectionKey;
  expanded: boolean;
  onToggle: (section: SectionKey) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--color-line)] pb-4 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(section)}
        className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm font-semibold text-[var(--color-foreground)]"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

export function AssmannCatalogBrowser({
  categories,
  products,
  locale,
  activeCategorySlug,
}: {
  categories: AssmannCategory[];
  products: AssmannProduct[];
  locale: Locale;
  activeCategorySlug?: string;
}) {
  const labels = copy[locale];
  const activeCategory =
    categories.find((category) => category.slug === activeCategorySlug) ?? null;
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [onlyWithImages, setOnlyWithImages] = useState(false);
  const [officialOnly, setOfficialOnly] = useState(false);
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    categories: true,
    subcategories: true,
    filters: true,
  });

  const normalizedQuery = normalize(query.trim());
  const hasQuery = normalizedQuery.length > 0;

  const subcategoryOptions = useMemo(() => {
    const categoryScope = activeCategory && !hasQuery ? [activeCategory] : categories;

    return categoryScope.flatMap((category) =>
      category.subcategories.map((subcategory) => ({
        id: `${category.slug}:${subcategory.slug}`,
        category: category.name,
        categorySlug: category.slug,
        label: subcategory.name,
      })),
    );
  }, [activeCategory, categories, hasQuery]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => productMatches(product, normalizedQuery))
      .filter((product) => {
        if (hasQuery || !activeCategory) {
          return true;
        }

        return product.placements.some(
          (placement) => placement.categorySlug === activeCategory.slug,
        );
      })
      .filter((product) => {
        if (selectedSubcategories.length === 0) {
          return true;
        }

        return product.placements.some((placement) =>
          selectedSubcategories.includes(`${placement.categorySlug}:${placement.subcategorySlug}`),
        );
      })
      .filter((product) => (onlyWithImages ? product.images.length > 0 : true))
      .filter((product) => (officialOnly ? product.foundOfficialPage : true))
      .slice()
      .sort((a, b) => (a.title || a.documentName).localeCompare(b.title || b.documentName));
  }, [
    activeCategory,
    hasQuery,
    normalizedQuery,
    officialOnly,
    onlyWithImages,
    products,
    selectedSubcategories,
  ]);

  const filteredSkuSet = useMemo(
    () => new Set(filteredProducts.map((product) => product.sku)),
    [filteredProducts],
  );

  const sections = useMemo<ProductSection[]>(() => {
    if (activeCategory && !hasQuery) {
      return activeCategory.subcategories
        .map((subcategory) => ({
          id: `${activeCategory.slug}:${subcategory.slug}`,
          title: subcategory.name,
          eyebrow: activeCategory.name,
          categorySlug: activeCategory.slug,
          products: subcategory.products.filter((product) => filteredSkuSet.has(product.sku)),
        }))
        .filter((section) => section.products.length > 0);
    }

    const sectionMap = new Map<string, ProductSection>();

    for (const product of filteredProducts) {
      const placement = getPrimaryPlacement(product) ?? product.placements[0];

      if (!placement) {
        continue;
      }

      const id = `${placement.categorySlug}:${placement.subcategorySlug}`;
      const existing = sectionMap.get(id);

      if (existing) {
        existing.products.push(product);
      } else {
        sectionMap.set(id, {
          id,
          title: placement.subcategory,
          eyebrow: placement.category,
          categorySlug: placement.categorySlug,
          products: [product],
        });
      }
    }

    return [...sectionMap.values()].sort((a, b) =>
      `${a.eyebrow} ${a.title}`.localeCompare(`${b.eyebrow} ${b.title}`),
    );
  }, [activeCategory, filteredProducts, filteredSkuSet, hasQuery]);

  const suggestions = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return products
      .filter((product) => productMatches(product, normalizedQuery))
      .slice(0, 6);
  }, [normalizedQuery, products]);

  function toggleSection(section: SectionKey) {
    setExpanded((current) => ({ ...current, [section]: !current[section] }));
  }

  function toggleSubcategory(value: string) {
    setSelectedSubcategories((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function clearFilters() {
    setQuery("");
    setSelectedSubcategories([]);
    setOnlyWithImages(false);
    setOfficialOnly(false);
  }

  const sidebar = (
    <aside className="h-full overflow-y-auto bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--color-foreground)]">{labels.filter}</span>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-line)]"
          aria-label={labels.clear}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <SidebarSection
          title={labels.categories}
          section="categories"
          expanded={expanded.categories}
          onToggle={toggleSection}
        >
          <div className="grid gap-1 pt-2">
            <Link
              href={`/${locale}/products`}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition hover:bg-[#f7fafc]",
                !activeCategory ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]" : "text-[var(--color-foreground)]",
              )}
            >
              {labels.allProducts}
              <ChevronRight className="h-4 w-4" />
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/${locale}/products/${category.slug}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-[#f7fafc]",
                  activeCategory?.slug === category.slug
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                    : "text-[var(--color-foreground)]",
                )}
              >
                <span>{category.name}</span>
                <span className="text-xs text-[var(--color-muted)]">{category.productCount}</span>
              </Link>
            ))}
          </div>
        </SidebarSection>

        <SidebarSection
          title={labels.subcategories}
          section="subcategories"
          expanded={expanded.subcategories}
          onToggle={toggleSection}
        >
          <div className="grid gap-2 pt-2">
            {subcategoryOptions.map((subcategory) => (
              <label
                key={subcategory.id}
                className="flex cursor-pointer items-start gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-foreground)] transition hover:bg-[#f7fafc]"
              >
                <input
                  type="checkbox"
                  checked={selectedSubcategories.includes(subcategory.id)}
                  onChange={() => toggleSubcategory(subcategory.id)}
                  className="mt-1 h-4 w-4 rounded border-[var(--color-line-strong)] accent-[var(--color-accent)]"
                />
                <span>
                  <span className="block font-medium">{subcategory.label}</span>
                  {hasQuery || !activeCategory ? (
                    <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                      {subcategory.category}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </SidebarSection>

        <SidebarSection
          title={labels.filters}
          section="filters"
          expanded={expanded.filters}
          onToggle={toggleSection}
        >
          <div className="grid gap-2 pt-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[#f7fafc]">
              <input
                type="checkbox"
                checked={onlyWithImages}
                onChange={(event) => setOnlyWithImages(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-line-strong)] accent-[var(--color-accent)]"
              />
              {labels.withImages}
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[#f7fafc]">
              <input
                type="checkbox"
                checked={officialOnly}
                onChange={(event) => setOfficialOnly(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-line-strong)] accent-[var(--color-accent)]"
              />
              {labels.officialOnly}
            </label>
          </div>
        </SidebarSection>

        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[var(--color-line)] bg-white px-4 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
        >
          {labels.clear}
        </button>
      </div>
    </aside>
  );

  return (
    <section className="bg-[#f7fafc]">
      <div className="sticky top-[69px] z-20 border-b border-[var(--color-line)] bg-white/94 px-4 py-4 backdrop-blur-xl sm:px-6 md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="relative flex items-center gap-2">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">{labels.search}</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labels.search}
                className="h-13 w-full rounded-lg border border-[var(--color-line-strong)] bg-white px-12 text-sm font-medium text-[var(--color-foreground)] shadow-[0_12px_30px_rgba(8,27,42,0.04)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(0,107,150,0.14)]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-muted)] transition hover:bg-black/5"
                  aria-label={labels.clear}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-13 items-center justify-center gap-2 rounded-lg border border-[var(--color-line-strong)] bg-white px-4 text-sm font-semibold text-[var(--color-foreground)] shadow-[0_12px_30px_rgba(8,27,42,0.04)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">{labels.filter}</span>
            </button>
          </div>

          {suggestions.length > 0 ? (
            <div className="absolute left-1/2 top-[calc(100%-10px)] z-30 w-[min(840px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-[var(--color-line)] bg-white p-2 shadow-[0_24px_70px_rgba(8,27,42,0.16)]">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {labels.suggestions}
              </p>
              <div className="grid gap-1">
                {suggestions.map((product) => (
                  <Link
                    key={product.sku}
                    href={getProductDetailHref(locale, product, activeCategory?.slug)}
                    className="grid grid-cols-[44px_1fr] items-center gap-3 rounded-md px-3 py-2 transition hover:bg-[#f7fafc]"
                  >
                    <span className="relative aspect-square overflow-hidden rounded bg-[#f7fafc]">
                      {getProductImage(product) ? (
                        <Image
                          src={getProductImage(product) ?? ""}
                          alt={product.title || product.documentName}
                          fill
                          sizes="44px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <PackageSearch className="m-3 h-5 w-5 text-[var(--color-muted)]" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[var(--color-foreground)]">
                        <Highlight value={product.title || product.documentName} query={query} />
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold text-[var(--color-accent-strong)]">
                        <Highlight value={product.sku} query={query} />
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-10">
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/35 transition",
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onMouseDown={() => setSidebarOpen(false)}
        >
          <div
            className={cn(
              "h-full w-[min(420px,92vw)] transform rounded-r-lg shadow-[0_28px_90px_rgba(2,14,24,0.22)] transition duration-300",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {sidebar}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
            >
              <Filter className="h-4 w-4" />
              {labels.filter}
            </button>
          </div>

          {sections.length > 0 ? (
            <div className="space-y-16">
              {sections.map((section) => (
                <section key={section.id} className="min-w-0 scroll-mt-36">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                        {section.eyebrow}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold text-[var(--color-foreground)]">
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
                    <div className="grid auto-cols-[242px] grid-flow-col grid-rows-2 gap-4 sm:auto-cols-[262px]">
                      {section.products.map((product) => (
                        <ProductCard
                          key={`${section.id}:${product.sku}`}
                          product={product}
                          locale={locale}
                          categorySlug={section.categorySlug}
                          query={query}
                          imageMissingLabel={labels.imageMissing}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--color-line)] bg-white px-6 py-14 text-center text-sm font-semibold text-[var(--color-muted)] shadow-[0_18px_48px_rgba(8,27,42,0.07)]">
              {labels.noResults}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
