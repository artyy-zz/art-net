import Image from "next/image";
import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import {
  partnerBrands,
  publicBrand,
  publicContact,
  publicCopy,
} from "@/data/public-site";
import { GOOGLE_MAPS_EMBED_URL } from "@/lib/company";
import { locales, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata(locale as Locale, "contact");
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const copy = publicCopy[typedLocale];
  const socials = [
    { label: "Instagram", href: publicContact.instagram },
    { label: "Facebook", href: publicContact.facebook },
  ];
  const mapsUrl = "https://maps.app.goo.gl/MwSfzJTzXoKHsDUW8";

  return (
    <div className="bg-white">
      <section className="px-4 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
              {copy.contact.eyebrow}
            </p>
            <h1 className="mt-5 max-w-5xl break-words font-display text-5xl font-semibold leading-[0.98] text-[var(--color-foreground)] md:text-7xl">
              {copy.contact.title}
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
              {copy.contact.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 md:px-10 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-[38px] border border-black/8 bg-white p-6 shadow-[0_24px_75px_rgba(8,27,42,0.09)] sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { name: publicBrand.name, logo: publicBrand.logo, width: 132 },
                { name: "Art Home", logo: "/images/artnet/partners/arthome.jpg", width: 112 },
                { name: "Artly", logo: "/images/artnet/partners/artly.png", width: 78 },
              ].map((brand) => (
                <div
                  key={brand.name}
                  className="inline-flex h-16 items-center justify-center rounded-[18px] border border-black/8 bg-white px-3 shadow-[0_12px_32px_rgba(8,27,42,0.08)]"
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={brand.width}
                    height={48}
                    className="max-h-10 w-auto object-contain"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  {copy.contact.social}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8fcfe] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                    >
                      {social.label}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  {copy.contact.phoneNumbers}
                </p>
                <div className="mt-4 space-y-3">
                  {publicContact.phoneNumbers.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/[\s/]/g, "")}`}
                      className="flex items-center gap-3 rounded-[22px] border border-black/8 bg-[#f8fcfe] p-4 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)]"
                    >
                      <Phone className="h-5 w-5 shrink-0 text-[var(--color-accent-strong)]" />
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  {copy.contact.emails}
                </p>
                <div className="mt-4 space-y-3">
                  {publicContact.emails.map((email) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="flex min-w-0 items-center gap-3 rounded-[22px] border border-black/8 bg-[#f8fcfe] p-4 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)]"
                    >
                      <Mail className="h-5 w-5 shrink-0 text-[var(--color-accent-strong)]" />
                      <span className="break-all">{email}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="overflow-hidden rounded-[38px] border border-black/8 bg-[#f8fcfe] p-2 shadow-[0_24px_75px_rgba(8,27,42,0.09)]">
            <div className="flex items-start gap-4 px-5 py-4">
              <span className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
                  {copy.contact.mapTitle}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="text-sm leading-6 text-[var(--color-muted)]">
                    {publicContact.address}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                  >
                    {typedLocale === "sq" ? "Hape ne Google Maps" : "Open in Google Maps"}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            <iframe
              title={
                typedLocale === "sq" ? "Harta e lokacionit ArtNet" : "ArtNet location map"
              }
              src={GOOGLE_MAPS_EMBED_URL}
              className="h-[420px] w-full rounded-[30px] border-0 sm:h-[560px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
              {typedLocale === "sq" ? "Partnerë" : "Partners"}
            </p>
            <h2 className="mt-4 break-words font-display text-4xl font-semibold leading-[1.04] text-[var(--color-foreground)] md:text-6xl">
              {copy.contact.partnersTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--color-muted)]">
              {copy.contact.partnersBody}
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partnerBrands.map((brand) => (
              <div
                key={brand.name}
                className="flex min-h-32 items-center justify-center rounded-[26px] border border-black/8 bg-[#f8fcfe] px-6 py-6 shadow-[0_16px_46px_rgba(8,27,42,0.06)]"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={220}
                  height={100}
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="max-h-20 w-auto max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-18 sm:px-6 md:px-10 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[42px] bg-[var(--color-panel)] p-8 text-white shadow-[0_30px_90px_rgba(2,14,24,0.28)] sm:p-10 md:p-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
              {publicBrand.name}
            </p>
            <h2 className="mt-5 break-words font-display text-4xl font-semibold leading-[1.04] md:text-6xl">
              {copy.contact.aboutTitle}
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-8 text-white/72 lg:justify-self-end">
            {copy.contact.aboutBody}
          </p>
        </div>
      </section>
    </div>
  );
}
