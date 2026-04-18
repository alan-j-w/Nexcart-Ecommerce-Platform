"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function VendorEarnings() {
  const [data, setData] = useState<{ totalEarnings: number; totalOrders: number; topProducts: any[] } | null>(null);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/orders/vendor/earnings"),
      API.get("/orders/vendor"),
    ]).then(([earn, ords]) => {
      setData(earn.data);
      setAllOrders(ords.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>Loading earnings...</div>;

  const paid = allOrders.filter(o => o.status !== "pending");
  const pending = allOrders.filter(o => o.status === "pending");
  const pendingAmount = pending.reduce((s, o) => s + (o.vendorTotal || 0), 0);
  const avgOrderValue = paid.length > 0 ? (data?.totalEarnings || 0) / paid.length : 0;

  // Monthly breakdown
  const monthly: Record<string, number> = {};
  allOrders
    .filter(o => ["paid", "shipped", "delivered"].includes(o.status))
    .forEach(o => {
      const month = new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      monthly[month] = (monthly[month] || 0) + (o.vendorTotal || 0);
    });
  const monthEntries = Object.entries(monthly).slice(-6);
  const maxMonthly = Math.max(...monthEntries.map(([, v]) => v), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
        {[
          { label: "Total Earnings", value: `₹${(data?.totalEarnings || 0).toLocaleString("en-IN")}`, color: "#059669", sub: "Confirmed orders" },
          { label: "Pending Payout", value: `₹${pendingAmount.toLocaleString("en-IN")}`, color: "#F59E0B", sub: "Awaiting confirmation" },
          { label: "Orders Fulfilled", value: paid.length, color: "#6D28D9", sub: "Paid / shipped / delivered" },
          { label: "Avg Order Value", value: `₹${Math.round(avgOrderValue).toLocaleString("en-IN")}`, color: "#06B6D4", sub: "Per confirmed order" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "6px", fontWeight: 600 }}>{card.label}</div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: "11px", color: "#CBD5E1", marginTop: "4px" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      {monthEntries.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "22px" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>Monthly Revenue</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "140px" }}>
            {monthEntries.map(([month, value]) => (
              <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600 }}>₹{(value / 1000).toFixed(1)}k</div>
                <div style={{
                  width: "100%", borderRadius: "6px 6px 0 0",
                  height: `${Math.max((value / maxMonthly) * 110, 8)}px`,
                  background: "linear-gradient(to top, #6D28D9, #7C3AED)",
                  transition: "height 0.3s",
                }} />
                <div style={{ fontSize: "11px", color: "#94A3B8" }}>{month}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top products */}
      {data?.topProducts && data.topProducts.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>Top Performing Products</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                {["Product", "Units Sold", "Revenue", "Share"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => {
                const share = data.totalEarnings > 0 ? ((p.revenue / data.totalEarnings) * 100).toFixed(1) : "0";
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: i === 0 ? "#FEF3C7" : "#F1F5F9", color: i === 0 ? "#92400E" : "#64748B", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        {p.image && <img src={p.image} alt="" style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />}
                        <span style={{ fontWeight: 600, fontSize: "13px", color: "#1E293B" }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748B", fontSize: "13px" }}>{p.unitsSold} units</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#059669" }}>₹{p.revenue.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "#F1F5F9", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${share}%`, background: "#6D28D9", borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontSize: "12px", color: "#64748B", minWidth: "36px" }}>{share}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* All orders breakdown */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>Order History</h3>
        </div>
        {allOrders.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>No orders yet</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                {["Date", "Order ID", "Customer", "Items", "Your Earnings", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allOrders.slice(0, 20).map(o => (
                <tr key={o._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "11px 16px", color: "#64748B", fontSize: "12px" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td style={{ padding: "11px 16px", color: "#94A3B8", fontSize: "12px", fontFamily: "monospace" }}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td style={{ padding: "11px 16px", color: "#1E293B", fontSize: "13px", fontWeight: 600 }}>{o.user?.name || "—"}</td>
                  <td style={{ padding: "11px 16px", color: "#64748B", fontSize: "12px" }}>{o.items?.length}</td>
                  <td style={{ padding: "11px 16px", fontWeight: 700, color: o.status === "pending" ? "#F59E0B" : "#059669" }}>
                    ₹{o.vendorTotal?.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: o.status === "pending" ? "#FEF3C7" : o.status === "delivered" ? "#EDE9FE" : "#D1FAE5", color: o.status === "pending" ? "#92400E" : o.status === "delivered" ? "#5B21B6" : "#065F46" }}>
                      {o.status}
                    </span>
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
