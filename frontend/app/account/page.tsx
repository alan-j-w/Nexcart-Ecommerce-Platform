"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function AccountPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
      setIsLoggingOut(false);
    }
  };

  const activitySection = [
    {
      title: "Your Orders",
      desc: "Track packages, view past orders & receipts",
      link: "/orders",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
    {
      title: "Your Favorites",
      desc: "View and manage your saved wishlist items",
      link: "/favorites",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
    },
    {
      title: "Shopping Cart",
      desc: "View, update, or proceed to checkout",
      link: "/cart",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      ),
    },
  ];

  const settingsSection = [
    {
      title: "Login & Security",
      desc: "Edit password, email address, and security details",
      link: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      title: "Your Addresses",
      desc: "Edit, remove, or set default delivery addresses",
      link: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z" />
          <circle cx="11" cy="10" r="3" />
        </svg>
      ),
    },
    {
      title: "Payment Options",
      desc: "Manage cards, UPI, and saved payment methods",
      link: "#",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
  ];

  const managementSection = [
    ...(user.role === "admin"
      ? [
          {
            title: "Admin Panel",
            desc: "Manage vendors, platform catalog, orders & settings",
            link: "/admin",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ),
          },
        ]
      : []),
    ...(user.role === "vendor"
      ? [
          {
            title: "Seller Central",
            desc: "Manage your inventory, listings, orders and earnings",
            link: "/vendor/dashboard",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                <path d="M2 7h20" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const roleBadgeClass =
    user.role === "admin"
      ? "mm-account-badge-admin"
      : user.role === "vendor"
      ? "mm-account-badge-vendor"
      : "mm-account-badge-customer";

  return (
    <div className="mm-account-wrapper">
      {/* Header */}
      <div className="mm-account-header">
        <h1 className="mm-account-title">Your Account</h1>
        <p className="mm-account-subtitle">Manage your personal details, activity, and preferences</p>
      </div>

      {/* Minimal Profile Card */}
      <div className="mm-account-profile-card">
        <div className="mm-account-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="mm-account-profile-info">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h2 className="mm-account-profile-name">{user.name}</h2>
            <span className={`mm-account-badge ${roleBadgeClass}`}>
              {user.role}
            </span>
          </div>
          <p className="mm-account-profile-email">{user.email}</p>
        </div>
      </div>

      {/* Orders & Activity */}
      <div className="mm-account-section">
        <div className="mm-account-section-label">Orders & Activity</div>
        <div className="mm-account-card">
          {activitySection.map((item) => (
            <Link key={item.title} href={item.link} className="mm-account-item">
              <div className="mm-account-item-icon">{item.icon}</div>
              <div className="mm-account-item-content">
                <div className="mm-account-item-title">{item.title}</div>
                <div className="mm-account-item-desc">{item.desc}</div>
              </div>
              <svg className="mm-account-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Settings & Preferences */}
      <div className="mm-account-section">
        <div className="mm-account-section-label">Settings & Preferences</div>
        <div className="mm-account-card">
          {settingsSection.map((item) => (
            <Link key={item.title} href={item.link} className="mm-account-item">
              <div className="mm-account-item-icon">{item.icon}</div>
              <div className="mm-account-item-content">
                <div className="mm-account-item-title">{item.title}</div>
                <div className="mm-account-item-desc">{item.desc}</div>
              </div>
              <svg className="mm-account-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Management (Admin / Vendor) */}
      {managementSection.length > 0 && (
        <div className="mm-account-section">
          <div className="mm-account-section-label">Platform Management</div>
          <div className="mm-account-card">
            {managementSection.map((item) => (
              <Link key={item.title} href={item.link} className="mm-account-item">
                <div className="mm-account-item-icon">{item.icon}</div>
                <div className="mm-account-item-content">
                  <div className="mm-account-item-title">{item.title}</div>
                  <div className="mm-account-item-desc">{item.desc}</div>
                </div>
                <svg className="mm-account-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Account Actions / Sign Out */}
      <div className="mm-account-section">
        <div className="mm-account-section-label">Account Session</div>
        <div className="mm-account-card">
          <button
            type="button"
            className="mm-account-item mm-account-item-danger"
            onClick={handleSignOut}
            disabled={isLoggingOut}
          >
            <div className="mm-account-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </div>
            <div className="mm-account-item-content">
              <div className="mm-account-item-title">
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </div>
              <div className="mm-account-item-desc">
                Log out of your Nexcart account on this device
              </div>
            </div>
            <svg className="mm-account-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
