"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Product } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/fetch-utils";
import ProductDetailView from "./ProductDetailView";

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFoundState, setNotFoundState] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(false);
        setNotFoundState(false);
        
        // Fetch all products client-side
        const products: Product[] | null = await safeFetch(`${API_BASE_URL}/products`, {}, 60000, 3, 1500);
        
        if (active) {
          if (!products) {
            setError(true);
            return;
          }
          const found = products.find((p) => p._id === id);
          if (found) {
            setProduct(found);
          } else {
            setNotFoundState(true);
          }
        }
      } catch (err) {
        console.error("Failed to load product details client-side:", err);
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      active = false;
    };
  }, [id, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  if (notFoundState) {
    notFound();
    return null;
  }

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "flex", gap: "40px", background: "#fff", borderRadius: "4px", padding: "30px" }}>
          {/* Left image skeleton */}
          <div style={{ width: "400px", flexShrink: 0 }}>
            <div className="animate-pulse" style={{ width: "100%", height: "400px", background: "#F3F4F6", borderRadius: "4px" }} />
          </div>
          
          {/* Middle details skeleton */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="animate-pulse" style={{ height: "32px", background: "#e5e7eb", width: "80%", borderRadius: "4px" }} />
            <div className="animate-pulse" style={{ height: "16px", background: "#e5e7eb", width: "30%", borderRadius: "4px" }} />
            <div className="animate-pulse" style={{ height: "20px", background: "#e5e7eb", width: "40%", borderRadius: "4px" }} />
            <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "4px 0" }} />
            <div className="animate-pulse" style={{ height: "36px", background: "#e5e7eb", width: "50%", borderRadius: "4px" }} />
            <div className="animate-pulse" style={{ height: "16px", background: "#e5e7eb", width: "60%", borderRadius: "4px" }} />
            <div className="animate-pulse" style={{ height: "80px", background: "#e5e7eb", width: "95%", borderRadius: "4px" }} />
          </div>

          {/* Right buy box skeleton */}
          <div style={{ width: "260px", flexShrink: 0, border: "1px solid #E5E7EB", borderRadius: "8px", padding: "20px", height: "300px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="animate-pulse" style={{ height: "36px", background: "#e5e7eb", width: "60%", borderRadius: "4px" }} />
            <div className="animate-pulse" style={{ height: "16px", background: "#e5e7eb", width: "80%", borderRadius: "4px" }} />
            <div className="animate-pulse" style={{ height: "16px", background: "#e5e7eb", width: "40%", borderRadius: "4px" }} />
            <div className="animate-pulse" style={{ height: "40px", background: "#e5e7eb", borderRadius: "6px" }} />
            <div className="animate-pulse" style={{ height: "40px", background: "#e5e7eb", borderRadius: "6px" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mm-empty" style={{ padding: "60px 20px" }}>
        <div className="mm-empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <h3>Failed to load product</h3>
        <p style={{ color: "#6B7280", marginBottom: "20px" }}>
          We had trouble fetching the product details. The database might be waking up.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={handleRetry} className="mm-btn-primary" style={{ width: "auto", padding: "10px 24px" }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <ProductDetailView product={product!} />;
}
