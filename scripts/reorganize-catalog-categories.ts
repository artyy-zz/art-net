import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
  tags?: string[];
};

type CatalogCategory = {
  name: string;
  slug: string;
  subcategories: {
    name: string;
    slug: string;
    productSkus: string[];
  }[];
};

type CatalogFile = {
  source: Record<string, unknown>;
  categories: CatalogCategory[];
  products: CatalogProduct[];
  sourceDocuments?: unknown[];
};

type CategoryDefinition = {
  name: string;
  slug: string;
};

const workspaceRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(workspaceRoot, "src", "data", "assmann-catalog.json");
const reportPath = path.join(workspaceRoot, "src", "data", "catalog-reorganization-report.json");

const categoryDefinitions = [
  { name: "Networking", slug: "networking" },
  { name: "WiFi & Wireless", slug: "wifi-wireless" },
  { name: "Surveillance", slug: "surveillance" },
  { name: "Security & Access Control", slug: "security-access-control" },
  { name: "Racks & Cabinets", slug: "racks-cabinets" },
  { name: "Fiber Optics", slug: "fiber-optics" },
  { name: "Power", slug: "power" },
  { name: "AV & Multimedia", slug: "av-multimedia" },
  { name: "Smart Home & Automation", slug: "smart-home-automation" },
  { name: "Lighting", slug: "lighting" },
  { name: "Electrical & Industrial", slug: "electrical-industrial" },
  { name: "Solar / Photovoltaic", slug: "solar-photovoltaic" },
  { name: "Installation Materials & Cables", slug: "installation-materials-cables" },
  { name: "Tools & Accessories", slug: "tools-accessories" },
] as const satisfies readonly CategoryDefinition[];

const categoriesBySlug: Map<string, CategoryDefinition> = new Map(
  categoryDefinitions.map((category) => [category.slug, category]),
);

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function unique<T>(values: (T | null | undefined | false | "")[]) {
  return [...new Set(values.filter((value): value is T => Boolean(value)))];
}

function includesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function textFor(product: CatalogProduct) {
  return normalize(
    [
      product.sku,
      product.title,
      product.documentName,
      product.description,
      product.brand,
      product.sourceLabel,
      product.officialSource,
      ...product.specifications,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function makePlacement(categorySlug: string, subcategory: string): Placement {
  const category = categoriesBySlug.get(categorySlug);

  if (!category) {
    throw new Error(`Unknown category slug: ${categorySlug}`);
  }

  return {
    category: category.name,
    categorySlug: category.slug,
    subcategory,
    subcategorySlug: slugify(subcategory),
  };
}

function targetForNetworking(product: CatalogProduct, subcategory: string, text: string) {
  const titleText = normalize([product.title, product.documentName].filter(Boolean).join(" "));

  if (/wireless-lan|wireless lan/.test(text)) {
    if (/access point|\bap\b|\bu7\b|\bu6\b|\be7\b/.test(titleText)) {
      return makePlacement("wifi-wireless", "Access Points & WiFi Devices");
    }

    if (includesAny(titleText, [/antenna/, /stand/, /mount/])) {
      return makePlacement("wifi-wireless", "Wireless Antennas & Accessories");
    }

    if (includesAny(titleText, [/bridge/, /mesh/, /outdoor/])) {
      return makePlacement("wifi-wireless", "Wireless Bridges / Mesh / Outdoor");
    }

    return makePlacement("wifi-wireless", "Access Points & WiFi Devices");
  }

  if (/cloud gateway|dream machine|gateway|router|controller/.test(text)) {
    return makePlacement("networking", "Gateways & Network Controllers");
  }

  if (/switch/.test(subcategory) || /\bswitch\b|switches/.test(text)) {
    return makePlacement("networking", "Switches");
  }

  if (/media converter/.test(subcategory) || /media converter/.test(text)) {
    return makePlacement("networking", "Media Converters");
  }

  if (/sfp|dac|aoc/.test(subcategory) || /\bsfp\b|\bdac\b|\baoc\b|transceiver/.test(text)) {
    return makePlacement("networking", "SFP / DAC / AOC Modules");
  }

  if (/patch cable/.test(subcategory)) {
    return makePlacement("networking", "Patch Cables");
  }

  if (/patch panel/.test(subcategory)) {
    return makePlacement("networking", "Patch Panels");
  }

  if (/keystone|outlet|surface|face plate|wall plate/.test(subcategory) || /keystone|wall plate|surface mount|face plate/.test(text)) {
    return makePlacement("networking", "Keystone Modules & Network Outlets");
  }

  if (/poe/.test(subcategory) || /\bpoe\b|power over ethernet/.test(text)) {
    return makePlacement("networking", "PoE Injectors / Splitters / Extenders");
  }

  if (/tool|tester|crimp|strip|cutter|roller/.test(subcategory) || /tester|crimp|stripping tool|cutter|cable roller|network tool/.test(text)) {
    return makePlacement("tools-accessories", "Network Testers & Crimping Tools");
  }

  if (/plug|connector|rj45/.test(subcategory) || /\brj45\b|connector|plug/.test(text)) {
    return makePlacement("networking", "RJ45 Connectors & Plugs");
  }

  return makePlacement("networking", "Copper Network Cables");
}

function targetForSurveillance(subcategory: string, text: string) {
  if (/intercom|2-wire|4\+n|door access|access|anti-theft|fire|alarm|sensor|siren|keyfob|reader|card/.test(subcategory)) {
    if (/fire/.test(subcategory) || /zjarri|fire/.test(text)) {
      return makePlacement("security-access-control", "Fire Alarm Systems");
    }

    if (/intercom|2-wire|4\+n|videocitofon|monitor kolor|pixel|elvox/.test(subcategory) || /intercom|videocitofon|elvox/.test(text)) {
      return makePlacement("security-access-control", "Intercom Systems");
    }

    if (/door access|smart access|access reader|card|fob|reader|relay|entry/.test(subcategory) || /access|reader|card|keyfob|relay|entry/.test(text)) {
      return makePlacement("security-access-control", "Door Access Control");
    }

    if (/anti-theft/.test(subcategory)) {
      return makePlacement("security-access-control", "Anti-Theft Systems");
    }

    return makePlacement("security-access-control", "Alarm Sensors & Sirens");
  }

  if (/nvr|record|edge/.test(subcategory) || /\bnvr\b|record|cloudkey|ai key/.test(text)) {
    return makePlacement("surveillance", "NVRs & Video Recorders");
  }

  if (/mount|accessor/.test(subcategory)) {
    return makePlacement("surveillance", "Camera Mounts & Accessories");
  }

  if (/cable/.test(subcategory)) {
    return makePlacement("surveillance", "Surveillance Cables");
  }

  return makePlacement("surveillance", "IP Cameras");
}

function targetForPower(subcategory: string, text: string) {
  if (/poe/.test(subcategory) || /\bpoe\b|power over ethernet/.test(text)) {
    return makePlacement("networking", "PoE Injectors / Splitters / Extenders");
  }

  if (/solar|photovoltaic|\bpv\b|mc4/.test(subcategory) || /solar|photovoltaic|\bpv\b|mc4/.test(text)) {
    return makePlacement("solar-photovoltaic", "Solar Cables & Connectors");
  }

  if (/pdu|power distribution/.test(subcategory) || /\bpdu\b|power distribution/.test(text)) {
    return makePlacement("power", "Rack PDUs");
  }

  if (/ups|inverter/.test(subcategory) || /\bups\b/.test(text)) {
    return makePlacement("power", "UPS Systems & Inverters");
  }

  if (/ev/.test(subcategory) || /ev charger|karikues ev/.test(text)) {
    return makePlacement("power", "EV Chargers");
  }

  if (/stabilizer/.test(subcategory)) {
    return makePlacement("power", "Stabilizers");
  }

  if (/generator/.test(subcategory)) {
    return makePlacement("power", "Generators");
  }

  if (/transformer/.test(subcategory)) {
    return makePlacement("power", "Transformers");
  }

  if (/factor correction/.test(subcategory)) {
    return makePlacement("power", "Power Factor Correction");
  }

  if (/storage|battery/.test(subcategory) || /battery|storage/.test(text)) {
    return makePlacement("power", "Batteries & Storage");
  }

  if (/cable|cord/.test(subcategory) || /power cord|extension cable/.test(text)) {
    return makePlacement("power", "Power Cords");
  }

  return makePlacement("power", "Chargers & Power Supplies");
}

function targetForSmartHome(product: CatalogProduct, subcategory: string, text: string) {
  const titleText = normalize(
    [product.title, product.documentName, product.description, ...product.specifications]
      .filter(Boolean)
      .join(" "),
  );

  if (/camera/.test(subcategory)) {
    return makePlacement("surveillance", "IP Cameras");
  }

  if (
    includesAny(titleText, [
      /shirit led/,
      /led strip/,
      /led panel/,
      /panel led/,
      /street lighting/,
      /rrug/,
      /emergency/,
      /emergjence/,
      /floodlight/,
      /spotlight/,
      /projektor/,
      /ndric/,
      /llampe led/,
      /gu10/,
    ]) &&
    !includesAny(titleText, [/hue/, /bluetooth/, /\bsmart\b/])
  ) {
    if (/panel/.test(titleText)) {
      return makePlacement("lighting", "LED Panels");
    }

    if (/shirit led|led strip/.test(titleText)) {
      return makePlacement("lighting", "LED Strips");
    }

    if (/street|rrug/.test(titleText)) {
      return makePlacement("lighting", "Street Lighting");
    }

    if (/emergency|emergjence/.test(titleText)) {
      return makePlacement("lighting", "Emergency Lighting");
    }

    return makePlacement("lighting", "LED Lamps & Spotlights");
  }

  if (/smart lighting|hue|bluetooth|smart bulb/.test(subcategory) || /hue|bluetooth|smart bulb|smart switch|smart controller|smart module/.test(text)) {
    return makePlacement("smart-home-automation", "Philips Hue & Smart Lighting");
  }

  if (/panel/.test(subcategory)) {
    return makePlacement("lighting", "LED Panels");
  }

  if (/strip|shirit/.test(subcategory) || /shirit led|led strip/.test(text)) {
    return makePlacement("lighting", "LED Strips");
  }

  if (/street/.test(subcategory)) {
    return makePlacement("lighting", "Street Lighting");
  }

  if (/emergency/.test(subcategory) || /emergency|emergjence/.test(text)) {
    return makePlacement("lighting", "Emergency Lighting");
  }

  return makePlacement("lighting", "LED Lamps & Spotlights");
}

function targetForElectrical(subcategory: string, text: string) {
  if (/solar|photovoltaic|\bpv\b/.test(text)) {
    return makePlacement("solar-photovoltaic", "PV Structures & Mounting");
  }

  if (/installation materials/.test(subcategory)) {
    if (/plastic cable ducts|metal cable ducts|kanaline|duct/.test(subcategory) || /kanaline|duct|channel|raceway/.test(text)) {
      return makePlacement("installation-materials-cables", "Cable Channels & Ducts");
    }

    if (/conduit|tube|tuba|tubo/.test(subcategory) || /conduit|tube|tuba|tubo/.test(text)) {
      return makePlacement("installation-materials-cables", "Conduits & Tubes");
    }

    if (/cable trays|wire mesh/.test(subcategory) || /tray|mesh/.test(text)) {
      return makePlacement("installation-materials-cables", "Cable Trays");
    }

    if (/terminal/.test(subcategory) || /terminal|kleme/.test(text)) {
      return makePlacement("installation-materials-cables", "Terminals & Busbars");
    }

    return makePlacement("installation-materials-cables", "Junction / Wall / Distribution Boxes");
  }

  if (/busbars and terminals/.test(subcategory) || /terminal|busbar/.test(text)) {
    return makePlacement("installation-materials-cables", "Terminals & Busbars");
  }

  if (/cables - power/.test(subcategory)) {
    return makePlacement("installation-materials-cables", "General Power Cables");
  }

  if (/cables - bus/.test(subcategory)) {
    return makePlacement("installation-materials-cables", "Bus Cables");
  }

  if (/circuit breaker|automat|differential|rcd|breaker/.test(subcategory) || /automat|breaker|diferencial|rcd/.test(text)) {
    return makePlacement("electrical-industrial", "Circuit Breakers & RCDs");
  }

  if (/plc|hmi|bms/.test(subcategory) || /\bplc\b|\bhmi\b|\bbms\b/.test(text)) {
    return makePlacement("electrical-industrial", "PLC / HMI / BMS");
  }

  if (/inverter frequency|motor/.test(subcategory) || /frequency|motor|inverter/.test(text)) {
    return makePlacement("electrical-industrial", "Frequency Inverters & Motor Control");
  }

  if (/sensor/.test(subcategory) || /sensor/.test(text)) {
    return makePlacement("electrical-industrial", "Industrial Sensors");
  }

  if (/measurement|instrument/.test(subcategory) || /meter|multimeter|instrument|testboy/.test(text)) {
    return makePlacement("electrical-industrial", "Measuring Instruments");
  }

  if (/civil electrical|socket|switch|vimar|schneider sockets/.test(subcategory) || /socket|switch|prize|vimar|plana|arke|eikon|neve/.test(text)) {
    return makePlacement("electrical-industrial", "Civil Switches & Sockets");
  }

  return makePlacement("electrical-industrial", "Panels & Enclosures");
}

function targetForAv(subcategory: string, text: string) {
  if (/audio cables/.test(subcategory) || /kabell audio|emergency audio|kordon audio/.test(text)) {
    return makePlacement("installation-materials-cables", "Fire / Alarm / Audio Cables");
  }

  if (/splitter/.test(subcategory)) {
    return makePlacement("av-multimedia", "HDMI Splitters");
  }

  if (/switch/.test(subcategory)) {
    return makePlacement("av-multimedia", "HDMI Switches");
  }

  if (/matrix|video wall/.test(subcategory)) {
    return makePlacement("av-multimedia", "Matrix & Video Walls");
  }

  if (/repeater|converter|adapter|hub/.test(subcategory)) {
    return makePlacement("av-multimedia", "Repeaters / Converters / Adapters");
  }

  if (/conference|presentation|cart/.test(subcategory)) {
    return makePlacement("av-multimedia", "Conferencing & Presentation");
  }

  if (/mount|stand/.test(subcategory)) {
    return makePlacement("av-multimedia", "Monitor & TV Mounts");
  }

  if (/usb/.test(subcategory) || /usb extender|active usb/.test(text)) {
    return makePlacement("av-multimedia", "USB Extenders");
  }

  return makePlacement("av-multimedia", "HDMI / AV Extenders");
}

function targetForTools(product: CatalogProduct, subcategory: string, text: string) {
  if (/fiber/.test(subcategory)) {
    return makePlacement("fiber-optics", "Splice Devices & Fiber Tools");
  }

  if (/usb extender|active usb|usb /.test(text) || /usb extenders/.test(subcategory)) {
    return makePlacement("av-multimedia", "USB Extenders");
  }

  if (/shelf|tray|sliding rail|support rail/.test(text) || /shelves|trays/.test(subcategory)) {
    return makePlacement("racks-cabinets", "Shelves & Rails");
  }

  if (/cable management|brush strip|steel rings|cable channel|c profile|rack-mount|castor|cabinet|483 mm|19\"|19''|19-inch/.test(text)) {
    return makePlacement("racks-cabinets", "Rack Accessories");
  }

  if (/keystone|wall plate/.test(text)) {
    return makePlacement("networking", "Keystone Modules & Network Outlets");
  }

  if (/raceway|cable duct|channel/.test(text)) {
    return makePlacement("installation-materials-cables", "Cable Channels & Ducts");
  }

  if (/hdmi|display arm|monitor|tv/.test(text)) {
    return makePlacement("av-multimedia", "Monitor & TV Mounts");
  }

  if (/network tools|tester|crimp|strip|cable roller/.test(subcategory) || /tester|crimp|strip|network tool/.test(text)) {
    return makePlacement("tools-accessories", "Network Testers & Crimping Tools");
  }

  if (/measuring|meter|level/.test(subcategory) || /measure|meter|level/.test(text)) {
    return makePlacement("tools-accessories", "Measuring Tools");
  }

  if (/label|tie|adapter|accessor|mounting kit|stand|floating mount/.test(subcategory) || /label|tie|adapter|mounting kit|stand|floating mount/.test(text)) {
    return makePlacement("tools-accessories", "Labels / Cable Ties / Small Accessories");
  }

  return makePlacement("tools-accessories", "Hand Tools");
}

function targetForRacks(subcategory: string, text: string) {
  if (/charging/.test(subcategory)) {
    return makePlacement("racks-cabinets", "Charging Cabinets");
  }

  if (/audio|video/.test(subcategory)) {
    return makePlacement("racks-cabinets", "AV Racks");
  }

  if (/server/.test(subcategory)) {
    return makePlacement("racks-cabinets", "Server Cabinets");
  }

  if (/freestanding|free-standing/.test(subcategory)) {
    return makePlacement("racks-cabinets", "Freestanding Racks & Cabinets");
  }

  if (/wall mount|wall-mounted|10-inch|dynamic basic|unique|outdoor|slim/.test(subcategory)) {
    return makePlacement("racks-cabinets", "Wall Cabinets");
  }

  if (/shelf|drawer|rail|tray/.test(subcategory) || /shelf|tray|rail/.test(text)) {
    return makePlacement("racks-cabinets", "Shelves & Rails");
  }

  if (/cable management/.test(subcategory)) {
    return makePlacement("racks-cabinets", "Rack Cable Management");
  }

  if (/cool|ventilation|fan/.test(subcategory) || /fan|ventilation|cool/.test(text)) {
    return makePlacement("racks-cabinets", "Cooling & Ventilation");
  }

  if (/blank|cover|mounting|lock|handle|key|panel|system|accessor/.test(subcategory)) {
    return makePlacement("racks-cabinets", "Rack Accessories");
  }

  if (/keystone|wall plate/.test(text)) {
    return makePlacement("networking", "Keystone Modules & Network Outlets");
  }

  if (/raceway|cable duct|channel/.test(text)) {
    return makePlacement("installation-materials-cables", "Cable Channels & Ducts");
  }

  if (/hdmi|display arm/.test(text)) {
    return makePlacement("av-multimedia", "Monitor & TV Mounts");
  }

  return makePlacement("racks-cabinets", "Rack Accessories");
}

function targetForFiber(subcategory: string) {
  if (/structured|installation/.test(subcategory)) {
    return makePlacement("fiber-optics", "Fiber Structured / Installation Cables");
  }

  if (/patch cable/.test(subcategory)) {
    return makePlacement("fiber-optics", "Fiber Patch Cables");
  }

  if (/pigtail/.test(subcategory)) {
    return makePlacement("fiber-optics", "Fiber Pigtails");
  }

  if (/trunk|breakout/.test(subcategory)) {
    return makePlacement("fiber-optics", "Fiber Trunk / Breakout Cables");
  }

  if (/coupler/.test(subcategory)) {
    return makePlacement("fiber-optics", "Fiber Couplers");
  }

  if (/connector/.test(subcategory)) {
    return makePlacement("fiber-optics", "Fiber Connectors");
  }

  if (/splice enclosure|patch panel|cassette|splice protection/.test(subcategory)) {
    return makePlacement("fiber-optics", "Fiber Splice Enclosures / Patch Panels");
  }

  if (/distribution|wall mount|din rail/.test(subcategory)) {
    return makePlacement("fiber-optics", "Fiber Distribution Boxes");
  }

  if (/fttx/.test(subcategory)) {
    return makePlacement("fiber-optics", "FTTX");
  }

  if (/mpo/.test(subcategory)) {
    return makePlacement("fiber-optics", "MPO Patch Cables");
  }

  return makePlacement("fiber-optics", "Splice Devices & Fiber Tools");
}

function targetForSolar(subcategory: string, text: string) {
  if (/panel/.test(subcategory) || /panel/.test(text)) {
    return makePlacement("solar-photovoltaic", "Photovoltaic Panels");
  }

  if (/cable|connector|mc4/.test(subcategory) || /cable|connector|mc4/.test(text)) {
    return makePlacement("solar-photovoltaic", "Solar Cables & Connectors");
  }

  if (/structure|mount|accessor/.test(subcategory) || /structure|mount|accessor/.test(text)) {
    return makePlacement("solar-photovoltaic", "PV Structures & Mounting");
  }

  return makePlacement("solar-photovoltaic", "Solar Inverters & SmartLog");
}

function inferPlacement(product: CatalogProduct) {
  const primary = product.placements[0];
  const categorySlug = primary?.categorySlug ?? "";
  const subcategory = normalize(primary?.subcategory ?? "");
  const text = textFor(product);
  const titleText = normalize([product.title, product.documentName].filter(Boolean).join(" "));

  if (product.sourceLabel === "Ubiquiti / UniFi" || product.brand === "Ubiquiti / UniFi") {
    if (/access point|\be7\b|\bu7\b|\bu6\b/.test(titleText)) {
      return makePlacement("wifi-wireless", "Access Points & WiFi Devices");
    }

    if (/gateway|dream machine|dream router|dream wall|unifi express|fortress/.test(titleText)) {
      return makePlacement("networking", "Gateways & Network Controllers");
    }

    if (/switch|flex|aggregation/.test(titleText)) {
      return makePlacement("networking", "Switches");
    }

    if (/camera|nvr|viewport|ai key/.test(titleText)) {
      return /nvr|ai key/.test(titleText)
        ? makePlacement("surveillance", "NVRs & Video Recorders")
        : makePlacement("surveillance", "IP Cameras");
    }

    if (/door|access|reader|intercom|lock|sensor|alarm|siren|keyfob|chime|motion|glass break|environmental/.test(titleText)) {
      if (/sensor|alarm|siren|keyfob|chime|motion|glass break|environmental/.test(titleText)) {
        return makePlacement("security-access-control", "Alarm Sensors & Sirens");
      }

      return /intercom|doorbell/.test(titleText)
        ? makePlacement("security-access-control", "Intercom Systems")
        : makePlacement("security-access-control", "Door Access Control");
    }
  }

  switch (categorySlug) {
    case "networking":
      return targetForNetworking(product, subcategory, text);
    case "surveillance":
      return targetForSurveillance(subcategory, text);
    case "racks-cabinets":
      return targetForRacks(subcategory, text);
    case "fiber-optics":
      return targetForFiber(subcategory);
    case "power":
      return targetForPower(subcategory, text);
    case "av-multimedia":
      return targetForAv(subcategory, text);
    case "smart-home":
    case "smart-home-automation":
      return targetForSmartHome(product, subcategory, text);
    case "tools-accessories":
      return targetForTools(product, subcategory, text);
    case "electrical-industrial":
      return targetForElectrical(subcategory, text);
    case "solar-photovoltaic":
      return targetForSolar(subcategory, text);
    case "wifi-wireless":
      return targetForNetworking(product, "wireless lan", text);
    case "security-access-control":
      return targetForSurveillance(subcategory, text);
    case "lighting":
      return targetForSmartHome(product, subcategory, text);
    case "installation-materials-cables":
      return makePlacement("installation-materials-cables", primary?.subcategory ?? "Installation Accessories");
    default:
      return makePlacement("tools-accessories", "Labels / Cable Ties / Small Accessories");
  }
}

function addProductToCategory(categories: CatalogCategory[], product: CatalogProduct, placement: Placement) {
  let category = categories.find((item) => item.slug === placement.categorySlug);

  if (!category) {
    category = {
      name: placement.category,
      slug: placement.categorySlug,
      subcategories: [],
    };
    categories.push(category);
  }

  let subcategory = category.subcategories.find((item) => item.slug === placement.subcategorySlug);

  if (!subcategory) {
    subcategory = {
      name: placement.subcategory,
      slug: placement.subcategorySlug,
      productSkus: [],
    };
    category.subcategories.push(subcategory);
  }

  if (!subcategory.productSkus.includes(product.sku)) {
    subcategory.productSkus.push(product.sku);
  }
}

function compareByTitle(productBySku: Map<string, CatalogProduct>) {
  return (left: string, right: string) => {
    const leftProduct = productBySku.get(left);
    const rightProduct = productBySku.get(right);
    const leftTitle = leftProduct?.title || leftProduct?.documentName || left;
    const rightTitle = rightProduct?.title || rightProduct?.documentName || right;
    return leftTitle.localeCompare(rightTitle);
  };
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as CatalogFile;
  const productBySku = new Map(catalog.products.map((product) => [product.sku, product]));
  const newCategories: CatalogCategory[] = categoryDefinitions.map((category) => ({
    name: category.name,
    slug: category.slug,
    subcategories: [],
  }));
  const movedProducts: {
    sku: string;
    from: string;
    to: string;
  }[] = [];
  const assignmentCounts = new Map<string, number>();

  for (const product of catalog.products) {
    const previousPlacements = product.placements;
    const previousPrimary = previousPlacements[0];
    const placement = inferPlacement(product);

    if (
      previousPrimary &&
      (previousPrimary.categorySlug !== placement.categorySlug ||
        previousPrimary.subcategorySlug !== placement.subcategorySlug)
    ) {
      movedProducts.push({
        sku: product.sku,
        from: `${previousPrimary.category} / ${previousPrimary.subcategory}`,
        to: `${placement.category} / ${placement.subcategory}`,
      });
    }

    product.tags = unique([
      product.brand,
      product.sourceLabel,
      product.officialSource,
      placement.category,
      placement.subcategory,
    ]);
    product.placements = [placement];
    assignmentCounts.set(placement.categorySlug, (assignmentCounts.get(placement.categorySlug) ?? 0) + 1);
    addProductToCategory(newCategories, product, placement);
  }

  const skuComparator = compareByTitle(productBySku);

  for (const category of newCategories) {
    category.subcategories = category.subcategories
      .filter((subcategory) => subcategory.productSkus.length > 0)
      .map((subcategory) => ({
        ...subcategory,
        productSkus: unique(subcategory.productSkus).sort(skuComparator),
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  catalog.categories = newCategories.filter((category) => category.subcategories.length > 0);
  catalog.source = {
    ...catalog.source,
    reorganizedAt: new Date().toISOString(),
    categoryStructureVersion: "2026-05-service-separated-v1",
  };

  const referencedSkus = new Set(
    catalog.categories.flatMap((category) =>
      category.subcategories.flatMap((subcategory) => subcategory.productSkus),
    ),
  );
  const missingReferences = catalog.products.filter((product) => !referencedSkus.has(product.sku));

  if (missingReferences.length > 0) {
    throw new Error(`Some products were not assigned to categories: ${missingReferences.length}`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    products: catalog.products.length,
    categories: catalog.categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      products: new Set(category.subcategories.flatMap((subcategory) => subcategory.productSkus)).size,
      subcategories: category.subcategories.length,
    })),
    assignmentCounts: Object.fromEntries([...assignmentCounts.entries()].sort()),
    movedProducts: movedProducts.length,
    sampleMoves: movedProducts.slice(0, 80),
  };

  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Reorganized ${catalog.products.length} products into ${catalog.categories.length} categories.`);
  console.log(`Moved primary category/subcategory for ${movedProducts.length} products.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
