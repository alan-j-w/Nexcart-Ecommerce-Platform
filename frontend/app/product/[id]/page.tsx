
import { notFound } from "next/navigation";
import { Product } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import ProductDetailView from "@/components/ProductDetailView";
import { safeFetch } from "@/lib/fetch-utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  return {
    title: product ? `${product.name} | Nexcart` : "Product Not Found",
    description: product?.description || "Shop on Nexcart",
  };
}

async function getProduct(id: string) {
  if (!API_BASE_URL) return null;
  try {
    // Products can be cached slightly for performance
    const products: Product[] = await safeFetch(`${API_BASE_URL}/products`, { next: { revalidate: 30 } });
    return products.find((p) => p._id === id) || null;
  } catch (err) {
    console.error("Error fetching product:", err);
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
