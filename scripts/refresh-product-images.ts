import { existsSync } from "node:fs";
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

type ImageDimensions = {
  width: number;
  height: number;
};

const workspaceRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(workspaceRoot, "src", "data", "assmann-catalog.json");
const outputImagesDir = path.join(workspaceRoot, "public", "images", "assmann-products");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const offsetArg = process.argv.find((arg) => arg.startsWith("--offset="));
const skuArg = process.argv.find((arg) => arg.startsWith("--sku="));
const sourceArg = process.argv.find((arg) => arg.startsWith("--source="));
const refreshLimit = limitArg ? Number.parseInt(limitArg.split("=")[1] ?? "", 10) : null;
const refreshOffset = offsetArg ? Number.parseInt(offsetArg.split("=")[1] ?? "", 10) : 0;
const onlySku = skuArg ? skuArg.split("=")[1]?.trim() : null;
const onlySource = sourceArg ? sourceArg.split("=")[1]?.trim() : null;
const lowQualityMaxDimension = 500;
const lowQualityMinDimension = 220;

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
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

async function fetchWithRetry(url: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
          accept: "text/html,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
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

function imageExtension(url: string) {
  const cleanUrl = url.split("?")[0] ?? url;
  const extension = path.extname(cleanUrl).toLowerCase();
  return extension && extension.length <= 6 ? extension : ".jpg";
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
  if (buffer.subarray(0, 4).toString("ascii") !== "RIFF" || buffer.subarray(8, 12).toString("ascii") !== "WEBP") {
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

function isLowQualityImage(metadata: ProductImageMetadata) {
  return (
    Math.max(metadata.width, metadata.height) < lowQualityMaxDimension ||
    Math.min(metadata.width, metadata.height) < lowQualityMinDimension
  );
}

function scoreImageUrl(url: string) {
  const sizeMatch = url.match(/\/(\d+)_(\d+)_\d+\//);
  const generatedSize = sizeMatch
    ? Number.parseInt(sizeMatch[1] ?? "0", 10) * Number.parseInt(sizeMatch[2] ?? "0", 10)
    : 0;

  return (url.includes("/out/pictures/master/product/") ? 1_000_000_000 : 0) + generatedSize;
}

function getDigitusImageCandidates(html: string) {
  const rawUrls = [
    ...html.matchAll(/\s(?:href|src|data-src|data-zoom-image)="([^"]+\.(?:jpe?g|png|webp)(?:\?[^"]*)?)"/gi),
  ]
    .map((match) => htmlDecode(match[1] ?? ""))
    .filter((url) => /\/out\/pictures\/(?:master|generated)\/product\//.test(url))
    .filter((url) => !/\/95_95_\d+\//.test(url));

  const urls = rawUrls.flatMap((url) => {
    const masterUrl = url.replace(
      /\/out\/pictures\/generated\/product\/(\d+)\/\d+_\d+_\d+\//,
      "/out/pictures/master/product/$1/",
    );

    return masterUrl === url ? [url] : [masterUrl, url];
  });

  return unique(urls)
    .filter((url) => !/\/(?:thumb|thumbnail)[^/]*\.(?:jpe?g|png|webp)/i.test(url))
    .sort((left, right) => scoreImageUrl(right) - scoreImageUrl(left));
}

async function downloadProductImages(product: CatalogProduct) {
  if (product.officialSource !== "products.digitus.com" || !product.officialUrl) {
    return null;
  }

  const response = await fetchWithRetry(product.officialUrl);
  const html = await response.text();
  const candidates = getDigitusImageCandidates(html);

  if (candidates.length === 0) {
    return null;
  }

  const skuDir = slugify(product.sku);
  const targetDir = path.join(outputImagesDir, skuDir);
  await mkdir(targetDir, { recursive: true });

  const images: string[] = [];
  const metadata: ProductImageMetadata[] = [];
  const seenNames = new Set<string>();

  for (const url of candidates) {
    const urlFileName = path.basename(url.split("?")[0] ?? url);

    if (seenNames.has(urlFileName)) {
      continue;
    }

    seenNames.add(urlFileName);

    try {
      const imageResponse = await fetchWithRetry(url);
      const bytes = Buffer.from(await imageResponse.arrayBuffer());
      const dimensions = readImageDimensions(bytes);

      if (!dimensions) {
        continue;
      }

      const publicPath = `/images/assmann-products/${skuDir}/${String(images.length + 1).padStart(2, "0")}${imageExtension(url)}`;
      const absolutePath = path.join(workspaceRoot, "public", publicPath);
      await writeFile(absolutePath, bytes);
      images.push(publicPath);
      metadata.push({
        src: publicPath,
        width: dimensions.width,
        height: dimensions.height,
        bytes: bytes.length,
      });
    } catch {
      // Some generated URLs have no matching master file. Keep trying lower-ranked candidates.
    }
  }

  if (metadata.length === 0) {
    return null;
  }

  const allLowQuality = metadata.every(isLowQualityImage);

  if (allLowQuality) {
    for (const item of metadata) {
      item.low_quality_image = true;
    }
  }

  return { images, metadata };
}

async function metadataForExistingImage(src: string): Promise<ProductImageMetadata | null> {
  if (src.startsWith("https://") || src.startsWith("http://")) {
    const response = await fetchWithRetry(src);
    const bytes = Buffer.from(await response.arrayBuffer());
    const dimensions = readImageDimensions(bytes);

    if (!dimensions) {
      return null;
    }

    const metadata: ProductImageMetadata = {
      src,
      width: dimensions.width,
      height: dimensions.height,
      bytes: bytes.length,
    };

    if (isLowQualityImage(metadata)) {
      metadata.low_quality_image = true;
    }

    return metadata;
  }

  if (!src.startsWith("/images/")) {
    return null;
  }

  const absolutePath = path.join(workspaceRoot, "public", src);

  if (!existsSync(absolutePath)) {
    return null;
  }

  const bytes = await readFile(absolutePath);
  const dimensions = readImageDimensions(bytes);

  if (!dimensions) {
    return null;
  }

  const metadata: ProductImageMetadata = {
    src,
    width: dimensions.width,
    height: dimensions.height,
    bytes: bytes.length,
  };

  if (isLowQualityImage(metadata)) {
    metadata.low_quality_image = true;
  }

  return metadata;
}

async function refreshMetadata(product: CatalogProduct) {
  const metadata = (
    await Promise.all(
      product.images.map(async (image) => {
        try {
          return await metadataForExistingImage(image);
        } catch {
          return null;
        }
      }),
    )
  ).filter((item): item is ProductImageMetadata => Boolean(item));

  if (metadata.length === product.images.length && metadata.length > 0) {
    product.imageMetadata = metadata;
  }
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as CatalogFile;
  const products = catalog.products
    .filter((product) => (onlySku ? product.sku === onlySku : true))
    .filter((product) => (onlySource ? product.officialSource === onlySource : true))
    .slice(refreshOffset, refreshLimit ? refreshOffset + refreshLimit : undefined);

  let refreshed = 0;
  let metadataOnly = 0;

  for (const [index, product] of products.entries()) {
    process.stdout.write(
      `\rRefreshing ${index + 1}/${products.length}: ${product.sku.padEnd(28)} `,
    );

    const result = await downloadProductImages(product);

    if (result) {
      product.images = result.images;
      product.imageMetadata = result.metadata;
      refreshed += 1;
    } else {
      await refreshMetadata(product);
      if (product.imageMetadata?.length) {
        metadataOnly += 1;
      }
    }
  }

  process.stdout.write("\n");
  const tempCatalogPath = `${catalogPath}.tmp`;
  await writeFile(tempCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await rename(tempCatalogPath, catalogPath);
  console.log(`Refreshed product images: ${refreshed}`);
  console.log(`Recorded metadata only: ${metadataOnly}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
