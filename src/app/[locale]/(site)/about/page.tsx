import Image from "next/image";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getLocalizedProducts, publicBrand, publicCopy } from "@/data/public-site";
import { getDictionary, locales, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata(locale as Locale, "about");
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const copy = publicCopy[typedLocale];
  const products = getLocalizedProducts(typedLocale);

  return (
    <div className="bg-white">
      <section className="px-4 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
              {copy.about.eyebrow}
            </p>
            <h1 className="mt-5 max-w-5xl break-words font-display text-5xl font-semibold leading-[0.98] text-[var(--color-foreground)] md:text-7xl">
              {copy.about.title}
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
              {copy.about.intro}
            </p>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-[42px] bg-[linear-gradient(180deg,#f8fcfe_0%,#e8f6fb_100%)] shadow-[0_30px_90px_rgba(8,27,42,0.12)]">
            <div className="industrial-grid absolute inset-0 opacity-55" />
            <Image
              src="/images/artnet/toolkit.png"
              alt={typedLocale === "sq" ? "Mjete teknike ArtNet" : "ArtNet technical tools"}
              fill
              preload
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-contain p-8 md:p-12"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[36px] bg-[var(--color-panel)] p-8 text-white shadow-[0_26px_80px_rgba(2,14,24,0.26)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
              {publicBrand.name}
            </p>
            <h2 className="mt-5 break-words font-display text-4xl font-semibold leading-[1.05] md:text-5xl">
              {copy.about.capabilityTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/72">
              {copy.about.capabilityBody}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.about.principles.map((principle) => (
              <div
                key={principle}
                className="flex min-h-32 items-start gap-4 rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_54px_rgba(8,27,42,0.08)]"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[var(--color-accent)]" />
                <p className="text-lg font-semibold leading-7 text-[var(--color-foreground)]">
                  {principle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
              {typedLocale === "sq" ? "Aftësitë" : "Capabilities"}
            </p>
            <h2 className="mt-5 break-words font-display text-4xl font-semibold leading-[1.04] text-[var(--color-foreground)] md:text-6xl">
              {dict.about.craftsmanshipTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-muted)]">
              {dict.about.craftsmanshipBody}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <article
                key={product.id}
                className="rounded-[30px] border border-black/8 bg-[#f8fcfe] p-6 shadow-[0_18px_54px_rgba(8,27,42,0.08)]"
              >
                <div className="relative mb-6 aspect-square rounded-[24px] bg-white">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(min-width: 768px) 28vw, 100vw"
                    className="object-contain p-7"
                  />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
                  {product.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight text-[var(--color-foreground)]">
                  {product.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                  {product.summary}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-18 sm:px-6 md:px-10 md:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[36px] border border-black/8 bg-white p-8 shadow-[0_24px_75px_rgba(8,27,42,0.09)] sm:p-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="break-words font-display text-3xl font-semibold leading-[1.08] text-[var(--color-foreground)] md:text-5xl">
              {typedLocale === "sq"
                ? "Gati për një sistem më të pastër?"
                : "Ready for a cleaner system?"}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
              {typedLocale === "sq"
                ? "E nisim me hapësirën dhe objektivin, pastaj ndërtojmë planin teknik."
                : "We start with the space and the goal, then build the technical plan."}
            </p>
          </div>
          <div className="rounded-[24px] border border-black/8 bg-[#f8fcfe] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {typedLocale === "sq" ? "Viti i themelimit" : "Year founded"}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
              {publicBrand.foundedYear}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
