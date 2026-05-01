"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [query, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Pass filters directly to the API
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (category) params.append("category", category);

      const res = await fetch(`http://localhost:5000/api/products?${params.toString()}`, {
        cache: "no-store",
      });
      const data: Product[] = await res.json();
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  return (
    <div className="mm-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Results Header */}
      <div style={{ marginBottom: "16px" }}>
        {(query || category) ? (
          <>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              {products.length} results for
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#6D28D9", textTransform: "capitalize" }}>
              &quot;{query || category}&quot;
            </h1>
          </>
        ) : (
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>All Products</h1>
        )}
      </div>

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

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="mm-product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mm-empty" style={{ background: "#fff", borderRadius: "8px" }}>
          <div className="mm-empty-icon">🔍</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No results found</h3>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>
            Try different keywords or browse our categories.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mm-loading">
          <div className="mm-spinner" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
