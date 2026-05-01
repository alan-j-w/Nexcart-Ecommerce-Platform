"use client";

import { useEffect, useState } from "react";
import createAPI from "@/lib/api";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  isApproved: boolean;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

const S = {
  btn: (color: string, bg: string, border: string): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: "6px", border: `1px solid ${border}`,
    background: bg, color: color, fontSize: "12px", fontWeight: 600,
    cursor: "pointer", transition: "opacity 0.15s", whiteSpace: "nowrap" as const,
  }),
};

export default function AdminVendors() {
  const API = createAPI();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [past, setPast] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "inactive">("all");
  const [toastMsg, setToastMsg] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };

  const load = async () => {
    try {
      const [a, b] = await Promise.all([API.get("/admin/vendors"), API.get("/admin/vendors/past")]);
      setVendors(a.data);
      setPast(b.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    setBusy(id);
    try { await API.put(`/admin/approve-vendor/${id}`); await load(); toast("Vendor approved!"); }
    catch { toast("Failed"); } finally { setBusy(null); }
  };

  const toggle = async (id: string) => {
    setBusy(id);
    try { await API.put(`/admin/toggle-vendor-active/${id}`); await load(); toast("Status updated"); }
    catch { toast("Failed"); } finally { setBusy(null); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete vendor "${name}"? This is reversible from the database.`)) return;
    setBusy(id);
    try { await API.delete(`/admin/vendor/${id}`); await load(); toast("Vendor deleted"); }
    catch { toast("Failed"); } finally { setBusy(null); }
  };

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "pending" ? !v.isApproved :
      filter === "active" ? v.isApproved && v.isActive :
      filter === "inactive" ? v.isApproved && !v.isActive : true;
    return matchSearch && matchFilter;
  });

  const pending = vendors.filter(v => !v.isApproved).length;
  const active  = vendors.filter(v => v.isApproved && v.isActive).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "#1E293B", color: "#F8FAFC", padding: "12px 20px", borderRadius: "8px", zIndex: 999, border: "1px solid #334155", fontSize: "14px" }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "12px", flex: 1 }}>
          {/* Stats pills */}
          {[
            { label: "All", count: vendors.length, key: "all" as const },
            { label: "Pending", count: pending, key: "pending" as const },
            { label: "Active", count: active, key: "active" as const },
            { label: "Inactive", count: vendors.filter(v => v.isApproved && !v.isActive).length, key: "inactive" as const },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              background: filter === f.key ? "#6D28D9" : "#1E293B",
              color: filter === f.key ? "#fff" : "#94A3B8",
              transition: "all 0.15s",
            }}>
              {f.label} · {f.count}
            </button>
          ))}
        </div>
        <input
          type="text" placeholder="Search vendors..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: "8px", border: "1px solid #334155",
            background: "#0F172A", color: "#F8FAFC", fontSize: "13px", width: "220px", outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#475569" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#475569" }}>No vendors found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Vendor", "Email", "Joined", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v._id} style={{ borderBottom: "1px solid #0F172A" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#0F172A"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ""}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: "14px",
                      }}>{v.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ color: "#F8FAFC", fontWeight: 600, fontSize: "14px" }}>{v.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#94A3B8", fontSize: "13px" }}>{v.email}</td>
                  <td style={{ padding: "14px 16px", color: "#64748B", fontSize: "12px" }}>
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {!v.isApproved ? (
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: "#422006", color: "#FCD34D" }}>Pending</span>
                    ) : v.isActive ? (
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: "#052E16", color: "#34D399" }}>Active</span>
                    ) : (
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: "#1E293B", color: "#64748B" }}>Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {!v.isApproved ? (
                        <button onClick={() => approve(v._id)} disabled={busy === v._id}
                          style={S.btn("#fff", "#6D28D9", "#6D28D9")}>
                          {busy === v._id ? "..." : "Approve"}
                        </button>
                      ) : (
                        <button onClick={() => toggle(v._id)} disabled={busy === v._id}
                          style={S.btn("#94A3B8", "#0F172A", "#334155")}>
                          {busy === v._id ? "..." : v.isActive ? "Suspend" : "Activate"}
                        </button>
                      )}
                      <button onClick={() => del(v._id, v.name)} disabled={busy === v._id}
                        style={S.btn("#EF4444", "#1E293B", "#991B1B")}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Past / Deleted */}
      {past.length > 0 && (
        <div style={{ background: "#1E293B", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden", opacity: 0.7 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #334155" }}>
            <h3 style={{ margin: 0, fontSize: "14px", color: "#EF4444", fontWeight: 700 }}>Deleted Vendors ({past.length})</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Vendor", "Email", "Joined"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {past.map(v => (
                <tr key={v._id} style={{ borderBottom: "1px solid #0F172A" }}>
                  <td style={{ padding: "10px 16px", color: "#64748B", textDecoration: "line-through", fontSize: "13px" }}>{v.name}</td>
                  <td style={{ padding: "10px 16px", color: "#475569", fontSize: "13px" }}>{v.email}</td>
                  <td style={{ padding: "10px 16px", color: "#475569", fontSize: "12px" }}>
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-IN") : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
