"use client";

import { useEffect, useState } from "react";
import createAPI from "@/lib/api";

const STATUSES = ["pending", "paid", "shipped", "delivered"];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#422006", color: "#FCD34D" },
  paid:      { bg: "#052E16", color: "#34D399" },
  shipped:   { bg: "#172554", color: "#93C5FD" },
  delivered: { bg: "#2E1065", color: "#C4B5FD" },
};

export default function AdminOrders() {
  const API = createAPI();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    try { const res = await API.get("/admin/orders"); setOrders(res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setBusy(id);
    try { await API.put(`/admin/orders/${id}/status`, { status }); await load(); showToast("Status updated"); }
    catch { showToast("Failed"); } finally { setBusy(null); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o._id.includes(search) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#1E293B", color: "#F8FAFC", padding: "12px 20px", borderRadius: "8px", zIndex: 999, border: "1px solid #334155" }}>
          {toast}
        </div>
      )}

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        <div style={{ background: "#1E293B", borderRadius: "10px", padding: "16px", border: "1px solid #334155" }}>
          <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px" }}>TOTAL ORDERS</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#F8FAFC" }}>{orders.length}</div>
        </div>
        <div style={{ background: "#1E293B", borderRadius: "10px", padding: "16px", border: "1px solid #334155" }}>
          <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px" }}>TOTAL REVENUE</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#FBBF24" }}>₹{totalRevenue.toLocaleString("en-IN")}</div>
        </div>
        {STATUSES.map(s => (
          <div key={s} style={{ background: "#1E293B", borderRadius: "10px", padding: "16px", border: "1px solid #334155" }}>
            <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "4px", textTransform: "uppercase" }}>{s}</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: STATUS_STYLE[s]?.color || "#F8FAFC" }}>
              {orders.filter(o => o.status === s).length}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {["all", ...STATUSES].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: "5px 14px", borderRadius: "20px", border: "none", cursor: "pointer",
              fontSize: "12px", fontWeight: 600, textTransform: "capitalize",
              background: statusFilter === s ? "#6D28D9" : "#1E293B",
              color: statusFilter === s ? "#fff" : "#94A3B8",
            }}>{s}</button>
          ))}
        </div>
        <input type="text" placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #334155", background: "#0F172A", color: "#F8FAFC", fontSize: "13px", width: "260px", outline: "none", marginLeft: "auto" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#475569" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#475569" }}>No orders found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Order ID", "Customer", "Items", "Amount", "Status", "Date", "Update"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id} style={{ borderBottom: "1px solid #0F172A" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#0F172A"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ""}
                >
                  <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: "12px", fontFamily: "monospace" }}>
                    #{o._id.slice(-8).toUpperCase()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ color: "#F8FAFC", fontSize: "13px", fontWeight: 600 }}>{o.user?.name || "Guest"}</div>
                    <div style={{ color: "#475569", fontSize: "11px" }}>{o.user?.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {o.items?.slice(0, 2).map((item: any, i: number) => (
                        <div key={i} style={{ fontSize: "12px", color: "#94A3B8" }}>
                          {item.product?.name?.slice(0, 25) || "Product"} × {item.quantity}
                        </div>
                      ))}
                      {o.items?.length > 2 && <div style={{ fontSize: "11px", color: "#475569" }}>+{o.items.length - 2} more</div>}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#FBBF24", fontWeight: 700 }}>
                    ₹{o.totalAmount?.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                      ...(STATUS_STYLE[o.status] || { bg: "#1E293B", color: "#64748B" }),
                    }}>{o.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontSize: "12px" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o._id, e.target.value)}
                      disabled={busy === o._id}
                      style={{
                        padding: "5px 10px", borderRadius: "6px", border: "1px solid #334155",
                        background: "#0F172A", color: "#F8FAFC", fontSize: "12px", cursor: "pointer", outline: "none",
                      }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
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
