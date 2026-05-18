import type { Metadata } from "next";
import { ProductListingPage } from "@/components/site/product-listing-page";
import { locales, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products">): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata(locale as Locale, "products");
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ProductsPage({ params }: PageProps<"/[locale]/products">) {
  const { locale } = await params;

  return <ProductListingPage locale={locale as Locale} />;
}
