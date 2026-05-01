"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FEF3C7", color: "#92400E" },
  paid:      { bg: "#D1FAE5", color: "#065F46" },
  shipped:   { bg: "#DBEAFE", color: "#1E40AF" },
  delivered: { bg: "#EDE9FE", color: "#5B21B6" },
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    API.get("/orders/vendor")
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATUSES = ["all", "pending", "paid", "shipped", "delivered"];

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = search === "" ||
      o._id.includes(search) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalEarnings = orders
    .filter(o => o.status !== "pending")
    .reduce((s, o) => s + (o.vendorTotal || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        <div style={{ background: "#fff", borderRadius: "10px", padding: "16px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Total Orders</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#1E293B" }}>{orders.length}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: "10px", padding: "16px", border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px", textTransform: "uppercase", fontWeight: 600 }}>Confirmed Revenue</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#059669" }}>₹{totalEarnings.toLocaleString("en-IN")}</div>
        </div>
        {["pending", "paid", "shipped", "delivered"].map(s => (
          <div key={s} style={{ background: "#fff", borderRadius: "10px", padding: "16px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px", textTransform: "capitalize", fontWeight: 600 }}>{s}</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: STATUS_STYLE[s]?.color || "#1E293B" }}>
              {orders.filter(o => o.status === s).length}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: "5px 14px", borderRadius: "20px", cursor: "pointer",
              fontSize: "12px", fontWeight: 600, textTransform: "capitalize",
              background: statusFilter === s ? "#6D28D9" : "#fff",
              color: statusFilter === s ? "#fff" : "#64748B",
              border: statusFilter === s ? "none" : "1px solid #E2E8F0",
            } as React.CSSProperties}>{s}</button>
          ))}
        </div>
        <input type="text" placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px", width: "240px", outline: "none", marginLeft: "auto", background: "#fff" }}
        />
      </div>

      {/* Orders */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "60px", textAlign: "center", color: "#94A3B8" }}>
            No orders found
          </div>
        ) : (
          filtered.map(o => (
            <div key={o._id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
              {/* Order header row */}
              <div
                onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ""}
              >
                <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#64748B", minWidth: "100px" }}>
                  #{o._id.slice(-8).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#1E293B" }}>{o.user?.name || "Customer"}</div>
                  <div style={{ fontSize: "11px", color: "#94A3B8" }}>{o.user?.email}</div>
                </div>
                <div style={{ fontSize: "13px", color: "#94A3B8" }}>
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#059669", minWidth: "100px", textAlign: "right" }}>
                  ₹{o.vendorTotal?.toLocaleString("en-IN")}
                </div>
                <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, ...(STATUS_STYLE[o.status] || {}), minWidth: "80px", textAlign: "center" }}>
                  {o.status}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: expanded === o._id ? "rotate(180deg)" : "none", flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {/* Expanded items */}
              {expanded === o._id && (
                <div style={{ borderTop: "1px solid #F1F5F9", padding: "16px 20px", background: "#F8FAFC" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Product", "Qty", "Unit Price", "Subtotal"].map(h => (
                          <th key={h} style={{ textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: 600, paddingBottom: "8px", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {o.items?.map((item: any, i: number) => (
                        <tr key={i} style={{ borderTop: "1px solid #E2E8F0" }}>
                          <td style={{ padding: "10px 0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />}
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1E293B" }}>{item.product?.name || "Product"}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: "13px", color: "#64748B" }}>×{item.quantity}</td>
                          <td style={{ fontSize: "13px", color: "#1E293B" }}>₹{item.price?.toLocaleString("en-IN")}</td>
                          <td style={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>₹{(item.price * item.quantity)?.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
