import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

type Placement = {
  category: string;
  categorySlug: string;
  subcategory: string;
  subcategorySlug: string;
};

type ProductImageMetadata = {
  src: string;
  width: number;
  height: number;
  bytes: number;
};

type CatalogProduct = {
  sku: string;
  slug: string;
  documentName: string;
  title: string;
  description: string;
  specifications: string[];
  images: string[];
  imageMetadata?: ProductImageMetadata[];
  officialUrl: string | null;
  officialSource:
    | "products.digitus.com"
    | "store.ui.com"
    | "itegroup.al"
    | "assmann.com"
    | null;
  foundOfficialPage: boolean;
  placements: Placement[];
  brand?: string;
  sourceLabel?: string;
  tags?: string[];
};

type CatalogFile = {
  products: CatalogProduct[];
};

type OfficialResult = {
  source: "products.digitus.com" | "itegroup.al" | "store.ui.com" | "assmann.com";
  officialUrl: string;
  title: string;
  description: string;
  specifications: string[];
  imageUrls: string[];
  brand?: string;
};

type ImageDimensions = {
  width: number;
  height: number;
};

type WooProduct = {
  name: string;
  permalink: string;
  sku: string;
  short_description?: string;
  description?: string;
  images?: { src?: string }[];
  attributes?: {
    name: string;
    terms?: { name: string }[];
  }[];
  categories?: { name: string }[];
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
  thumbnail?: UiAsset;
  gallery?: UiGallery | null;
  techSpecsMedia?: UiGallery | null;
  variants?: {
    sku?: string;
    displaySku?: string;
  }[];
  __typename?: string;
};

const workspaceRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(workspaceRoot, "src", "data", "assmann-catalog.json");
const outputImagesDir = path.join(workspaceRoot, "public", "images", "products");
const reportPath = path.join(workspaceRoot, "missing-product-images-retry-report.json");
const placeholderPath = "/images/product-placeholder.svg";
const digitusSearchBaseUrl =
  "https://products.digitus.com/index.php?lang=1&cl=search&searchparam=";

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
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function stripTags(value: string) {
  return htmlDecode(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function unique<T>(values: (T | null | undefined | false | "")[]) {
  return [...new Set(values.filter((value): value is T => Boolean(value)))];
}

function normalizeText(value: string) {
  return htmlDecode(value)
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAttribute(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ? htmlDecode(html.match(pattern)?.[1] ?? "") : "";
}

async function fetchWithRetry(url: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
          accept: "text/html,application/xhtml+xml,application/json,image/avif,image/webp,image/*,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(18000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 450 * attempt));
    }
  }

  throw lastError;
}

function readJpegDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    if (
      marker &&
      ((marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf))
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

function readPngDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readWebpDimensions(buffer: Buffer): ImageDimensions | null {
  if (
    buffer.subarray(0, 4).toString("ascii") !== "RIFF" ||
    buffer.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    return null;
  }

  const type = buffer.subarray(12, 16).toString("ascii");

  if (type === "VP8X") {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }

  if (type === "VP8 " && buffer.length > 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (type === "VP8L" && buffer.length > 25) {
    const bits = buffer.readUInt32LE(21);

    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return null;
}

function readImageDimensions(buffer: Buffer): ImageDimensions | null {
  return readPngDimensions(buffer) ?? readJpegDimensions(buffer) ?? readWebpDimensions(buffer);
}

function imageExtension(url: string) {
  const cleanUrl = url.split("?")[0] ?? url;
  const extension = path.extname(cleanUrl).toLowerCase();
  return extension && extension.length <= 6 ? extension : ".jpg";
}

function scoreImageUrl(url: string) {
  const sizeMatch = url.match(/\/(\d+)_(\d+)_\d+\//);
  const generatedSize = sizeMatch
    ? Number.parseInt(sizeMatch[1] ?? "0", 10) *
      Number.parseInt(sizeMatch[2] ?? "0", 10)
    : 0;

  return (url.includes("/out/pictures/master/product/") ? 1_000_000_000 : 0) + generatedSize;
}

function exactDigitusSkuInHtml(html: string, sku: string) {
  const escapedSku = escapeRegExp(sku);
  const skuValues = [
    ...html.matchAll(/property="gr:hasStockKeepingUnit"\s+content="([^"]+)"/g),
    ...html.matchAll(/(?:Product number|Item No\.|Référence d'article|Artikelnr\.)\s*:\s*<\/?[^>]*>\s*([^<\s][^<]*)/gi),
  ].map((match) => stripTags(match[1] ?? ""));

  return (
    skuValues.some((value) => value.trim().toLocaleLowerCase() === sku.toLocaleLowerCase()) ||
    new RegExp(`(?:Product number|Item No\\.|Référence d'article|Artikelnr\\.)\\s*:?\\s*${escapedSku}`, "i").test(
      stripTags(html),
    )
  );
}

function parseListItems(sectionHtml: string) {
  return unique(
    [...sectionHtml.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)]
      .map((match) => stripTags(match[1] ?? ""))
      .filter((value) => value.length > 2)
      .filter((value) => !/^Datasheet|^Manual|^Certificate/i.test(value)),
  ).slice(0, 12);
}

function getDigitusProductLinks(html: string) {
  return unique(
    [...html.matchAll(/href="([^"]+\.html(?:\?[^"]*)?)"/gi)]
      .map((match) => htmlDecode(match[1] ?? ""))
      .filter((url) => /products\.digitus\.com\//.test(url) || url.startsWith("/"))
      .map((url) =>
        url.startsWith("/")
          ? `https://products.digitus.com${url}`
          : url.replace(/&amp;/g, "&"),
      )
      .filter((url) => !/\/(?:index|account|basket|compare)\.html/i.test(url)),
  ).slice(0, 8);
}

function getDigitusImageUrls(html: string) {
  const rawImageUrls = [
    ...[
      ...html.matchAll(
        /\s(?:href|src|data-src|data-zoom-image)="([^"]+\/out\/pictures\/(?:master|generated)\/product\/[^"]+\.(?:jpe?g|png|webp)(?:\?[^"]*)?)"/gi,
      ),
    ].map((match) => htmlDecode(match[1] ?? "")),
    getAttribute(html, /<meta\s+property="og:image"\s+content="([^"]+)"/),
  ]
    .filter(Boolean)
    .filter((url) => /\/product\//.test(url))
    .filter((url) => !/\/95_95_\d+\//.test(url))
    .filter((url) => !/\/(?:thumb|thumbnail)[^/]*\.(?:jpe?g|png|webp)/i.test(url));

  return unique(
    rawImageUrls.flatMap((url) => {
      const masterUrl = url.replace(
        /\/out\/pictures\/generated\/product\/(\d+)\/\d+_\d+_\d+\//,
        "/out/pictures/master/product/$1/",
      );

      return masterUrl === url ? [url] : [masterUrl, url];
    }),
  )
    .sort((left, right) => scoreImageUrl(right) - scoreImageUrl(left))
    .slice(0, 12);
}

function parseDigitusPage(html: string, sku: string): OfficialResult | null {
  if (!exactDigitusSkuInHtml(html, sku)) {
    return null;
  }

  const title =
    getAttribute(html, /<div\s+property="gr:name"\s+content="([^"]+)"/) ||
    getAttribute(
      html,
      /<meta\s+property="og:title"\s+content="(?:DIGITUS by ASSMANN Shop \| )?([^"]+)"/,
    );
  const description =
    getAttribute(html, /<div\s+property="gr:description"\s+content="([^"]+)"/) ||
    getAttribute(html, /<meta\s+name="description"\s+content="([^"]+)"/);
  const officialUrl =
    getAttribute(html, /<link\s+rel="canonical"\s+href="([^"]+)"/) ||
    getAttribute(html, /<meta\s+property="og:url"\s+content="([^"]+)"/);
  const techSection =
    html.match(/<div id=techdetails\b[\s\S]*?(?=<div id=techattrs|<div id="dlfiles"|<div id=logistics)/)?.[0] ??
    "";
  const leadSection =
    html.match(/<div id="details_container"[\s\S]*?(?=<div id=techdetails)/)?.[0] ?? "";
  const imageUrls = getDigitusImageUrls(html);

  if (
    !imageUrls.length ||
    !officialUrl ||
    /^https:\/\/products\.digitus\.com\/?$/i.test(officialUrl) ||
    /\bHits for\b/i.test(title)
  ) {
    return null;
  }

  return {
    source: "products.digitus.com",
    officialUrl,
    title: title.trim(),
    description: description.trim(),
    specifications: unique([...parseListItems(leadSection), ...parseListItems(techSection)]).slice(0, 10),
    imageUrls,
  };
}

async function searchDigitus(product: CatalogProduct) {
  const queries = unique([product.sku, product.title, product.documentName]);

  for (const query of queries) {
    const response = await fetchWithRetry(`${digitusSearchBaseUrl}${encodeURIComponent(query)}`);
    const html = await response.text();
    const direct = parseDigitusPage(html, product.sku);

    if (direct) {
      return direct;
    }

    for (const link of getDigitusProductLinks(html)) {
      try {
        const detailResponse = await fetchWithRetry(link);
        const detail = parseDigitusPage(await detailResponse.text(), product.sku);

        if (detail) {
          return detail;
        }
      } catch {
        // Try the next official search result.
      }
    }
  }

  return null;
}

async function searchIte(product: CatalogProduct) {
  const queries = unique([product.sku, product.title, product.documentName]);

  for (const query of queries) {
    const url = `https://itegroup.al/wp-json/wc/store/v1/products?search=${encodeURIComponent(query)}&per_page=20`;
    const response = await fetchWithRetry(url);
    const products = (await response.json()) as WooProduct[];
    const normalizedSku = product.sku.trim().toLocaleLowerCase();
    const normalizedName = normalizeText(product.title || product.documentName);
    const match =
      products.find((item) => item.sku?.trim().toLocaleLowerCase() === normalizedSku) ??
      products.find((item) => normalizeText(item.name) === normalizedName);

    if (!match?.images?.length) {
      continue;
    }

    const imageUrls = unique(match.images.map((image) => image.src)).slice(0, 8);

    if (!imageUrls.length) {
      continue;
    }

    const brand =
      match.attributes
        ?.find((attribute) => /marka|brand/i.test(attribute.name))
        ?.terms?.[0]?.name?.trim() ?? "";
    const categories = match.categories?.map((category) => htmlDecode(category.name)) ?? [];

    return {
      source: "itegroup.al" as const,
      officialUrl: match.permalink,
      title: match.name,
      description: stripTags(match.short_description || match.description || ""),
      specifications: unique([
        brand ? `Brand: ${brand}` : "",
        ...categories.map((category) => `ITE category: ${category}`),
      ]).slice(0, 10),
      imageUrls,
      brand,
    };
  }

  return null;
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
      urls.push(imageUrlFromAsset(item.data) ?? "");

      for (const childAsset of item.data?.childAssets ?? []) {
        urls.push(imageUrlFromAsset(childAsset) ?? "");
      }
    }
  }

  urls.unshift(imageUrlFromAsset(product.thumbnail) ?? "");

  return unique(urls).slice(0, 8);
}

function uiProductMatches(product: UiProduct, target: CatalogProduct) {
  const keys = unique([
    product.name,
    product.displaySku,
    product.displaySku?.replace(/\s*\([^)]*\)\s*/g, "").trim(),
    product.title,
    product.shortTitle,
    ...(product.variants ?? []).flatMap((variant) => [
      variant.sku,
      variant.displaySku,
      variant.displaySku?.replace(/\s*\([^)]*\)\s*/g, "").trim(),
    ]),
  ]);
  const sku = target.sku.trim().toLocaleLowerCase();
  const name = normalizeText(target.title || target.documentName);

  return (
    keys.some((key) => key.trim().toLocaleLowerCase() === sku) ||
    keys.some((key) => normalizeText(key) === name)
  );
}

async function searchUnifi(product: CatalogProduct) {
  if (!/ubiquiti|unifi/i.test(`${product.brand ?? ""} ${product.sourceLabel ?? ""} ${product.title}`)) {
    return null;
  }

  const urls = [
    "https://store.ui.com/us/en/category/all-unifi-cloud-gateways",
    "https://store.ui.com/us/en/category/all-wifi",
    "https://store.ui.com/us/en/category/all-switching",
    "https://store.ui.com/us/en/category/cameras-nvrs",
    "https://store.ui.com/us/en/category/accessories-cables-dacs",
  ];

  for (const url of urls) {
    try {
      const response = await fetchWithRetry(url);
      const products = [...collectUiProducts(readNextData(await response.text())).values()];
      const match = products.find((item) => uiProductMatches(item, product));
      const imageUrls = match ? collectUiImageUrls(match) : [];

      if (match && imageUrls.length) {
        return {
          source: "store.ui.com" as const,
          officialUrl: `${url.replace(/\/$/, "")}/products/${match.slug}`,
          title: match.title || match.shortTitle || match.name || product.title,
          description: stripTags(match.shortDescription || match.description || product.description),
          specifications: [],
          imageUrls,
          brand: "Ubiquiti / UniFi",
        };
      }
    } catch {
      // Try the next official UniFi category.
    }
  }

  return null;
}

async function findOfficialImage(product: CatalogProduct) {
  return (
    (await searchDigitus(product)) ??
    (await searchIte(product)) ??
    (await searchUnifi(product))
  );
}

async function downloadImages(product: CatalogProduct, imageUrls: string[]) {
  const productDir = path.join(outputImagesDir, slugify(product.sku));
  await mkdir(productDir, { recursive: true });

  const images: string[] = [];
  const metadata: ProductImageMetadata[] = [];
  const seenNames = new Set<string>();

  for (const url of imageUrls) {
    const urlFileName = path.basename(url.split("?")[0] ?? url);

    if (seenNames.has(urlFileName)) {
      continue;
    }

    seenNames.add(urlFileName);

    try {
      const response = await fetchWithRetry(url);
      const bytes = Buffer.from(await response.arrayBuffer());
      const dimensions = readImageDimensions(bytes);

      if (!dimensions) {
        continue;
      }

      const localPath = `/images/products/${slugify(product.sku)}/${String(images.length + 1).padStart(2, "0")}${imageExtension(url)}`;
      await writeFile(path.join(workspaceRoot, "public", localPath), bytes);
      images.push(localPath);
      metadata.push({
        src: localPath,
        width: dimensions.width,
        height: dimensions.height,
        bytes: bytes.length,
      });
    } catch {
      // Official pages can list stale generated image variants. Continue to the next one.
    }
  }

  return { images, metadata };
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as CatalogFile;
  const placeholderProducts = catalog.products.filter(
    (product) => product.images.length === 1 && product.images[0] === placeholderPath,
  );
  const fixed: { sku: string; source: string; officialUrl: string; images: string[] }[] = [];
  const stillMissing: { sku: string; name: string }[] = [];

  for (const [index, product] of placeholderProducts.entries()) {
    process.stdout.write(
      `\rRetrying ${index + 1}/${placeholderProducts.length}: ${product.sku.padEnd(28)}`,
    );

    const official = await findOfficialImage(product);

    if (!official) {
      stillMissing.push({ sku: product.sku, name: product.title || product.documentName });
      continue;
    }

    const downloaded = await downloadImages(product, official.imageUrls);

    if (!downloaded.images.length) {
      stillMissing.push({ sku: product.sku, name: product.title || product.documentName });
      continue;
    }

    product.images = downloaded.images;
    product.imageMetadata = downloaded.metadata;

    fixed.push({
      sku: product.sku,
      source: official.source,
      officialUrl: official.officialUrl,
      images: downloaded.images,
    });
  }

  process.stdout.write("\n");

  const tempCatalogPath = `${catalogPath}.tmp`;
  await writeFile(tempCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await rename(tempCatalogPath, catalogPath);

  const remainingPlaceholders = catalog.products
    .filter((product) => product.images.length === 1 && product.images[0] === placeholderPath)
    .map((product) => ({
      sku: product.sku,
      name: product.title || product.documentName,
    }));

  const report = {
    generatedAt: new Date().toISOString(),
    inputPlaceholders: placeholderProducts.length,
    fixedCount: fixed.length,
    remainingCount: remainingPlaceholders.length,
    fixed,
    remainingPlaceholders,
    stillMissing,
  };

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
