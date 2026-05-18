import { inflateRawSync } from "node:zlib";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type SourceKind = "ite" | "unifi";

type SourceRow = {
  source: SourceKind;
  documentPath: string;
  category: string;
  subcategory: string;
  name: string;
  sku: string;
  sourceLabel: string;
  url: string;
  notes: string;
};

type Placement = {
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
};

type CatalogProduct = {
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
  placements: Placement[];
  brand?: string;
  sourceLabel?: string;
};

type CatalogSubcategory = {
  name: string;
  slug: string;
  productSkus: string[];
};

type CatalogCategory = {
  name: string;
  slug: string;
  subcategories: CatalogSubcategory[];
};

type CatalogFile = {
  source: Record<string, unknown>;
  categories: CatalogCategory[];
  products: CatalogProduct[];
  sourceDocuments?: {
    path: string;
    kind: SourceKind | "assmann";
    importedAt: string;
    rows: number;
  }[];
};

type WooCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  permalink: string;
};

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku: string;
  short_description: string;
  description: string;
  images: { src: string; thumbnail?: string; alt?: string }[];
  categories: { id: number; name: string; slug: string; link: string }[];
  attributes: {
    name: string;
    terms?: { name: string; slug: string }[];
  }[];
};

type UiAsset = {
  url?: string;
  mimeType?: string;
  childAssets?: UiAsset[];
};

type UiGallery = {
  items?: {
    data?: UiAsset;
  }[];
};

type UiProduct = {
  id: string;
  slug: string;
  name?: string;
  displaySku?: string;
  title?: string;
  shortTitle?: string;
  shortDescription?: string;
  description?: string;
  keyFeatures?: string;
  status?: string;
  thumbnail?: UiAsset;
  gallery?: UiGallery | null;
  techSpecsMedia?: UiGallery | null;
  variants?: {
    sku?: string;
    displaySku?: string;
    status?: string;
  }[];
  __typename?: string;
};

type ImportStats = {
  rows: number;
  addedProducts: number;
  mergedProducts: number;
  dedupedProducts: number;
  addedPlacements: number;
  skippedRows: { source: SourceKind; name: string; sku: string; reason: string }[];
  missingOfficialData: { source: SourceKind; name: string; sku: string; url: string }[];
  categoryImports: { sourceName: string; matchedCategory: string; products: number }[];
};

const workspaceRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(workspaceRoot, "src", "data", "assmann-catalog.json");
const reportPath = path.join(workspaceRoot, "src", "data", "catalog-expansion-report.json");
const userHome = process.env.USERPROFILE ?? "C:\\Users\\PC";
function resolveSourceDocument(fileName: string) {
  const candidates = [
    path.join(userHome, "Desktop", fileName),
    path.join(userHome, "Desktop", "artneti", "catalog doc", fileName),
    path.join(userHome, "Downloads", fileName),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}

const documents = [
  {
    source: "ite" as const,
    path: resolveSourceDocument("itegroup_product_source_map.docx"),
  },
  {
    source: "unifi" as const,
    path: resolveSourceDocument("ubiquiti_unifi_product_source_map.docx"),
  },
];

const stats: ImportStats = {
  rows: 0,
  addedProducts: 0,
  mergedProducts: 0,
  dedupedProducts: 0,
  addedPlacements: 0,
  skippedRows: [],
  missingOfficialData: [],
  categoryImports: [],
};

function readUInt32LE(buffer: Buffer, offset: number) {
  return buffer.readUInt32LE(offset);
}

function readUInt16LE(buffer: Buffer, offset: number) {
  return buffer.readUInt16LE(offset);
}

function fail(message: string): never {
  throw new Error(message);
}

function extractZipEntry(buffer: Buffer, entryName: string) {
  let eocdOffset = -1;

  for (let index = buffer.length - 22; index >= 0; index -= 1) {
    if (readUInt32LE(buffer, index) === 0x06054b50) {
      eocdOffset = index;
      break;
    }
  }

  if (eocdOffset < 0) {
    fail("Could not find the DOCX ZIP central directory.");
  }

  const entryCount = readUInt16LE(buffer, eocdOffset + 10);
  let centralDirectoryOffset = readUInt32LE(buffer, eocdOffset + 16);

  for (let index = 0; index < entryCount; index += 1) {
    if (readUInt32LE(buffer, centralDirectoryOffset) !== 0x02014b50) {
      fail("Invalid DOCX ZIP central directory entry.");
    }

    const compressionMethod = readUInt16LE(buffer, centralDirectoryOffset + 10);
    const compressedSize = readUInt32LE(buffer, centralDirectoryOffset + 20);
    const fileNameLength = readUInt16LE(buffer, centralDirectoryOffset + 28);
    const extraLength = readUInt16LE(buffer, centralDirectoryOffset + 30);
    const commentLength = readUInt16LE(buffer, centralDirectoryOffset + 32);
    const localHeaderOffset = readUInt32LE(buffer, centralDirectoryOffset + 42);
    const fileName = buffer
      .subarray(centralDirectoryOffset + 46, centralDirectoryOffset + 46 + fileNameLength)
      .toString("utf8");

    if (fileName === entryName) {
      if (readUInt32LE(buffer, localHeaderOffset) !== 0x04034b50) {
        fail(`Invalid local ZIP header for ${entryName}.`);
      }

      const localNameLength = readUInt16LE(buffer, localHeaderOffset + 26);
      const localExtraLength = readUInt16LE(buffer, localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);

      if (compressionMethod === 0) {
        return compressed.toString("utf8");
      }

      if (compressionMethod === 8) {
        return inflateRawSync(compressed).toString("utf8");
      }

      fail(`Unsupported DOCX ZIP compression method: ${compressionMethod}.`);
    }

    centralDirectoryOffset += 46 + fileNameLength + extraLength + commentLength;
  }

  fail(`Could not find ${entryName} inside the DOCX file.`);
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function paragraphText(xml: string) {
  return [...xml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)]
    .map((match) => decodeXml(match[1] ?? ""))
    .join("")
    .trim()
    .replace(/\s+/g, " ");
}

function paragraphStyle(xml: string) {
  return xml.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/)?.[1] ?? "";
}

function tableRows(xml: string) {
  return [...xml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map((rowMatch) =>
    [...(rowMatch[0] ?? "").matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)].map((cellMatch) =>
      [...(cellMatch[0] ?? "").matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)]
        .map((paragraphMatch) => paragraphText(paragraphMatch[0] ?? ""))
        .filter(Boolean)
        .join(" ")
        .trim()
        .replace(/\s+/g, " "),
    ),
  );
}

async function extractRows(documentPath: string, source: SourceKind) {
  const docBuffer = await readFile(documentPath);
  const docXml = extractZipEntry(docBuffer, "word/document.xml");
  const body = docXml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)?.[1] ?? "";
  const blocks = [...body.matchAll(/<w:(p|tbl)\b[\s\S]*?<\/w:\1>/g)];
  const rows: SourceRow[] = [];
  let category = "";
  let subcategory = "";

  for (const block of blocks) {
    const xml = block[0] ?? "";
    const type = block[1];

    if (type === "p") {
      const style = paragraphStyle(xml);
      const text = paragraphText(xml);

      if (style === "Heading1") {
        category = text;
        subcategory = "";
      }

      if (style === "Heading2") {
        subcategory = text;
      }
    }

    if (type === "tbl" && category && subcategory) {
      const table = tableRows(xml).filter((row) => row.length >= 5);
      const header = table[0] ?? [];

      if (!/Product name/i.test(header[0] ?? "") || !/Codex source URL/i.test(header[3] ?? "")) {
        continue;
      }

      for (const row of table.slice(1)) {
        const [name, sku, sourceLabel, url, notes] = row.map((value) => value.trim());

        if (name && sku) {
          rows.push({
            source,
            documentPath,
            category,
            subcategory,
            name,
            sku,
            sourceLabel,
            url,
            notes,
          });
        }
      }
    }
  }

  return rows;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function htmlDecode(value: string) {
  return decodeXml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value: string) {
  return htmlDecode(value.replace(/<br\s*\/?>/gi, " "));
}

function normalizeText(value: string) {
  return htmlDecode(value)
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeSku(value: string) {
  return value.trim().toLocaleLowerCase();
}

function unique<T>(values: (T | null | undefined | false | "")[]) {
  return [...new Set(values.filter((value): value is T => Boolean(value)))];
}

function cleanDisplaySku(value: string) {
  return value.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function isIteCategorySource(row: SourceRow) {
  return /^Categor(y|ies):/i.test(row.sku);
}

function isCollectionPlaceholder(row: SourceRow) {
  return /Product Collection/i.test(row.sku);
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.text();
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
      accept: "application/json,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json() as Promise<T>;
}

function readNextData(html: string) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );

  if (!match?.[1]) {
    return null;
  }

  return JSON.parse(match[1]) as unknown;
}

function collectUiProducts(value: unknown, products = new Map<string, UiProduct>()) {
  if (!value || typeof value !== "object") {
    return products;
  }

  if (
    !Array.isArray(value) &&
    (value as UiProduct).__typename === "StorefrontProduct" &&
    (value as UiProduct).slug
  ) {
    products.set((value as UiProduct).id, value as UiProduct);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectUiProducts(item, products);
    }
  } else {
    for (const item of Object.values(value)) {
      collectUiProducts(item, products);
    }
  }

  return products;
}

function getObjectPath<T>(value: unknown, pathSegments: string[]) {
  let current = value;

  for (const segment of pathSegments) {
    if (!current || typeof current !== "object") {
      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current as T | null;
}

function parseListItems(html: string) {
  return unique(
    [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)]
      .map((match) => stripHtml(match[1] ?? ""))
      .filter((value) => value.length > 2),
  );
}

function imageUrlFromAsset(asset: UiAsset | undefined) {
  if (!asset?.url || !/^image\//.test(asset.mimeType ?? "")) {
    return null;
  }

  return asset.url;
}

function collectUiImageUrls(product: UiProduct) {
  const urls: string[] = [];
  const galleries = [product.gallery, product.techSpecsMedia].filter(Boolean) as UiGallery[];

  for (const gallery of galleries) {
    for (const item of gallery.items ?? []) {
      const image = imageUrlFromAsset(item.data);

      if (image) {
        urls.push(image);
      }

      for (const childAsset of item.data?.childAssets ?? []) {
        const childImage = imageUrlFromAsset(childAsset);

        if (childImage) {
          urls.push(childImage);
        }
      }
    }
  }

  const thumbnail = imageUrlFromAsset(product.thumbnail);

  if (thumbnail) {
    urls.unshift(thumbnail);
  }

  return unique(urls).slice(0, 8);
}

function uiProductKeys(product: UiProduct) {
  return unique([
    product.name,
    product.displaySku,
    product.displaySku ? cleanDisplaySku(product.displaySku) : "",
    product.title,
    product.shortTitle,
    ...(product.variants ?? []).flatMap((variant) => [
      variant.sku,
      variant.displaySku,
      variant.displaySku ? cleanDisplaySku(variant.displaySku) : "",
    ]),
  ]);
}

function findUiProduct(row: SourceRow, products: UiProduct[]) {
  const rowSku = normalizeSku(row.sku);
  const rowName = normalizeText(row.name);

  const skuMatch = products.find((product) =>
    uiProductKeys(product).some((key) => normalizeSku(key) === rowSku),
  );

  if (skuMatch) {
    return skuMatch;
  }

  return (
    products.find((product) =>
      [product.title, product.shortTitle, product.name].some(
        (value) => value && normalizeText(value) === rowName,
      ),
    ) ?? null
  );
}

function findUiSku(row: SourceRow, product: UiProduct) {
  const rowSku = normalizeSku(row.sku);
  const matchingVariant = product.variants?.find((variant) =>
    unique([
      variant.sku,
      variant.displaySku,
      variant.displaySku ? cleanDisplaySku(variant.displaySku) : "",
    ]).some((value) => normalizeSku(value) === rowSku),
  );

  return (
    matchingVariant?.sku ??
    cleanDisplaySku(product.displaySku ?? "") ??
    product.name ??
    row.sku
  );
}

function sourceBrand(row: SourceRow) {
  return row.sourceLabel.split("/")[0]?.trim() || row.sourceLabel || "Catalog product";
}

function mapPlacement(row: SourceRow, preferredSubcategory?: string): Placement {
  const sourceSubcategory = preferredSubcategory || row.subcategory;
  let category = row.category;
  let subcategory = sourceSubcategory;

  if (row.source === "unifi") {
    if (row.category === "UniFi Network Core") {
      category = "Networking";
      subcategory = "Cloud Gateways";
    } else if (row.category === "UniFi WiFi") {
      category = "Networking";
      subcategory = "Wireless LAN";
    } else if (row.category === "UniFi Switching") {
      category = "Networking";
      subcategory = "Network Switches";
    } else if (row.category === "UniFi Protect / Surveillance") {
      category = "Surveillance";
      if (/dome|turret|bullet|compact|ptz/i.test(row.subcategory)) {
        subcategory = "IP Cameras";
      } else if (/nvr|edge/i.test(row.subcategory)) {
        subcategory = "NVRs and Edge Devices";
      }
    } else if (row.category === "Door Access & Smart Access") {
      category = "Surveillance";
      subcategory = "Door Access & Smart Access";
    } else if (row.category === "Fiber, Cables & Accessories") {
      category = "Networking";
      subcategory = /sfp|fiber/i.test(row.subcategory)
        ? "SFP / DAC / AOC Technology"
        : "Patch Cables";
    } else if (row.category === "Racks & Mounting") {
      category = "Racks & Cabinets";
    } else if (row.category === "Power, PoE & Storage") {
      category = "Power";
      subcategory = /storage/i.test(row.subcategory) ? "Storage" : "PoE Power Accessories";
    }
  }

  if (row.source === "ite") {
    if (["Electrical & Industrial", "Panels & Enclosures", "Installation Materials", "Civil Electrical"].includes(row.category)) {
      category = "Electrical & Industrial";
      subcategory =
        row.category === "Electrical & Industrial"
          ? sourceSubcategory
          : `${row.category} - ${sourceSubcategory}`;
    } else if (row.category === "Energy & Power") {
      category = "Power";
    } else if (row.category === "Solar / Photovoltaic") {
      category = "Solar / Photovoltaic";
    } else if (row.category === "Lighting & Smart Home") {
      category = "Smart Home";
    } else if (row.category === "Intercoms, Security & Low-Voltage Systems") {
      if (/RJ45 plugs/i.test(sourceSubcategory)) {
        category = "Networking";
        subcategory = "Plugs and Connectors";
      } else if (/RJ45 outlets/i.test(sourceSubcategory)) {
        category = "Networking";
        subcategory = "Wall Outlets / Surface Boxes / Face Plates";
      } else if (/Patch cords/i.test(sourceSubcategory)) {
        category = "Networking";
        subcategory = "Patch Cables";
      } else if (/Patch panels/i.test(sourceSubcategory)) {
        category = "Networking";
        subcategory = "Patch Panels";
      } else if (/Rack accessories|19-inch rack/i.test(sourceSubcategory)) {
        category = "Racks & Cabinets";
      } else {
        category = "Surveillance";
      }
    } else if (row.category === "Cables") {
      if (/fiber/i.test(sourceSubcategory)) {
        category = "Fiber Optics";
        subcategory = "Fiber Structured / Installation Cables";
      } else if (/data/i.test(sourceSubcategory)) {
        category = "Networking";
        subcategory = "Structured / Installation Cables";
      } else if (/audio/i.test(sourceSubcategory)) {
        category = "AV & Multimedia";
        subcategory = "Audio Cables";
      } else if (/tv|cctv/i.test(sourceSubcategory)) {
        category = "Surveillance";
        subcategory = "Surveillance Cables";
      } else if (/photovoltaic/i.test(sourceSubcategory)) {
        category = "Solar / Photovoltaic";
        subcategory = "Photovoltaic Cables";
      } else {
        category = "Electrical & Industrial";
        subcategory = `Cables - ${sourceSubcategory}`;
      }
    } else if (row.category === "Tools") {
      category = "Tools & Accessories";
    }
  }

  return {
    category,
    categorySlug: slugify(category),
    subcategory,
    subcategorySlug: slugify(subcategory),
  };
}

function productFromWoo(row: SourceRow, product: WooProduct, preferredSubcategory?: string): CatalogProduct | null {
  const sku = product.sku?.trim();

  if (!sku) {
    return null;
  }

  const brand =
    product.attributes
      ?.find((attribute) => /marka|brand/i.test(attribute.name))
      ?.terms?.[0]?.name?.trim() || sourceBrand(row);
  const categories = product.categories?.map((category) => htmlDecode(category.name)) ?? [];
  const description = stripHtml(product.short_description || product.description) || row.notes || row.name;
  const specifications = unique([
    row.notes && !/^Category:/i.test(row.notes) ? row.notes : "",
    brand ? `Brand: ${brand}` : "",
    ...categories.map((category) => `ITE category: ${category}`),
  ]).slice(0, 10);

  return {
    sku,
    slug: slugify(`${sku}-${product.name || row.name}`),
    documentName: row.name,
    title: product.name || row.name,
    description,
    specifications,
    images: unique(product.images?.map((image) => image.src).filter(Boolean) ?? []).slice(0, 8),
    officialUrl: product.permalink || row.url,
    officialSource: "itegroup.al",
    foundOfficialPage: true,
    placements: [mapPlacement(row, preferredSubcategory)],
    brand,
    sourceLabel: row.sourceLabel,
  };
}

function productFromUi(row: SourceRow, product: UiProduct | null, detailUrl?: string): CatalogProduct {
  const title = product?.title || product?.shortTitle || row.name;
  const sku = product ? findUiSku(row, product) : row.sku;
  const description = stripHtml(product?.shortDescription || product?.description || row.notes) || row.name;
  const features = product?.keyFeatures ? parseListItems(product.keyFeatures) : [];
  const displaySku = product?.displaySku ? cleanDisplaySku(product.displaySku) : "";
  const variantSkus = product?.variants?.map((variant) => variant.sku).filter(Boolean) ?? [];
  const specifications = unique([
    row.notes,
    displaySku && displaySku !== sku ? `Model: ${displaySku}` : "",
    product?.status ? `Store status: ${product.status}` : "",
    ...features,
    ...variantSkus.filter((variantSku): variantSku is string => Boolean(variantSku && variantSku !== sku)).map(
      (variantSku) => `Variant: ${variantSku}`,
    ),
  ]).slice(0, 10);

  return {
    sku,
    slug: slugify(`${sku}-${title}`),
    documentName: row.name,
    title,
    description,
    specifications,
    images: product ? collectUiImageUrls(product) : [],
    officialUrl: detailUrl ?? row.url,
    officialSource: product ? "store.ui.com" : null,
    foundOfficialPage: Boolean(product),
    placements: [mapPlacement(row)],
    brand: "Ubiquiti / UniFi",
    sourceLabel: row.sourceLabel,
  };
}

function ensureCategory(catalog: CatalogFile, placement: Placement) {
  let category = catalog.categories.find((item) => item.slug === placement.categorySlug);

  if (!category) {
    category = {
      name: placement.category,
      slug: placement.categorySlug,
      subcategories: [],
    };
    catalog.categories.push(category);
  }

  let subcategory = category.subcategories.find(
    (item) => item.slug === placement.subcategorySlug,
  );

  if (!subcategory) {
    subcategory = {
      name: placement.subcategory,
      slug: placement.subcategorySlug,
      productSkus: [],
    };
    category.subcategories.push(subcategory);
  }

  return subcategory;
}

function addPlacement(product: CatalogProduct, placement: Placement) {
  const exists = product.placements.some(
    (item) =>
      item.categorySlug === placement.categorySlug &&
      item.subcategorySlug === placement.subcategorySlug,
  );

  if (!exists) {
    product.placements.push(placement);
    stats.addedPlacements += 1;
  }
}

function upsertProduct(catalog: CatalogFile, product: CatalogProduct, productBySku: Map<string, CatalogProduct>, slugSet: Set<string>) {
  const existing = productBySku.get(normalizeSku(product.sku));
  const target = existing ?? product;

  if (existing) {
    stats.mergedProducts += 1;

    if (!existing.foundOfficialPage && product.foundOfficialPage) {
      existing.foundOfficialPage = product.foundOfficialPage;
      existing.officialSource = product.officialSource;
      existing.officialUrl = product.officialUrl;
    }

    existing.images = unique([...existing.images, ...product.images]);
    existing.specifications = unique([...existing.specifications, ...product.specifications]).slice(0, 12);
    existing.brand ??= product.brand;
    existing.sourceLabel ??= product.sourceLabel;
  } else {
    let uniqueSlug = product.slug;
    let suffix = 2;

    while (slugSet.has(uniqueSlug)) {
      uniqueSlug = `${product.slug}-${suffix}`;
      suffix += 1;
    }

    product.slug = uniqueSlug;
    slugSet.add(product.slug);
    catalog.products.push(product);
    productBySku.set(normalizeSku(product.sku), product);
    stats.addedProducts += 1;
  }

  for (const placement of product.placements) {
    addPlacement(target, placement);
    const subcategory = ensureCategory(catalog, placement);

    if (!subcategory.productSkus.includes(target.sku)) {
      subcategory.productSkus.push(target.sku);
    }
  }
}

function mergeUnifiFallbackProducts(
  catalog: CatalogFile,
  productBySku: Map<string, CatalogProduct>,
  slugSet: Set<string>,
) {
  const officialByDocumentName = new Map<string, CatalogProduct>();

  for (const product of catalog.products) {
    if (
      product.sourceLabel !== "Ubiquiti / UniFi" ||
      !product.foundOfficialPage ||
      product.officialSource !== "store.ui.com"
    ) {
      continue;
    }

    const key = normalizeText(product.documentName || product.title);
    const current = officialByDocumentName.get(key);

    if (!current || product.images.length > current.images.length) {
      officialByDocumentName.set(key, product);
    }
  }

  const skuReplacement = new Map<string, string>();
  const fallbackSkus = new Set<string>();

  for (const fallback of catalog.products) {
    if (
      fallback.sourceLabel !== "Ubiquiti / UniFi" ||
      fallback.foundOfficialPage ||
      fallback.officialSource
    ) {
      continue;
    }

    const official = officialByDocumentName.get(normalizeText(fallback.documentName || fallback.title));

    if (!official) {
      continue;
    }

    for (const placement of fallback.placements) {
      addPlacement(official, placement);
    }

    const modelSpec = `Model: ${fallback.sku}`;
    const hasModelSpec = official.specifications.some((specification) =>
      normalizeText(specification).includes(normalizeText(fallback.sku)),
    );

    if (!hasModelSpec) {
      official.specifications = unique([modelSpec, ...official.specifications]).slice(0, 12);
    }

    skuReplacement.set(fallback.sku, official.sku);
    fallbackSkus.add(fallback.sku);
    productBySku.delete(normalizeSku(fallback.sku));
    slugSet.delete(fallback.slug);
  }

  if (fallbackSkus.size === 0) {
    return;
  }

  catalog.products = catalog.products.filter((product) => !fallbackSkus.has(product.sku));

  for (const category of catalog.categories) {
    for (const subcategory of category.subcategories) {
      subcategory.productSkus = unique(
        subcategory.productSkus
          .map((sku) => skuReplacement.get(sku) ?? sku)
          .filter((sku) => !fallbackSkus.has(sku)),
      );
    }
  }

  stats.dedupedProducts += fallbackSkus.size;
}

async function loadWooCategories() {
  const categories: WooCategory[] = [];

  for (let page = 1; ; page += 1) {
    const url = `https://itegroup.al/wp-json/wc/store/v1/products/categories?per_page=100&page=${page}`;
    const pageCategories = await fetchJson<WooCategory[]>(url);

    if (pageCategories.length === 0) {
      break;
    }

    categories.push(...pageCategories);
  }

  return categories;
}

function parseCategoryTerms(value: string, categoryByName: Map<string, WooCategory>) {
  const text = value.replace(/^Categor(?:y|ies):\s*/i, "").trim();
  const fullMatch = categoryByName.get(normalizeText(text));

  if (fullMatch) {
    return [text];
  }

  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);

  if (/SHIRIT LED/i.test(parts[0] ?? "")) {
    return parts.map((part, index) => (index === 0 ? part : `SHIRIT LED ${part}`));
  }

  return parts;
}

async function fetchWooProductsByCategory(categoryId: number) {
  const products: WooProduct[] = [];

  for (let page = 1; ; page += 1) {
    const url = `https://itegroup.al/wp-json/wc/store/v1/products?category=${categoryId}&per_page=100&page=${page}`;
    const pageProducts = await fetchJson<WooProduct[]>(url);

    if (pageProducts.length === 0) {
      break;
    }

    products.push(...pageProducts);
  }

  return products;
}

async function searchWooProduct(row: SourceRow) {
  const exactSku = !/SKU not opened|Product slug visible|Product page visible/i.test(row.sku);
  const query = exactSku ? row.sku : row.name;
  const url = `https://itegroup.al/wp-json/wc/store/v1/products?search=${encodeURIComponent(query)}&per_page=20`;
  const products = await fetchJson<WooProduct[]>(url);
  const rowSku = normalizeSku(row.sku);
  const rowName = normalizeText(row.name);

  return (
    products.find((product) => exactSku && normalizeSku(product.sku) === rowSku) ??
    products.find((product) => normalizeText(product.name) === rowName) ??
    products.find((product) => normalizeText(product.name).includes(rowName)) ??
    null
  );
}

async function importIteRows(catalog: CatalogFile, rows: SourceRow[], productBySku: Map<string, CatalogProduct>, slugSet: Set<string>) {
  const categories = await loadWooCategories();
  const categoryByName = new Map(categories.map((category) => [normalizeText(category.name), category]));
  const categoryBySlug = new Map(categories.map((category) => [normalizeText(category.slug), category]));
  const categoryProductCache = new Map<number, WooProduct[]>();

  for (const row of rows) {
    if (isIteCategorySource(row)) {
      const terms = parseCategoryTerms(row.sku, categoryByName);
      const matchedCategories = terms
        .map((term) => categoryByName.get(normalizeText(term)) ?? categoryBySlug.get(normalizeText(term)))
        .filter((category): category is WooCategory => Boolean(category));

      if (matchedCategories.length === 0) {
        stats.skippedRows.push({
          source: row.source,
          name: row.name,
          sku: row.sku,
          reason: "ITE category source did not match a public WooCommerce category.",
        });
        continue;
      }

      for (const category of matchedCategories) {
        if (category.parent === 0 && row.name !== category.name) {
          stats.skippedRows.push({
            source: row.source,
            name: row.name,
            sku: row.sku,
            reason: `Skipped broad parent ITE category ${category.name}.`,
          });
          continue;
        }

        if (!categoryProductCache.has(category.id)) {
          categoryProductCache.set(category.id, await fetchWooProductsByCategory(category.id));
        }

        const products = categoryProductCache.get(category.id) ?? [];
        stats.categoryImports.push({
          sourceName: row.name,
          matchedCategory: htmlDecode(category.name),
          products: products.length,
        });

        for (const product of products) {
          const catalogProduct = productFromWoo(row, product, row.name);

          if (catalogProduct) {
            upsertProduct(catalog, catalogProduct, productBySku, slugSet);
          }
        }
      }

      continue;
    }

    const product = await searchWooProduct(row);

    if (!product) {
      stats.missingOfficialData.push({
        source: row.source,
        name: row.name,
        sku: row.sku,
        url: row.url,
      });
      continue;
    }

    const catalogProduct = productFromWoo(row, product);

    if (catalogProduct) {
      upsertProduct(catalog, catalogProduct, productBySku, slugSet);
    }
  }
}

async function loadUiCategoryProducts(url: string) {
  const html = await fetchText(url);
  const data = readNextData(html);
  const pageProps = getObjectPath<unknown>(data, ["props", "pageProps"]);
  return [...collectUiProducts(pageProps).values()];
}

async function loadUiProductDetail(categoryUrl: string, product: UiProduct) {
  const detailUrl = `${categoryUrl.replace(/\/$/, "")}/products/${product.slug}`;

  try {
    const html = await fetchText(detailUrl);
    const data = readNextData(html);
    const currentProductId = getObjectPath<string>(data, [
      "props",
      "pageProps",
      "currentProductId",
    ]);
    const collection = getObjectPath<unknown>(data, ["props", "pageProps", "collection"]);
    const products = [...collectUiProducts(collection).values()];
    const detailProduct = products.find((item) => item.id === currentProductId) ?? products[0] ?? product;

    return { product: detailProduct, url: detailUrl };
  } catch {
    return { product, url: detailUrl };
  }
}

async function mapLimit<T, U>(items: T[], limit: number, callback: (item: T, index: number) => Promise<U>) {
  const results: U[] = [];
  let index = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      for (;;) {
        const currentIndex = index;
        index += 1;

        if (currentIndex >= items.length) {
          break;
        }

        results[currentIndex] = await callback(items[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}

async function importUnifiRows(catalog: CatalogFile, rows: SourceRow[], productBySku: Map<string, CatalogProduct>, slugSet: Set<string>) {
  const uniqueUrls = unique(rows.map((row) => row.url));
  const productsByUrl = new Map<string, UiProduct[]>();

  for (const url of uniqueUrls) {
    productsByUrl.set(url, await loadUiCategoryProducts(url));
  }

  await mapLimit(rows, 6, async (row, index) => {
    process.stdout.write(`\rImporting UniFi rows ${index + 1}/${rows.length}`);

    if (isCollectionPlaceholder(row)) {
      stats.skippedRows.push({
        source: row.source,
        name: row.name,
        sku: row.sku,
        reason: "Skipped UniFi product collection placeholder; no single SKU/model.",
      });
      return;
    }

    const categoryProducts = productsByUrl.get(row.url) ?? [];
    const product = findUiProduct(row, categoryProducts);

    if (!product) {
      const fallbackProduct = productFromUi(row, null);
      stats.missingOfficialData.push({
        source: row.source,
        name: row.name,
        sku: row.sku,
        url: row.url,
      });
      upsertProduct(catalog, fallbackProduct, productBySku, slugSet);
      return;
    }

    const detail = await loadUiProductDetail(row.url, product);
    const catalogProduct = productFromUi(row, detail.product, detail.url);
    upsertProduct(catalog, catalogProduct, productBySku, slugSet);
  });

  process.stdout.write("\n");
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as CatalogFile;
  const rowsBySource = new Map<SourceKind, SourceRow[]>();

  for (const document of documents) {
    const rows = await extractRows(document.path, document.source);
    rowsBySource.set(document.source, rows);
    stats.rows += rows.length;
  }

  const productBySku = new Map(catalog.products.map((product) => [normalizeSku(product.sku), product]));
  const slugSet = new Set(catalog.products.map((product) => product.slug));

  await importIteRows(catalog, rowsBySource.get("ite") ?? [], productBySku, slugSet);
  await importUnifiRows(catalog, rowsBySource.get("unifi") ?? [], productBySku, slugSet);
  mergeUnifiFallbackProducts(catalog, productBySku, slugSet);

  const importedAt = new Date().toISOString();
  catalog.source = {
    ...catalog.source,
    expandedAt: importedAt,
  };
  catalog.sourceDocuments = [
    ...(catalog.sourceDocuments ?? []).filter(
      (entry) => !documents.some((document) => document.path === entry.path),
    ),
    ...documents.map((document) => ({
      path: document.path,
      kind: document.source,
      importedAt,
      rows: rowsBySource.get(document.source)?.length ?? 0,
    })),
  ];

  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await writeFile(reportPath, `${JSON.stringify({ generatedAt: importedAt, ...stats }, null, 2)}\n`, "utf8");

  console.log(`Added products: ${stats.addedProducts}`);
  console.log(`Merged products: ${stats.mergedProducts}`);
  console.log(`Deduped products: ${stats.dedupedProducts}`);
  console.log(`Skipped rows: ${stats.skippedRows.length}`);
  console.log(`Missing official data: ${stats.missingOfficialData.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
