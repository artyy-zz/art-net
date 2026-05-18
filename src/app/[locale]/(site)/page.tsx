import type { Metadata } from "next";
import { HomeCategorySections } from "@/components/site/home-category-sections";
import { getAssmannHomeCategories } from "@/data/assmann-catalog";
import { publicCopy } from "@/data/public-site";
import { locales, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata(locale as Locale, "home");
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const copy = publicCopy[typedLocale];
  const categories = getAssmannHomeCategories(typedLocale);

  return (
    <div className="animate-fade bg-white">
      <HomeCategorySections
        categories={categories}
        locale={typedLocale}
        copy={{
          detailsButton: copy.home.detailsButton,
          productsButton: copy.home.productsButton,
        }}
      />
    </div>
  );
}
