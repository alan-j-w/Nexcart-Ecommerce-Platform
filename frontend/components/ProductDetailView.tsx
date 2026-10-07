"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import createAPI from "@/lib/api";

export default function ProductDetailView({ product }: { product: Product }) {
  const API = createAPI();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState("");

  const addToCart = async (): Promise<boolean> => {
    if (!isAuthenticated) {
      router.push("/login");
      return false;
    }

    setAddingToCart(true);
    try {
      await API.post("/cart", { productId: product._id, quantity });
      window.dispatchEvent(new Event("cartUpdated"));
      setMessage("✓ Added to cart!");
      setTimeout(() => setMessage(""), 3500);
      return true;
    } catch (err: any) {
      setMessage("Failed to add to cart");
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const success = await addToCart();
    if (success) {
      router.push("/cart");
    }
  };

  const vendorName = typeof product.vendor === "object" ? product.vendor.name : "Nexcart Seller";
  const originalPrice = Math.round(product.price * 1.35);
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImage] || images[0];

  return (
    <div className="mm-pdp-container">
      {/* Breadcrumb Navigation */}
      <nav className="mm-pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="mm-pdp-breadcrumb-sep">›</span>
        {product.category && (
          <>
            <Link 
              href={`/search?category=${encodeURIComponent(product.category.toLowerCase())}`}
              prefetch={false}
            >
              {product.category}
            </Link>
            <span className="mm-pdp-breadcrumb-sep">›</span>
          </>
        )}
        <span className="mm-pdp-breadcrumb-current" title={product.name}>
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout Card */}
      <div className="mm-pdp-card">
        {/* Left Column — Image Gallery */}
        <div className="mm-pdp-gallery">
          <div className="mm-pdp-main-image-wrap">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="mm-pdp-main-image"
              />
            ) : (
              <svg
                width="96"
                height="96"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            )}
          </div>

          {/* Multiple Image Thumbnails */}
          {images.length > 1 && (
            <div className="mm-pdp-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`mm-pdp-thumb-btn ${selectedImage === idx ? "active" : ""}`}
                  aria-label={`View product image ${idx + 1}`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Column — Details & Description */}
        <div className="mm-pdp-info">
          <h1 className="mm-pdp-title">{product.name}</h1>

          <span className="mm-pdp-vendor-link">
            Visit the {vendorName} Store
          </span>

          <div className="mm-pdp-rating-row">
            <div className="mm-pdp-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={s <= 4 ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="mm-pdp-rating-text">
              {((product.name.length * 17) % 3000 + 120).toLocaleString()} ratings
            </span>
          </div>

          <hr className="mm-pdp-divider" />

          {/* Pricing Row */}
          <div className="mm-pdp-price-wrap">
            <span className="mm-pdp-discount-badge">-{discount}%</span>
            <span className="mm-pdp-price-main">
              <span className="mm-pdp-currency">₹</span>
              {product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <p className="mm-pdp-mrp">
            M.R.P.: <span className="mm-pdp-mrp-val">₹{originalPrice.toLocaleString("en-IN")}</span> Inclusive of all taxes
          </p>

          {/* Trust Badges */}
          <div className="mm-pdp-trust-grid">
            <div className="mm-pdp-trust-item">
              <div className="mm-pdp-trust-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 17h4V5H2v12h3" />
                  <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
                  <path d="M14 17h1" />
                  <circle cx="7.5" cy="17.5" r="2.5" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
              </div>
              <span className="mm-pdp-trust-title">Free Delivery</span>
            </div>

            <div className="mm-pdp-trust-item">
              <div className="mm-pdp-trust-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6" />
                  <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </div>
              <span className="mm-pdp-trust-title">7 Days Replacement</span>
            </div>

            <div className="mm-pdp-trust-item">
              <div className="mm-pdp-trust-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span className="mm-pdp-trust-title">Secure Transaction</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mm-pdp-desc-section">
              <h2 className="mm-pdp-desc-heading">About this item</h2>
              <p className="mm-pdp-desc-text">{product.description}</p>
            </div>
          )}
        </div>

        {/* Right Column — Buy Box */}
        <div className="mm-pdp-buybox">
          <div className="mm-pdp-buybox-price">
            <span className="mm-pdp-currency">₹</span>
            {product.price.toLocaleString("en-IN")}
          </div>

          <div className="mm-pdp-buybox-delivery">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            FREE Delivery
          </div>
          <p className="mm-pdp-buybox-logistics">Delivered by Nexcart Logistics</p>

          {product.stock > 0 ? (
            <div className="mm-pdp-buybox-stock in-stock">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              In Stock
            </div>
          ) : (
            <div className="mm-pdp-buybox-stock out-of-stock">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Currently Out of Stock
            </div>
          )}

          {product.stock > 0 && (
            <>
              <div className="mm-pdp-qty-wrap">
                <label htmlFor="pdp-qty" className="mm-pdp-qty-label">Quantity:</label>
                <select
                  id="pdp-qty"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="mm-pdp-qty-select"
                >
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="mm-pdp-btn-cart"
                onClick={addToCart}
                disabled={addingToCart}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>

              <button
                type="button"
                className="mm-pdp-btn-buy"
                onClick={handleBuyNow}
                disabled={addingToCart}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Buy Now
              </button>
            </>
          )}

          {message && (
            <div
              className={`mm-pdp-msg-alert ${
                message.includes("✓") ? "mm-pdp-msg-success" : "mm-pdp-msg-error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mm-pdp-buybox-meta">
            <div>
              <strong>Sold by:</strong> {vendorName}
            </div>
            <div>
              <strong>Fulfilled by:</strong> Nexcart
            </div>
            <div>
              <strong>Payment:</strong> Secure Transaction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
