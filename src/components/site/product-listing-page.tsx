import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AssmannCatalogBrowser } from "@/components/site/assmann-catalog-browser";
import {
  getAssmannCategories,
  getAssmannProducts,
  type AssmannCategory,
} from "@/data/assmann-catalog";
import { publicBrand, publicCopy } from "@/data/public-site";
import type { Locale } from "@/lib/i18n";
import { isRemoteImage } from "@/lib/image-utils";

const listingCopy = {
  sq: {
    allLabel: "Te gjitha produktet",
    breadcrumbProducts: "Produktet",
    categoryProducts: "produkte",
    subcategories: "nenkategori",
    relatedCategories: "Kategori te tjera",
    relatedBody: "Kaloni shpejt ne nje familje tjeter produktesh pa humbur katalogun.",
    browse: "Shfleto",
  },
  en: {
    allLabel: "All Products",
    breadcrumbProducts: "Products",
    categoryProducts: "products",
    subcategories: "subcategories",
    relatedCategories: "Related categories",
    relatedBody: "Move quickly into another product family without leaving the catalog flow.",
    browse: "Browse",
  },
} as const;

function CategoryTile({
  category,
  locale,
  label,
}: {
  category: AssmannCategory;
  locale: Locale;
  label: string;
}) {
  return (
    <Link
      href={`/${locale}/products/${category.slug}`}
      className="group grid grid-cols-[72px_1fr_auto] items-center gap-4 rounded-lg border border-[var(--color-line)] bg-white p-3 shadow-[0_12px_30px_rgba(8,27,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(0,107,150,0.28)] hover:shadow-[0_18px_48px_rgba(8,27,42,0.09)]"
    >
      <span className="relative aspect-square overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          quality={90}
          unoptimized={isRemoteImage(category.image)}
          sizes="72px"
          className="object-contain p-2 transition duration-500 group-hover:scale-[1.05]"
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--color-foreground)]">
          {category.name}
        </span>
        <span className="mt-1 block text-xs font-medium text-[var(--color-muted)]">
          {category.productCount.toLocaleString()} {label}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 text-[var(--color-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-accent-strong)]" />
    </Link>
  );
}

export function ProductListingPage({
  locale,
  activeCategory,
}: {
  locale: Locale;
  activeCategory?: AssmannCategory | null;
}) {
  const copy = publicCopy[locale];
  const labels = listingCopy[locale];
  const categories = getAssmannCategories();
  const products = getAssmannProducts();
  const otherCategories = categories.filter((category) => category.slug !== activeCategory?.slug);
  const pageTitle = activeCategory?.name ?? labels.allLabel;
  const pageDescription = activeCategory?.description;
  const heroImage = activeCategory?.image ?? publicBrand.logo;
  const heroAlt = activeCategory?.name ?? publicBrand.name;

  return (
    <div className="bg-[#f7fafc]">
      <section className="border-b border-[var(--color-line)] bg-white px-4 py-8 sm:px-6 md:px-10">
        <div className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
            <Link href={`/${locale}`} className="hover:text-[var(--color-foreground)]">
              {publicBrand.name}
            </Link>
            <span>/</span>
            <Link href={`/${locale}/products`} className="hover:text-[var(--color-foreground)]">
              {labels.breadcrumbProducts}
            </Link>
            {activeCategory ? (
              <>
                <span>/</span>
                <span className="text-[var(--color-foreground)]">{activeCategory.name}</span>
              </>
            ) : null}
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.62fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-[var(--color-accent-strong)]">
                {copy.products.eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl break-words font-display text-4xl font-semibold leading-tight text-[var(--color-foreground)] md:text-6xl">
                {pageTitle}
              </h1>
              {pageDescription ? (
                <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
                  {pageDescription}
                </p>
              ) : null}
            </div>

            <div className="relative min-h-[260px] overflow-hidden rounded-lg border border-[var(--color-line)] bg-white shadow-[0_24px_70px_rgba(8,27,42,0.08)]">
              <Image
                src={heroImage}
                alt={heroAlt}
                fill
                preload
                quality={90}
                unoptimized={isRemoteImage(heroImage)}
                sizes="(min-width: 1024px) 32vw, 100vw"
                className="object-contain p-10"
              />
            </div>
          </div>
        </div>
      </section>

      <AssmannCatalogBrowser
        categories={categories}
        products={products}
        locale={locale}
        activeCategorySlug={activeCategory?.slug}
      />

      <section className="border-t border-[var(--color-line)] bg-white px-4 py-12 sm:px-6 md:px-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
                {labels.relatedCategories}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                {labels.relatedBody}
              </p>
            </div>
            {activeCategory ? (
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
              >
                {labels.allLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(activeCategory ? otherCategories : categories).map((category) => (
              <CategoryTile
                key={category.slug}
                category={category}
                locale={locale}
                label={labels.categoryProducts}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
