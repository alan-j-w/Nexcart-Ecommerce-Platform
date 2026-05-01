"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import { Product, Banner, Category } from "@/lib/types";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, bannerRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/banners/active`),
          fetch(`${API_BASE_URL}/categories`),
        ]);

        if (prodRes.ok) setProducts(await prodRes.json());
        if (bannerRes.ok) setBanners(await bannerRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        setError("Unable to connect to the server. Please try again later.");
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  return (
    <>
      {/* Hero Banner */}
      <HeroBanner banners={banners} />

      {/* Category Cards */}
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
        {categories.length === 0 && !loading && (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
            No categories available.
          </p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div style={{ textAlign: "center", padding: "20px", color: "#DC2626" }}>
          {error}
        </div>
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
          <section className="mm-section">
            <h2 className="mm-section-title">Featured Products</h2>
            <div className="mm-products-scroll">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>

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
