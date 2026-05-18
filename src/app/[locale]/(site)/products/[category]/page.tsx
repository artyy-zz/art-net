import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductListingPage } from "@/components/site/product-listing-page";
import {
  getAssmannCategories,
  getAssmannCategoryBySlug,
  getLegacyProductCategorySlug,
} from "@/data/assmann-catalog";
import { locales, type Locale } from "@/lib/i18n";
import { getAbsoluteUrl, getAlternateLanguages, siteName } from "@/lib/seo";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAssmannCategories().map((category) => ({
      locale,
      category: category.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[category]">): Promise<Metadata> {
  const { locale, category } = await params;
  const typedLocale = locale as Locale;
  const activeCategory = getAssmannCategoryBySlug(category);

  if (!activeCategory) {
    const replacementSlug = getLegacyProductCategorySlug(category);

    if (replacementSlug) {
      const replacementCategory = getAssmannCategoryBySlug(replacementSlug);

      if (replacementCategory) {
        return {
          title: `${replacementCategory.name} Products | ${siteName}`,
          description: replacementCategory.description,
        };
      }
    }

    return {};
  }

  const path = `/${typedLocale}/products/${activeCategory.slug}`;
  const title = `${activeCategory.name} Products | ${siteName}`;

  return {
    title,
    description: activeCategory.description,
    keywords: [
      activeCategory.name,
      ...activeCategory.subcategories.map((subcategory) => subcategory.name),
      "DIGITUS",
      "ASSMANN",
      "Ubiquiti",
      "UniFi",
      "ITE Group",
    ],
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        Object.entries(getAlternateLanguages("products")).map(([language, href]) => [
          language,
          `${href}/${activeCategory.slug}`,
        ]),
      ),
    },
    openGraph: {
      title,
      description: activeCategory.description,
      url: path,
      siteName,
      type: "website",
      images: [
        {
          url: getAbsoluteUrl(activeCategory.image),
          alt: activeCategory.name,
        },
      ],
    },
  };
}

export default async function ProductCategoryPage({
  params,
}: PageProps<"/[locale]/products/[category]">) {
  const { locale, category } = await params;
  const activeCategory = getAssmannCategoryBySlug(category);

  if (!activeCategory) {
    const replacementSlug = getLegacyProductCategorySlug(category);

    if (replacementSlug) {
      redirect(`/${locale}/products/${replacementSlug}`);
    }

    notFound();
  }

  return <ProductListingPage locale={locale as Locale} activeCategory={activeCategory} />;
}
