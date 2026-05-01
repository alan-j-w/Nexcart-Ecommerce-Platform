"use client";

import { useEffect, useState } from "react";
import createAPI from "@/lib/api";
import { Category } from "@/lib/types";
import Toast from "@/components/Toast";

import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

export default function AdminCategories() {
  const API = createAPI();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState(""); // final cropped base64
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{message: string, type: "error" | "success"} | null>(null);
  const [fileStats, setFileStats] = useState<{ dimensions: string, size: string } | null>(null);

  // Cropper State
  const [imageSrc, setImageSrc] = useState<string | null>(null); // raw uploaded image
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editId) {
      // Auto-generate slug only when creating new
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Get file size
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageSrc(result);

        // Get dimensions
        const img = new Image();
        img.onload = () => {
          setFileStats({
            dimensions: `${img.width} x ${img.height} px`,
            size: `${sizeInMB} MB`
          });
        };
        img.src = result;

        setIsCropping(true); // Open cropper modal
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropImage = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
        setImage(croppedBase64);
        setIsCropping(false);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
      setToastMsg({ message: "Failed to crop image", type: "error" });
    }
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setImageSrc(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!image && !editId)) {
      setToastMsg({ message: "Please provide the required fields including an image.", type: "error" });
      return;
    }
    
    setUploading(true);
    try {
      if (editId) {
        await API.put(`/categories/${editId}`, { name, slug, image: image || undefined });
        setToastMsg({ message: "Category updated", type: "success" });
      } else {
        await API.post("/categories", { name, slug, image });
        setToastMsg({ message: "Category created", type: "success" });
      }
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error("Failed to save category", error);
      setToastMsg({ message: error.response?.data?.error || "Failed to save category", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
      setToastMsg({ message: "Category deleted", type: "success" });
    } catch (error) {
      console.error("Failed to delete", error);
      setToastMsg({ message: "Failed to delete category", type: "error" });
    }
  };

  const handleEdit = (category: Category) => {
    setEditId(category._id);
    setName(category.name);
    setSlug(category.slug);
    setImage(""); // Clear image so we don't upload unless changed
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setImage("");
    setEditId(null);
    setFileStats(null);
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>Loading...</div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {toastMsg && <Toast message={toastMsg.message} type={toastMsg.type} />}
      {/* Cropper Modal */}
      {isCropping && imageSrc && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ position: "relative", width: "80vw", height: "60vh", background: "#333", borderRadius: "12px", overflow: "hidden" }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1} // 1:1 for category icons/images
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
            {/* Safe Area Overlay */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%", height: "80%",
              border: "2px dashed rgba(255, 255, 255, 0.7)",
              pointerEvents: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%" // Suggest circular usage mostly for categories if needed
            }}>
              <span style={{ color: "rgba(255, 255, 255, 0.5)", fontWeight: 700, textShadow: "0px 1px 2px #000" }}>
                SAFE AREA
              </span>
            </div>
          </div>
          <div style={{ marginTop: "24px", display: "flex", gap: "16px", background: "#fff", padding: "16px 32px", borderRadius: "12px" }}>
            <div className="mm-input-group" style={{ marginBottom: 0, width: "300px" }}>
              <label>Zoom</label>
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
            <button className="mm-btn-secondary" onClick={cancelCrop} style={{ width: "120px" }}>Cancel</button>
            <button className="mm-btn-primary" onClick={handleCropImage} style={{ width: "120px" }}>Crop & Save</button>
          </div>
        </div>
      )}



      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>     
        {/* Add/Edit Form */}
        <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #E5E7EB", height: "fit-content" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
            {editId ? "Edit Category" : "Add New Category"}
          </h2>
          <form className="mm-form" onSubmit={handleSubmit}>
            <div className="mm-input-group">
              <label>Category Name</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="mm-input"
                placeholder="e.g., Electronics"
                required
              />
            </div>
            <div className="mm-input-group">
              <label>Slug <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: 400 }}>(Auto-generated, editable)</span></label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mm-input"
                placeholder="e.g., electronics"
                required
              />
            </div>
            <div className="mm-input-group">
              <label>Image {editId && !image && <span style={{ fontSize: "12px", color: "#6B7280" }}>(Leave empty to keep current)</span>}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mm-input"
              />
              {fileStats && (
                <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px", display: "flex", gap: "12px" }}>
                  <span><strong>Ratio:</strong> {fileStats.dimensions}</span>
                  <span><strong>Size:</strong> {fileStats.size}</span>
                </p>
              )}
            </div>
            {image && (
              <div style={{ marginBottom: "16px", border: "2px solid #E5E7EB", padding: "4px", borderRadius: "12px" }}>
                <img src={image} alt="Preview" style={{ width: "100%", borderRadius: "8px", objectFit: "cover", aspectRatio: "1/1" }} />
              </div>
            )}
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                className="mm-btn-primary"
                disabled={uploading}
                style={{ flex: 1 }}
              >
                {uploading ? "Saving..." : (editId ? "Update Category" : "Create Category")}
              </button>
              {editId && (
                <button
                  type="button"
                  className="mm-btn-secondary"
                  onClick={resetForm}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div>
          {categories.length === 0 ? (
            <div className="mm-empty" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
              <div className="mm-empty-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{ width: "48px", height: "48px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No categories created</h3>
              <p style={{ fontSize: "14px" }}>Start by adding a product category.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
              {categories.map((category) => (
                <div key={category._id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ width: "100%", height: "180px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={category.imageUrl} alt={category.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{category.name}</h3>
                      <p style={{ fontSize: "13px", color: "#6B7280" }}>
                        <strong>Slug:</strong> {category.slug}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                      <button
                        className="mm-btn-secondary"
                        onClick={() => handleEdit(category)}
                        style={{ padding: "6px 12px", flex: 1, fontSize: "13px" }}
                      >
                        Edit
                      </button>
                      <button
                         className="mm-btn-secondary"
                        onClick={() => handleDelete(category._id)}
                        style={{ padding: "6px 12px", flex: 1, fontSize: "13px", color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
