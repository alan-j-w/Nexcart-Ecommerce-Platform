import { notFound } from "next/navigation";
import { Product } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import ProductDetailView from "@/components/ProductDetailView";
import { safeFetch } from "@/lib/fetch-utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product } = await getProduct(id);
  
  return {
    title: product ? `${product.name} | Nexcart` : "Product Not Found",
    description: product?.description || "Shop on Nexcart",
  };
}

async function getProduct(id: string) {
  if (!API_BASE_URL) return { product: null, status: "error" };
  
  // We use .catch(() => null) to avoid swallowing Next.js build signals
  const products: Product[] | null = await safeFetch(`${API_BASE_URL}/products`, { next: { revalidate: 30 } }).catch(() => null);
  
  if (!products) return { product: null, status: "error" };
  
  const found = products.find((p) => p._id === id);
  return { product: found || null, status: found ? "success" : "empty" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product, status } = await getProduct(id);

  if (!product && status !== "error") {
    notFound();
  }

  if (status === "error") {
    throw new Error("Failed to load product. Please try again later.");
  }

  return <ProductDetailView product={product!} />;
}
