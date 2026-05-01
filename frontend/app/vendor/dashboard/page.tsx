"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createAPI from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalStock: number;
  totalOrders: number;
  totalEarnings: number;
  recentOrders: any[];
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FEF3C7", color: "#92400E" },
  paid:      { bg: "#D1FAE5", color: "#065F46" },
  shipped:   { bg: "#DBEAFE", color: "#1E40AF" },
  delivered: { bg: "#EDE9FE", color: "#5B21B6" },
};

export default function VendorDashboard() {
  const API = createAPI();
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [products, orders, earnings] = await Promise.all([
          API.get("/products/vendor"),
          API.get("/orders/vendor"),
          API.get("/orders/vendor/earnings"),
        ]);
        const prods = products.data;
        const ords = orders.data;
        const earn = earnings.data;
        setStats({
          totalProducts: prods.length,
          activeProducts: prods.filter((p: any) => p.isActive).length,
          totalStock: prods.reduce((s: number, p: any) => s + p.stock, 0),
          totalOrders: ords.length,
          totalEarnings: earn.totalEarnings,
          recentOrders: ords.slice(0, 5),
        });
      } catch {} finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const cards = [
    { label: "Total Earnings", value: `₹${(stats?.totalEarnings || 0).toLocaleString("en-IN")}`, color: "#FBBF24", href: "/vendor/earnings",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
    { label: "Total Orders", value: stats?.totalOrders || 0, color: "#6D28D9", href: "/vendor/orders",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
    { label: "Active Products", value: stats?.activeProducts || 0, color: "#10B981", href: "/vendor/products",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
    { label: "Total Stock Units", value: stats?.totalStock?.toLocaleString("en-IN") || 0, color: "#06B6D4", href: "/vendor/products",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome */}
      <div style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4F46E5 100%)", borderRadius: "14px", padding: "24px 28px", color: "#fff" }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>Welcome back, {user?.name?.split(" ")[0]}!</h2>
        <p style={{ margin: "6px 0 16px", opacity: 0.85, fontSize: "14px" }}>Here&apos;s what&apos;s happening with your store today.</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => router.push("/vendor/products?add=1")} style={{
            padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer",
            background: "#fff", color: "#6D28D9", fontWeight: 700, fontSize: "13px",
          }}>
            + Add Product
          </button>
          <button onClick={() => router.push("/vendor/orders")} style={{
            padding: "8px 18px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer",
            background: "transparent", color: "#fff", fontWeight: 600, fontSize: "13px",
          }}>
            View Orders
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#94A3B8", padding: "40px" }}>Loading stats...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          {cards.map(c => (
            <div key={c.label} onClick={() => router.push(c.href)} style={{
              background: "#fff", borderRadius: "12px", padding: "20px",
              border: "1px solid #E2E8F0", cursor: "pointer",
              transition: "box-shadow 0.15s, transform 0.15s",
              display: "flex", flexDirection: "column", gap: "10px",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(109,40,217,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ""; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500 }}>{c.label}</span>
                <div style={{ color: c.color, background: c.color + "18", padding: "6px", borderRadius: "8px" }}>{c.icon}</div>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#1E293B" }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>Recent Orders</h3>
          <a href="/vendor/orders" style={{ fontSize: "13px", color: "#6D28D9", fontWeight: 600 }}>View all →</a>
        </div>
        {!stats?.recentOrders?.length ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No orders yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                {["Order ID", "Customer", "Items", "Earnings", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o: any) => (
                <tr key={o._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontSize: "12px", fontFamily: "monospace" }}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td style={{ padding: "12px 16px", color: "#1E293B", fontSize: "13px", fontWeight: 600 }}>{o.user?.name || "Customer"}</td>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontSize: "12px" }}>{o.items?.length} item{o.items?.length !== 1 ? "s" : ""}</td>
                  <td style={{ padding: "12px 16px", color: "#059669", fontWeight: 700 }}>₹{o.vendorTotal?.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, ...(STATUS_STYLE[o.status] || {}) }}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
