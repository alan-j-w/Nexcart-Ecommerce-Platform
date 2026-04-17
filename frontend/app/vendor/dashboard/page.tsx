"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Product } from "@/lib/types";

export default function VendorDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false); // start false — only set true when we actually fetch

  // ── Add Product modal ──────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fileStats, setFileStats] = useState<{ dimensions: string, size: string } | null>(null);

  // ── Edit Product modal ─────────────────────────────────────────────
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImageBase64, setEditImageBase64] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editFileStats, setEditFileStats] = useState<{ dimensions: string, size: string } | null>(null);

  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve

    if (!isAuthenticated || user?.role !== "vendor") {
      router.replace("/login"); // replace so back button doesn't loop
      return;
    }

    fetchProducts();
  }, [isAuthenticated, authLoading, user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products/vendor");
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Open edit modal, pre-fill fields ──────────────────────────────
  const openEdit = (product: Product) => {
    setEditProduct(product);
    setEditName(product.name);
    setEditDescription(product.description || "");
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setEditCategory(product.category || "");
    setEditImageBase64("");
    setEditImagePreview(product.images?.[0] || "");
    setEditError("");
    setEditFileStats(null);
  };

  const closeEdit = () => {
    setEditProduct(null);
    setEditFileStats(null);
  };

  // ── Submit edit ───────────────────────────────────────────────────
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setEditError("");
    setEditSaving(true);
    try {
      await API.put(`/products/${editProduct._id}`, {
        name: editName,
        description: editDescription,
        price: Number(editPrice),
        stock: Number(editStock),
        category: editCategory,
        ...(editImageBase64 ? { image: editImageBase64 } : {}),
      });
      closeEdit();
      await fetchProducts();
    } catch (err: any) {
      setEditError(err.response?.data?.error || "Failed to update product");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Create product ────────────────────────────────────────────────
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      await API.post("/products", {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        image: imageBase64,
      });
      setShowModal(false);
      setName(""); setDescription(""); setPrice("");
      setStock(""); setCategory(""); setImageBase64("");
      setFileStats(null);
      await fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  // Auth still resolving → show spinner
  if (authLoading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  // Auth done but not a vendor → redirect is triggered in useEffect, render nothing
  if (!isAuthenticated || user?.role !== "vendor") {
    return null;
  }

  // Products loading → show spinner
  if (loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  return (
    <div className="mm-dashboard">
      <div className="mm-dashboard-header">
        <div>
          <h1>🏪 Seller Central</h1>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
            Welcome back, {user?.name}! Manage your products and orders.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="mm-btn-secondary"
            style={{ width: "auto", padding: "10px 24px" }}
            onClick={async () => {
              router.push("/");
            }}
          >
            Sign Out
          </button>
          <button
            className="mm-btn-primary"
            style={{ width: "auto", padding: "10px 24px" }}
            onClick={() => setShowModal(true)}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", border: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>Total Products</p>
          <p style={{ fontSize: "32px", fontWeight: 800, color: "#6D28D9" }}>{products.length}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", border: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>Active Products</p>
          <p style={{ fontSize: "32px", fontWeight: 800, color: "#059669" }}>
            {products.filter((p) => p.isActive).length}
          </p>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", border: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>Total Stock</p>
          <p style={{ fontSize: "32px", fontWeight: 800, color: "#F59E0B" }}>
            {products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="mm-empty" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
          <div className="mm-empty-icon">📦</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No products yet</h3>
          <p style={{ fontSize: "14px" }}>Click &quot;Add Product&quot; to list your first product.</p>
        </div>
      ) : (
        <table className="mm-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "50px", height: "50px",
                        background: "#F3F4F6", borderRadius: "6px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "24px", flexShrink: 0, overflow: "hidden",
                      }}
                    >
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : "📦"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>
                        {product.description?.slice(0, 60)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="mm-badge mm-badge-info">{product.category || "N/A"}</span>
                </td>
                <td style={{ fontWeight: 700 }}>₹{product.price.toLocaleString("en-IN")}</td>
                <td>
                  <span style={{ color: product.stock > 0 ? "#059669" : "#DC2626", fontWeight: 600 }}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span className={`mm-badge ${product.isActive ? "mm-badge-success" : "mm-badge-error"}`}>
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => openEdit(product)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "6px 16px", borderRadius: "6px", border: "1px solid #6D28D9",
                      background: "transparent", color: "#6D28D9", fontSize: "13px",
                      fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#6D28D9";
                      (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "#6D28D9";
                    }}
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ── Add Product Modal ───────────────────────────────────────── */}
      {showModal && (
        <div className="mm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", width: "100%", padding: "30px" }}>
            <h2>Add New Product</h2>
            {formError && <div className="mm-auth-error">{formError}</div>}
            <form onSubmit={handleCreateProduct}>
              <label>Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wireless Bluetooth Headphones" required />

              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..." required />

              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home &amp; Kitchen</option>
                <option value="Books">Books</option>
                <option value="Sports">Sports</option>
                <option value="Beauty">Beauty</option>
                <option value="Toys">Toys &amp; Games</option>
                <option value="Other">Other</option>
              </select>

              <label>Price (₹)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="999" min="1" required />

              <label>Stock Quantity</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)}
                placeholder="100" min="0" required />

              <label>Product Image</label>
              <ImageUploadBox 
                imagePreview={imageBase64} 
                onImageChange={setImageBase64} 
                onStatsChange={setFileStats}
              />
              {fileStats && (
                <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "-12px", marginBottom: "16px", display: "flex", gap: "12px" }}>
                  <span><strong>Ratio:</strong> {fileStats.dimensions}</span>
                  <span><strong>Size:</strong> {fileStats.size}</span>
                </p>
              )}

              <div className="mm-modal-actions">
                <button type="submit" className="mm-btn-primary" disabled={saving}>
                  {saving ? "Creating..." : "Create Product"}
                </button>
                <button type="button" className="mm-btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Product Modal ──────────────────────────────────────── */}
      {editProduct && (
        <div className="mm-modal-overlay" onClick={closeEdit}>
          <div
            className="mm-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "620px", width: "100%", padding: "30px" }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>✏️ Edit Product</h2>
              <button
                onClick={closeEdit}
                style={{
                  background: "none", border: "none", fontSize: "22px",
                  cursor: "pointer", color: "#6B7280", lineHeight: 1,
                }}
              >✕</button>
            </div>

            {editError && <div className="mm-auth-error">{editError}</div>}

            <form onSubmit={handleEditProduct}>
              <label>Product Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />

              <label>Description</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />

              <label>Category</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required>
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home &amp; Kitchen</option>
                <option value="Books">Books</option>
                <option value="Sports">Sports</option>
                <option value="Beauty">Beauty</option>
                <option value="Toys">Toys &amp; Games</option>
                <option value="Other">Other</option>
              </select>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label>Price (₹)</label>
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)}
                    min="1" required />
                </div>
                <div>
                  <label>Stock Quantity</label>
                  <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)}
                    min="0" required />
                </div>
              </div>

              {/* Image upload with existing image preview */}
              <label style={{ display: "block", marginTop: "8px" }}>Product Photo</label>

              {/* Show current image if no new image selected */}
              {editImagePreview && !editImageBase64 && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "6px" }}>Current photo:</p>
                  <img
                    src={editImagePreview}
                    alt="Current product"
                    style={{
                      height: "100px", borderRadius: "8px",
                      border: "1px solid #E5E7EB", objectFit: "cover",
                    }}
                  />
                </div>
              )}

              <ImageUploadBox
                imagePreview={editImageBase64}
                onImageChange={setEditImageBase64}
                onStatsChange={setEditFileStats}
                placeholder={editImagePreview ? "Click to replace current photo" : "Click or drag image here"}
              />

              {editFileStats && (
                <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "-12px", marginBottom: "16px", display: "flex", gap: "12px" }}>
                  <span><strong>Ratio:</strong> {editFileStats.dimensions}</span>
                  <span><strong>Size:</strong> {editFileStats.size}</span>
                </p>
              )}

              {editImageBase64 && (
                <button
                  type="button"
                  onClick={() => setEditImageBase64("")}
                  style={{
                    fontSize: "12px", color: "#DC2626", background: "none",
                    border: "none", cursor: "pointer", marginTop: "-8px", marginBottom: "8px",
                  }}
                >
                  ✕ Remove new photo (keep current)
                </button>
              )}

              <div className="mm-modal-actions">
                <button type="submit" className="mm-btn-primary" disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="mm-btn-secondary" onClick={closeEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable image upload box ────────────────────────────────────────
function ImageUploadBox({
  imagePreview,
  onImageChange,
  onStatsChange,
  placeholder = "Click or drag image here",
}: {
  imagePreview: string;
  onImageChange: (b64: string) => void;
  onStatsChange?: (stats: { dimensions: string, size: string } | null) => void;
  placeholder?: string;
}) {
  return (
    <div
      style={{
        border: "2px dashed #D1D5DB", borderRadius: "8px",
        padding: "24px", textAlign: "center", cursor: "pointer",
        position: "relative", background: imagePreview ? "#F9FAFB" : "#FAFAFA",
        marginBottom: "16px", transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#6D28D9")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#D1D5DB")}
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              onImageChange(result);
              
              const img = new Image();
              img.onload = () => {
                if (onStatsChange) {
                  onStatsChange({
                    dimensions: `${img.width} x ${img.height} px`,
                    size: `${sizeInMB} MB`
                  });
                }
              };
              img.src = result;
            };
            reader.readAsDataURL(file);
          }
        }}
        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
      />
      {imagePreview ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img src={imagePreview} alt="Preview"
            style={{ maxHeight: "140px", borderRadius: "6px", objectFit: "contain" }} />
          <p style={{ fontSize: "12px", color: "#6D28D9", marginTop: "8px", fontWeight: 600 }}>
            Click to change image
          </p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: "30px", marginBottom: "6px" }}>📸</div>
          <p style={{ fontWeight: 600, color: "#4B5563", fontSize: "14px" }}>{placeholder}</p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>PNG, JPG, WEBP up to 5 MB</p>
        </div>
      )}
    </div>
  );
}
