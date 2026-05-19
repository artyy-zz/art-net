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
  imageMetadata?: ProductImageMetadata[];
  officialUrl: string | null;
  officialSource: "products.digitus.com" | "store.ui.com" | "itegroup.al" | "assmann.com" | null;
  foundOfficialPage: boolean;
  placements: AssmannPlacement[];
  brand?: string;
  sourceLabel?: string;
  tags?: string[];
};

export type ProductImageMetadata = {
  src: string;
  width: number;
  height: number;
  bytes: number;
  low_quality_image?: true;
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

type AssmannCategoryCopy = {
  name: string;
  description: string;
  subcategories: Record<string, string>;
};

const sqCategoryCopy = {
  networking: {
    name: "Rrjete",
    description:
      "Kabllo bakri për rrjete, patching, switching, PoE, konvertim mediash, teknologji SFP dhe komponentë për kabllim të strukturuar.",
    subcategories: {
      "copper-network-cables": "Kabllo rrjeti bakri",
      "gateways-and-network-controllers": "Gateway dhe kontrollues rrjeti",
      "keystone-modules-and-network-outlets": "Module keystone dhe priza rrjeti",
      "media-converters": "Konvertues mediash",
      "patch-cables": "Patch kabllo",
      "patch-panels": "Patch panele",
      "poe-injectors-splitters-extenders": "PoE injektorë, ndarës dhe zgjatues",
      "rj45-connectors-and-plugs": "Konektorë dhe priza RJ45",
      "sfp-dac-aoc-modules": "Module SFP / DAC / AOC",
      switches: "Switch-e",
    },
  },
  "wifi-wireless": {
    name: "WiFi dhe pa tel",
    description:
      "Access point, pajisje WiFi, antena pa tel, mesh, zgjidhje të jashtme wireless dhe aksesorë për lidhje pa kabllo.",
    subcategories: {
      "access-points-and-wifi-devices": "Access point dhe pajisje WiFi",
      "wireless-antennas-and-accessories": "Antena wireless dhe aksesorë",
    },
  },
  surveillance: {
    name: "Mbikëqyrje",
    description:
      "Produkte për video-mbikëqyrje, përfshirë kamera IP, NVR, aksesorë kamerash dhe kabllo për sisteme sigurie.",
    subcategories: {
      "ip-cameras": "Kamera IP",
      "nvrs-and-video-recorders": "NVR dhe regjistrues video",
      "surveillance-cables": "Kabllo për mbikëqyrje",
      "surveillance-storage-accessories": "Ruajtje dhe aksesorë për mbikëqyrje",
    },
  },
  "security-access-control": {
    name: "Siguri dhe kontroll hyrjeje",
    description:
      "Interfonë, kontroll dyersh, lexues, sisteme alarmi zjarri, sensorë alarmi, sirena dhe kontrolle sigurie.",
    subcategories: {
      "alarm-sensors-and-sirens": "Sensorë alarmi dhe sirena",
      "door-access-control": "Kontroll hyrjeje në dyer",
      "fire-alarm-systems": "Sisteme alarmi zjarri",
      "intercom-systems": "Sisteme interfonie",
    },
  },
  "racks-cabinets": {
    name: "Rack dhe kabinete",
    description:
      "Kabinete muri, rack-e të lira, kabinete serverësh, rafte, ftohje, menaxhim kabllosh dhe aksesorë kabinetesh.",
    subcategories: {
      "charging-cabinets": "Kabinete karikimi",
      "cooling-and-ventilation": "Ftohje dhe ventilim",
      "freestanding-racks-and-cabinets": "Rack-e dhe kabinete të lira",
      "rack-accessories": "Aksesorë për rack",
      "rack-cable-management": "Menaxhim kabllosh në rack",
      "server-cabinets": "Kabinete serverësh",
      "shelves-and-rails": "Rafte dhe shina",
    },
  },
  "fiber-optics": {
    name: "Fibër optike",
    description:
      "Patch kabllo fiber, pigtail, coupler, kuti bashkimi, kuti shpërndarjeje, MPO, FTTX dhe vegla për fibër.",
    subcategories: {
      "fiber-connectors": "Konektorë fiber",
      "fiber-couplers": "Coupler fiber",
      "fiber-distribution-boxes": "Kuti shpërndarjeje fiber",
      "fiber-patch-cables": "Patch kabllo fiber",
      "fiber-pigtails": "Pigtail fiber",
      "fiber-splice-enclosures-patch-panels": "Kuti bashkimi dhe patch panele fiber",
      "fiber-structured-installation-cables": "Kabllo fiber për instalim të strukturuar",
      "fiber-trunk-breakout-cables": "Kabllo trunk dhe breakout fiber",
      fttx: "FTTX",
      "splice-devices-and-fiber-tools": "Pajisje bashkimi dhe vegla fiber",
    },
  },
  power: {
    name: "Energji",
    description:
      "Rack PDU, sisteme UPS, karikues, priza energjie, kabllo rryme dhe zgjidhje furnizimi me PoE.",
    subcategories: {
      "chargers-and-power-supplies": "Karikues dhe furnizues energjie",
      "ev-chargers": "Karikues EV",
      generators: "Gjeneratorë",
      "power-cords": "Kabllo rryme",
      "power-factor-correction": "Korrigjim i faktorit të fuqisë",
      "rack-pdus": "Rack PDU",
      stabilizers: "Stabilizatorë",
      transformers: "Transformatorë",
      "ups-systems-and-inverters": "Sisteme UPS dhe inverterë",
    },
  },
  "av-multimedia": {
    name: "AV dhe multimedia",
    description:
      "Kabllo AV, adapterë, zgjatues, splitter, konvertues, docking station dhe aksesorë multimedialë.",
    subcategories: {
      "conferencing-and-presentation": "Konferenca dhe prezantime",
      "hdmi-av-extenders": "Zgjatues HDMI / AV",
      "hdmi-splitters": "HDMI splitter",
      "hdmi-switches": "HDMI switch",
      "matrix-and-video-walls": "Matrix dhe video wall",
      "monitor-and-tv-mounts": "Mbajtëse monitori dhe TV",
      "repeaters-converters-adapters": "Repeater, konvertues dhe adapterë",
      "usb-extenders": "Zgjatues USB",
    },
  },
  "smart-home-automation": {
    name: "Shtëpi smart dhe automatizim",
    description:
      "Ndriçim smart, kontrollues, poça smart, sensorë dhe module automatizimi për shtëpi.",
    subcategories: {
      "philips-hue-and-smart-lighting": "Philips Hue dhe ndriçim smart",
    },
  },
  lighting: {
    name: "Ndriçim",
    description:
      "Llamba LED, panele, shirita, ndriçim rrugor, ndriçim emergjent, spotlights dhe produkte të përgjithshme ndriçimi.",
    subcategories: {
      "emergency-lighting": "Ndriçim emergjent",
      "led-lamps-and-spotlights": "Llamba LED dhe spotlights",
      "led-panels": "Panele LED",
      "led-strips": "Shirita LED",
      "street-lighting": "Ndriçim rrugor",
    },
  },
  "electrical-industrial": {
    name: "Elektrike dhe industriale",
    description:
      "Mbrojtje elektrike, çelësa civilë, panele industriale, PLC/HMI, sensorë, instrumente matëse dhe komponentë automatizimi.",
    subcategories: {
      "circuit-breakers-and-rcds": "Automatë dhe RCD",
      "civil-switches-and-sockets": "Çelësa dhe priza civile",
      "frequency-inverters-and-motor-control": "Inverterë frekuence dhe kontroll motori",
      "industrial-sensors": "Sensorë industrialë",
      "measuring-instruments": "Instrumente matëse",
      "panels-and-enclosures": "Panele dhe kuti mbrojtëse",
      "plc-hmi-bms": "PLC / HMI / BMS",
    },
  },
  "solar-photovoltaic": {
    name: "Solare / Fotovoltaike",
    description:
      "Panele fotovoltaike, inverterë solarë, mbrojtje DC dhe komponentë instalimi për sisteme solare nga katalogu ITE.",
    subcategories: {
      "photovoltaic-panels": "Panele fotovoltaike",
      "pv-structures-and-mounting": "Struktura dhe montim PV",
      "solar-cables-and-connectors": "Kabllo dhe konektorë solarë",
      "solar-inverters-and-smartlog": "Inverterë solarë dhe SmartLog",
    },
  },
  "installation-materials-cables": {
    name: "Materiale instalimi dhe kabllo",
    description:
      "Kanale kabllosh, tuba, kanale metalike, kuti muri, terminale, kabllo të përgjithshme dhe aksesorë instalimi.",
    subcategories: {
      "bus-cables": "Kabllo bus",
      "cable-channels-and-ducts": "Kanale dhe duct kabllosh",
      "conduits-and-tubes": "Tuba dhe kanale instalimi",
      "fire-alarm-audio-cables": "Kabllo zjarri, alarmi dhe audio",
      "general-power-cables": "Kabllo të përgjithshme energjie",
      "junction-wall-distribution-boxes": "Kuti lidhëse, muri dhe shpërndarjeje",
      "terminals-and-busbars": "Terminale dhe busbar",
    },
  },
  "tools-accessories": {
    name: "Vegla dhe aksesorë",
    description:
      "Vegla rrjeti, testues, etiketa, organizues, aksesorë të vegjël, mbajtëse, çanta dhe aksesorë për hapësirën e punës.",
    subcategories: {
      "hand-tools": "Vegla dore",
      "measuring-tools": "Vegla matëse",
      "network-testers-and-crimping-tools": "Testues rrjeti dhe vegla krimpimi",
    },
  },
} as const satisfies Record<string, AssmannCategoryCopy>;

const categoryMeta = {
  networking: {
    description:
      "Copper networking, patching, switching, PoE, media conversion, SFP technology, and structured cabling components.",
    image: "/images/artnet/home-categories/networking.jpg",
    theme: "#006b96",
  },
  "wifi-wireless": {
    description:
      "Access points, WiFi devices, wireless antennas, mesh, outdoor wireless, and wireless accessories.",
    image: "/images/artnet/home-categories/wifi-wireless.png",
    theme: "#0477b8",
  },
  surveillance: {
    description:
      "Video surveillance products including IP cameras, NVRs, camera accessories, and surveillance cabling.",
    image: "/images/artnet/home-categories/surveillance.png",
    theme: "#0f766e",
  },
  "security-access-control": {
    description:
      "Intercoms, door access, readers, fire alarm systems, alarm sensors, sirens, and security controls.",
    image: "/images/artnet/home-categories/security-access-control.png",
    theme: "#7f1d1d",
  },
  "racks-cabinets": {
    description:
      "Wall cabinets, freestanding racks, server cabinets, shelves, cooling, cable management, and cabinet accessories.",
    image: "/images/artnet/home-categories/racks-cabinets.jpg",
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
    image: "/images/artnet/home-categories/power.jpg",
    theme: "#92400e",
  },
  "av-multimedia": {
    description:
      "AV cabling, adapters, extenders, splitters, converters, docking stations, and multimedia accessories.",
    image: "/images/artnet/home-categories/av-multimedia.jpg",
    theme: "#1d4ed8",
  },
  "smart-home": {
    description:
      "Smart-home products from the source catalog, represented without adding unlisted items.",
    image: "/images/artnet/smart-doorbell.jpg",
    theme: "#0f7a58",
  },
  "smart-home-automation": {
    description:
      "Smart lighting, controllers, smart bulbs, sensors, and home automation modules.",
    image: "/images/artnet/smart-doorbell.jpg",
    theme: "#0f7a58",
  },
  lighting: {
    description:
      "LED lamps, panels, strips, street lighting, emergency lighting, spotlights, and general lighting products.",
    image: "/images/artnet/home-categories/lighting.jpg",
    theme: "#b45309",
  },
  "tools-accessories": {
    description:
      "Network tools, testers, labels, organizers, small accessories, mounts, bags, and workspace accessories.",
    image: "/images/artnet/toolkit.png",
    theme: "#525252",
  },
  "electrical-industrial": {
    description:
      "Electrical protection, civil switchgear, industrial panels, PLC/HMI, sensors, measuring instruments, and automation components.",
    image: "https://itegroup.al/wp-content/uploads/2025/01/SHEZ9F351162734-10.jpg",
    theme: "#5b6b73",
  },
  "solar-photovoltaic": {
    description:
      "Photovoltaic panels, solar inverters, DC protection, and solar installation components sourced from the ITE catalog.",
    image: "https://itegroup.al/wp-content/uploads/2025/01/HUSUN2000-8KTL-M11364-10.jpg",
    theme: "#b7791f",
  },
  "installation-materials-cables": {
    description:
      "Cable channels, conduits, trays, wall boxes, terminals, general cables, and installation accessories.",
    image: "/images/artnet/home-categories/installation-materials-cables.jpg",
    theme: "#64748b",
  },
} as const;

function getSqCategoryCopy(categorySlug: string) {
  return (sqCategoryCopy as Record<string, AssmannCategoryCopy>)[categorySlug];
}

function localizeCategoryName(category: RawCatalog["categories"][number], locale: Locale) {
  return locale === "sq" ? getSqCategoryCopy(category.slug)?.name ?? category.name : category.name;
}

function localizeCategoryDescription(
  category: RawCatalog["categories"][number],
  fallback: string,
  locale: Locale,
) {
  return locale === "sq" ? getSqCategoryCopy(category.slug)?.description ?? fallback : fallback;
}

function localizeSubcategoryName(
  categorySlug: string,
  subcategory: AssmannSubcategory,
  locale: Locale,
) {
  return locale === "sq"
    ? getSqCategoryCopy(categorySlug)?.subcategories[subcategory.slug] ?? subcategory.name
    : subcategory.name;
}

function localizePlacement(placement: AssmannPlacement, locale: Locale): AssmannPlacement {
  if (locale === "en") {
    return placement;
  }

  const category = rawCatalog.categories.find((item) => item.slug === placement.categorySlug);
  const subcategory = category?.subcategories.find(
    (item) => item.slug === placement.subcategorySlug,
  );

  return {
    ...placement,
    category: category
      ? localizeCategoryName(category, locale)
      : getSqCategoryCopy(placement.categorySlug)?.name ?? placement.category,
    subcategory: subcategory
      ? localizeSubcategoryName(placement.categorySlug, subcategory, locale)
      : getSqCategoryCopy(placement.categorySlug)?.subcategories[placement.subcategorySlug] ??
        placement.subcategory,
  };
}

function localizeProductPlacements(product: AssmannProduct, locale: Locale): AssmannProduct {
  if (locale === "en") {
    return product;
  }

  const tagTranslations = new Map<string, string>();
  for (const category of rawCatalog.categories) {
    tagTranslations.set(category.name, localizeCategoryName(category, locale));
    for (const subcategory of category.subcategories) {
      tagTranslations.set(
        subcategory.name,
        localizeSubcategoryName(category.slug, subcategory, locale),
      );
    }
  }

  return {
    ...product,
    placements: product.placements.map((placement) => localizePlacement(placement, locale)),
    tags: product.tags?.map((tag) => tagTranslations.get(tag) ?? tag),
  };
}

const legacyCategorySlugRedirects = {
  "smart-home": "smart-home-automation",
} as const;

const productBySku = new Map(rawCatalog.products.map((product) => [product.sku, product]));

export const assmannCatalogSource = rawCatalog.source;

export function getAssmannProducts(locale: Locale = "en") {
  return rawCatalog.products.map((product) => localizeProductPlacements(product, locale));
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

export function getProductImageMetadata(product: AssmannProduct, src?: string | null) {
  if (!src) {
    return null;
  }

  return product.imageMetadata?.find((item) => item.src === src) ?? null;
}

export function isLowQualityProductImage(product: AssmannProduct, src?: string | null) {
  return Boolean(getProductImageMetadata(product, src)?.low_quality_image);
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

export function getLegacyProductCategorySlug(slug: string) {
  return legacyCategorySlugRedirects[slug as keyof typeof legacyCategorySlugRedirects] ?? null;
}

export function getAssmannCategories(locale: Locale = "en"): AssmannCategory[] {
  return rawCatalog.categories.map((category) => {
    const meta = categoryMeta[category.slug as keyof typeof categoryMeta] ?? {
      description: "Products imported from the official source catalogs.",
      image: "/images/artnet/hardware.png",
      theme: "#334155",
    };
    const subcategories = category.subcategories.map((subcategory) => ({
      ...subcategory,
      name: localizeSubcategoryName(category.slug, subcategory, locale),
      products: subcategory.productSkus
        .map((sku) => productBySku.get(sku))
        .filter((product): product is AssmannProduct => Boolean(product))
        .map((product) => localizeProductPlacements(product, locale)),
    }));

    return {
      ...category,
      ...meta,
      name: localizeCategoryName(category, locale),
      description: localizeCategoryDescription(category, meta.description, locale),
      subcategories,
      productCount: new Set(category.subcategories.flatMap((subcategory) => subcategory.productSkus))
        .size,
    };
  });
}

export function getAssmannCategoryBySlug(slug: string, locale: Locale = "en") {
  return getAssmannCategories(locale).find((category) => category.slug === slug) ?? null;
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

export function getAssmannHomeCategories(locale: Locale): LocalizedCategory[] {
  return getAssmannCategories(locale).map((category) => ({
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
