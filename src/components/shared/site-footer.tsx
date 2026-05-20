import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/shared/logo";
import { publicBrand, publicContact, publicCopy } from "@/data/public-site";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const copy = publicCopy[locale];
  const navItems = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/products`, label: copy.nav.products },
    { href: `/${locale}/services`, label: copy.nav.services },
    { href: `/${locale}/projects`, label: copy.nav.projects },
    { href: `/${locale}/contact`, label: copy.nav.contacts },
  ];

  return (
    <footer className="reveal border-t border-black/8 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div className="max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
              {locale === "sq" ? "Navigim" : "Navigation"}
            </p>
            <nav className="mt-4 grid gap-2 text-sm font-medium text-[var(--color-foreground)] sm:grid-cols-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md py-1.5 transition hover:translate-x-0.5 hover:text-[var(--color-accent-strong)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="md:justify-self-end md:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
              {locale === "sq" ? "Kontakt" : "Contact"}
            </p>
            <div className="mt-4 space-y-1.5 break-words text-sm leading-6 text-[var(--color-muted)]">
              {publicContact.phoneNumbers.map((phone) => (
                <p key={phone}>{phone}</p>
              ))}
              {publicContact.emails.map((email) => (
                <p key={email}>{email}</p>
              ))}
              <p>{publicContact.address}</p>
            </div>
          </div>
        </div>
        <div className="mt-9 flex flex-col gap-6 border-t border-black/8 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Logo href={`/${locale}`} />
              {[
                { name: "Art Home", logo: "/images/artnet/partners/arthome.jpg", width: 96 },
                { name: "Artly", logo: "/images/artnet/partners/artly.png", width: 66 },
              ].map((brand) => (
                <span
                  key={brand.name}
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-black/8 bg-white px-3 shadow-[0_10px_24px_rgba(8,27,42,0.05)]"
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={brand.width}
                    height={34}
                    className="max-h-8 w-auto object-contain"
                  />
                </span>
              ))}
            </div>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
              {locale === "sq"
                ? "Rrjete, siguri dhe sisteme smart për hapësira që kërkojnë teknologji të pastër dhe të besueshme."
                : "Networks, security, and smart systems for spaces that need clean, reliable technology."}
            </p>
          </div>
          <p className="text-sm font-medium text-[var(--color-muted)]">
            © {new Date().getFullYear()} {publicBrand.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
