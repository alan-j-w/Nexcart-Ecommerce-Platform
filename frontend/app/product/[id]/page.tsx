import ProductDetailClient from "@/components/ProductDetailClient";

export const metadata = {
  title: "Product Details | Nexcart",
  description: "Shop the latest electronics, fashion, and home essentials on Nexcart.",
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}

