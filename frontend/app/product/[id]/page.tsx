"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import createAPI from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";

export default function ProductDetailPage() {
  const API = createAPI();
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        cache: "no-store",
      });
      const products: Product[] = await res.json();
      const found = products.find((p) => p._id === id);
      setProduct(found || null);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setAddingToCart(true);
    try {
      await API.post("/cart", { productId: product?._id, quantity });
      window.dispatchEvent(new Event("cartUpdated"));
      setMessage("✓ Added to cart!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mm-empty">
        <div className="mm-empty-icon">🔍</div>
        <h3>Product not found</h3>
        <p>Sorry, we couldn&apos;t find the product you&apos;re looking for.</p>
      </div>
    );
  }

  const vendorName =
    typeof product.vendor === "object" ? product.vendor.name : "Nexcart Seller";

  const originalPrice = Math.round(product.price * 1.35);
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", gap: "40px", background: "#fff", borderRadius: "4px", padding: "30px" }}>
        {/* Left — Image */}
        <div style={{ width: "400px", flexShrink: 0 }}>
          <div
            style={{
              width: "100%",
              height: "400px",
              background: "#F3F4F6",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "120px",
              border: "1px solid #E5E7EB",
            }}
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            ) : (
              "📦"
            )}
          </div>
        </div>

        {/* Middle — Details */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "24px", fontWeight: 600, lineHeight: 1.3, marginBottom: "8px" }}>
            {product.name}
          </h1>

          <p style={{ fontSize: "13px", color: "#6D28D9", marginBottom: "6px" }}>
            Visit the {vendorName} Store
          </p>

          {/* Rating */}
          <div className="mm-product-rating" style={{ marginBottom: "12px" }}>
            <span className="mm-stars" style={{ fontSize: "16px" }}>★★★★☆</span>
            <span style={{ fontSize: "13px", color: "#6D28D9" }}>
              {((product.name.length * 13) % 5000 + 50).toLocaleString()} ratings
            </span>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "12px 0" }} />

          {/* Price */}
          <div style={{ marginBottom: "4px" }}>
            <span style={{ color: "#DC2626", fontSize: "14px" }}>-{discount}%</span>
            <span style={{ fontSize: "28px", fontWeight: 700, marginLeft: "8px" }}>
              <span style={{ fontSize: "14px", verticalAlign: "top" }}>₹</span>
              {product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px" }}>
            M.R.P.: <span style={{ textDecoration: "line-through" }}>₹{originalPrice.toLocaleString("en-IN")}</span>
            {" "}Inclusive of all taxes
          </p>

          {/* Description */}
          {product.description && (
            <>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>About this item</h3>
              <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: 1.6, marginBottom: "16px" }}>
                {product.description}
              </p>
            </>
          )}

          {/* Category */}
          {product.category && (
            <p style={{ fontSize: "13px", color: "#6B7280" }}>
              <strong>Category:</strong> {product.category}
            </p>
          )}
        </div>

        {/* Right — Buy Box */}
        <div
          style={{
            width: "260px",
            flexShrink: 0,
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "20px",
            height: "fit-content",
          }}
        >
          <p style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", verticalAlign: "top" }}>₹</span>
            {product.price.toLocaleString("en-IN")}
          </p>

          <p style={{ fontSize: "13px", color: "#059669", marginBottom: "4px" }}>
            🚚 FREE Delivery
          </p>
          <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "16px" }}>
            Delivered by Nexcart Logistics
          </p>

          {/* Stock */}
          {product.stock > 0 ? (
            <p style={{ fontSize: "16px", color: "#059669", fontWeight: 600, marginBottom: "12px" }}>
              In Stock
            </p>
          ) : (
            <p style={{ fontSize: "16px", color: "#DC2626", fontWeight: 600, marginBottom: "12px" }}>
              Out of Stock
            </p>
          )}

          {/* Quantity */}
          {product.stock > 0 && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", marginRight: "8px" }}>Qty:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid #D1D5DB",
                    fontSize: "14px",
                  }}
                >
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button className="mm-btn-cart" onClick={addToCart} disabled={addingToCart}>
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>

              <button
                className="mm-btn-buy"
                onClick={() => {
                  addToCart().then(() => router.push("/cart"));
                }}
              >
                Buy Now
              </button>
            </>
          )}

          {/* Success Message */}
          {message && (
            <p
              style={{
                fontSize: "13px",
                color: message.includes("✓") ? "#059669" : "#DC2626",
                marginTop: "10px",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              {message}
            </p>
          )}

          <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid #E5E7EB" }} />

          <p style={{ fontSize: "12px", color: "#6B7280" }}>
            <strong>Sold by:</strong> {vendorName}
          </p>
          <p style={{ fontSize: "12px", color: "#6B7280" }}>
            <strong>Fulfilled by:</strong> Nexcart
          </p>
        </div>
      </div>
    </div>
  );
}
