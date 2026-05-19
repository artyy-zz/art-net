import { inflateRawSync } from "node:zlib";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

type DocProductRow = {
  category: string;
  subcategory: string;
  name: string;
  sku: string;
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
  imageMetadata?: ProductImageMetadata[];
  officialUrl: string | null;
  officialSource: "products.digitus.com" | null;
  foundOfficialPage: boolean;
  placements: Placement[];
};

type ProductImageMetadata = {
  src: string;
  width: number;
  height: number;
  bytes: number;
  low_quality_image?: true;
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
  source: {
    documentPath: string;
    officialSearchBaseUrl: string;
    generatedAt: string;
    documentRows: number;
    uniqueProducts: number;
  };
  categories: CatalogCategory[];
  products: CatalogProduct[];
};

type ScrapedProduct = {
  found: boolean;
  title: string;
  description: string;
  specifications: string[];
  imageUrls: string[];
  officialUrl: string | null;
};

const workspaceRoot = path.resolve(__dirname, "..");
const defaultDocPath = path.join(
  process.env.USERPROFILE ?? "C:\\Users\\PC",
  "Desktop",
  "assmann_digitus_product_categories.docx",
);
const documentPath = process.env.ASSMANN_CATALOG_DOCX ?? defaultDocPath;
const outputCatalogPath = path.join(workspaceRoot, "src", "data", "assmann-catalog.json");
const outputReportPath = path.join(workspaceRoot, "src", "data", "assmann-import-report.json");
const outputImagesDir = path.join(workspaceRoot, "public", "images", "assmann-products");
const searchBaseUrl = "https://products.digitus.com/index.php?lang=1&cl=search&searchparam=";
const shouldSkipDownload = process.argv.includes("--skip-download");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const importLimit = limitArg ? Number.parseInt(limitArg.split("=")[1] ?? "", 10) : null;
const lowQualityMaxDimension = 500;
const lowQualityMinDimension = 220;

function fail(message: string): never {
  throw new Error(message);
}

function readUInt32LE(buffer: Buffer, offset: number) {
  return buffer.readUInt32LE(offset);
}

function readUInt16LE(buffer: Buffer, offset: number) {
  return buffer.readUInt16LE(offset);
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

function extractDocRows(docXml: string): DocProductRow[] {
  const body = docXml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/)?.[1] ?? "";
  const blocks = [...body.matchAll(/<w:(p|tbl)\b[\s\S]*?<\/w:\1>/g)];
  const rows: DocProductRow[] = [];
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
      const table = tableRows(xml).filter((row) => row.length >= 3);
      const header = table[0] ?? [];

      if (!/Product/i.test(header[1] ?? "") || !/(SKU|Product Number)/i.test(header[2] ?? "")) {
        continue;
      }

      for (const row of table.slice(1)) {
        const name = (row[1] ?? "").trim();
        const sku = (row[2] ?? "").trim();

        if (name && sku) {
          rows.push({ category, subcategory, name, sku });
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

function stripTags(value: string) {
  return htmlDecode(value.replace(/<br\s*\/?>/gi, " "));
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function readJpegDimensions(buffer: Buffer) {
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

function readPngDimensions(buffer: Buffer) {
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readWebpDimensions(buffer: Buffer) {
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

function readImageDimensions(buffer: Buffer) {
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

function getAttribute(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1] ? htmlDecode(html.match(pattern)?.[1] ?? "") : "";
}

function exactSkuInHtml(html: string, sku: string) {
  const skuValues = [...html.matchAll(/property="gr:hasStockKeepingUnit"\s+content="([^"]+)"/g)].map(
    (match) => htmlDecode(match[1] ?? ""),
  );
  return skuValues.some((value) => value.trim().toLocaleLowerCase() === sku.toLocaleLowerCase());
}

function parseListItems(sectionHtml: string) {
  return unique(
    [...sectionHtml.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)]
      .map((match) => stripTags(match[1] ?? ""))
      .filter((value) => value.length > 2)
      .filter((value) => !/^Datasheet|^Manual|^Certificate/i.test(value)),
  ).slice(0, 12);
}

function parseOfficialProduct(html: string, sku: string): ScrapedProduct {
  if (!exactSkuInHtml(html, sku)) {
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
    getAttribute(html, /<meta\s+property="og:title"\s+content="(?:DIGITUS by ASSMANN Shop \| )?([^"]+)"/);
  const description =
    getAttribute(html, /<div\s+property="gr:description"\s+content="([^"]+)"/) ||
    getAttribute(html, /<meta\s+name="description"\s+content="([^"]+)"/);
  const officialUrl =
    getAttribute(html, /<link\s+rel="canonical"\s+href="([^"]+)"/) ||
    getAttribute(html, /<meta\s+property="og:url"\s+content="([^"]+)"/) ||
    null;
  const techSection = html.match(/<div id=techdetails\b[\s\S]*?(?=<div id=techattrs|<div id="dlfiles"|<div id=logistics)/)?.[0] ?? "";
  const leadSection = html.match(/<div id="details_container"[\s\S]*?(?=<div id=techdetails)/)?.[0] ?? "";
  const specifications = unique([...parseListItems(leadSection), ...parseListItems(techSection)]).slice(0, 10);
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
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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

async function scrapeProduct(sku: string): Promise<ScrapedProduct> {
  const response = await fetchWithRetry(`${searchBaseUrl}${encodeURIComponent(sku)}`);
  const html = await response.text();
  return parseOfficialProduct(html, sku);
}

function imageExtension(url: string) {
  const cleanUrl = url.split("?")[0] ?? url;
  const extension = path.extname(cleanUrl).toLowerCase();
  return extension && extension.length <= 6 ? extension : ".jpg";
}

async function downloadImages(sku: string, imageUrls: string[]) {
  if (shouldSkipDownload || imageUrls.length === 0) {
    return {
      images: imageUrls,
      metadata: [],
    };
  }

  const skuDir = slugify(sku);
  const targetDir = path.join(outputImagesDir, skuDir);
  await mkdir(targetDir, { recursive: true });

  const localImages: string[] = [];
  const imageMetadata: ProductImageMetadata[] = [];
  const seenNames = new Set<string>();

  for (const url of imageUrls) {
    const urlFileName = path.basename(url.split("?")[0] ?? url);

    if (seenNames.has(urlFileName)) {
      continue;
    }

    seenNames.add(urlFileName);

    const extension = imageExtension(url);
    const localFileName = `${String(localImages.length + 1).padStart(2, "0")}${extension}`;
    const absolutePath = path.join(targetDir, localFileName);
    const publicPath = `/images/assmann-products/${skuDir}/${localFileName}`;
    let bytes: Buffer;

    if (!existsSync(absolutePath)) {
      const response = await fetchWithRetry(url, 3);
      bytes = Buffer.from(await response.arrayBuffer());
      await writeFile(absolutePath, bytes);
    } else {
      bytes = await readFile(absolutePath);
    }

    const dimensions = readImageDimensions(bytes);

    if (!dimensions) {
      continue;
    }

    localImages.push(publicPath);
    imageMetadata.push({
      src: publicPath,
      width: dimensions.width,
      height: dimensions.height,
      bytes: bytes.length,
    });
  }

  if (imageMetadata.length > 0 && imageMetadata.every(isLowQualityImage)) {
    for (const metadata of imageMetadata) {
      metadata.low_quality_image = true;
    }
  }

  return {
    images: localImages,
    metadata: imageMetadata,
  };
}

function buildCatalogSkeleton(rows: DocProductRow[]) {
  const categories = new Map<string, CatalogCategory>();
  const products = new Map<string, CatalogProduct>();

  for (const row of rows) {
    const categorySlug = slugify(row.category);
    const subcategorySlug = slugify(row.subcategory);

    if (!categories.has(row.category)) {
      categories.set(row.category, {
        name: row.category,
        slug: categorySlug,
        subcategories: [],
      });
    }

    const category = categories.get(row.category);
    if (!category) {
      continue;
    }

    let subcategory = category.subcategories.find((item) => item.name === row.subcategory);
    if (!subcategory) {
      subcategory = {
        name: row.subcategory,
        slug: subcategorySlug,
        productSkus: [],
      };
      category.subcategories.push(subcategory);
    }

    if (!subcategory.productSkus.includes(row.sku)) {
      subcategory.productSkus.push(row.sku);
    }

    const placement = {
      category: row.category,
      categorySlug,
      subcategory: row.subcategory,
      subcategorySlug,
    };

    if (!products.has(row.sku)) {
      products.set(row.sku, {
        sku: row.sku,
        slug: slugify(`${row.sku}-${row.name}`),
        documentName: row.name,
        title: row.name,
        description: "",
        specifications: [],
        images: [],
        officialUrl: null,
        officialSource: null,
        foundOfficialPage: false,
        placements: [placement],
      });
    } else {
      const product = products.get(row.sku);
      if (
        product &&
        !product.placements.some(
          (item) =>
            item.categorySlug === placement.categorySlug &&
            item.subcategorySlug === placement.subcategorySlug,
        )
      ) {
        product.placements.push(placement);
      }
    }
  }

  return {
    categories: [...categories.values()],
    products: [...products.values()],
  };
}

async function main() {
  if (!existsSync(documentPath)) {
    fail(`Document not found: ${documentPath}`);
  }

  await mkdir(path.dirname(outputCatalogPath), { recursive: true });
  await mkdir(outputImagesDir, { recursive: true });

  const docBuffer = await readFile(documentPath);
  const docXml = extractZipEntry(docBuffer, "word/document.xml");
  const rows = extractDocRows(docXml);
  const { categories, products } = buildCatalogSkeleton(rows);
  const productsToImport = importLimit ? products.slice(0, importLimit) : products;
  const missingOfficialPages: { sku: string; name: string; placements: Placement[]; reason: string }[] = [];
  const missingImages: { sku: string; name: string; officialUrl: string | null }[] = [];

  for (const [index, product] of productsToImport.entries()) {
    process.stdout.write(
      `\rImporting ${index + 1}/${productsToImport.length}: ${product.sku.padEnd(26)} `,
    );

    try {
      const official = await scrapeProduct(product.sku);

      if (!official.found) {
        missingOfficialPages.push({
          sku: product.sku,
          name: product.documentName,
          placements: product.placements,
          reason: "No exact official products.digitus.com page returned by SKU search",
        });
        continue;
      }

      product.foundOfficialPage = true;
      product.officialSource = "products.digitus.com";
      product.officialUrl = official.officialUrl;
      product.title = official.title || product.documentName;
      product.description = official.description;
      product.specifications = official.specifications;
      const downloadedImages = await downloadImages(product.sku, official.imageUrls);
      product.images = downloadedImages.images;
      product.imageMetadata = downloadedImages.metadata;

      if (product.images.length === 0) {
        missingImages.push({
          sku: product.sku,
          name: product.title,
          officialUrl: product.officialUrl,
        });
      }
    } catch (error) {
      missingOfficialPages.push({
        sku: product.sku,
        name: product.documentName,
        placements: product.placements,
        reason: error instanceof Error ? error.message : "Unknown import error",
      });
    }
  }

  process.stdout.write("\n");

  const catalog: CatalogFile = {
    source: {
      documentPath,
      officialSearchBaseUrl: searchBaseUrl,
      generatedAt: new Date().toISOString(),
      documentRows: rows.length,
      uniqueProducts: products.length,
    },
    categories,
    products,
  };

  const duplicateRows = [...rows.reduce((map, row) => {
    map.set(row.sku, (map.get(row.sku) ?? 0) + 1);
    return map;
  }, new Map<string, number>())]
    .filter(([, count]) => count > 1)
    .map(([sku, count]) => ({ sku, count }));

  const report = {
    generatedAt: catalog.source.generatedAt,
    documentRows: rows.length,
    uniqueProducts: products.length,
    duplicateSkusDeduped: duplicateRows,
    officialPagesFound: products.filter((product) => product.foundOfficialPage).length,
    officialPagesMissing: missingOfficialPages,
    productsWithoutImages: [
      ...missingImages,
      ...products
        .filter((product) => product.foundOfficialPage && product.images.length === 0)
        .map((product) => ({
          sku: product.sku,
          name: product.title,
          officialUrl: product.officialUrl,
        })),
    ],
  };

  await writeFile(outputCatalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await writeFile(outputReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Wrote ${path.relative(workspaceRoot, outputCatalogPath)}`);
  console.log(`Wrote ${path.relative(workspaceRoot, outputReportPath)}`);
  console.log(`Official pages found: ${report.officialPagesFound}/${products.length}`);
  console.log(`Products without downloaded images: ${report.productsWithoutImages.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
