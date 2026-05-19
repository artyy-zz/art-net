import { existsSync, statSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

type ProductImageMetadata = {
  src: string;
  width: number;
  height: number;
  bytes: number;
  low_quality_image?: true;
};

type CatalogProduct = {
  sku: string;
  images?: string[];
  imageMetadata?: ProductImageMetadata[];
};

type CatalogFile = {
  products: CatalogProduct[];
};

type BrokenImage = {
  sku: string;
  src: string;
  reason: string;
};

const workspaceRoot = process.cwd();
const catalogPath = path.join(workspaceRoot, "src/data/assmann-catalog.json");
const fallbackRef =
  process.argv.find((arg) => arg.startsWith("--fallback-ref="))?.split("=")[1] ??
  "HEAD^";
const shouldFix = process.argv.includes("--fix");

function loadCatalog() {
  return JSON.parse(readFileSync(catalogPath, "utf8")) as CatalogFile;
}

function loadFallbackCatalog() {
  try {
    return JSON.parse(
      execSync(`git show ${fallbackRef}:src/data/assmann-catalog.json`, {
        encoding: "utf8",
        maxBuffer: 250 * 1024 * 1024,
      }),
    ) as CatalogFile;
  } catch {
    return null;
  }
}

function localImagePath(src: string) {
  if (!src.startsWith("/")) {
    return null;
  }

  return path.join(workspaceRoot, "public", src);
}

function isLfsPointer(filePath: string) {
  if (statSync(filePath).size > 512) {
    return false;
  }

  return readFileSync(filePath, "utf8").startsWith(
    "version https://git-lfs.github.com/spec/",
  );
}

function checkLocalImage(src: string) {
  if (!src.startsWith("/")) {
    return "local image path must start with /";
  }

  const filePath = localImagePath(src);

  if (!filePath?.startsWith(path.join(workspaceRoot, "public"))) {
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

async function checkRemoteImage(src: string) {
  try {
    const response = await fetch(src, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return `remote image returned HTTP ${response.status}`;
    }

    return null;
  } catch (error) {
    return `remote image failed: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
}

async function checkImage(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return checkRemoteImage(src);
  }

  return checkLocalImage(src);
}

async function main() {
  const catalog = loadCatalog();
  const fallbackCatalog = loadFallbackCatalog();
  const fallbackBySku = new Map(
    fallbackCatalog?.products.map((product) => [product.sku, product]) ?? [],
  );
  const brokenImages: BrokenImage[] = [];
  const emptyProducts: string[] = [];
  const metadataFixed: string[] = [];
  let fallbackProducts = 0;

  for (const product of catalog.products) {
    const images = product.images ?? [];

    if (images.length === 0) {
      emptyProducts.push(product.sku);
      continue;
    }

    const validImages: string[] = [];

    for (const src of images) {
      const reason = await checkImage(src);

      if (reason) {
        brokenImages.push({ sku: product.sku, src, reason });
      } else {
        validImages.push(src);
      }
    }

    if (shouldFix && validImages.length !== images.length) {
      const fallbackImages = fallbackBySku.get(product.sku)?.images ?? [];
      const usableFallbackImages: string[] = [];

      for (const src of fallbackImages) {
        if (!(await checkImage(src))) {
          usableFallbackImages.push(src);
        }
      }

      product.images =
        validImages.length > 0 ? validImages : usableFallbackImages;

      if (validImages.length === 0 && usableFallbackImages.length > 0) {
        fallbackProducts += 1;
      }
    }

    if (shouldFix && product.imageMetadata) {
      const imageSet = new Set(product.images ?? []);
      const nextMetadata = product.imageMetadata.filter((item) =>
        imageSet.has(item.src),
      );

      if (nextMetadata.length !== product.imageMetadata.length) {
        metadataFixed.push(product.sku);
      }

      if (nextMetadata.length > 0) {
        product.imageMetadata = nextMetadata;
      } else {
        delete product.imageMetadata;
      }
    }
  }

  if (shouldFix) {
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  }

  const report = {
    products: catalog.products.length,
    emptyProducts: emptyProducts.length,
    brokenImages: brokenImages.length,
    fallbackProducts,
    metadataFixed: metadataFixed.length,
    sampleBrokenImages: brokenImages.slice(0, 20),
    fixed: shouldFix,
  };

  console.log(JSON.stringify(report, null, 2));

  if (!shouldFix && brokenImages.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
