"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import createAPI from "@/lib/api";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const { user, token, loading: authLoading, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API = createAPI();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (token) {
      fetchFavorites();
    }
  }, [token, authLoading, isAuthenticated, user?.favorites]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await API.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.data);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (loading && favorites.length === 0)) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner"></div>
      </div>
    );
  }

  return (
    <div className="mm-section">
      <h1 className="mm-section-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#EF4444" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </span> Your Favorites
      </h1>

      {favorites.length === 0 ? (
        <div className="mm-empty">
          <div className="mm-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Click the heart icon on any product to save it for later.</p>
          <button 
            className="mm-btn-primary" 
            style={{ width: "auto", marginTop: "20px", padding: "10px 30px" }}
            onClick={() => router.push("/")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="mm-product-grid">
          {favorites.map((product) => (
            <ProductCard key={product._id} product={product} showFavorite={true} />
          ))}
        </div>
      )}
    </div>
  );
}
