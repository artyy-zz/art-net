"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductsMegaMenu, type ProductMenuCategory } from "@/components/shared/products-mega-menu";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  products?: boolean;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href.split("/").length > 2 && pathname.startsWith(`${href}/`));
}

export function SiteDesktopNav({
  locale,
  navItems,
  productCategories,
}: {
  locale: Locale;
  navItems: NavItem[];
  productCategories: ProductMenuCategory[];
}) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center justify-self-center rounded-full border border-black/8 bg-white/78 px-3 py-1.5 text-sm font-medium text-[var(--color-muted)] shadow-[0_12px_30px_rgba(8,27,42,0.05)] md:flex">
      {navItems.map((item) =>
        item.products ? (
          <ProductsMegaMenu
            key={item.href}
            locale={locale}
            label={item.label}
            categories={productCategories}
            active={isActivePath(pathname, item.href)}
          />
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "premium-nav-link",
              isActivePath(pathname, item.href) && "is-active text-[var(--color-foreground)]",
            )}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
