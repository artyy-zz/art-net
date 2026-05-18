import { FurnitureCategory } from "@prisma/client";

export const COMPANY = {
  name: "Artnet",
  phone: "049 160 740",
  email: "bujar.bela@artnet-ks.com",
  address: "rr. Dardania, Fushe Kosove 12000, Kosovo",
  documents: {
    legalName: "Artnet",
    address: "rr. Dardania, Fushe Kosove 12000, Kosovo",
    phone: "049 160 740",
    email: "bujar.bela@artnet-ks.com",
    nui: null,
    vatNumber: null,
    bankAccounts: [
      "BPB: 1300001004256511",
    ],
  },
  instagram: "https://www.instagram.com/artnet_shpk?igsh=MTFjdHdqYmxtMW15ZQ==",
  instagramUsername: "@artnet_shpk",
  facebook: "https://www.facebook.com/share/1E13vUCTS8/?mibextid=wwXIfr",
  facebookUsername: "Artnet",
} as const;

export const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d473.3770458239536!2d21.108567187813556!3d42.64350624647025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13549facfae7e1f5%3A0x2b9bf56a90b7ce46!2sART%20NET!5e1!3m2!1sen!2sus!4v1779052252279!5m2!1sen!2sus";

export const categoryCopy: Record<
  FurnitureCategory,
  { titleSq: string; titleEn: string; bodySq: string; bodyEn: string }
> = {
  KITCHENS: {
    titleSq: "Kuzhina",
    titleEn: "Kitchens",
    bodySq:
      "Kompozime funksionale me ruajtje inteligjente, sipërfaqe cilësore dhe detaje të pastra.",
    bodyEn:
      "Functional compositions with intelligent storage, quality surfaces, and clean detailing.",
  },
  TABLES: {
    titleSq: "Tavolina",
    titleEn: "Tables",
    bodySq:
      "Tavolina ngrënieje dhe pune me kombinim të drurit të ngrohtë dhe bazave të qëndrueshme.",
    bodyEn:
      "Dining and work tables pairing warm wood with durable foundations.",
  },
  WARDROBES: {
    titleSq: "Garderoba",
    titleEn: "Wardrobes",
    bodySq:
      "Sisteme të personalizuara me dyer praktike, ndriçim dhe organizim efikas.",
    bodyEn:
      "Custom systems with practical doors, integrated lighting, and efficient organization.",
  },
  CUSTOM: {
    titleSq: "Mobilje me porosi",
    titleEn: "Made-to-measure furniture",
    bodySq:
      "Zgjidhje unike për sallone, hotele, zyra dhe projekte të tjera biznesi.",
    bodyEn:
      "Unique solutions for living rooms, hotels, offices, and other business projects.",
  },
};
