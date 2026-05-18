import { redirect } from "next/navigation";

export default async function RootProductDetailPage({
  params,
}: PageProps<"/products/[category]/[slug]">) {
  const { category, slug } = await params;

  redirect(`/sq/products/${category}/${slug}`);
}
