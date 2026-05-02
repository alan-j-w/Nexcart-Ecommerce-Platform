"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import createAPI from "@/lib/api";

const MAX_SIZE_MB = 5;
const CATEGORIES = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports", "Beauty", "Toys & Games", "Other"];

// ── SVG Icons ────────────────────────────────────────────────────────
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconPencil = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconClose = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCamera = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;

// ── Multi-image upload ───────────────────────────────────────────────
function MultiImageUpload({ images, onChange, max = 6 }: { images: string[]; onChange: (imgs: string[]) => void; max?: number }) {
  const remaining = max - images.length;
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, remaining).forEach(file => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => onChange([...images, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };
  return (
    <div style={{ marginBottom: "16px" }}>
      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
          {images.map((src, i) => (
            <div key={i} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: i === 0 ? "2px solid #6D28D9" : "2px solid #E2E8F0", flexShrink: 0 }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && <span style={{ position: "absolute", bottom: "3px", left: "50%", transform: "translateX(-50%)", background: "#6D28D9", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px" }}>MAIN</span>}
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} style={{ position: "absolute", top: "2px", right: "2px", width: "18px", height: "18px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <IconClose size={9} />
              </button>
            </div>
          ))}
        </div>
      )}
      {remaining > 0 && (
        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", border: "2px dashed #CBD5E1", borderRadius: "8px", padding: images.length > 0 ? "14px" : "24px", cursor: "pointer", background: "#F8FAFC", transition: "border-color 0.2s" }}
          onMouseEnter={e => (e.currentTarget as HTMLLabelElement).style.borderColor = "#6D28D9"}
          onMouseLeave={e => (e.currentTarget as HTMLLabelElement).style.borderColor = "#CBD5E1"}>
          <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
          <IconCamera />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>{images.length === 0 ? "Click to add photos" : `Add more (${remaining} left)`}</span>
          <span style={{ fontSize: "11px", color: "#94A3B8" }}>PNG, JPG, WEBP · max {MAX_SIZE_MB}MB each</span>
        </label>
      )}
      {images.length > 0 && <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>{images.length}/{max} · First is the main image</p>}
    </div>
  );
}

// ── Product Form (shared for add/edit) ───────────────────────────────
function ProductForm({ initial, onSave, onCancel, saving }: {
  initial?: any; onSave: (data: any) => void; onCancel: () => void; saving: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "");
  const [stock, setStock] = useState(initial?.stock?.toString() || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) { setError("Add at least one product image."); return; }
    setError("");
    onSave({ name, description: desc, price: Number(price), stock: Number(stock), category, images, isActive });
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "14px", outline: "none", background: "#F8FAFC", color: "#1E293B" };
  const labelStyle: React.CSSProperties = { fontSize: "13px", fontWeight: 600, color: "#475569", display: "block", marginBottom: "5px", marginTop: "14px" };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {error && <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "10px" }}>{error}</div>}
      <label style={labelStyle}>Product Name</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wireless Earbuds Pro" required />
      <label style={labelStyle}>Description</label>
      <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your product..." required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Price (₹)</label>
          <input style={inputStyle} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="999" min="1" required />
        </div>
        <div>
          <label style={labelStyle}>Stock</label>
          <input style={inputStyle} type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="100" min="0" required />
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px" }}>
        <input 
          type="checkbox" 
          checked={isActive} 
          onChange={e => setIsActive(e.target.checked)}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
          id="isActive"
        />
        <label htmlFor="isActive" style={{ fontSize: "13px", fontWeight: 600, color: "#475569", cursor: "pointer" }}>
          Product is active and visible to customers
        </label>
      </div>

      <label style={labelStyle}>Photos <span style={{ fontWeight: 400, color: "#94A3B8" }}>(up to 6)</span></label>
      <MultiImageUpload images={images} onChange={setImages} max={6} />
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: "#6D28D9", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : initial ? "Save Changes" : "Create Product"}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 600, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main page ────────────────────────────────────────────────────────
export default function VendorProducts() {
  const API = createAPI();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(searchParams.get("add") === "1");
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    setLoading(true);
    try { const res = await API.get("/products/vendor"); setProducts(res.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data: any) => {
    setSaving(true);
    try { await API.post("/products", data); setShowForm(false); await load(); showToast("Product created!"); }
    catch (err: any) { showToast(err.response?.data?.error || "Failed"); } finally { setSaving(false); }
  };

  const handleEdit = async (data: any) => {
    if (!editProduct) return;
    setSaving(true);
    try { await API.put(`/products/${editProduct._id}`, data); setEditProduct(null); await load(); showToast("Product updated!"); }
    catch (err: any) { showToast(err.response?.data?.error || "Failed"); } finally { setSaving(false); }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await API.put(`/products/${id}`, { isActive: !currentStatus });
      setProducts(products.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
      showToast(`Product ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (err: any) {
      showToast("Failed to update status");
    }
  };

  const filtered = products.filter(p => 
    (p.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (p.category?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
      {/* Toast */}
      {toast && <div style={{ position: "fixed", top: "20px", right: "20px", background: "#1E293B", color: "#F8FAFC", padding: "12px 20px", borderRadius: "8px", zIndex: 999, border: "1px solid #334155" }}>{toast}</div>}

      {/* Left: Product list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: "9px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px", outline: "none", background: "#fff" }}
          />
          <button onClick={() => { setShowForm(true); setEditProduct(null); }} style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px",
            borderRadius: "8px", border: "none", background: "#6D28D9", color: "#fff",
            fontWeight: 700, fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            <IconPlus /> Add Product
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>
              {products.length === 0 ? "No products yet — add your first product!" : "No products matching search"}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                  {["Product", "Category", "Price", "Stock", "Status", "Edit"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #F1F5F9" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#F8FAFC"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ""}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "8px", overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
                          {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "13px", color: "#1E293B" }}>{p.name}</div>
                          <div style={{ fontSize: "11px", color: "#94A3B8" }}>{p.description?.slice(0, 40)}...</div>
                          {p.images?.length > 1 && <div style={{ fontSize: "10px", color: "#6D28D9", marginTop: "1px" }}>+{p.images.length - 1} photos</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: "4px", background: "#F1F5F9", color: "#64748B", fontSize: "12px" }}>{p.category || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1E293B" }}>₹{p.price?.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px 16px", color: p.stock > 0 ? "#059669" : "#DC2626", fontWeight: 600 }}>{p.stock}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div 
                        onClick={() => handleToggleStatus(p._id, p.isActive)}
                        style={{ 
                          width: "36px", 
                          height: "18px", 
                          background: p.isActive ? "#10B981" : "#CBD5E1", 
                          borderRadius: "20px", 
                          position: "relative", 
                          cursor: "pointer", 
                          transition: "0.2s" 
                        }}
                      >
                        <div style={{ 
                          position: "absolute", 
                          top: "2px", 
                          left: p.isActive ? "20px" : "2px", 
                          width: "14px", 
                          height: "14px", 
                          background: "#fff", 
                          borderRadius: "50%", 
                          transition: "0.2s" 
                        }} />
                      </div>
                      <span style={{ fontSize: "10px", color: p.isActive ? "#059669" : "#64748B", fontWeight: 600, marginTop: "4px", display: "block" }}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => { setEditProduct(p); setShowForm(false); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #6D28D9", background: "transparent", color: "#6D28D9", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                        <IconPencil /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right: Add/Edit form panel */}
      {(showForm || editProduct) && (
        <div style={{ width: "420px", flexShrink: 0, background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "22px", position: "sticky", top: "80px", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1E293B" }}>
              {editProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <button onClick={() => { setShowForm(false); setEditProduct(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
              <IconClose size={18} />
            </button>
          </div>
          <ProductForm
            initial={editProduct}
            onSave={editProduct ? handleEdit : handleCreate}
            onCancel={() => { setShowForm(false); setEditProduct(null); }}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
}
