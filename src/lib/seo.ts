import type { Metadata } from "next";
import { publicBrand } from "@/data/public-site";
import { COMPANY } from "@/lib/company";
import { locales, type Locale } from "@/lib/i18n";
import { productionSiteUrl } from "@/lib/site-url";

export const siteUrl = productionSiteUrl;
export const metadataBase = new URL(siteUrl);
export const siteName = publicBrand.name;
export const socialPreviewPath = "/social-preview";

const defaultDescription =
  "Artnet designs and installs premium networks, security systems, smart devices, and technology infrastructure for modern homes and businesses.";

export const rootMetadata: Metadata = {
  metadataBase,
  applicationName: siteName,
  title: {
    default: "Artnet | Networks, Security & Smart Systems",
    template: "%s",
  },
  description: defaultDescription,
  keywords: [
    "Artnet",
    "network installation Kosovo",
    "security cameras Kosovo",
    "smart Kosovo",
    "structured cabling",
    "IT infrastructure",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: COMPANY.documents.legalName,
  publisher: COMPANY.documents.legalName,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Artnet | Networks, Security & Smart Systems",
    description: defaultDescription,
    url: "/sq",
    siteName,
    locale: "sq_AL",
    alternateLocale: ["en_GB"],
    type: "website",
    images: [
      {
        url: socialPreviewPath,
        width: 1200,
        height: 630,
        alt: "Artnet technology infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artnet | Networks, Security & Smart Systems",
    description: defaultDescription,
    images: [
      {
        url: socialPreviewPath,
        alt: "Artnet technology infrastructure",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export type PublicPage =
  | "home"
  | "about"
  | "products"
  | "services"
  | "projects"
  | "contact"
  | "quote";

const routePaths = {
  home: "",
  about: "/about",
  products: "/products",
  services: "/services",
  projects: "/projects",
  contact: "/contact",
  quote: "/quote",
} as const satisfies Record<PublicPage, string>;

const baseKeywords = [
  "Artnet",
  "IT infrastructure",
  "network installation",
  "CCTV installation",
  "smart systems",
  "structured cabling",
];

const pageSeo = {
  sq: {
    home: {
      title: "Artnet | Rrjete, siguri dhe sisteme smart",
      description:
        "Artnet projekton dhe instalon rrjete, kamera sigurie, pajisje smart dhe infrastrukturë teknologjike për biznese dhe shtëpi moderne.",
      keywords: ["rrjete në Kosovë", "kamera sigurie Kosovë", "smart Kosovë"],
    },
    about: {
      title: "Rreth Artnet | Infrastrukturë teknologjike moderne",
      description:
        "Njihuni me Artnet, ekip teknik për rrjete, sisteme sigurie, kabllim të strukturuar dhe instalime smart.",
      keywords: ["rreth Artnet", "instalime teknologjike Kosovë"],
    },
    products: {
      title: "Produkte teknologjike | Artnet",
      description:
        "Shikoni produktet dhe zgjidhjet Artnet për rrjete, siguri, kabllo, aksesore, software dhe hapësira smart.",
      keywords: ["produkte rrjeti", "kamera IP", "kabllo ethernet", "fiber patch"],
    },
    services: {
      title: "Shërbime teknologjike | Artnet",
      description:
        "Shërbime Artnet për instalim rrjeti, CCTV, fibër optike, WiFi, mirëmbajtje hardware, website, ecommerce, ERP, hosting, SEO dhe UI/UX.",
      keywords: ["instalim rrjeti", "instalim CCTV", "website development", "ERP", "hosting"],
    },
    projects: {
      title: "Projekte teknologjike | Artnet",
      description:
        "Projekte Artnet për zyra, objekte komerciale dhe hapësira banimi me rrjete, siguri dhe sisteme smart.",
      keywords: ["projekte rrjeti", "instalime CCTV", "smart office"],
    },
    contact: {
      title: "Kontakt | Artnet",
      description:
        "Kontaktoni Artnet për rrjete, kamera sigurie, instalime smart, kabllim të strukturuar dhe mbështetje teknike.",
      keywords: ["kontakt Artnet", "rrjete Kosovë kontakt"],
    },
    quote: {
      title: "Kërko konsultë teknike | Artnet",
      description:
        "Dërgoni kërkesën tuaj për rrjet, sistem sigurie, pajisje smart ose instalim teknologjik dhe ekipi i Artnet do ta shqyrtojë.",
      keywords: ["konsultë teknike", "ofertë rrjeti", "ofertë kamera sigurie"],
    },
  },
  en: {
    home: {
      title: "Artnet | Networks, Security & Smart Systems",
      description:
        "Artnet designs and installs networks, security cameras, smart devices, and technology infrastructure for modern homes and businesses.",
      keywords: ["network installation Kosovo", "security cameras Kosovo", "smart Kosovo"],
    },
    about: {
      title: "About Artnet | Modern technology infrastructure",
      description:
        "Meet Artnet, a technical team for networks, security systems, structured cabling, and smart installations.",
      keywords: ["about Artnet", "technology installation Kosovo"],
    },
    products: {
      title: "Technology Products | Artnet",
      description:
        "Explore Artnet products and solutions for networks, security, cables, accessories, software, and smart spaces.",
      keywords: ["network products", "IP cameras", "ethernet cable", "fiber patch"],
    },
    services: {
      title: "Technology Services | Artnet",
      description:
        "Artnet services for network installation, CCTV, fiber optics, WiFi setup, hardware maintenance, website development, ecommerce, ERP, hosting, SEO, and UI/UX.",
      keywords: ["network installation", "CCTV installation", "website development", "ERP", "hosting"],
    },
    projects: {
      title: "Technology Projects | Artnet",
      description:
        "Artnet projects for offices, commercial facilities, and homes with networks, security, and smart systems.",
      keywords: ["network projects", "CCTV installation", "smart office"],
    },
    contact: {
      title: "Contact | Artnet",
      description:
        "Contact Artnet for networks, security cameras, smart installations, structured cabling, and technical support.",
      keywords: ["contact Artnet", "network Kosovo contact"],
    },
    quote: {
      title: "Request a Technical Consult | Artnet",
      description:
        "Send your request for a network, security system, smart device, or technology installation and the Artnet team will review it.",
      keywords: ["technical consult", "network quote", "security camera quote"],
    },
  },
} as const satisfies Record<
  Locale,
  Record<PublicPage, { title: string; description: string; keywords: readonly string[] }>
>;

export function getPublicRoutePath(page: PublicPage) {
  return routePaths[page];
}

export function getLocalizedPath(locale: Locale, page: PublicPage) {
  return `/${locale}${routePaths[page]}`;
}

export function getAbsoluteUrl(path: string) {
  return new URL(path, metadataBase).toString();
}

export function getAlternateLanguages(page: PublicPage) {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, getLocalizedPath(locale, page)]),
  );

  return {
    ...languages,
    "x-default": getLocalizedPath("sq", page),
  };
}

function getOgLocale(locale: Locale) {
  return locale === "sq" ? "sq_AL" : "en_GB";
}

export function buildPageMetadata(locale: Locale, page: PublicPage): Metadata {
  const seo = pageSeo[locale][page];
  const path = getLocalizedPath(locale, page);
  const socialAlt =
    locale === "sq"
      ? "Artnet - rrjete, siguri dhe sisteme smart"
      : "Artnet - networks, security, and smart systems";

  return {
    title: seo.title,
    description: seo.description,
    keywords: [...baseKeywords, ...seo.keywords],
    alternates: {
      canonical: path,
      languages: getAlternateLanguages(page),
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: path,
      siteName,
      locale: getOgLocale(locale),
      alternateLocale: locales
        .filter((alternateLocale) => alternateLocale !== locale)
        .map(getOgLocale),
      type: "website",
      images: [
        {
          url: socialPreviewPath,
          width: 1200,
          height: 630,
          alt: socialAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: socialPreviewPath,
          alt: socialAlt,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function buildLoginMetadata(locale: Locale): Metadata {
  const title = locale === "sq" ? "Hyr në ERP" : "ERP Login";
  const description =
    locale === "sq"
      ? "Qasje e mbrojtur për ekipin e Artnet."
      : "Protected access for the Artnet team.";

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/login`,
      languages: {
        sq: "/sq/login",
        en: "/en/login",
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function getStructuredData(locale: Locale) {
  const inLanguage = locale === "sq" ? "sq" : "en";
  const organizationId = `${siteUrl}/#organization`;
  const localBusinessId = `${siteUrl}/#localbusiness`;
  const websiteId = `${siteUrl}/#website`;
  const logoUrl = getAbsoluteUrl(publicBrand.logo);
  const imageUrl = getAbsoluteUrl("/images/artnet/ethernet-cable.png");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteName,
        legalName: COMPANY.documents.legalName,
        alternateName: ["Artnet Kosovo", "Artnet KS"],
        url: siteUrl,
        logo: logoUrl,
        image: imageUrl,
        email: COMPANY.email,
        telephone: COMPANY.phone,
        sameAs: [COMPANY.instagram, COMPANY.facebook],
      },
      {
        "@type": ["LocalBusiness", "ProfessionalService"],
        "@id": localBusinessId,
        name: siteName,
        legalName: COMPANY.documents.legalName,
        alternateName: "Artnet KS",
        url: siteUrl,
        image: imageUrl,
        logo: logoUrl,
        telephone: COMPANY.phone,
        email: COMPANY.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: COMPANY.address,
          addressLocality: "Ferizaj",
          addressRegion: "Kosovë",
          addressCountry: "XK",
        },
        areaServed: [
          {
            "@type": "Country",
            name: "Kosovë",
          },
          {
            "@type": "AdministrativeArea",
            name: "Kosovë",
          },
        ],
        priceRange: "$$",
        sameAs: [COMPANY.instagram, COMPANY.facebook],
        parentOrganization: {
          "@id": organizationId,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteName,
        alternateName: "Artnet KS",
        url: siteUrl,
        inLanguage,
        publisher: {
          "@id": organizationId,
        },
      },
    ],
  };
}
