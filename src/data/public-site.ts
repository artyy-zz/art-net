import type { Locale } from "@/lib/i18n";

type LocalizedText = Record<Locale, string>;

export type PublicCatalogProduct = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  image: string;
  specs: readonly LocalizedText[];
  tags: readonly string[];
};

export type PublicSubcategory = {
  id: string;
  title: LocalizedText;
  products: readonly PublicCatalogProduct[];
};

export type PublicCategory = {
  id: string;
  slug: string;
  title: LocalizedText;
  shortTitle?: LocalizedText;
  description: LocalizedText;
  image: string;
  theme: string;
  subcategories: readonly PublicSubcategory[];
};

export type LocalizedCatalogProduct = {
  id: string;
  name: string;
  description: string;
  image: string;
  specs: string[];
  tags: readonly string[];
  categorySlug: string;
  categoryTitle: string;
  subcategoryId: string;
  subcategoryTitle: string;
};

export type LocalizedCategory = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  image: string;
  theme: string;
  subcategories: {
    id: string;
    title: string;
    products: LocalizedCatalogProduct[];
  }[];
};

export type PublicProject = {
  id: string;
  title: LocalizedText;
  location: LocalizedText;
  summary: LocalizedText;
  image: string;
  metrics: readonly {
    value: string;
    label: LocalizedText;
  }[];
};

export const publicBrand = {
  name: "Artnet",
  logo: "/images/artnet/logo-new.png",
  accent: "#006b96",
  foundedYear: "YEAR FOUNDED",
} as const;

export const publicAssetImages = {
  logo: "/images/artnet/logo-new.png",
  networking: "/images/artnet/ethernet-cable.png",
  surveillance: "/images/artnet/cctv-camera.png",
  racksCabinets: "/images/artnet/rack.jpg",
  fiberOptics: "/images/artnet/fiber-optic.webp",
  power: "/images/artnet/power-strip.png",
  avMultimedia: "/images/artnet/hdmi-cable.png",
  smartHome: "/images/artnet/smart-doorbell.jpg",
  toolsAccessories: "/images/artnet/toolkit.png",
  hardware: "/images/artnet/hardware.png",
  software: "/images/artnet/software.png",
} as const;

export const publicContact = {
  phoneNumbers: ["049 160 740", "049 313 215"],
  emails: ["bujar.bela@artnet-ks.com", "sales@artnet-ks.com"],
  address: "rr. Dardania, Fushe Kosove 12000, Kosovo",
  instagram: "https://www.instagram.com/artnet_shpk?igsh=MTFjdHdqYmxtMW15ZQ==",
  facebook: "https://www.facebook.com/share/1E13vUCTS8/?mibextid=wwXIfr",
} as const;

export const heroProducts = [
  {
    image: publicAssetImages.networking,
    alt: { sq: "Kabllo ethernet Artnet", en: "Artnet ethernet cable" },
  },
  {
    image: publicAssetImages.surveillance,
    alt: { sq: "Kamera sigurie Artnet", en: "Artnet security camera" },
  },
  {
    image: publicAssetImages.racksCabinets,
    alt: { sq: "Rack serveri Artnet", en: "Artnet server rack" },
  },
] as const;

export const publicCategories = [
  {
    id: "networking",
    slug: "networking",
    title: { sq: "Rrjete", en: "Networking" },
    description: {
      sq: "Infrastrukturë rrjeti e projektuar për shpejtësi, stabilitet dhe administrim të pastër në çdo hapësirë.",
      en: "Network infrastructure designed for speed, stability, and clean administration across every space.",
    },
    image: publicAssetImages.networking,
    theme: "#006b96",
    subcategories: [
      {
        id: "switching-routing",
        title: { sq: "Switching dhe routing", en: "Switching & routing" },
        products: [
          {
            id: "managed-gigabit-switch",
            name: { sq: "Managed Gigabit Switch", en: "Managed Gigabit Switch" },
            description: {
              sq: "Switch i menaxhueshëm për rrjete zyre, VLAN, monitorim dhe performancë të qëndrueshme.",
              en: "Managed switching for office networks, VLANs, monitoring, and dependable performance.",
            },
            image: "/images/artnet/ethernet-cable.png",
            specs: [
              { sq: "Porta Gigabit / PoE sipas nevojës", en: "Gigabit / PoE ports as needed" },
              { sq: "VLAN, QoS dhe segmentim rrjeti", en: "VLAN, QoS, and network segmentation" },
              { sq: "Konfigurim dhe dokumentim Artnet", en: "Artnet configuration and documentation" },
            ],
            tags: ["switch", "lan", "poe", "office"],
          },
          {
            id: "dual-band-access-point",
            name: { sq: "Dual Band Access Point", en: "Dual Band Access Point" },
            description: {
              sq: "Wi-Fi i pastër për ambiente pune, dyqane dhe hapësira banimi me mbulim të qëndrueshëm.",
              en: "Clean Wi-Fi for workplaces, retail, and homes with dependable coverage.",
            },
            image: "/images/artnet/ethernet-cable.png",
            specs: [
              { sq: "2.4 GHz dhe 5 GHz", en: "2.4 GHz and 5 GHz" },
              { sq: "Roaming i qetë në hapësira më të mëdha", en: "Smooth roaming in larger spaces" },
              { sq: "Montim diskret në tavan ose mur", en: "Discreet ceiling or wall mounting" },
            ],
            tags: ["wifi", "access point", "network"],
          },
          {
            id: "secure-edge-router",
            name: { sq: "Secure Edge Router", en: "Secure Edge Router" },
            description: {
              sq: "Router për lidhje të sigurta, ndarje përdoruesish dhe kontroll të qartë të trafikut.",
              en: "Routing for secure connectivity, user separation, and clear traffic control.",
            },
            image: "/images/artnet/software.png",
            specs: [
              { sq: "Firewall dhe politika qasjeje", en: "Firewall and access policies" },
              { sq: "VPN për punë nga distanca", en: "VPN for remote work" },
              { sq: "Monitorim i performancës", en: "Performance monitoring" },
            ],
            tags: ["router", "firewall", "vpn"],
          },
        ],
      },
      {
        id: "structured-cabling",
        title: { sq: "Kabllim i strukturuar", en: "Structured cabling" },
        products: [
          {
            id: "cat6-cable-system",
            name: { sq: "Cat6 Cable System", en: "Cat6 Cable System" },
            description: {
              sq: "Kabllim i organizuar për pika rrjeti që mbeten të qarta edhe pas zgjerimeve.",
              en: "Organized cabling for network points that stay clear after future expansions.",
            },
            image: "/images/artnet/ethernet-cable.png",
            specs: [
              { sq: "Pika të etiketuara", en: "Labeled endpoints" },
              { sq: "Testim pas instalimit", en: "Post-install testing" },
              { sq: "Përshtatje për zyra dhe objekte", en: "Fit for offices and facilities" },
            ],
            tags: ["cat6", "cable", "structured"],
          },
          {
            id: "patch-panel-kit",
            name: { sq: "Patch Panel Kit", en: "Patch Panel Kit" },
            description: {
              sq: "Panel dhe aksesorë për rack që e bëjnë rrjetin më të lehtë për t'u lexuar dhe mirëmbajtur.",
              en: "Panel and rack accessories that make the network easier to read and maintain.",
            },
            image: "/images/artnet/rack.jpg",
            specs: [
              { sq: "Organizim 24/48 porta", en: "24/48-port organization" },
              { sq: "Etiketim dhe diagram", en: "Labeling and diagram" },
              { sq: "Menaxhim i pastër kabllosh", en: "Clean cable management" },
            ],
            tags: ["patch panel", "rack", "lan"],
          },
        ],
      },
    ],
  },
  {
    id: "surveillance",
    slug: "surveillance",
    title: { sq: "Mbikëqyrje", en: "Surveillance" },
    description: {
      sq: "Kamera, regjistrim dhe qasje mobile për siguri të qartë pa e komplikuar përditshmërinë.",
      en: "Cameras, recording, and mobile access for clear security without complicating daily work.",
    },
    image: publicAssetImages.surveillance,
    theme: "#0f7a58",
    subcategories: [
      {
        id: "ip-cameras",
        title: { sq: "Kamera IP", en: "IP cameras" },
        products: [
          {
            id: "4mp-dome-camera",
            name: { sq: "4MP Dome Camera", en: "4MP Dome Camera" },
            description: {
              sq: "Kamerë diskrete për hyrje, korridore dhe hapësira të brendshme me pamje të qartë.",
              en: "Discreet camera for entries, corridors, and interior spaces with clear visibility.",
            },
            image: "/images/artnet/cctv-camera.png",
            specs: [
              { sq: "Rezolucion deri 4MP", en: "Up to 4MP resolution" },
              { sq: "Night vision", en: "Night vision" },
              { sq: "Montim i pastër", en: "Clean mounting" },
            ],
            tags: ["camera", "cctv", "dome"],
          },
          {
            id: "outdoor-bullet-camera",
            name: { sq: "Outdoor Bullet Camera", en: "Outdoor Bullet Camera" },
            description: {
              sq: "Kamerë e jashtme për perimetër, parkingje dhe pika hyrjeje me rezistencë ndaj motit.",
              en: "Outdoor camera for perimeters, parking, and entry points with weather resistance.",
            },
            image: "/images/artnet/cctv-camera.png",
            specs: [
              { sq: "Trup rezistent për jashtë", en: "Outdoor-rated housing" },
              { sq: "Pamje e qartë natën", en: "Clear night image" },
              { sq: "Qasje nga aplikacioni", en: "App access" },
            ],
            tags: ["outdoor", "camera", "security"],
          },
        ],
      },
      {
        id: "recording-access",
        title: { sq: "Regjistrim dhe qasje", en: "Recording & access" },
        products: [
          {
            id: "network-video-recorder",
            name: { sq: "Network Video Recorder", en: "Network Video Recorder" },
            description: {
              sq: "Regjistrim i centralizuar dhe arkivim i sigurt për sisteme të vogla dhe të mesme.",
              en: "Centralized recording and secure archiving for small and mid-size systems.",
            },
            image: "/images/artnet/software.png",
            specs: [
              { sq: "Kanale sipas projektit", en: "Channels sized to project" },
              { sq: "Playback i thjeshtë", en: "Simple playback" },
              { sq: "Qasje mobile", en: "Mobile access" },
            ],
            tags: ["nvr", "recording", "video"],
          },
          {
            id: "smart-entry-kit",
            name: { sq: "Smart Entry Kit", en: "Smart Entry Kit" },
            description: {
              sq: "Doorbell dhe kontroll hyrjeje për banesa, zyra dhe objekte me qasje të shpejtë.",
              en: "Doorbell and entry control for homes, offices, and facilities with quick access.",
            },
            image: "/images/artnet/smart-doorbell.jpg",
            specs: [
              { sq: "Video thirrje nga telefoni", en: "Video call from phone" },
              { sq: "Njoftime të menjëhershme", en: "Instant notifications" },
              { sq: "Integrim me rrjetin", en: "Network integration" },
            ],
            tags: ["doorbell", "entry", "access"],
          },
        ],
      },
    ],
  },
  {
    id: "racks-cabinets",
    slug: "racks-cabinets",
    title: { sq: "Rack & Kabinete", en: "Racks & Cabinets" },
    description: {
      sq: "Qendra teknike të organizuara, të ajrosura dhe të lehta për servisim në çdo projekt.",
      en: "Organized, ventilated technical centers that are easy to service in every project.",
    },
    image: publicAssetImages.racksCabinets,
    theme: "#203a54",
    subcategories: [
      {
        id: "wall-racks",
        title: { sq: "Rack muri", en: "Wall racks" },
        products: [
          {
            id: "wall-mount-rack",
            name: { sq: "Wall Mount Rack", en: "Wall Mount Rack" },
            description: {
              sq: "Rack kompakt për pika rrjeti, kamera dhe pajisje kryesore në hapësira të vogla.",
              en: "Compact rack for network points, cameras, and core devices in smaller spaces.",
            },
            image: "/images/artnet/rack.jpg",
            specs: [
              { sq: "6U / 9U / 12U", en: "6U / 9U / 12U" },
              { sq: "Derë me çelës", en: "Lockable door" },
              { sq: "Menaxhim kabllosh", en: "Cable management" },
            ],
            tags: ["rack", "cabinet", "wall"],
          },
          {
            id: "rack-power-module",
            name: { sq: "Rack Power Module", en: "Rack Power Module" },
            description: {
              sq: "Shpërndarje energjie për pajisjet brenda rack-ut me vendosje të sigurt.",
              en: "Power distribution for rack-mounted devices with secure placement.",
            },
            image: "/images/artnet/power-strip.png",
            specs: [
              { sq: "Priza të shumëfishta", en: "Multiple outlets" },
              { sq: "Vendosje 19 inch", en: "19-inch mounting" },
              { sq: "Etiketim sipas pajisjeve", en: "Device-based labeling" },
            ],
            tags: ["power", "rack", "pdu"],
          },
        ],
      },
      {
        id: "floor-cabinets",
        title: { sq: "Kabinete dyshemeje", en: "Floor cabinets" },
        products: [
          {
            id: "floor-server-cabinet",
            name: { sq: "Floor Server Cabinet", en: "Floor Server Cabinet" },
            description: {
              sq: "Kabinet për sisteme më të mëdha me hapësirë për switch, NVR, UPS dhe patch panel.",
              en: "Cabinet for larger systems with room for switches, NVR, UPS, and patch panels.",
            },
            image: "/images/artnet/rack.jpg",
            specs: [
              { sq: "42U ose sipas projektit", en: "42U or project-sized" },
              { sq: "Ajrosje dhe akses servisimi", en: "Ventilation and service access" },
              { sq: "Organizim profesional", en: "Professional organization" },
            ],
            tags: ["server", "cabinet", "datacenter"],
          },
          {
            id: "cable-management-kit",
            name: { sq: "Cable Management Kit", en: "Cable Management Kit" },
            description: {
              sq: "Aksesorë për rrjedhë të qartë të kabllove dhe mirëmbajtje më të shpejtë.",
              en: "Accessories for clear cable flow and faster maintenance.",
            },
            image: "/images/artnet/toolkit.png",
            specs: [
              { sq: "Horizontale dhe vertikale", en: "Horizontal and vertical" },
              { sq: "Etiketim i pikave", en: "Endpoint labeling" },
              { sq: "Pamje e pastër brenda rack-ut", en: "Clean rack interior" },
            ],
            tags: ["cable", "management", "rack"],
          },
        ],
      },
    ],
  },
  {
    id: "fiber-optics",
    slug: "fiber-optics",
    title: { sq: "Fibër optike", en: "Fiber Optics" },
    description: {
      sq: "Lidhje fiber për backbone, distanca të gjata dhe sisteme që kërkojnë kapacitet të lartë.",
      en: "Fiber connectivity for backbone links, long distances, and systems that need high capacity.",
    },
    image: publicAssetImages.fiberOptics,
    theme: "#7c3aed",
    subcategories: [
      {
        id: "fiber-cabling",
        title: { sq: "Kabllim fiber", en: "Fiber cabling" },
        products: [
          {
            id: "fiber-patch-lead",
            name: { sq: "Fiber Patch Lead", en: "Fiber Patch Lead" },
            description: {
              sq: "Patch kabllo fiber për lidhje të pastra në rack dhe nyje të rrjetit.",
              en: "Fiber patch leads for clean connections inside racks and network nodes.",
            },
            image: "/images/artnet/fiber-optic.webp",
            specs: [
              { sq: "Single-mode ose multi-mode", en: "Single-mode or multi-mode" },
              { sq: "Gjatësi sipas nevojës", en: "Lengths as needed" },
              { sq: "Lidhje LC / SC", en: "LC / SC connectors" },
            ],
            tags: ["fiber", "patch", "backbone"],
          },
          {
            id: "fiber-termination-box",
            name: { sq: "Fiber Termination Box", en: "Fiber Termination Box" },
            description: {
              sq: "Pikë fundore e mbrojtur për organizimin dhe servisimin e lidhjeve fiber.",
              en: "Protected endpoint for organizing and servicing fiber links.",
            },
            image: "/images/artnet/rack.jpg",
            specs: [
              { sq: "Mbrojtje e lidhjeve", en: "Connection protection" },
              { sq: "Etiketim i qartë", en: "Clear labeling" },
              { sq: "Instalim në rack ose mur", en: "Rack or wall install" },
            ],
            tags: ["fiber", "termination", "box"],
          },
        ],
      },
      {
        id: "fiber-active",
        title: { sq: "Pajisje aktive fiber", en: "Fiber active equipment" },
        products: [
          {
            id: "sfp-module",
            name: { sq: "SFP Module", en: "SFP Module" },
            description: {
              sq: "Module për lidhje fiber ndërmjet switch-eve, rack-eve dhe hapësirave të ndara.",
              en: "Modules for fiber links between switches, racks, and separated areas.",
            },
            image: "/images/artnet/fiber-optic.webp",
            specs: [
              { sq: "1G / 10G sipas projektit", en: "1G / 10G project fit" },
              { sq: "Kompatibilitet me switch", en: "Switch compatibility" },
              { sq: "Testim i lidhjes", en: "Link testing" },
            ],
            tags: ["sfp", "module", "fiber"],
          },
        ],
      },
    ],
  },
  {
    id: "power",
    slug: "power",
    title: { sq: "Energji", en: "Power" },
    description: {
      sq: "Furnizim, mbrojtje dhe organizim energjie për pajisje që duhet të qëndrojnë online.",
      en: "Power supply, protection, and organization for devices that need to stay online.",
    },
    image: publicAssetImages.power,
    theme: "#c2410c",
    subcategories: [
      {
        id: "power-distribution",
        title: { sq: "Shpërndarje energjie", en: "Power distribution" },
        products: [
          {
            id: "surge-protected-strip",
            name: { sq: "Surge Protected Strip", en: "Surge Protected Strip" },
            description: {
              sq: "Shirit energjie për mbrojtje dhe vendosje të pastër të pajisjeve teknike.",
              en: "Power strip for protection and clean placement of technical devices.",
            },
            image: "/images/artnet/power-strip.png",
            specs: [
              { sq: "Mbrojtje nga luhatjet", en: "Surge protection" },
              { sq: "Kabllo me gjatësi fleksibile", en: "Flexible cable length" },
              { sq: "Përshtatje për rack ose zyrë", en: "Rack or office fit" },
            ],
            tags: ["power", "surge", "strip"],
          },
          {
            id: "rack-pdu",
            name: { sq: "Rack PDU", en: "Rack PDU" },
            description: {
              sq: "PDU për shpërndarje të rregullt energjie brenda rack-ut.",
              en: "PDU for organized power distribution inside the rack.",
            },
            image: "/images/artnet/power-strip.png",
            specs: [
              { sq: "Montim 19 inch", en: "19-inch mounting" },
              { sq: "Etiketim dhe ndarje pajisjesh", en: "Device labeling and separation" },
              { sq: "Instalim i sigurt", en: "Secure installation" },
            ],
            tags: ["pdu", "rack", "power"],
          },
        ],
      },
      {
        id: "backup-power",
        title: { sq: "Energji rezervë", en: "Backup power" },
        products: [
          {
            id: "compact-ups",
            name: { sq: "Compact UPS", en: "Compact UPS" },
            description: {
              sq: "Rezervë energjie për router, switch, kamera dhe pajisje kritike.",
              en: "Backup power for routers, switches, cameras, and critical devices.",
            },
            image: "/images/artnet/power-strip.png",
            specs: [
              { sq: "Autonomi sipas ngarkesës", en: "Runtime based on load" },
              { sq: "Mbrojtje për ndërprerje", en: "Outage protection" },
              { sq: "Sinjalizim i statusit", en: "Status alerts" },
            ],
            tags: ["ups", "backup", "power"],
          },
        ],
      },
    ],
  },
  {
    id: "av-multimedia",
    slug: "av-multimedia",
    title: { sq: "AV & Multimedia", en: "AV & Multimedia" },
    description: {
      sq: "Lidhje audio-video dhe pajisje prezantimi për salla, zyra dhe ambiente moderne.",
      en: "Audio-video connectivity and presentation devices for rooms, offices, and modern spaces.",
    },
    image: publicAssetImages.avMultimedia,
    theme: "#be123c",
    subcategories: [
      {
        id: "av-cables",
        title: { sq: "Kabllo AV", en: "AV cables" },
        products: [
          {
            id: "premium-hdmi-cable",
            name: { sq: "Premium HDMI Cable", en: "Premium HDMI Cable" },
            description: {
              sq: "Kabllo HDMI për lidhje të qëndrueshme në prezantime, ekrane dhe sisteme multimedia.",
              en: "HDMI cable for stable links in presentations, displays, and multimedia systems.",
            },
            image: "/images/artnet/hdmi-cable.png",
            specs: [
              { sq: "4K sipas pajisjeve", en: "4K device-ready" },
              { sq: "Gjatësi të ndryshme", en: "Multiple lengths" },
              { sq: "Menaxhim i pastër kabllosh", en: "Clean cable handling" },
            ],
            tags: ["hdmi", "av", "multimedia"],
          },
          {
            id: "display-link-kit",
            name: { sq: "Display Link Kit", en: "Display Link Kit" },
            description: {
              sq: "Set për lidhje të ekraneve në salla takimesh, recepsione dhe hapësira pritjeje.",
              en: "Kit for display connections in meeting rooms, receptions, and waiting areas.",
            },
            image: "/images/artnet/hdmi-cable.png",
            specs: [
              { sq: "Përshtatje për TV ose projektor", en: "TV or projector fit" },
              { sq: "Vendosje diskrete", en: "Discreet placement" },
              { sq: "Testim i sinjalit", en: "Signal testing" },
            ],
            tags: ["display", "projector", "hdmi"],
          },
        ],
      },
      {
        id: "room-systems",
        title: { sq: "Sisteme sallash", en: "Room systems" },
        products: [
          {
            id: "meeting-room-av",
            name: { sq: "Meeting Room AV", en: "Meeting Room AV" },
            description: {
              sq: "Zgjidhje audio-video për takime më të qarta dhe prezantime më të rregullta.",
              en: "Audio-video solution for clearer meetings and cleaner presentations.",
            },
            image: "/images/artnet/software.png",
            specs: [
              { sq: "Ekran, kabllo dhe kontroll", en: "Display, cabling, and control" },
              { sq: "Konfigurim sipas sallës", en: "Room-based configuration" },
              { sq: "Dorëzim me udhëzime", en: "Handover with guidance" },
            ],
            tags: ["meeting", "av", "room"],
          },
        ],
      },
    ],
  },
  {
    id: "smart-home",
    slug: "smart-home",
    title: { sq: "Shtëpi smart", en: "Smart Home" },
    description: {
      sq: "Pajisje smart që ndihen natyrale: hyrje, njoftime, kontroll dhe automatizime të përditshme.",
      en: "Smart devices that feel natural: entry, alerts, control, and everyday automation.",
    },
    image: publicAssetImages.smartHome,
    theme: "#0891b2",
    subcategories: [
      {
        id: "smart-entry",
        title: { sq: "Hyrje smart", en: "Smart entry" },
        products: [
          {
            id: "video-doorbell",
            name: { sq: "Video Doorbell", en: "Video Doorbell" },
            description: {
              sq: "Doorbell smart me video, njoftime dhe komunikim direkt nga telefoni.",
              en: "Smart video doorbell with alerts and direct communication from the phone.",
            },
            image: "/images/artnet/smart-doorbell.jpg",
            specs: [
              { sq: "Video live", en: "Live video" },
              { sq: "Njoftime mobile", en: "Mobile notifications" },
              { sq: "Integrim me Wi-Fi", en: "Wi-Fi integration" },
            ],
            tags: ["doorbell", "smart home", "entry"],
          },
          {
            id: "smart-lock-interface",
            name: { sq: "Smart Lock Interface", en: "Smart Lock Interface" },
            description: {
              sq: "Kontroll hyrjeje që lidhet me pajisjet ekzistuese dhe rrjetin e objektit.",
              en: "Entry control that connects with existing devices and the site network.",
            },
            image: "/images/artnet/smart-doorbell.jpg",
            specs: [
              { sq: "Qasje e kontrolluar", en: "Controlled access" },
              { sq: "Role përdoruesish", en: "User roles" },
              { sq: "Auditim i hyrjeve", en: "Entry audit trail" },
            ],
            tags: ["smart lock", "access", "home"],
          },
        ],
      },
      {
        id: "automation",
        title: { sq: "Automatizim", en: "Automation" },
        products: [
          {
            id: "smart-control-hub",
            name: { sq: "Smart Control Hub", en: "Smart Control Hub" },
            description: {
              sq: "Qendër kontrolli për pajisje smart, skena dhe automatizime të thjeshta.",
              en: "Control hub for smart devices, scenes, and simple automations.",
            },
            image: "/images/artnet/software.png",
            specs: [
              { sq: "Skena ditore", en: "Daily scenes" },
              { sq: "Kontroll nga aplikacioni", en: "App control" },
              { sq: "Konfigurim i udhëzuar", en: "Guided configuration" },
            ],
            tags: ["automation", "hub", "smart"],
          },
        ],
      },
    ],
  },
  {
    id: "tools-accessories",
    slug: "tools-accessories",
    title: { sq: "Mjete & aksesorë", en: "Tools & Accessories" },
    description: {
      sq: "Mjetet dhe aksesorët që e bëjnë instalimin më të saktë, më të pastër dhe më të lehtë për servis.",
      en: "Tools and accessories that make installation more precise, cleaner, and easier to service.",
    },
    image: publicAssetImages.toolsAccessories,
    theme: "#64748b",
    subcategories: [
      {
        id: "installation-tools",
        title: { sq: "Mjete instalimi", en: "Installation tools" },
        products: [
          {
            id: "network-toolkit",
            name: { sq: "Network Toolkit", en: "Network Toolkit" },
            description: {
              sq: "Set praktik për terminim, testim dhe servis të instalimeve të rrjetit.",
              en: "Practical set for terminating, testing, and servicing network installations.",
            },
            image: "/images/artnet/toolkit.png",
            specs: [
              { sq: "Crimping dhe punch-down", en: "Crimping and punch-down" },
              { sq: "Tester kabllosh", en: "Cable tester" },
              { sq: "Organizim në valixhe", en: "Organized case" },
            ],
            tags: ["tools", "tester", "installation"],
          },
          {
            id: "labeling-kit",
            name: { sq: "Labeling Kit", en: "Labeling Kit" },
            description: {
              sq: "Etiketim profesional për rack, patch panel, kabllo dhe pika fundore.",
              en: "Professional labeling for racks, patch panels, cables, and endpoints.",
            },
            image: "/images/artnet/toolkit.png",
            specs: [
              { sq: "Etiketa rezistente", en: "Durable labels" },
              { sq: "Standard për servis", en: "Service-friendly standard" },
              { sq: "Skemë e dokumentuar", en: "Documented scheme" },
            ],
            tags: ["labels", "accessories", "service"],
          },
        ],
      },
      {
        id: "small-accessories",
        title: { sq: "Aksesorë të vegjël", en: "Small accessories" },
        products: [
          {
            id: "connector-pack",
            name: { sq: "Connector Pack", en: "Connector Pack" },
            description: {
              sq: "Konektorë dhe pjesë të vogla për përfundime të pastra në rrjet dhe AV.",
              en: "Connectors and small parts for clean finishes in networking and AV.",
            },
            image: "/images/artnet/ethernet-cable.png",
            specs: [
              { sq: "RJ45 dhe aksesorë", en: "RJ45 and accessories" },
              { sq: "Përshtatje për kabllo", en: "Cable fit" },
              { sq: "Rezervë për servis", en: "Service reserve" },
            ],
            tags: ["connector", "rj45", "accessories"],
          },
        ],
      },
    ],
  },
  {
    id: "hardware",
    slug: "hardware",
    title: { sq: "Harduer", en: "Hardware" },
    description: {
      sq: "Pajisje, instalim dhe pune infrastrukturore per sisteme qe duhet te vendosen me kujdes.",
      en: "Hardware, installation, and infrastructure work for systems that need precise deployment.",
    },
    image: publicAssetImages.hardware,
    theme: "#334155",
    subcategories: [
      {
        id: "workplace-hardware",
        title: { sq: "Pajisje pune", en: "Workplace hardware" },
        products: [
          {
            id: "business-workstation",
            name: { sq: "Business Workstation", en: "Business Workstation" },
            description: {
              sq: "Pajisje pune për ekipe që kanë nevojë për stabilitet dhe konfigurim të pastër.",
              en: "Work device for teams that need stability and clean configuration.",
            },
            image: "/images/artnet/hardware.png",
            specs: [
              { sq: "Specifikim sipas rolit", en: "Role-based specification" },
              { sq: "Konfigurim përdoruesi", en: "User configuration" },
              { sq: "Integrim në rrjet", en: "Network integration" },
            ],
            tags: ["hardware", "workstation", "office"],
          },
          {
            id: "peripheral-bundle",
            name: { sq: "Peripheral Bundle", en: "Peripheral Bundle" },
            description: {
              sq: "Aksesorë pune të unifikuar për setup më të rregullt në zyrë.",
              en: "Unified work accessories for a cleaner office setup.",
            },
            image: "/images/artnet/hardware.png",
            specs: [
              { sq: "Tastierë, mouse, hub", en: "Keyboard, mouse, hub" },
              { sq: "Menaxhim kabllosh", en: "Cable management" },
              { sq: "Standardizim ekipi", en: "Team standardization" },
            ],
            tags: ["peripherals", "office", "hardware"],
          },
        ],
      },
      {
        id: "system-devices",
        title: { sq: "Pajisje sistemi", en: "System devices" },
        products: [
          {
            id: "mini-control-pc",
            name: { sq: "Mini Control PC", en: "Mini Control PC" },
            description: {
              sq: "Pajisje kompakte për monitorim, panel kontrolli ose shërbime lokale.",
              en: "Compact device for monitoring, control panels, or local services.",
            },
            image: "/images/artnet/hardware.png",
            specs: [
              { sq: "Formë kompakte", en: "Compact form" },
              { sq: "Vendosje diskrete", en: "Discreet placement" },
              { sq: "Konfigurim sipas sistemit", en: "System-based configuration" },
            ],
            tags: ["mini pc", "control", "hardware"],
          },
        ],
      },
    ],
  },
  {
    id: "software",
    slug: "software",
    title: { sq: "Softuer", en: "Software" },
    description: {
      sq: "Konfigurim, monitorim dhe sisteme digjitale që e bëjnë infrastrukturën më të kuptueshme.",
      en: "Configuration, monitoring, and digital systems that make infrastructure easier to understand.",
    },
    image: publicAssetImages.software,
    theme: "#2563eb",
    subcategories: [
      {
        id: "monitoring-management",
        title: { sq: "Monitorim dhe menaxhim", en: "Monitoring & management" },
        products: [
          {
            id: "network-monitoring",
            name: { sq: "Network Monitoring", en: "Network Monitoring" },
            description: {
              sq: "Monitorim për pajisje kritike, qasje, status dhe sinjalizime të shpejta.",
              en: "Monitoring for critical devices, access, status, and quick alerts.",
            },
            image: "/images/artnet/software.png",
            specs: [
              { sq: "Pajisje dhe pika kryesore", en: "Devices and key endpoints" },
              { sq: "Sinjalizime statusi", en: "Status alerts" },
              { sq: "Raportim i thjeshtë", en: "Simple reporting" },
            ],
            tags: ["monitoring", "software", "network"],
          },
          {
            id: "device-configuration",
            name: { sq: "Device Configuration", en: "Device Configuration" },
            description: {
              sq: "Konfigurim i kontrolluar për router, switch, kamera, NVR dhe pajisje smart.",
              en: "Controlled configuration for routers, switches, cameras, NVR, and smart devices.",
            },
            image: "/images/artnet/software.png",
            specs: [
              { sq: "Role dhe qasje", en: "Roles and access" },
              { sq: "Backup konfigurimi", en: "Configuration backup" },
              { sq: "Dorëzim me dokumentim", en: "Documented handover" },
            ],
            tags: ["configuration", "software", "support"],
          },
        ],
      },
      {
        id: "business-systems",
        title: { sq: "Sisteme biznesi", en: "Business systems" },
        products: [
          {
            id: "workflow-dashboard",
            name: { sq: "Workflow Dashboard", en: "Workflow Dashboard" },
            description: {
              sq: "Panel për procese operative, pajisje dhe status pune në një pamje më të qartë.",
              en: "Dashboard for operational processes, devices, and work status in a clearer view.",
            },
            image: "/images/artnet/software.png",
            specs: [
              { sq: "Pamje e personalizuar", en: "Custom view" },
              { sq: "Të dhëna të organizuara", en: "Organized data" },
              { sq: "Mbështetje pas dorëzimit", en: "Post-handover support" },
            ],
            tags: ["dashboard", "workflow", "software"],
          },
        ],
      },
    ],
  },
] as const satisfies readonly PublicCategory[];

export const publicProducts = publicCategories;

export const publicProjects = [
  {
    id: "business-network",
    title: {
      sq: "Rrjet i strukturuar për zyrë moderne",
      en: "Structured network for a modern office",
    },
    location: {
      sq: "Biznes / zyrë",
      en: "Business / office",
    },
    summary: {
      sq: "Planifikim i pikave, rack i organizuar, kabllim i pastër dhe konfigurim për qasje stabile në të gjitha zonat e punës.",
      en: "Endpoint planning, organized rack work, clean cabling, and configuration for stable access across every work area.",
    },
    image: "/images/artnet/rack.jpg",
    metrics: [
      { value: "24/7", label: { sq: "stabilitet i rrjetit", en: "network stability" } },
      { value: "0", label: { sq: "kabllo të dukshme", en: "visible cable clutter" } },
      { value: "1", label: { sq: "pikë kontrolli", en: "control point" } },
    ],
  },
  {
    id: "security-layer",
    title: {
      sq: "Sistem sigurie për objekt komercial",
      en: "Security layer for a commercial space",
    },
    location: {
      sq: "Dyqan / objekt",
      en: "Retail / facility",
    },
    summary: {
      sq: "Vendosje strategjike e kamerave, regjistrim i centralizuar dhe qasje e shpejtë nga telefoni për menaxhim të përditshëm.",
      en: "Strategic camera placement, centralized recording, and quick mobile access for everyday management.",
    },
    image: "/images/artnet/cctv-camera.png",
    metrics: [
      { value: "360", label: { sq: "pamje e hapësirës", en: "space visibility" } },
      { value: "HD", label: { sq: "imazh i qartë", en: "clear image" } },
      { value: "App", label: { sq: "qasje mobile", en: "mobile access" } },
    ],
  },
  {
    id: "connected-home",
    title: {
      sq: "Hapësirë banimi e lidhur dhe e sigurt",
      en: "Connected and secure living space",
    },
    location: {
      sq: "Shtëpi / apartament",
      en: "Home / apartment",
    },
    summary: {
      sq: "Wi-Fi i qëndrueshëm, hyrje smart dhe pajisje të lidhura që punojnë pa penguar estetikën e ambientit.",
      en: "Stable Wi-Fi, smart entry, and connected devices that work without disturbing the look of the space.",
    },
    image: "/images/artnet/smart-doorbell.jpg",
    metrics: [
      { value: "Wi-Fi", label: { sq: "mbulim i plotë", en: "full coverage" } },
      { value: "Smart", label: { sq: "hyrje e kontrolluar", en: "controlled entry" } },
      { value: "Clean", label: { sq: "instalim minimal", en: "minimal install" } },
    ],
  },
  {
    id: "av-room",
    title: {
      sq: "Sallë takimesh me AV të integruar",
      en: "Meeting room with integrated AV",
    },
    location: {
      sq: "Zyrë / konferencë",
      en: "Office / conference",
    },
    summary: {
      sq: "Ekran, lidhje HDMI, audio-video dhe rrjet i stabilizuar për takime të qarta dhe prezantime pa pengesa.",
      en: "Display, HDMI connectivity, audio-video, and stabilized networking for clear meetings and seamless presentations.",
    },
    image: "/images/artnet/hdmi-cable.png",
    metrics: [
      { value: "4K", label: { sq: "sinjal vizual", en: "visual signal" } },
      { value: "1", label: { sq: "rrjedhë kontrolli", en: "control flow" } },
      { value: "Calm", label: { sq: "setup i pastër", en: "clean setup" } },
    ],
  },
] as const satisfies readonly PublicProject[];

export const partnerBrands = [
  {
    name: "Artly",
    logo: "/images/artnet/partners/artly.png",
  },
  {
    name: "Art Home",
    logo: "/images/artnet/partners/arthome.jpg",
  },
  {
    name: "ASSMANN Group",
    logo: "/images/artnet/partners/assmann-group.png",
  },
  {
    name: "DIGITUS by ASSMANN",
    logo: "/images/artnet/partners/digitus-by-assmann.png",
  },
  {
    name: "MONO Electric",
    logo: "/images/artnet/partners/mono-electric.webp",
  },
  {
    name: "Schneider Electric",
    logo: "/images/artnet/partners/schneider-electric.png",
  },
] as const;

export const publicCopy = {
  sq: {
    nav: {
      products: "Produkte",
      projects: "Projekte",
      contacts: "Kontaktet",
    },
    home: {
      eyebrow: "Infrastrukturë teknologjike me standard premium",
      title: "Artnet",
      subtitle:
        "Rrjete, siguri, energji dhe sisteme smart për hapësira moderne që duhet të duken pastër dhe të punojnë pa ndërprerje.",
      primaryCta: "Kontaktet",
      secondaryCta: "Shiko produktet",
      categoriesEyebrow: "Kategoritë",
      categoriesTitle: "Një ekosistem i plotë, i prezantuar qartë.",
      detailsButton: "Detajet",
      productsButton: "Produktet",
      finalTitle: "Teknologjia më e mirë ndihet e qetë.",
      finalBody:
        "Nga auditimi i hapësirës deri te dorëzimi, Artnet e kthen kompleksitetin teknik në një sistem të pastër dhe të menaxhueshëm.",
    },
    products: {
      eyebrow: "Produkte & zgjidhje",
      title: "Katalog profesional ASSMANN / DIGITUS me SKU reale.",
      subtitle: "",
      allProducts: "Të gjitha produktet",
      searchPlaceholder: "Kërko produkt, specifikim ose kategori",
      advancedFilter: "Filtër i avancuar",
      allSubcategories: "Të gjitha nënkategoritë",
      viewDetails: "Shiko detajet",
      previous: "Mbrapa",
      next: "Përpara",
      specifications: "Specifikimet",
      noResults: "Nuk u gjet produkt për këtë kërkim.",
      close: "Mbyll",
    },
    projects: {
      eyebrow: "Projekte",
      title: "Instalime të menduara për hapësira që punojnë çdo ditë.",
      subtitle:
        "Çdo projekt balancohet mes performancës teknike, estetikës së pastër dhe mirëmbajtjes afatgjatë.",
      detailLabel: "Qasja e projektit",
    },
    about: {
      eyebrow: "Rreth Artnet",
      title: "Ne ndërtojmë shtresën teknologjike që hapësira të funksionojë pa zhurmë.",
      intro:
        "Artnet kombinon planifikimin teknik, instalimin në terren dhe konfigurimin e kujdesshëm për biznese dhe shtëpi që kërkojnë standard modern.",
      principles: [
        "Projektim i qartë para instalimit",
        "Pajisje të zgjedhura për jetëgjatësi",
        "Kabllim i pastër dhe i dokumentuar",
        "Mbështetje pas dorëzimit",
      ],
      capabilityTitle: "Nga rrjeti bazë deri te kontrolli smart.",
      capabilityBody:
        "Ekipi ynë mendon për gjithë zinxhirin: furnizim, instalim, konfigurim, testim dhe dorëzim me udhëzime të qarta.",
    },
    contact: {
      eyebrow: "Kontaktet",
      title: "Flasim për hapësirën tuaj teknologjike.",
      intro:
        "Na dërgoni një ide, një problem rrjeti, një plan objekti ose një kërkesë për sistem sigurie.",
      social: "Social media",
      phoneNumbers: "Telefonat",
      emails: "Email",
      mapTitle: "Lokacioni",
      partnersTitle: "Marka dhe platforma me të cilat punojmë",
      partnersBody:
        "Zgjedhim pajisje dhe ekosisteme që përshtaten me projektin, mirëmbahen lehtë dhe rriten me hapësirën.",
      aboutTitle: "Rreth Artnet",
      aboutBody:
        "Artnet është partner teknik për rrjete, kamera, rack, fiber, energji, AV dhe sisteme smart. Qëllimi ynë është një instalim që duket minimal dhe funksionon me disiplinë.",
    },
    quote: {
      eyebrow: "Konsultë",
      title: "Kërko konsultë teknike",
      description:
        "Përshkruani rrjetin, sistemin e sigurisë ose pajisjet që dëshironi të instaloni. Ekipi ynë do ta shqyrtojë kërkesën.",
      direct: "Kontakt direkt",
    },
  },
  en: {
    nav: {
      products: "Products",
      projects: "Projects",
      contacts: "Contacts",
    },
    home: {
      eyebrow: "Premium technology infrastructure",
      title: "Artnet",
      subtitle:
        "Networks, security, power, and smart systems for modern spaces that need to look clean and run without interruption.",
      primaryCta: "Contacts",
      secondaryCta: "Explore products",
      categoriesEyebrow: "Categories",
      categoriesTitle: "A complete ecosystem, presented with clarity.",
      detailsButton: "Details",
      productsButton: "Products",
      finalTitle: "The best technology feels calm.",
      finalBody:
        "From space audit to handover, Artnet turns technical complexity into a clean, manageable system.",
    },
    products: {
      eyebrow: "Products & solutions",
      title: "A professional ASSMANN / DIGITUS catalog with real SKUs.",
      subtitle: "",
      allProducts: "All Products",
      searchPlaceholder: "Search product, specification, or category",
      advancedFilter: "Advanced filter",
      allSubcategories: "All subcategories",
      viewDetails: "View details",
      previous: "Previous",
      next: "Next",
      specifications: "Specifications",
      noResults: "No product matched this search.",
      close: "Close",
    },
    projects: {
      eyebrow: "Projects",
      title: "Installations designed for spaces that work every day.",
      subtitle:
        "Every project balances technical performance, clean aesthetics, and long-term maintenance.",
      detailLabel: "Project approach",
    },
    about: {
      eyebrow: "About Artnet",
      title: "Infrastructure for connected spaces.",
      intro:
        "Artnet works across networking, surveillance, infrastructure, hardware, services, and technology solutions.",
      principles: [
        "Clear design before installation",
        "Equipment selected for longevity",
        "Clean and documented cabling",
        "Support after handover",
      ],
      capabilityTitle: "Clean systems. Precise deployment.",
      capabilityBody:
        "From structured networks to camera systems and deployment work, every layer is planned to stay stable and easy to manage.",
    },
    contact: {
      eyebrow: "Contacts",
      title: "Let’s talk about your technology space.",
      intro:
        "Send us an idea, a network issue, a building plan, or a security system request.",
      social: "Social media",
      phoneNumbers: "Phone numbers",
      emails: "Emails",
      mapTitle: "Location",
      partnersTitle: "Brands and platforms we work with",
      partnersBody:
        "We select devices and ecosystems that fit the project, stay serviceable, and scale with the space.",
      aboutTitle: "About Artnet",
      aboutBody:
        "Artnet delivers networking, surveillance, infrastructure, hardware services, and technology solutions from Kosovo with an international standard.",
    },
    quote: {
      eyebrow: "Consult",
      title: "Request a technical consult",
      description:
        "Describe the network, security system, or devices you want to install. Our team will review the request.",
      direct: "Direct contact",
    },
  },
} as const;

export function localizeText(value: LocalizedText, locale: Locale) {
  return value[locale];
}

export function getLocalizedCategories(locale: Locale): LocalizedCategory[] {
  return publicCategories.map((category) => {
    const title = localizeText(category.title, locale);
    const shortTitle = title;

    return {
      id: category.id,
      slug: category.slug,
      title,
      shortTitle,
      description: localizeText(category.description, locale),
      image: category.image,
      theme: category.theme,
      subcategories: category.subcategories.map((subcategory) => {
        const subcategoryTitle = localizeText(subcategory.title, locale);

        return {
          id: subcategory.id,
          title: subcategoryTitle,
          products: subcategory.products.map((product) => ({
            id: product.id,
            name: localizeText(product.name, locale),
            description: localizeText(product.description, locale),
            image: product.image,
            specs: product.specs.map((spec) => localizeText(spec, locale)),
            tags: product.tags,
            categorySlug: category.slug,
            categoryTitle: title,
            subcategoryId: subcategory.id,
            subcategoryTitle,
          })),
        };
      }),
    };
  });
}

export function getLocalizedProducts(locale: Locale) {
  return getLocalizedCategories(locale).map((category) => ({
    id: category.id,
    title: category.title,
    eyebrow: category.shortTitle,
    summary: category.description,
    description: category.description,
    image: category.image,
    specs: category.subcategories.map((subcategory) => subcategory.title).slice(0, 3),
  }));
}

export function getLocalizedProjects(locale: Locale) {
  return publicProjects.map((project) => ({
    ...project,
    title: localizeText(project.title, locale),
    location: localizeText(project.location, locale),
    summary: localizeText(project.summary, locale),
    metrics: project.metrics.map((metric) => ({
      ...metric,
      label: localizeText(metric.label, locale),
    })),
  }));
}
