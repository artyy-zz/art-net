import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export default async function LegacyFurniturePage({
  params,
}: PageProps<"/[locale]/furniture">) {
  const { locale } = await params;

  redirect(`/${locale as Locale}/products`);
}
