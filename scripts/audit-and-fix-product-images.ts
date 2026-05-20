import { existsSync, readFileSync, statSync } from "node:fs";
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
  low_quality_image?: true;
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

type AuditRow = {
  productName: string;
  skuModel: string;
  category: string;
  subcategory: string;
  sourceBrand: string;
  currentImagePath: string;
  problemFound: string;
  officialProductPageUrl: string;
  newImageUrlFound: string;
  localSavedImagePath: string;
  status: string;
};

type ScrapedProduct = {
  found: boolean;
  title: string;
  description: string;
  specifications: string[];
  imageUrls: string[];
  officialUrl: string | null;
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

const workspaceRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(workspaceRoot, "src", "data", "assmann-catalog.json");
const auditJsonPath = path.join(workspaceRoot, "missing-product-images.audit.json");
const outputImagesDir = path.join(workspaceRoot, "public", "images", "assmann-products");
const publicDir = path.join(workspaceRoot, "public");
const placeholderPath = "/images/product-placeholder.svg";
const searchBaseUrl = "https://products.digitus.com/index.php?lang=1&cl=search&searchparam=";

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

function getAttribute(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ? htmlDecode(html.match(pattern)?.[1] ?? "") : "";
}

function firstPlacement(product: CatalogProduct) {
  return product.placements[0] ?? {
    category: "",
    categorySlug: "",
    subcategory: "",
    subcategorySlug: "",
  };
}

function sourceName(product: CatalogProduct) {
  return product.sourceLabel || product.brand || product.officialSource || "Catalog product";
}

function imageExtension(url: string) {
  const cleanUrl = url.split("?")[0] ?? url;
  const extension = path.extname(cleanUrl).toLowerCase();
  return extension && extension.length <= 6 ? extension : ".jpg";
}

function localImagePath(src: string) {
  if (!src.startsWith("/")) {
    return null;
  }

  return path.join(publicDir, src);
}

function isLfsPointer(filePath: string) {
  if (statSync(filePath).size > 512) {
    return false;
  }

  return readFileSync(filePath, "utf8").startsWith(
    "version https://git-lfs.github.com/spec/",
  );
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

function scoreImageUrl(url: string) {
  const sizeMatch = url.match(/\/(\d+)_(\d+)_\d+\//);
  const generatedSize = sizeMatch
    ? Number.parseInt(sizeMatch[1] ?? "0", 10) *
      Number.parseInt(sizeMatch[2] ?? "0", 10)
    : 0;

  return (url.includes("/out/pictures/master/product/") ? 1_000_000_000 : 0) + generatedSize;
}

function exactDigitusSkuInHtml(html: string, sku: string) {
  const skuValues = [
    ...html.matchAll(/property="gr:hasStockKeepingUnit"\s+content="([^"]+)"/g),
  ].map((match) => htmlDecode(match[1] ?? ""));
  const normalizedSku = sku.trim().toLocaleLowerCase();

  return (
    skuValues.some((value) => value.trim().toLocaleLowerCase() === normalizedSku) ||
    new RegExp(`Product (?:number|No\\.)\\s*:?\\s*${sku.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(html)
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

function parseDigitusProduct(html: string, sku: string): ScrapedProduct {
  if (!exactDigitusSkuInHtml(html, sku)) {
    return {
      found: false,
      title: "",
      description: "",
      specifications: [],
      imageUrls: [],
      officialUrl: null,
    };
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
    getAttribute(html, /<meta\s+property="og:url"\s+content="([^"]+)"/) ||
    null;
  const techSection =
    html.match(/<div id=techdetails\b[\s\S]*?(?=<div id=techattrs|<div id="dlfiles"|<div id=logistics)/)?.[0] ??
    "";
  const leadSection =
    html.match(/<div id="details_container"[\s\S]*?(?=<div id=techdetails)/)?.[0] ?? "";
  const specifications = unique([...parseListItems(leadSection), ...parseListItems(techSection)]).slice(
    0,
    10,
  );
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

  const imageUrls = unique(
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

  return {
    found: true,
    title: title.trim() || "",
    description: description.trim() || "",
    specifications,
    imageUrls,
    officialUrl,
  };
}

async function fetchWithRetry(url: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
          accept: "text/html,application/xhtml+xml,application/json,image/*,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
    }
  }

  throw lastError;
}

async function checkRemoteImage(src: string) {
  try {
    let response = await fetch(src, {
      method: "HEAD",
      signal: AbortSignal.timeout(12000),
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "image/*,*/*",
      },
    });

    if (!response.ok || response.status === 405) {
      response = await fetch(src, {
        method: "GET",
        signal: AbortSignal.timeout(15000),
        headers: {
          "user-agent": "Mozilla/5.0",
          accept: "image/*,*/*",
          range: "bytes=0-2047",
        },
      });
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || (!contentType.startsWith("image/") && response.status !== 206)) {
      return `remote image returned HTTP ${response.status}`;
    }

    return null;
  } catch (error) {
    return `remote image failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function checkImage(src: string) {
  if (src === placeholderPath) {
    return null;
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return checkRemoteImage(src);
  }

  if (!src.startsWith("/")) {
    return "local image path must start with /";
  }

  const filePath = localImagePath(src);

  if (!filePath?.startsWith(publicDir)) {
    return "local image path is outside /public";
  }

  if (!existsSync(filePath)) {
    return "local image file is missing from /public";
  }

  if (isLfsPointer(filePath)) {
    return "local image is a Git LFS pointer, not image bytes";
  }

  return null;
}

async function downloadImages(sku: string, imageUrls: string[]) {
  const skuDir = slugify(sku);
  const targetDir = path.join(outputImagesDir, skuDir);
  await mkdir(targetDir, { recursive: true });

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

      const publicPath = `/images/assmann-products/${skuDir}/${String(images.length + 1).padStart(2, "0")}${imageExtension(url)}`;
      const absolutePath = path.join(publicDir, publicPath);
      await writeFile(absolutePath, bytes);
      images.push(publicPath);
      metadata.push({
        src: publicPath,
        width: dimensions.width,
        height: dimensions.height,
        bytes: bytes.length,
      });
    } catch {
      // Official pages sometimes advertise stale image URLs. Keep trying candidates.
    }
  }

  return { images, metadata };
}

async function searchDigitusBySku(sku: string) {
  const response = await fetchWithRetry(`${searchBaseUrl}${encodeURIComponent(sku)}`);
  return parseDigitusProduct(await response.text(), sku);
}

async function searchIteBySku(sku: string) {
  const url = `https://itegroup.al/wp-json/wc/store/v1/products?search=${encodeURIComponent(sku)}&per_page=20`;
  const response = await fetchWithRetry(url);
  const products = (await response.json()) as WooProduct[];
  const normalizedSku = sku.trim().toLocaleLowerCase();
  const product =
    products.find((item) => item.sku?.trim().toLocaleLowerCase() === normalizedSku) ??
    products.find((item) => item.sku?.trim().toLocaleLowerCase().startsWith(normalizedSku));

  if (!product) {
    return null;
  }

  const brand =
    product.attributes
      ?.find((attribute) => /marka|brand/i.test(attribute.name))
      ?.terms?.[0]?.name?.trim() ?? "";
  const categories = product.categories?.map((category) => htmlDecode(category.name)) ?? [];
  const description = stripTags(product.short_description || product.description || "");
  const specifications = unique([
    brand ? `Brand: ${brand}` : "",
    ...categories.map((category) => `ITE category: ${category}`),
  ]).slice(0, 10);

  return {
    title: product.name,
    description,
    specifications,
    imageUrls: unique(product.images?.map((image) => image.src) ?? []).slice(0, 8),
    officialUrl: product.permalink,
    brand,
  };
}

async function tryFixProduct(product: CatalogProduct) {
  if (product.officialSource === "itegroup.al" || product.sourceLabel === "ITE") {
    const official = await searchIteBySku(product.sku);

    if (official?.imageUrls.length) {
      const downloaded = await downloadImages(product.sku, official.imageUrls);

      if (downloaded.images.length) {
        product.title = official.title || product.title;
        product.description = official.description || product.description;
        product.specifications = unique([...product.specifications, ...official.specifications]).slice(0, 12);
        product.officialUrl = official.officialUrl || product.officialUrl;
        product.officialSource = "itegroup.al";
        product.foundOfficialPage = true;
        product.brand ??= official.brand || undefined;
        product.images = downloaded.images;
        product.imageMetadata = downloaded.metadata;

        return {
          status: "Fixed from official ITE product data",
          newImageUrlFound: official.imageUrls.join("\n"),
          localSavedImagePath: downloaded.images.join("\n"),
        };
      }
    }
  }

  try {
    const official = await searchDigitusBySku(product.sku);

    if (official.found && official.imageUrls.length) {
      const downloaded = await downloadImages(product.sku, official.imageUrls);

      if (downloaded.images.length) {
        product.title = official.title || product.title;
        product.description = official.description || product.description;
        product.specifications = official.specifications.length
          ? official.specifications
          : product.specifications;
        product.officialUrl = official.officialUrl || product.officialUrl;
        product.officialSource = "products.digitus.com";
        product.foundOfficialPage = true;
        product.images = downloaded.images;
        product.imageMetadata = downloaded.metadata;

        return {
          status: "Fixed from official DIGITUS product page",
          newImageUrlFound: official.imageUrls.join("\n"),
          localSavedImagePath: downloaded.images.join("\n"),
        };
      }
    }

    if (official.found) {
      product.officialUrl = official.officialUrl || product.officialUrl;
      product.officialSource = "products.digitus.com";
      product.foundOfficialPage = true;
    }
  } catch {
    // Keep catalog products, and fall back below.
  }

  product.images = [placeholderPath];
  delete product.imageMetadata;

  return {
    status: "Official image not found; clean placeholder assigned",
    newImageUrlFound: "",
    localSavedImagePath: placeholderPath,
  };
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as CatalogFile;
  const rows: AuditRow[] = [];
  let fixed = 0;
  let placeholders = 0;
  let audited = 0;

  for (const [index, product] of catalog.products.entries()) {
    const problems: string[] = [];
    const images = product.images ?? [];
    const invalidImages: { src: string; reason: string }[] = [];

    if (images.length === 0) {
      problems.push("Image array is empty; main product image is missing");
    }

    for (const src of images) {
      const reason = await checkImage(src);

      if (reason) {
        invalidImages.push({ src, reason });
        problems.push(`${src}: ${reason}`);
      }
    }

    if (images[0] && invalidImages.some((item) => item.src === images[0])) {
      problems.push("Main image is broken");
    }

    const placeholderLike = images.some((src) => /placeholder/i.test(src));
    const lowQualityImages =
      product.imageMetadata
        ?.filter((item) => item.low_quality_image)
        .map((item) => item.src) ?? [];

    if (placeholderLike) {
      problems.push("Placeholder image is being used");
    }

    if (lowQualityImages.length) {
      problems.push(`Low-resolution / placeholder-size image flagged: ${lowQualityImages.join(", ")}`);
    }

    const requiresFix = images.length === 0 || invalidImages.length > 0 || placeholderLike;

    if (!problems.length) {
      continue;
    }

    audited += 1;
    process.stdout.write(`\rAuditing ${index + 1}/${catalog.products.length}: ${product.sku.padEnd(28)}`);

    const previousImages = images.join("\n");
    let fixResult = {
      status: lowQualityImages.length
        ? "Audited; existing official image kept because it is reachable"
        : "Audited",
      newImageUrlFound: "",
      localSavedImagePath: "",
    };

    if (requiresFix) {
      fixResult = await tryFixProduct(product);
      fixed += product.images[0] === placeholderPath ? 0 : 1;
      placeholders += product.images[0] === placeholderPath ? 1 : 0;
    }

    const placement = firstPlacement(product);

    rows.push({
      productName: product.title || product.documentName,
      skuModel: product.sku,
      category: placement.category,
      subcategory: placement.subcategory,
      sourceBrand: sourceName(product),
      currentImagePath: previousImages,
      problemFound: unique(problems).join("\n"),
      officialProductPageUrl: product.officialUrl || "",
      newImageUrlFound: fixResult.newImageUrlFound,
      localSavedImagePath: fixResult.localSavedImagePath,
      status: fixResult.status,
    });
  }

  process.stdout.write("\n");

  const tempCatalogPath = `${catalogPath}.tmp`;
  await writeFile(tempCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await rename(tempCatalogPath, catalogPath);
  await writeFile(
    auditJsonPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        audited,
        fixed,
        placeholders,
        rows,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        auditedRows: rows.length,
        fixedWithOfficialImages: fixed,
        fallbackPlaceholders: placeholders,
        auditJsonPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
