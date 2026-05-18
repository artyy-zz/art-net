import type { MetadataRoute } from "next";
import { getAssmannProducts } from "@/data/assmann-catalog";
import { locales } from "@/lib/i18n";
import type { PublicPage } from "@/lib/seo";
import { getLocalizedPath, getPublicRoutePath } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

const publicPages: PublicPage[] = ["home", "about", "products", "projects", "contact"];

function absoluteUrl(path: string) {
  return `${siteUrl}${path}`;
}

function alternateLanguages(page: PublicPage) {
  return {
    sq: absoluteUrl(getLocalizedPath("sq", page)),
    en: absoluteUrl(getLocalizedPath("en", page)),
    "x-default": absoluteUrl(getLocalizedPath("sq", page)),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries = publicPages.flatMap((page) =>
    locales.map((locale) => ({
      url: absoluteUrl(getLocalizedPath(locale, page)),
      lastModified: new Date("2026-05-18"),
      changeFrequency: "monthly" as const,
      priority: getPublicRoutePath(page) === "" ? 1 : 0.8,
      alternates: {
        languages: alternateLanguages(page),
      },
    })),
  );

  const productEntries = getAssmannProducts().flatMap((product) =>
    locales.map((locale) => {
      const placement = product.placements[0];
      const path = `${getLocalizedPath(locale, "products")}/${placement?.categorySlug ?? "all"}/${product.slug}`;

      return {
        url: absoluteUrl(path),
        lastModified: new Date("2026-05-18"),
        changeFrequency: "monthly" as const,
        priority: 0.65,
        alternates: {
          languages: {
            sq: absoluteUrl(`${getLocalizedPath("sq", "products")}/${placement?.categorySlug ?? "all"}/${product.slug}`),
            en: absoluteUrl(`${getLocalizedPath("en", "products")}/${placement?.categorySlug ?? "all"}/${product.slug}`),
            "x-default": absoluteUrl(`${getLocalizedPath("sq", "products")}/${placement?.categorySlug ?? "all"}/${product.slug}`),
          },
        },
      };
    }),
  );

  return [...pageEntries, ...productEntries];
}
