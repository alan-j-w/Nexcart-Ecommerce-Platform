"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  images?: string[];
  isActive: boolean;
  vendor?: { name: string; email: string };
  createdAt?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    try { const res = await API.get("/admin/products"); setProducts(res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string) => {
    setBusy(id);
    try { await API.put(`/admin/products/${id}/toggle`); await load(); showToast("Product status updated"); }
    catch { showToast("Failed"); } finally { setBusy(null); }
  };

  const cats = ["all", ...Array.from(new Set(products.map(p => p.category || "Other")))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.vendor?.name.toLowerCase().includes(search.toLowerCase() || "");
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#1E293B", color: "#F8FAFC", padding: "12px 20px", borderRadius: "8px", zIndex: 999, border: "1px solid #334155" }}>
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{
              padding: "5px 14px", borderRadius: "20px", border: "none", cursor: "pointer",
              fontSize: "12px", fontWeight: 600, textTransform: "capitalize",
              background: catFilter === c ? "#6D28D9" : "#1E293B",
              color: catFilter === c ? "#fff" : "#94A3B8",
            }}>{c === "all" ? `All (${products.length})` : c}</button>
          ))}
        </div>
        <input type="text" placeholder="Search products or vendor..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #334155", background: "#0F172A", color: "#F8FAFC", fontSize: "13px", width: "240px", outline: "none" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#475569" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#475569" }}>No products found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Product", "Vendor", "Category", "Price", "Stock", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} style={{ borderBottom: "1px solid #0F172A" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#0F172A"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ""}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "8px", overflow: "hidden", background: "#0F172A", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        }
                      </div>
                      <div>
                        <div style={{ color: "#F8FAFC", fontWeight: 600, fontSize: "13px" }}>{p.name}</div>
                        <div style={{ color: "#475569", fontSize: "11px", marginTop: "2px" }}>{p.description?.slice(0, 40)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#94A3B8", fontSize: "13px" }}>{p.vendor?.name || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "4px", background: "#0F172A", color: "#94A3B8", fontSize: "12px" }}>{p.category || "—"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#FBBF24", fontWeight: 700, fontSize: "14px" }}>₹{p.price?.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 16px", color: p.stock > 0 ? "#34D399" : "#EF4444", fontWeight: 600 }}>{p.stock}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                      background: p.isActive ? "#052E16" : "#1E293B",
                      color: p.isActive ? "#34D399" : "#64748B",
                    }}>{p.isActive ? "Active" : "Hidden"}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => toggleActive(p._id)} disabled={busy === p._id}
                      style={{
                        padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                        border: "1px solid #334155", background: "#0F172A", color: "#94A3B8",
                        transition: "all 0.15s",
                      }}>
                      {busy === p._id ? "..." : p.isActive ? "Hide" : "Show"}
                    </button>
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
