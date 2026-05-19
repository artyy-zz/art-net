import Link from "next/link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Logo } from "@/components/shared/logo";
import { MobileSiteMenu } from "@/components/shared/mobile-site-menu";
import { ProductsMegaMenu } from "@/components/shared/products-mega-menu";
import { getAssmannCategories } from "@/data/assmann-catalog";
import { publicCopy } from "@/data/public-site";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const copy = publicCopy[locale];
  const productCategories = getAssmannCategories(locale).map((category) => ({
    name: category.name,
    slug: category.slug,
    productCount: category.productCount,
    subcategories: category.subcategories.map((subcategory) => ({
      name: subcategory.name,
      slug: subcategory.slug,
    })),
  }));
  const navItems = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/products`, label: copy.nav.products, products: true },
    { href: `/${locale}/services`, label: copy.nav.services },
    { href: `/${locale}/projects`, label: copy.nav.projects },
    { href: `/${locale}/contact`, label: copy.nav.contacts },
  ];
  const loginLabel = locale === "sq" ? "Hyr" : "Login";

  return (
    <header className="sticky top-0 z-30 border-b border-black/6 bg-white/82 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 md:px-10">
        <Logo href={`/${locale}`} />
        <nav className="hidden items-center justify-self-center rounded-full border border-black/8 bg-white/78 px-2 py-1 text-sm font-medium text-[var(--color-muted)] shadow-[0_12px_30px_rgba(8,27,42,0.05)] md:flex">
          {navItems.map((item) => (
            item.products ? (
              <ProductsMegaMenu
                key={item.href}
                locale={locale}
                label={item.label}
                categories={productCategories}
              />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 transition duration-200 hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-foreground)]"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>
        <div className="hidden items-center justify-end gap-3 md:flex">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/login`}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--color-foreground)] px-5 text-sm font-semibold !text-white shadow-[0_12px_30px_rgba(8,27,42,0.16)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-strong)]"
          >
            {loginLabel}
          </Link>
        </div>
        <div className="flex justify-end md:hidden">
          <MobileSiteMenu locale={locale} navItems={navItems} productCategories={productCategories} />
        </div>
      </div>
    </header>
  );
}
