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
        <span style={{ color: "#EF4444" }}>❤️</span> Your Favorites
      </h1>

      {favorites.length === 0 ? (
        <div className="mm-empty">
          <div className="mm-empty-icon">🤍</div>
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
