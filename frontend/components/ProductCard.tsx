"use client";

import Link from "next/link";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const vendorName =
    typeof product.vendor === "object" ? product.vendor.name : "Nexcart Seller";

  // Generate fake rating for display (since backend doesn't have ratings yet)
  const rating = ((product.name.length * 7 + product.price) % 20 + 30) / 10; // 3.0 - 5.0
  const ratingCount = (product.name.length * 13 + Math.floor(product.price)) % 5000 + 50;

  const stars = "★".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "½" : "");

  // Calculate a fake discount
  const originalPrice = Math.round(product.price * (1.2 + (product.name.length % 5) * 0.1));

  return (
    <Link href={`/product/${product._id}`} className="mm-product-card" style={{ textDecoration: "none" }}>
      {/* Product Image */}
      <div className="mm-product-image">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <span>📦</span>
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
