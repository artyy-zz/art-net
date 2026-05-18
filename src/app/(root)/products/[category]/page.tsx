import { redirect } from "next/navigation";

export default async function RootProductCategoryPage({
  params,
}: PageProps<"/products/[category]">) {
  const { category } = await params;

  redirect(`/sq/products/${category}`);
}
