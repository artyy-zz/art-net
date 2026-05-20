import { JsonLd } from "@/components/shared/json-ld";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteMain, SiteMotion } from "@/components/shared/site-motion";
import type { Locale } from "@/lib/i18n";
import { getStructuredData } from "@/lib/seo";

export default async function SiteLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  return (
    <div className="min-h-screen">
      <JsonLd data={getStructuredData(typedLocale)} />
      <SiteMotion />
      <SiteHeader locale={typedLocale} />
      <SiteMain>{children}</SiteMain>
      <SiteFooter locale={typedLocale} />
    </div>
  );
}
