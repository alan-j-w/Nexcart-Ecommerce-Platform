"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import API from "@/lib/api";

export default function OrdersPage() {
  const api = API();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        fetchOrders();
      }
    }
  }, [isAuthenticated, authLoading]);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Your Orders</h1>
      <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
        Track, return, or buy things again
      </p>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          borderBottom: "1px solid #E5E7EB",
          marginBottom: "24px",
        }}
      >
        {["All Orders", "Not Yet Shipped", "Cancelled"].map((tab, i) => (
          <button
            key={tab}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: i === 0 ? 700 : 400,
              color: i === 0 ? "#6D28D9" : "#4B5563",
              borderBottom: i === 0 ? "3px solid #6D28D9" : "3px solid transparent",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="mm-empty" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
          <div className="mm-empty-icon">📋</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
            No orders yet
          </h3>
          <p style={{ fontSize: "14px" }}>
            Looks like you haven&apos;t placed any orders. Start shopping to see your orders here!
          </p>
          <Link
            href="/"
            className="mm-btn-primary"
            style={{ display: "inline-block", marginTop: "16px", width: "auto", padding: "10px 24px" }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map((order) => (
            <div key={order._id} style={{ border: "1px solid #E5E7EB", borderRadius: "8px", background: "#fff", overflow: "hidden" }}>
              <div style={{ background: "#F3F4F6", padding: "14px 20px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", gap: "32px", fontSize: "13px" }}>
                  <div>
                    <div style={{ color: "#4B5563" }}>ORDER PLACED</div>
                    <div style={{ fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ color: "#4B5563" }}>TOTAL</div>
                    <div style={{ fontWeight: 600 }}>₹{order.totalAmount?.toLocaleString("en-IN")}</div>
                  </div>
                  <div>
                    <div style={{ color: "#4B5563" }}>STATUS</div>
                    <div style={{ fontWeight: 600, color: order.status === "paid" ? "#059669" : "#D97706", textTransform: "capitalize" }}>{order.status}</div>
                  </div>
                </div>
                <div style={{ fontSize: "13px", textAlign: "right" }}>
                  <div style={{ color: "#4B5563" }}>ORDER # {order._id.substring(order._id.length - 8).toUpperCase()}</div>
                  <Link href={`/orders/${order._id}`} style={{ color: "#2563EB", textDecoration: "underline" }}>View order details</Link>
                </div>
              </div>
              <div style={{ padding: "20px" }}>
                {order.items.map((item: any) => (
                  <div key={item._id} style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ width: "80px", height: "80px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                      ) : "📦"}
                    </div>
                    <div>
                      <Link href={`/product/${item.product?._id}`}>
                        <h4 style={{ fontWeight: 600, color: "#111827", marginBottom: "4px" }}>{item.product?.name || "Product Unavailable"}</h4>
                      </Link>
                      <div style={{ fontSize: "13px", color: "#4B5563", marginBottom: "4px" }}>Qty: {item.quantity}</div>
                      <div style={{ fontWeight: 700, color: "#DC2626" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
