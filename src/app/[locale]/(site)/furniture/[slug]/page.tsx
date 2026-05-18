import { notFound, redirect } from "next/navigation";
import { getAssmannProductBySlug, getProductDetailHref } from "@/data/assmann-catalog";
import type { Locale } from "@/lib/i18n";

export default async function LegacyFurnitureProductPage({
  params,
}: PageProps<"/[locale]/furniture/[slug]">) {
  const { locale, slug } = await params;
  const typedLocale = locale as Locale;
  const product = getAssmannProductBySlug(slug);

  if (!product) {
    notFound();
  }

  redirect(getProductDetailHref(typedLocale, product));
}
