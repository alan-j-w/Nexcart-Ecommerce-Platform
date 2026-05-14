"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
  showFavorite?: boolean;
}

export default function ProductCard({ product, showFavorite = false }: ProductCardProps) {
  const { user, toggleFavorite, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const isFavorite = user?.favorites?.includes(product._id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    await toggleFavorite(product._id);
  };

  const vendorName =
    typeof product.vendor === "object" ? product.vendor.name : "Nexcart Seller";

  // Generate fake rating for display (since backend doesn't have ratings yet)
  const rating = ((product.name.length * 7 + product.price) % 20 + 30) / 10; // 3.0 - 5.0
  const ratingCount = (product.name.length * 13 + Math.floor(product.price)) % 5000 + 50;

  const stars = "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "");

  // Calculate a fake discount
  const originalPrice = Math.round(product.price * (1.2 + (product.name.length % 5) * 0.1));

  return (
    <Link href={`/product/${product._id}`} className="mm-product-card" style={{ textDecoration: "none" }} prefetch={false}>
      {/* Product Image */}
      <div className="mm-product-image" style={{ position: "relative" }}>
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#F3F4F6", borderRadius: "4px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </div>
        )}
        
        {/* Favorite Heart Button - Flipkart Style */}
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              cursor: "pointer",
              zIndex: 10,
              transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              padding: 0,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.18)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1.0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.12)";
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isFavorite ? "#ff4343" : "none"}
              stroke={isFavorite ? "#ff4343" : "#9CA3AF"}
              strokeWidth="1.5"
              style={{ transition: "fill 0.3s ease" }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>

      {/* Product Title */}
      <div className="mm-product-title">{product.name}</div>

      {/* Rating */}
      <div className="mm-product-rating">
        <span className="mm-stars">{stars}</span>
        <span className="mm-rating-count">{ratingCount.toLocaleString()}</span>
      </div>

      {/* Price */}
      <div className="mm-product-price">
        <span className="mm-price-symbol">₹</span>
        <span className="mm-price-whole">{product.price.toLocaleString("en-IN")}</span>
        {originalPrice > product.price && (
          <span className="mm-price-original">₹{originalPrice.toLocaleString("en-IN")}</span>
        )}
      </div>

      {/* Delivery */}
      <div className="mm-product-delivery">
        <span className="mm-product-prime">Nexcart</span> — Free Delivery
      </div>

      {/* Seller */}
      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>
        by {vendorName}
      </div>
    </Link>
  );
}
