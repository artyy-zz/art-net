import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Logo } from "@/components/shared/logo";
import { MobileSiteMenu } from "@/components/shared/mobile-site-menu";
import { SiteDesktopNav } from "@/components/shared/site-desktop-nav";
import { SiteHeaderChrome } from "@/components/shared/site-header-chrome";
import Link from "next/link";
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
    <SiteHeaderChrome>
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 md:px-10">
        <Logo href={`/${locale}`} />
        <SiteDesktopNav
          locale={locale}
          navItems={navItems}
          productCategories={productCategories}
        />
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
    </SiteHeaderChrome>
  );
}
