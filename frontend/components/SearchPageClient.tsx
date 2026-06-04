"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/fetch-utils";
import ProductCard from "./ProductCard";
import SkeletonCard from "./SkeletonCard";

interface SearchPageClientProps {
  query: string;
  category: string;
}

export default function SearchPageClient({ query, category }: SearchPageClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadSearchProducts() {
      try {
        setLoading(true);
        setError(false);

        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (category) params.append("category", category);

        const url = `${API_BASE_URL}/products?${params.toString()}`;
        const data = await safeFetch(url, {}, 8000, 3, 1500);

        if (active) {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Failed to load search results client-side:", err);
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSearchProducts();
    return () => {
      active = false;
    };
  }, [query, category, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  return (
    <div className="mm-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Results Header */}
      <div style={{ marginBottom: "16px" }}>
        {(query || category) ? (
          <>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              {loading ? "Searching..." : `${products.length} results for`}
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#6D28D9", textTransform: "capitalize" }}>
              &quot;{query || category}&quot;
            </h1>
          </>
        ) : (
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>All Products</h1>
        )}
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", padding: "16px", borderRadius: "6px", color: "#991B1B", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Trouble reaching catalog
          </div>
          <p style={{ fontSize: "14px", margin: 0 }}>
            We're having trouble reaching our catalog. The server might be warming up.
          </p>
          <button 
            onClick={handleRetry} 
            className="mm-btn-primary" 
            style={{ width: "auto", padding: "6px 14px", fontSize: "13px" }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Sort bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "10px 16px",
          background: "#fff",
          borderRadius: "4px",
          marginBottom: "16px",
          fontSize: "13px",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <span style={{ fontWeight: 700 }}>Sort by:</span>
        <span style={{ cursor: "pointer", color: "#6D28D9", fontWeight: 600 }}>Featured</span>
        <span style={{ cursor: "pointer", color: "#4B5563" }}>Price: Low to High</span>
        <span style={{ cursor: "pointer", color: "#4B5563" }}>Price: High to Low</span>
        <span style={{ cursor: "pointer", color: "#4B5563" }}>Newest Arrivals</span>
      </div>

      {/* Product Grid / Skeletons */}
      {loading ? (
        <div className="mm-product-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="mm-product-grid">
          {products.map((p: Product) => (
            <ProductCard key={p._id} product={p} showFavorite={true} />
          ))}
        </div>
      ) : !error && (
        <div className="mm-empty" style={{ background: "#fff", borderRadius: "8px" }}>
          <div className="mm-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No results found</h3>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>
            Try different keywords or browse our categories.
          </p>
        </div>
      )}
    </div>
  );
}
