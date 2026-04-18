"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

interface Stats {
  totalVendors: number;
  pendingVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FEF3C7", color: "#92400E" },
  paid:      { bg: "#D1FAE5", color: "#065F46" },
  shipped:   { bg: "#DBEAFE", color: "#1E40AF" },
  delivered: { bg: "#EDE9FE", color: "#5B21B6" },
};

function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div style={{
      background: "#1E293B", borderRadius: "12px", padding: "22px 24px",
      border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", color: "#94A3B8", fontWeight: 500 }}>{label}</span>
        <div style={{
          width: "38px", height: "38px", borderRadius: "10px",
          background: color + "22", display: "flex", alignItems: "center", justifyContent: "center",
          color: color,
        }}>{icon}</div>
      </div>
      <div style={{ fontSize: "30px", fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: "12px", color: "#64748B" }}>{sub}</div>}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #334155", borderTopColor: "#6D28D9", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const cards = [
    {
      label: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      color: "#FBBF24",
      sub: "All-time platform GMV",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      color: "#6D28D9",
      sub: "Orders placed",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    },
    {
      label: "Total Vendors",
      value: stats?.totalVendors || 0,
      color: "#06B6D4",
      sub: `${stats?.pendingVendors || 0} pending approval`,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    },
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      color: "#10B981",
      sub: "Listed on platform",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Pending vendors alert */}
      {(stats?.pendingVendors ?? 0) > 0 && (
        <div style={{
          background: "#422006", border: "1px solid #92400E", borderRadius: "10px",
          padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <span style={{ color: "#FEF3C7", fontWeight: 700, fontSize: "14px" }}>
              {stats?.pendingVendors} vendor{stats?.pendingVendors! > 1 ? "s" : ""} waiting for approval
            </span>
            <span style={{ color: "#FCD34D", fontSize: "13px", marginLeft: "8px" }}>
              — <a href="/admin/vendors" style={{ color: "#FCD34D", textDecoration: "underline" }}>Review now</a>
            </span>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#F8FAFC" }}>Recent Orders</h2>
          <a href="/admin/orders" style={{ fontSize: "13px", color: "#6D28D9", fontWeight: 600 }}>View all →</a>
        </div>
        {!stats?.recentOrders?.length ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#475569" }}>No orders yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Order ID", "Customer", "Amount", "Status", "Date"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders.map((order: any) => (
                <tr key={order._id} style={{ borderBottom: "1px solid #1E293B" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#0F172A"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ""}
                >
                  <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: "13px", fontFamily: "monospace" }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#F8FAFC", fontSize: "13px" }}>
                    {order.user?.name || "Guest"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#FBBF24", fontWeight: 700, fontSize: "14px" }}>
                    ₹{order.totalAmount?.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                      ...(STATUS_COLORS[order.status] || { bg: "#1E293B", color: "#94A3B8" }),
                    }}>{order.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontSize: "12px" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
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
