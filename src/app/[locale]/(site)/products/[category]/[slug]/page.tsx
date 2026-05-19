import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/shared/json-ld";
import { ProductGallery } from "@/components/site/product-gallery";
import {
  getAssmannCategoryBySlug,
  getAssmannProductBySlug,
  getAssmannProducts,
  getLegacyProductCategorySlug,
  getProductBrand,
  getProductDetailHref,
  getPrimaryPlacement,
  getProductImage,
  getProductImageMetadata,
  getProductSourceName,
  getRelatedAssmannProducts,
} from "@/data/assmann-catalog";
import { publicBrand, publicCopy } from "@/data/public-site";
import { locales, type Locale } from "@/lib/i18n";
import { getAbsoluteUrl, getAlternateLanguages, siteName } from "@/lib/seo";

const copy = {
  sq: {
    back: "Kthehu te produktet",
    sku: "SKU / Model",
    category: "Kategoria",
    subcategory: "Nenkategoria",
    specifications: "Specifikimet",
    related: "Produkte te ngjashme",
    official: "Kontakto",
    sourceMissing: "Faqja zyrtare nuk u gjet gjate importit.",
    imageMissing: "Pa imazh zyrtar",
    preview: "Shiko imazhin",
    close: "Mbyll",
    description: "Pershkrimi",
  },
  en: {
    back: "Back to products",
    sku: "SKU / Model",
    category: "Category",
    subcategory: "Subcategory",
    specifications: "Specifications",
    related: "Related products",
    official: "Contact us",
    sourceMissing: "No official page was found during import.",
    imageMissing: "No official image",
    preview: "Preview image",
    close: "Close",
    description: "Description",
  },
} as const;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAssmannProducts().flatMap((product) =>
      product.placements.map((placement) => ({
        locale,
        category: placement.categorySlug,
        slug: product.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[category]/[slug]">): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const typedLocale = locale as Locale;
  const product = getAssmannProductBySlug(slug);
  const activeCategory = getAssmannCategoryBySlug(category);

  if (!product || !activeCategory) {
    const replacementSlug = getLegacyProductCategorySlug(category);

    if (product && replacementSlug) {
      return {
        alternates: {
          canonical: getProductDetailHref(typedLocale, product, replacementSlug),
        },
      };
    }

    return {};
  }

  const placement =
    product.placements.find((item) => item.categorySlug === activeCategory.slug) ??
    getPrimaryPlacement(product);
  const productBrand = getProductBrand(product);
  const productSourceName = getProductSourceName(product);
  const path = `/${typedLocale}/products/${activeCategory.slug}/${product.slug}`;
  const description =
    product.description ||
    `${product.documentName}. ${productBrand} product number ${product.sku}.`;
  const title = `${product.title || product.documentName} | ${product.sku} | ${siteName}`;

  return {
    title,
    description,
    keywords: [
      product.sku,
      product.title,
      product.documentName,
      productBrand,
      productSourceName,
      placement?.category,
      placement?.subcategory,
      ...(product.tags ?? []),
    ].filter((value): value is string => Boolean(value)),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        Object.entries(getAlternateLanguages("products")).map(([language, href]) => [
          language,
          `${href}/${activeCategory.slug}/${product.slug}`,
        ]),
      ),
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      type: "website",
      images: product.images.slice(0, 1).map((image) => ({
        url: image,
        alt: product.title || product.documentName,
      })),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function RelatedProductCard({
  product,
  locale,
  categorySlug,
}: {
  product: ReturnType<typeof getAssmannProducts>[number];
  locale: Locale;
  categorySlug: string;
}) {
  const image = getProductImage(product);
  const imageMetadata = getProductImageMetadata(product, image);
  const imageWidth = imageMetadata?.width ?? 112;
  const imageHeight = imageMetadata?.height ?? 112;

  return (
    <Link
      href={getProductDetailHref(locale, product, categorySlug)}
      className="group grid min-h-[132px] grid-cols-[112px_1fr] overflow-hidden rounded-lg border border-[var(--color-line)] bg-white shadow-[0_12px_34px_rgba(8,27,42,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(0,107,150,0.28)]"
    >
      <span className="relative flex items-center justify-center bg-[#f7fafc] p-3">
        {image ? (
          imageMetadata ? (
            <Image
              src={image}
              alt={product.title || product.documentName}
              width={imageWidth}
              height={imageHeight}
              loading="lazy"
              quality={90}
              sizes="88px"
              className="h-auto w-auto max-w-full object-contain"
              style={{
                maxWidth: `${Math.min(imageWidth, 88)}px`,
                maxHeight: `${Math.min(imageHeight, 88)}px`,
              }}
            />
          ) : (
            <Image
              src={image}
              alt={product.title || product.documentName}
              fill
              loading="lazy"
              quality={90}
              sizes="112px"
              className="object-contain p-3"
            />
          )
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col justify-center p-4">
        <span className="text-xs font-semibold text-[var(--color-accent-strong)]">
          {product.sku}
        </span>
        <span className="mt-2 line-clamp-3 text-sm font-semibold leading-5 text-[var(--color-foreground)]">
          {product.title || product.documentName}
        </span>
      </span>
    </Link>
  );
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/[locale]/products/[category]/[slug]">) {
  const { locale, category, slug } = await params;
  const typedLocale = locale as Locale;
  const labels = copy[typedLocale];
  const navProducts = publicCopy[typedLocale].nav.products;
  const product = getAssmannProductBySlug(slug);
  const activeCategory = getAssmannCategoryBySlug(category);

  if (!product) {
    notFound();
  }

  if (!activeCategory) {
    const replacementSlug = getLegacyProductCategorySlug(category);

    if (replacementSlug) {
      redirect(getProductDetailHref(typedLocale, product, replacementSlug));
    }

    notFound();
  }

  const placement =
    product.placements.find((item) => item.categorySlug === activeCategory.slug) ??
    getPrimaryPlacement(product);

  if (!placement || placement.categorySlug !== activeCategory.slug) {
    redirect(getProductDetailHref(typedLocale, product));
  }

  const related = getRelatedAssmannProducts(product);
  const title = product.title || product.documentName;
  const description = product.description || product.documentName;
  const productBrand = getProductBrand(product);
  const productSourceName = getProductSourceName(product);
  const productUrl = getAbsoluteUrl(`/${typedLocale}/products/${activeCategory.slug}/${product.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: title,
        sku: product.sku,
        description,
        image: product.images.map((image) => getAbsoluteUrl(image)),
        url: productUrl,
        category: `${placement.category} / ${placement.subcategory}`,
        brand: {
          "@type": "Brand",
          name: productBrand,
        },
        manufacturer: {
          "@type": "Organization",
          name: productSourceName,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: publicBrand.name,
            item: getAbsoluteUrl(`/${typedLocale}`),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: navProducts,
            item: getAbsoluteUrl(`/${typedLocale}/products`),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: placement.category,
            item: getAbsoluteUrl(`/${typedLocale}/products/${activeCategory.slug}`),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: title,
            item: productUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-[#f7fafc]">
      <JsonLd data={structuredData} />
      <section className="border-b border-[var(--color-line)] bg-white px-4 py-6 sm:px-6 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Link
            href={`/${typedLocale}/products/${activeCategory.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {labels.back}
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
            <Link href={`/${typedLocale}`} className="hover:text-[var(--color-foreground)]">
              {publicBrand.name}
            </Link>
            <span>/</span>
            <Link
              href={`/${typedLocale}/products`}
              className="hover:text-[var(--color-foreground)]"
            >
              {navProducts}
            </Link>
            <span>/</span>
            <Link
              href={`/${typedLocale}/products/${activeCategory.slug}`}
              className="hover:text-[var(--color-foreground)]"
            >
              {placement.category}
            </Link>
          </nav>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
          <ProductGallery
            images={product.images}
            imageMetadata={product.imageMetadata}
            title={title}
            missingLabel={labels.imageMissing}
            previewLabel={labels.preview}
            closeLabel={labels.close}
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-accent-strong)]">
              {productBrand}
            </p>
            <h1 className="mt-4 break-words font-display text-4xl font-semibold leading-tight text-[var(--color-foreground)] md:text-5xl">
              {title}
            </h1>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--color-line)] bg-white p-4">
                <p className="text-xs font-semibold text-[var(--color-muted)]">{labels.sku}</p>
                <p className="mt-2 break-words text-base font-semibold text-[var(--color-foreground)]">
                  {product.sku}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-line)] bg-white p-4">
                <p className="text-xs font-semibold text-[var(--color-muted)]">
                  {labels.category}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--color-foreground)]">
                  {placement.category}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-line)] bg-white p-4">
                <p className="text-xs font-semibold text-[var(--color-muted)]">
                  {labels.subcategory}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--color-foreground)]">
                  {placement.subcategory}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-[var(--color-line)] bg-white p-6 shadow-[0_18px_48px_rgba(8,27,42,0.07)]">
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
                {labels.description}
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">{description}</p>
              {product.officialUrl ? (
                <Link
                  href={`/${typedLocale}/contact`}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-foreground)] px-4 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--color-accent-strong)]"
                >
                  {labels.official}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : (
                <p className="mt-6 rounded-lg bg-[#f3f5f7] px-4 py-3 text-sm font-semibold text-[var(--color-muted)]">
                  {labels.sourceMissing}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {product.specifications.length > 0 ? (
        <section className="px-4 pb-10 sm:px-6 md:px-10 md:pb-14">
          <div className="mx-auto max-w-7xl rounded-lg border border-[var(--color-line)] bg-white p-6 shadow-[0_18px_48px_rgba(8,27,42,0.07)] md:p-8">
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
              {labels.specifications}
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {product.specifications.map((specification) => (
                <div
                  key={specification}
                  className="rounded-lg border border-[var(--color-line)] bg-[#f8fbfd] px-4 py-3 text-sm font-medium leading-6 text-[var(--color-foreground)]"
                >
                  {specification}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="px-4 pb-16 sm:px-6 md:px-10 md:pb-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
              {labels.related}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {related.map((relatedProduct) => (
                <RelatedProductCard
                  key={relatedProduct.sku}
                  product={relatedProduct}
                  locale={typedLocale}
                  categorySlug={activeCategory.slug}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
