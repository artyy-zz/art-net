import catalogJson from "@/data/assmann-catalog.json";
import type { LocalizedCatalogProduct, LocalizedCategory } from "@/data/public-site";
import type { Locale } from "@/lib/i18n";

export type AssmannPlacement = {
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
};

export type AssmannProduct = {
  sku: string;
  slug: string;
  documentName: string;
  title: string;
  description: string;
  specifications: string[];
  images: string[];
  officialUrl: string | null;
  officialSource: "products.digitus.com" | "store.ui.com" | "itegroup.al" | null;
  foundOfficialPage: boolean;
  placements: AssmannPlacement[];
  brand?: string;
  sourceLabel?: string;
};

export type AssmannSubcategory = {
  name: string;
  slug: string;
  productSkus: string[];
};

export type AssmannCategory = {
  name: string;
  slug: string;
  description: string;
  image: string;
  theme: string;
  subcategories: (AssmannSubcategory & {
    products: AssmannProduct[];
  })[];
  productCount: number;
};

type RawCatalog = {
  source: {
    documentPath: string;
    officialSearchBaseUrl: string;
    generatedAt: string;
    documentRows: number;
    uniqueProducts: number;
  };
  categories: {
    name: string;
    slug: string;
    subcategories: AssmannSubcategory[];
  }[];
  products: AssmannProduct[];
};

const rawCatalog = catalogJson as RawCatalog;

const categoryMeta = {
  networking: {
    description:
      "Copper networking, patching, switching, PoE, media conversion, SFP technology, and structured cabling components.",
    image: "/images/artnet/ethernet-cable.png",
    theme: "#006b96",
  },
  surveillance: {
    description:
      "Cameras, recording, access, and surveillance hardware merged from the official product sources.",
    image: "/images/artnet/cctv-camera.png",
    theme: "#0f766e",
  },
  "racks-cabinets": {
    description:
      "Wall cabinets, freestanding racks, server cabinets, shelves, cooling, cable management, and cabinet accessories.",
    image: "/images/artnet/rack.jpg",
    theme: "#334155",
  },
  "fiber-optics": {
    description:
      "Fiber patch cables, pigtails, couplers, splice boxes, distribution boxes, MPO, FTTX, and fiber tools.",
    image: "/images/artnet/fiber-optic.webp",
    theme: "#475569",
  },
  power: {
    description:
      "Rack PDUs, UPS systems, chargers, power outlets, power cords, and PoE power solutions.",
    image: "/images/artnet/power-strip.png",
    theme: "#92400e",
  },
  "av-multimedia": {
    description:
      "AV cabling, adapters, extenders, splitters, converters, docking stations, and multimedia accessories.",
    image: "/images/artnet/hdmi-cable.png",
    theme: "#1d4ed8",
  },
  "smart-home": {
    description:
      "Smart-home products from the source catalog, represented without adding unlisted items.",
    image: "/images/artnet/smart-doorbell.jpg",
    theme: "#0f7a58",
  },
  "tools-accessories": {
    description:
      "Network tools, testers, labels, organizers, small accessories, mounts, bags, and workspace accessories.",
    image: "/images/artnet/toolkit.png",
    theme: "#525252",
  },
  "electrical-industrial": {
    description:
      "Electrical protection, switches, lighting, cable routing, industrial panels, breakers, sockets, and installation materials.",
    image: "https://itegroup.al/wp-content/uploads/2025/01/SHEZ9F351162734-10.jpg",
    theme: "#5b6b73",
  },
  "solar-photovoltaic": {
    description:
      "Photovoltaic panels, solar inverters, DC protection, and solar installation components sourced from the ITE catalog.",
    image: "https://itegroup.al/wp-content/uploads/2025/01/HUSUN2000-8KTL-M11364-10.jpg",
    theme: "#b7791f",
  },
} as const;

const productBySku = new Map(rawCatalog.products.map((product) => [product.sku, product]));

export const assmannCatalogSource = rawCatalog.source;

export function getAssmannProducts() {
  return rawCatalog.products;
}

export function getAssmannProductBySlug(slug: string) {
  return rawCatalog.products.find((product) => product.slug === slug) ?? null;
}

export function getAssmannProductBySku(sku: string) {
  return productBySku.get(sku) ?? null;
}

export function getPrimaryPlacement(product: AssmannProduct) {
  return product.placements[0];
}

export function getProductImage(product: AssmannProduct) {
  return product.images[0] ?? null;
}

export function getProductBrand(product: AssmannProduct) {
  if (product.brand) {
    return product.brand;
  }

  if (product.officialSource === "store.ui.com") {
    return "Ubiquiti / UniFi";
  }

  if (product.officialSource === "itegroup.al") {
    return product.sourceLabel ?? "ITE Group";
  }

  return "DIGITUS / ASSMANN";
}

export function getProductSourceName(product: AssmannProduct) {
  return product.sourceLabel ?? getProductBrand(product);
}

export function getAssmannCategories(): AssmannCategory[] {
  return rawCatalog.categories.map((category) => {
    const meta = categoryMeta[category.slug as keyof typeof categoryMeta] ?? {
      description: "Products imported from the official source catalogs.",
      image: "/images/artnet/hardware.png",
      theme: "#334155",
    };
    const subcategories = category.subcategories.map((subcategory) => ({
      ...subcategory,
      products: subcategory.productSkus
        .map((sku) => productBySku.get(sku))
        .filter((product): product is AssmannProduct => Boolean(product)),
    }));

    return {
      ...category,
      ...meta,
      subcategories,
      productCount: new Set(category.subcategories.flatMap((subcategory) => subcategory.productSkus))
        .size,
    };
  });
}

export function getAssmannCategoryBySlug(slug: string) {
  return getAssmannCategories().find((category) => category.slug === slug) ?? null;
}

export function getProductDetailHref(
  locale: Locale,
  product: AssmannProduct,
  preferredCategorySlug?: string,
) {
  const placement =
    product.placements.find((item) => item.categorySlug === preferredCategorySlug) ??
    getPrimaryPlacement(product) ??
    product.placements[0];

  return `/${locale}/products/${placement?.categorySlug ?? "all"}/${product.slug}`;
}

export function getRelatedAssmannProducts(product: AssmannProduct, limit = 4) {
  const primary = getPrimaryPlacement(product);

  if (!primary) {
    return [];
  }

  return rawCatalog.products
    .filter((candidate) => candidate.sku !== product.sku)
    .filter((candidate) =>
      candidate.placements.some(
        (placement) =>
          placement.categorySlug === primary.categorySlug &&
          placement.subcategorySlug === primary.subcategorySlug,
      ),
    )
    .slice(0, limit);
}

export function getAssmannHomeCategories(_locale: Locale): LocalizedCategory[] {
  void _locale;

  return getAssmannCategories().map((category) => ({
    id: category.slug,
    slug: category.slug,
    title: category.name,
    shortTitle: category.name,
    description: category.description,
    image: category.image,
    theme: category.theme,
    subcategories: category.subcategories.map((subcategory) => ({
      id: subcategory.slug,
      title: subcategory.name,
      products: subcategory.products.slice(0, 4).map((product): LocalizedCatalogProduct => ({
        id: product.sku,
        name: product.title || product.documentName,
        description: product.description || product.documentName,
        image: getProductImage(product) ?? category.image,
        specs: product.specifications,
        tags: [product.sku],
        categorySlug: category.slug,
        categoryTitle: category.name,
        subcategoryId: subcategory.slug,
        subcategoryTitle: subcategory.name,
      })),
    })),
  }));
}
