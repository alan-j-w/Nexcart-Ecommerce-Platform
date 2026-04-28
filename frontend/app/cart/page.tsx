"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Cart, CartItem } from "@/lib/types";

export default function CartPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");+-
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
      // Guard: ensure Razorpay SDK is loaded
      if (typeof (window as any).Razorpay === "undefined") {
        alert("Payment gateway is not available. Please refresh the page and try again.");
        setProcessing(false);
        return;
      }

      // Create Razorpay order on backend
      const { data } = await API.post("/payment/create-order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
            <div className="mm-empty-icon">🛒</div>
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
                    "📦"
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
    </div>
  );
}
