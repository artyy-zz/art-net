import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Camera,
  Database,
  Globe2,
  HardDrive,
  LayoutTemplate,
  Network,
  PenTool,
  Search,
  Server,
  ShieldCheck,
  ShoppingCart,
  Wifi,
  Wrench,
} from "lucide-react";
import { publicAssetImages, publicBrand, publicCopy } from "@/data/public-site";
import { locales, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

const serviceCopy = {
  sq: {
    eyebrow: "Shërbime",
    title: "Shërbime teknike dhe digjitale",
    description:
      "Instalim, mirëmbajtje dhe zhvillim për infrastrukturën teknologjike që duhet të funksionojë qartë nga pajisja fizike deri te sistemi online.",
    infrastructure: "Infrastrukturë",
    digital: "Zhvillim digjital",
    contact: "Kërko konsultën",
    items: [
      ["Instalim rrjeti", "Projektim, kabllim, konfigurim dhe dokumentim rrjeti."],
      ["Instalim CCTV / mbikëqyrje", "Kamera, NVR, qasje në distancë dhe organizim regjistrimi."],
      ["Setup i rack-ut dhe kabinetit", "Rack-e të pastra, patching, ventilim dhe menaxhim kabllosh."],
      ["Instalim i fibrës optike", "Shtrirje, terminim, saldim dhe testim i lidhjeve fiber."],
      ["Setup WiFi", "Mbulim WiFi, roaming, kanale dhe kontroll për hapësira pune."],
      ["Mirëmbajtje hardueri", "Kontrolle, ndërrime pajisjesh dhe mirëmbajtje operative."],
      ["Zhvillim websites", "Faqe prezantuese të shpejta, responsive dhe të mirëstrukturuara."],
      ["Ecommerce websites", "Dyqane online me katalog, porosi dhe rrjedha shitjeje."],
      ["Sisteme ERP", "Sisteme për procese biznesi, role, dokumente dhe raporte."],
      ["Hosting dhe domaine", "Domaine, hosting, email dhe menaxhim teknik i publikimit."],
      ["SEO", "Strukturë teknike dhe përmbajtje që ndihmon zbulueshmërinë."],
      ["Dizajn UI/UX", "Prototipe, rrjedha përdoruesi dhe ndërfaqe të pastra."],
    ],
  },
  en: {
    eyebrow: "Services",
    title: "Technical and digital services",
    description:
      "Installation, maintenance, and development for technology infrastructure that needs to work cleanly from physical hardware to online systems.",
    infrastructure: "Infrastructure",
    digital: "Digital development",
    contact: "Request a consult",
    items: [
      ["Network Installation", "Design, cabling, configuration, and network documentation."],
      ["CCTV / Surveillance Installation", "Cameras, NVRs, remote access, and recording setup."],
      ["Rack & Cabinet Setup", "Clean racks, patching, ventilation, and cable management."],
      ["Fiber Optic Installation", "Fiber runs, termination, splicing, and link testing."],
      ["WiFi Setup", "Coverage, roaming, channel planning, and management for workspaces."],
      ["Hardware Maintenance", "Checks, device replacements, and operational maintenance."],
      ["Website Development", "Fast, responsive, well-structured presentation websites."],
      ["Ecommerce Websites", "Online stores with catalog, ordering, and sales flows."],
      ["ERP Systems", "Systems for business processes, roles, documents, and reports."],
      ["Hosting & Domains", "Domains, hosting, email, and technical publishing management."],
      ["SEO", "Technical structure and content that supports discoverability."],
      ["UI/UX Design", "Prototypes, user flows, and clean interface design."],
    ],
  },
} as const;

const icons = [
  Network,
  Camera,
  Server,
  ShieldCheck,
  Wifi,
  Wrench,
  Globe2,
  ShoppingCart,
  Database,
  HardDrive,
  Search,
  PenTool,
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata(locale as Locale, "services");
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const copy = serviceCopy[typedLocale];
  const publicLabels = publicCopy[typedLocale];
  const infrastructure = copy.items.slice(0, 6);
  const digital = copy.items.slice(6);

  return (
    <div className="bg-[#f7fafc]">
      <section className="border-b border-[var(--color-line)] bg-white px-4 py-12 sm:px-6 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center">
          <div>
            <nav className="mb-12 flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--color-muted)]">
              <Link href={`/${typedLocale}`} className="hover:text-[var(--color-foreground)]">
                {publicBrand.name}
              </Link>
              <span>/</span>
              <span className="text-[var(--color-foreground)]">{publicLabels.nav.services}</span>
            </nav>
            <p className="text-sm font-semibold text-[var(--color-accent-strong)]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight text-[var(--color-foreground)] md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
              {copy.description}
            </p>
            <Link
              href={`/${typedLocale}/contact`}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[var(--color-foreground)] px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--color-accent-strong)]"
            >
              {copy.contact}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-[var(--color-line)] bg-white shadow-[0_24px_70px_rgba(8,27,42,0.08)]">
            <Image
              src={publicAssetImages.software}
              alt={copy.title}
              fill
              preload
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-contain p-10"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:gap-10">
          {[
            [copy.infrastructure, infrastructure],
            [copy.digital, digital],
          ].map(([title, services], groupIndex) => (
            <div key={title as string} className="min-w-0">
              <h2 className="text-2xl font-semibold leading-tight text-[var(--color-foreground)]">
                {title as string}
              </h2>
              <div className="mt-6 grid gap-4">
                {(services as readonly (readonly [string, string])[]).map((service, index) => {
                  const Icon = icons[groupIndex * 6 + index] ?? LayoutTemplate;

                  return (
                    <article
                      key={service[0]}
                      className="grid grid-cols-[48px_1fr] gap-4 rounded-lg border border-[var(--color-line)] bg-white p-5 shadow-[0_12px_30px_rgba(8,27,42,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(0,107,150,0.24)] hover:shadow-[0_18px_42px_rgba(8,27,42,0.08)]"
                    >
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base font-semibold leading-6 text-[var(--color-foreground)]">
                          {service[0]}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-[var(--color-muted)]">
                          {service[1]}
                        </span>
                      </span>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
