"use client";


import { useEffect, useState } from "react";
import createAPI from "@/lib/api";
import { Banner } from "@/lib/types";
import Toast from "@/components/Toast";

import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

export default function AdminBanners() {
  const API = createAPI();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(""); // final cropped base64
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState<number>(0);
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
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await API.get("/banners");
      setBanners(res.data);
    } catch (error) {
      console.error("Failed to fetch banners", error);
    } finally {
      setLoading(false);
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
    setUploading(true);
    try {
      if (editId) {
        await API.put(`/banners/${editId}`, { title, link, isActive, order, image: image || undefined });
        setToastMsg({ message: "Banner updated", type: "success" });
      } else {
        await API.post("/banners", { title, link, isActive, order, image });
        setToastMsg({ message: "Banner created", type: "success" });
      }
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Failed to save banner", error);
      setToastMsg({ message: "Failed to save banner", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await API.delete(`/banners/${id}`);
      fetchBanners();
      setToastMsg({ message: "Banner deleted", type: "success" });
    } catch (error) {
      console.error("Failed to delete", error);
      setToastMsg({ message: "Failed to delete banner", type: "error" });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditId(banner._id);
    setTitle(banner.title || "");
    setLink(banner.link || "");
    setIsActive(banner.isActive);
    setOrder(banner.order || 0);
    setImage(""); // Clear image so we don't upload unless changed
  };

  const resetForm = () => {
    setTitle("");
    setLink("");
    setImage("");
    setIsActive(true);
    setOrder(0);
    setEditId(null);
    setFileStats(null);
  };

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8" }}>Loading...</div>;
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
              aspect={16 / 9} // 16:9 standard for better vertical inclusion (shows full subjects like heads)
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
            {/* Safe Area Overlay (Center 60%) */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60%", height: "60%",
              border: "2px dashed rgba(255, 255, 255, 0.7)",
              pointerEvents: "none",
              display: "flex", alignItems: "center", justifyContent: "center"
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
            {editId ? "Edit Banner" : "Add New Banner"}
          </h2>
          <form className="mm-form" onSubmit={handleSubmit}>
            <div className="mm-input-group">
              <label>Title <span style={{ color: "#9CA3AF", fontSize: "12px", fontWeight: 400 }}>(Optional)</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mm-input"
                placeholder="e.g., Summer Sale"
              />
            </div>
            <div className="mm-input-group">
              <label>Destination Link</label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="mm-input"
                placeholder="e.g., /search?q=electronics"
              />
            </div>
            <div className="mm-input-group">
              <label>Banner Image {editId && !image && <span style={{ fontSize: "12px", color: "#6B7280" }}>(Leave empty to keep current)</span>}</label>
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
                <img src={image} alt="Preview" style={{ width: "100%", borderRadius: "8px", objectFit: "cover" }} />
              </div>
            )}
            
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div className="mm-input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="mm-input"
                />
              </div>
              <div className="mm-input-group" style={{ flex: 1, marginBottom: 0, display: "flex", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "24px" }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="submit"
                className="mm-btn-primary"
                disabled={uploading}
                style={{ flex: 1 }}
              >
                {uploading ? "Saving..." : (editId ? "Update Banner" : "Create Banner")}
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

        {/* Banners List */}
        <div>
          {banners.length === 0 ? (
            <div className="mm-empty" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
              <div className="mm-empty-icon">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{ width: "48px", height: "48px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No banners uploaded</h3>
              <p style={{ fontSize: "14px" }}>Create your first hero banner.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {banners.map((banner) => (
                <div key={banner._id} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden", display: "flex" }}>
                  <div style={{ width: "200px", flexShrink: 0, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={banner.imageUrl} alt={banner.title} style={{ width: "100%", height: "100%", objectFit: "cover", maxHeight: "120px" }} />
                  </div>
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{banner.title || "Untitled Banner"}</h3>
                        <span className={`mm-badge ${banner.isActive ? "mm-badge-success" : "mm-badge-warning"}`}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#6B7280" }}>
                        <strong>Link:</strong> {banner.link || "N/A"}
                      </p>
                      <p style={{ fontSize: "13px", color: "#6B7280" }}>
                        <strong>Order:</strong> {banner.order}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "flex-end" }}>
                      <button
                        className="mm-btn-secondary"
                        onClick={() => handleEdit(banner)}
                        style={{ padding: "6px 12px", width: "auto", fontSize: "13px" }}
                      >
                        Edit
                      </button>
                      <button
                         className="mm-btn-secondary"
                        onClick={() => handleDelete(banner._id)}
                        style={{ padding: "6px 12px", width: "auto", fontSize: "13px", color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}
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
