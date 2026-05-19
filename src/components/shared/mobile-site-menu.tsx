"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Logo } from "@/components/shared/logo";
import type { ProductMenuCategory } from "@/components/shared/products-mega-menu";
import type { Locale } from "@/lib/i18n";

type SiteNavItem = {
  href: string;
  label: string;
  products?: boolean;
};

export function MobileSiteMenu({
  locale,
  navItems,
  productCategories,
}: {
  locale: Locale;
  navItems: SiteNavItem[];
  productCategories: ProductMenuCategory[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const allProductsLabel = locale === "sq" ? "Të gjitha produktet" : "All Products";
  const loginLabel = locale === "sq" ? "Hyr" : "Login";

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[var(--color-foreground)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.2)]"
        aria-label={locale === "sq" ? "Hap menunë" : "Open menu"}
        aria-expanded={isOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 p-3">
          <div className="ml-auto flex max-h-[calc(100vh-1.5rem)] w-full max-w-sm flex-col overflow-y-auto rounded-[26px] border border-black/10 bg-white p-4 shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between gap-3">
              <Logo href={`/${locale}`} />
              <button
                type="button"
                onClick={close}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/90 text-[var(--color-foreground)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.2)]"
                aria-label={locale === "sq" ? "Mbyll menunë" : "Close menu"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 grid gap-2 text-base font-medium text-[var(--color-foreground)]">
              {navItems.map((item) => (
                item.products ? (
                  <div
                    key={item.href}
                    className="rounded-2xl border border-black/8 bg-[#f7fafc] p-2"
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      className="block rounded-xl px-3 py-2 font-semibold transition hover:bg-white"
                    >
                      {allProductsLabel}
                    </Link>
                    <div className="mt-1 grid gap-1 border-t border-black/8 pt-2">
                      {productCategories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/${locale}/products/${category.slug}`}
                          onClick={close}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white"
                        >
                          <span>{category.name}</span>
                          <span className="text-xs font-semibold text-[var(--color-muted)]">
                            {category.productCount}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="group rounded-2xl border border-black/8 bg-[#f7fafc] px-4 py-3 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                  >
                    <span className="relative inline-block after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--color-accent)] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                      {item.label}
                    </span>
                  </Link>
                )
              ))}
            </nav>

            <div className="mt-6 border-t border-black/10 pt-5">
              <Link
                href={`/${locale}/login`}
                onClick={close}
                className="mb-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--color-foreground)] px-5 text-sm font-semibold !text-white transition hover:bg-[var(--color-accent-strong)]"
              >
                {loginLabel}
              </Link>
              <LanguageSwitcher locale={locale} labels="full" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
