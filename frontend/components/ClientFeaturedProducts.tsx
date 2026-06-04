"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/fetch-utils";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";

export default function ClientFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(false);
        // timeout = 60000ms, retries = 3, initial delay = 1500ms
        const data = await safeFetch(`${API_BASE_URL}/products`, {}, 60000, 3, 1500);
        if (active) {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Failed to load featured products client-side:", err);
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, [retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <section className="mm-section">
        <h2 className="mm-section-title">Featured Products</h2>
        <div className="mm-products-scroll">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mm-section">
        <h2 className="mm-section-title">Featured Products</h2>
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "20px", borderRadius: "8px", color: "#991B1B", display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start", maxWidth: "600px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Service temporarily unavailable
          </div>
          <p style={{ fontSize: "14px", margin: 0 }}>
            Our marketplace catalog is taking longer to respond. This might be due to a server sleep/cold-start.
          </p>
          <button 
            onClick={handleRetry} 
            className="mm-btn-primary" 
            style={{ width: "auto", padding: "8px 18px", fontSize: "13px" }}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mm-empty">
        <h3>No products yet</h3>
        <Link href="/register" className="mm-btn-primary">Start Selling</Link>
      </div>
    );
  }

  return (
    <section className="mm-section">
      <h2 className="mm-section-title">Featured Products</h2>
      <div className="mm-products-scroll">
        {products.map((p: Product) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
