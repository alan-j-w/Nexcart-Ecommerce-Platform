import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import { Product, Banner, Category } from "@/lib/types";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/fetch-utils";

export const metadata = {
  title: "Nexcart | Home of Premium Deals",
  description: "Shop the latest electronics, fashion, and home essentials on Nexcart.",
};

async function getHomeData() {
  if (!API_BASE_URL) return { products: [], banners: [], categories: [], status: "error" };

  // For homepage data, we use 60s revalidation for high performance
  const fetchOptions = { next: { revalidate: 60 } };
  
  // We use .catch(() => null) to avoid swallowing Next.js build signals in a try/catch
  const [products, banners, categories] = await Promise.all([
    safeFetch(`${API_BASE_URL}/products`, fetchOptions).catch(() => null),
    safeFetch(`${API_BASE_URL}/banners/active`, fetchOptions).catch(() => null),
    safeFetch(`${API_BASE_URL}/categories`, fetchOptions).catch(() => null),
  ]);

  if (!products || !banners || !categories) {
    return { 
      products: products || [], 
      banners: banners || [], 
      categories: categories || [], 
      status: "error" 
    };
  }

  return { 
    products, 
    banners, 
    categories, 
    status: products.length > 0 ? "success" : "empty" 
  };
}

export default async function Home() {
  const { products, banners, categories, status } = await getHomeData();

  return (
    <>
      <HeroBanner banners={banners} />

      <div className="mm-categories-grid">
        {categories.map((cat: Category) => (
          <Link href={`/search?category=${cat.slug}`} key={cat._id} style={{ textDecoration: "none" }} prefetch={false}>
            <div className="mm-category-card">
              <h3>{cat.name}</h3>
              <div className="mm-category-card-image">
                <img src={cat.imageUrl} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ color: "#6D28D9", fontSize: "13px", fontWeight: 600 }}>
                Shop now →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mm-deals-banner">
        <div>
          <div className="mm-deals-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Today&apos;s Deals
          </div>
          <div className="mm-deals-subtitle">Limited-time discounts</div>
        </div>
        <Link href="/search?q=" className="mm-hero-cta" style={{ fontSize: "14px", padding: "10px 24px" }} prefetch={false}>
          See all
        </Link>
      </div>

      <section className="mm-section">
        <h2 className="mm-section-title">Featured Products</h2>
        {status === "error" && (
          <p style={{ color: "#DC2626", fontSize: "14px", marginBottom: "10px" }}>
            ⚠️ Service temporarily unavailable. Showing cached/partial results.
          </p>
        )}
        <div className="mm-products-scroll">
          {products.map((p: Product) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
      
      {status === "empty" && (
        <div className="mm-empty">
          <h3>No products yet</h3>
          <Link href="/register" className="mm-btn-primary">Start Selling</Link>
        </div>
      )}
    </>
  );
}
