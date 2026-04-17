"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [query]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        cache: "no-store",
      });
      const all: Product[] = await res.json();

      if (query) {
        const q = query.toLowerCase();
        const filtered = all.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
        setProducts(filtered);
      } else {
        setProducts(all);
      }
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
        {query ? (
          <>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              {products.length} results for
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#B45309" }}>
              &quot;{query}&quot;
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
