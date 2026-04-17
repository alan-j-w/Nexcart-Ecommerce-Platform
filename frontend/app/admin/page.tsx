"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { User } from "@/lib/types";
import Toast from "@/components/Toast";

export default function AdminPanel() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState<User[]>([]);
  const [pastVendors, setPastVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{message: string, type: "error" | "success"} | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.push("/login");
      } else {
        fetchAllVendors();
      }
    }
  }, [isAuthenticated, authLoading, user]);

  const fetchAllVendors = async () => {
    try {
      const [resActive, resPast] = await Promise.all([
        API.get("/admin/vendors"),
        API.get("/admin/vendors/past")
      ]);
      setVendors(resActive.data);
      setPastVendors(resPast.data);
    } catch {
      setVendors([]);
      setPastVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (vendorId: string) => {
    setApprovingId(vendorId);
    try {
      await API.put(`/admin/approve-vendor/${vendorId}`);
      fetchAllVendors();
      setToastMsg({ message: "Vendor approved!", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Failed to approve vendor", type: "error" });
    } finally {
      setApprovingId(null);
    }
  };

  const toggleVendorActive = async (vendorId: string) => {
    try {
      await API.put(`/admin/toggle-vendor-active/${vendorId}`);
      fetchAllVendors();
      setToastMsg({ message: "Vendor status updated", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Failed to toggle vendor status", type: "error" });
    }
  };

  const deleteVendor = async (vendorId: string) => {
    if (!confirm("Are you sure you want to delete this vendor? They will be moved to Past Vendors.")) return;
    try {
      await API.delete(`/admin/vendor/${vendorId}`);
      fetchAllVendors();
      setToastMsg({ message: "Vendor moved to trash", type: "success" });
    } catch (err) {
      setToastMsg({ message: "Failed to delete vendor", type: "error" });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  const pendingCount = vendors.filter((v) => !v.isApproved).length;
  const approvedCount = vendors.filter((v) => v.isApproved).length;

  return (
    <div className="mm-dashboard">
      {toastMsg && <Toast message={toastMsg.message} type={toastMsg.type} />}
      <div className="mm-dashboard-header">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "28px", height: "28px", color: "#6D28D9" }}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Admin Panel
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
            Manage vendors, products, and platform settings.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="mm-btn-primary"
            style={{ width: "auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px" }}
            onClick={() => router.push("/admin/categories")}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            Manage Categories
          </button>
          <button
            className="mm-btn-primary"
            style={{ width: "auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: "8px" }}
            onClick={() => router.push("/admin/banners")}
          >
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Manage Banners
          </button>
          <button
            className="mm-btn-secondary"
            style={{ width: "auto", padding: "10px 24px" }}
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", border: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>Total Vendors</p>
          <p style={{ fontSize: "32px", fontWeight: 800, color: "#6D28D9" }}>{vendors.length}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", border: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>Approved</p>
          <p style={{ fontSize: "32px", fontWeight: 800, color: "#059669" }}>{approvedCount}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "8px", padding: "20px", border: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>Pending Approval</p>
          <p style={{ fontSize: "32px", fontWeight: 800, color: "#F59E0B" }}>{pendingCount}</p>
        </div>
      </div>

      {/* Vendors Table */}
      <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        Vendor Management
      </h2>

      {vendors.length === 0 ? (
        <div className="mm-empty" style={{ background: "#fff", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
          <div className="mm-empty-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" style={{ width: "48px", height: "48px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No active vendors yet</h3>
        </div>
      ) : (
        <table className="mm-table" style={{ marginBottom: "32px" }}>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {vendor.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{vendor.name}</span>
                  </div>
                </td>
                <td style={{ color: "#6B7280" }}>{vendor.email}</td>
                <td style={{ color: "#6B7280", fontSize: "13px" }}>
                  {vendor.createdAt
                    ? new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>
                <td>
                  {!vendor.isApproved ? (
                    <span className="mm-badge mm-badge-warning">Pending</span>
                  ) : vendor.isActive ? (
                    <span className="mm-badge mm-badge-success">Active</span>
                  ) : (
                    <span className="mm-badge" style={{ background: "#F3F4F6", color: "#374151" }}>Inactive</span>
                  )}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {!vendor.isApproved ? (
                      <button
                        className="mm-btn-primary"
                        style={{ width: "auto", padding: "6px 16px", fontSize: "13px", borderRadius: "6px" }}
                        onClick={() => approveVendor(vendor._id)}
                        disabled={approvingId === vendor._id}
                      >
                        {approvingId === vendor._id ? "Approving..." : "✓ Approve"}
                      </button>
                    ) : (
                      <button
                        className="mm-btn-secondary"
                        style={{ width: "auto", padding: "6px 12px", fontSize: "13px", borderRadius: "6px" }}
                        onClick={() => toggleVendorActive(vendor._id)}
                      >
                        {vendor.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                    <button
                      className="mm-btn-secondary"
                      style={{ width: "auto", padding: "6px 12px", fontSize: "13px", borderRadius: "6px", color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}
                      onClick={() => deleteVendor(vendor._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Past Vendors Table */}
      <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px", marginTop: "32px", color: "#4B5563", display: "flex", alignItems: "center", gap: "8px" }}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        Past / Deleted Vendors
      </h2>
      {pastVendors.length === 0 ? (
        <div className="mm-empty" style={{ background: "#F9FAFB", borderRadius: "8px", border: "1px dashed #E5E7EB", padding: "24px" }}>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>No deleted vendors.</p>
        </div>
      ) : (
        <table className="mm-table" style={{ opacity: 0.8 }}>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pastVendors.map((vendor) => (
              <tr key={vendor._id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#D1D5DB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {vendor.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, color: "#6B7280", textDecoration: "line-through" }}>{vendor.name}</span>
                  </div>
                </td>
                <td style={{ color: "#9CA3AF" }}>{vendor.email}</td>
                <td style={{ color: "#9CA3AF", fontSize: "13px" }}>
                  {vendor.createdAt
                    ? new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>
                <td>
                  <span className="mm-badge" style={{ background: "#FEE2E2", color: "#991B1B" }}>Deleted</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
