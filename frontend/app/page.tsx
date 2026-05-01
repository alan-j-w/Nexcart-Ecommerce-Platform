"use client";

export const dynamic = "force-dynamic";

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
  const [mounted, setMounted] = useState(false);

  // CRITICAL: This ensures that NOTHING inside this component
  // executes until AFTER the component has mounted in the browser.
  // This prevents Vercel's build-time SSR from triggering fetches.
  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      try {
        const [prodRes, bannerRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`, { cache: 'no-store' }),
          fetch(`${API_BASE_URL}/banners/active`, { cache: 'no-store' }),
          fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' }),
        ]);

        if (prodRes.ok) setProducts(await prodRes.json());
        if (bannerRes.ok) setBanners(await bannerRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error("Build-Safe Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Return a shell/loading state during SSR/Build
  if (!mounted) return <div className="mm-loading-shell" />;

  if (loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  return (
    <>
      <HeroBanner banners={banners} />

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
        <div className="mm-products-scroll">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
      
      {/* Empty State */}
      {products.length === 0 && (
        <div className="mm-empty">
          <h3>No products yet</h3>
          <Link href="/register" className="mm-btn-primary">Start Selling</Link>
        </div>
      )}
    </>
  );
}
