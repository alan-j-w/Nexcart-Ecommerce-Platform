"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import createAPI from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Cart, CartItem } from "@/lib/types";

export default function CartPage() {
  const API = createAPI();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Showcase Sandbox mock payment states
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderData, setMockOrderData] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [payingState, setPayingState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        fetchCart();
      }
    }
  }, [isAuthenticated, authLoading]);

  // Dynamically load Razorpay SDK when cart page mounts
  useEffect(() => {
    if (document.querySelector('script[src*="razorpay"]')) return; // already loaded
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQty: number) => {
    try {
      // The backend only adds to quantity, so we need to handle this carefully
      // For now, re-add with quantity difference
      await API.post("/cart", { productId, quantity: newQty });
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to update cart:", err);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await API.delete(`/cart/${productId}`);
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      // Create order on backend (automatically detects credentials and fallbacks to mock if needed)
      const { data } = await API.post("/payment/create-order");

      if (data.isMockMode) {
        // Toggle Showcase Mock Mode Payment simulation overlay
        setMockOrderData(data);
        setShowMockModal(true);
        setPayingState("idle");
        setProcessing(false);
        return;
      }

      // Guard: ensure Razorpay SDK is loaded for real transaction
      if (typeof (window as any).Razorpay === "undefined") {
        alert("Payment gateway is not available. Please refresh the page and try again.");
        setProcessing(false);
        return;
      }

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Nexcart",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert("✅ Payment successful! Your order has been placed.");
            router.push("/orders");
          } catch {
            alert("❌ Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: "9999999999", // contact is required for UPI to appear
        },
        theme: {
          color: "#7C3AED",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        alert(`❌ Payment failed: ${response.error.description}`);
        setProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };

  const handleMockPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      alert("Please fill out all credit card fields.");
      return;
    }
    setPayingState("loading");
    try {
      // Simulate verification delay for nice visual checkout feedback
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await API.post("/payment/verify", {
        razorpay_order_id: mockOrderData.orderId,
        razorpay_payment_id: `mock_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        razorpay_signature: "mock_signature_approved",
        isMockMode: true,
      });

      setPayingState("success");
      await new Promise((resolve) => setTimeout(resolve, 1200));

      alert("✅ Showcase Payment successful! Your order has been placed.");
      setShowMockModal(false);
      
      // Notify components to update cart counters
      window.dispatchEvent(new Event("cartUpdated"));
      router.push("/orders");
    } catch (err: any) {
      console.error(err);
      setPayingState("error");
      alert("❌ Payment verification failed. Please try again.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="mm-cart-page">
      {/* Cart Items */}
      <div className="mm-cart-items">
        <h1>Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="mm-empty">
          <div className="mm-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Your Nexcart Cart is empty</h3>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
              Your shopping cart is waiting. Give it purpose — fill it with groceries, electronics, books, and more.
            </p>
            <Link
              href="/"
              className="mm-btn-primary"
              style={{ display: "inline-block", marginTop: "16px", width: "auto", padding: "10px 24px" }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "13px", color: "#6B7280", textAlign: "right" }}>Price</p>

            {items.map((item: CartItem) => (
              <div className="mm-cart-item" key={item._id || item.product?._id}>
                {/* Image */}
                <Link href={`/product/${item.product?._id}`} className="mm-cart-item-image">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#F3F4F6", borderRadius: "4px" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="mm-cart-item-details">
                  <Link href={`/product/${item.product?._id}`}>
                    <div className="mm-cart-item-title">{item.product?.name}</div>
                  </Link>
                  <div className="mm-cart-item-stock">
                    {item.product?.stock > 0 ? "In Stock" : "Out of Stock"}
                  </div>
                  <p style={{ fontSize: "12px", color: "#6B7280" }}>
                    <span className="mm-product-prime">Nexcart</span> — Eligible for FREE Delivery
                  </p>

                  <div className="mm-cart-item-controls">
                    <div className="mm-qty-control">
                      <button
                        className="mm-qty-btn"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.product?._id, -1);
                          }
                        }}
                      >
                        −
                      </button>
                      <span className="mm-qty-value">{item.quantity}</span>
                      <button
                        className="mm-qty-btn"
                        onClick={() => updateQuantity(item.product?._id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product?._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#DC2626",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div style={{ fontWeight: 700, fontSize: "18px", whiteSpace: "nowrap" }}>
                  ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                </div>
              </div>
            ))}

            <div style={{ textAlign: "right", padding: "16px 0", fontSize: "18px" }}>
              Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items):{" "}
              <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
            </div>
          </>
        )}
      </div>

      {/* Summary / Checkout */}
      {items.length > 0 && (
        <div className="mm-cart-summary">
          <div className="mm-cart-subtotal">
            Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items):{" "}
            <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", marginBottom: "14px" }}>
            <input type="checkbox" defaultChecked />
            This order contains a gift
          </label>

          <button
            className="mm-btn-primary"
            onClick={handleCheckout}
            disabled={processing}
          >
            {processing ? "Processing..." : "Proceed to Buy"}
          </button>
        </div>
      )}
      {/* 💳 Showcase Interactive Sandbox Payment Modal Overlay */}
      {showMockModal && mockOrderData && (
        <div className="mm-payment-modal-overlay">
          <div className="mm-payment-modal">
            <button 
              className="mm-payment-close" 
              onClick={() => {
                setShowMockModal(false);
                setCardNumber("");
                setCardName("");
                setCardExpiry("");
                setCardCvv("");
                setIsFlipped(false);
              }}
              aria-label="Close modal"
            >
              ✕
            </button>
            
            <div className="mm-payment-header">
              <h3>🔐 Nexcart Showcase Sandbox</h3>
              <p>This is a 100% secure portfolio demonstration payment simulator. No real money will be charged.</p>
            </div>

            {/* 3D Interactive Card Preview */}
            <div className="mm-3d-card-wrapper">
              <div className={`mm-3d-card ${isFlipped ? "flipped" : ""}`}>
                {/* Front Surface */}
                <div className="mm-card-face mm-card-front">
                  <div className="mm-card-chip"></div>
                  <div className="mm-card-network-logo">VISA</div>
                  <div className="mm-card-number-display">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                  <div className="mm-card-meta-display">
                    <div className="mm-card-holder-col">
                      <span className="mm-card-label">CARDHOLDER NAME</span>
                      <span className="mm-card-value">
                        {cardName.toUpperCase() || "YOUR NAME HERE"}
                      </span>
                    </div>
                    <div className="mm-card-expiry-col">
                      <span className="mm-card-label">EXPIRES</span>
                      <span className="mm-card-value">{cardExpiry || "MM/YY"}</span>
                    </div>
                  </div>
                </div>

                {/* Back Surface */}
                <div className="mm-card-face mm-card-back">
                  <div className="mm-card-strip"></div>
                  <div className="mm-card-signature-bar">
                    <span className="mm-card-signature-display">
                      {cardName || "Authorized Signature"}
                    </span>
                    <span className="mm-card-cvv-display">{cardCvv || "•••"}</span>
                  </div>
                  <div className="mm-card-info-text">
                    This sandbox card is for portfolio demonstration purposes only. Bypassing financial gateway hooks securely.
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Fields Form */}
            {payingState === "success" ? (
              <div className="mm-payment-success-view">
                <div className="mm-success-checkmark-circle">
                  <div className="mm-success-checkmark"></div>
                </div>
                <h4>Payment Completed!</h4>
                <p>Redirecting to your orders history page...</p>
              </div>
            ) : (
              <form className="mm-payment-form" onSubmit={handleMockPaymentSubmit}>
                <div className="mm-form-group">
                  <label htmlFor="card-number">CARD NUMBER</label>
                  <input
                    id="card-number"
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    value={cardNumber}
                    required
                    onChange={(e) => {
                      // Auto format card space
                      const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                      const matches = v.match(/\d{4,16}/g);
                      const match = (matches && matches[0]) || "";
                      const parts = [];
                      for (let i = 0, len = match.length; i < len; i += 4) {
                        parts.push(match.substring(i, i + 4));
                      }
                      if (parts.length > 0) {
                        setCardNumber(parts.join(" "));
                      } else {
                        setCardNumber(v);
                      }
                    }}
                  />
                </div>

                <div className="mm-form-group">
                  <label htmlFor="card-name">CARDHOLDER NAME</label>
                  <input
                    id="card-name"
                    type="text"
                    placeholder="ALAN J"
                    maxLength={26}
                    value={cardName}
                    required
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="mm-form-row">
                  <div className="mm-form-group">
                    <label htmlFor="card-expiry">EXPIRY DATE</label>
                    <input
                      id="card-expiry"
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      required
                      onChange={(e) => {
                        const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
                        if (v.length >= 2) {
                          setCardExpiry(`${v.slice(0, 2)}/${v.slice(2, 4)}`);
                        } else {
                          setCardExpiry(v);
                        }
                      }}
                    />
                  </div>

                  <div className="mm-form-group">
                    <label htmlFor="card-cvv">CVV</label>
                    <input
                      id="card-cvv"
                      type="password"
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      required
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                  </div>
                </div>

                <button 
                  className="mm-btn-primary" 
                  type="submit" 
                  disabled={payingState === "loading"}
                  style={{ marginTop: "12px" }}
                >
                  {payingState === "loading" ? (
                    <span className="mm-btn-spinner-container">
                      <span className="mm-btn-spinner"></span> Processing...
                    </span>
                  ) : (
                    `Pay ₹${(subtotal).toLocaleString("en-IN")} securely`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
