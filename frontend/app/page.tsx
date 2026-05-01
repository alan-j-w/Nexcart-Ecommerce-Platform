export const dynamic = "force-dynamic";

import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import { Product, Banner, Category } from "@/lib/types";
import Link from "next/link";
import Toast from "@/components/Toast";
import { API_BASE_URL } from "@/lib/constants";

export default async function Home() {
  let products: Product[] = [];
  let banners: Banner[] = [];
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    const [prodRes, bannerRes, catRes] = await Promise.all([
      fetch(`${API_BASE_URL}/products`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/banners/active`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/categories`, { cache: "no-store" })
    ]);

    if (!prodRes.ok) throw new Error(`Backend responded with status ${prodRes.status}`);

    products = await prodRes.json();
    if (bannerRes.ok) {
      banners = await bannerRes.json();
    }
    if (catRes.ok) {
      categories = await catRes.json();
    }
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to connect to backend";
    console.error("Failed to fetch data:", err);
  }

  return (
    <>
      {/* Hero Banner */}
      <HeroBanner banners={banners} />

      {/* Category Cards — overlapping banner */}
      <div className="mm-categories-grid">
        {categories.map((cat) => (
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
        {categories.length === 0 && (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
            No categories available. Add some in the Admin Panel.
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Toast message="Unable to connect to the server at this time. Please try again later." type="error" />
      )}

      {/* Deals Banner */}
      <div className="mm-deals-banner">
        <div>
          <div className="mm-deals-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "24px", height: "24px", color: "#FCD34D" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Today&apos;s Deals
          </div>
          <div className="mm-deals-subtitle">
            Limited-time discounts across all categories
          </div>
        </div>
        <Link href="/search?q=" className="mm-hero-cta" style={{ fontSize: "14px", padding: "10px 24px" }} prefetch={false}>
          See all deals
        </Link>
      </div>

      {/* Products Section */}
      {!error && products.length > 0 && (
        <>
          {/* Horizontal Scroll - Featured */}
          <section className="mm-section">
            <h2 className="mm-section-title">Featured Products</h2>
            <div className="mm-products-scroll">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>

          {/* Product Grid - All Products */}
          <section className="mm-section">
            <h2 className="mm-section-title">All Products</h2>
            <div className="mm-product-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Empty State */}
      {!error && products.length === 0 && (
        <div className="mm-empty">
          <div className="mm-empty-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{ width: "48px", height: "48px", color: "#9CA3AF" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            No products yet
          </h3>
          <p style={{ fontSize: "14px" }}>
            Products from vendors will appear here once they start listing.
          </p>
          <Link
            href="/register"
            className="mm-btn-primary"
            style={{ display: "inline-block", marginTop: "16px", width: "auto", padding: "10px 24px" }}
          >
            Start Selling →
          </Link>
        </div>
      )}
    </>
  );
}
