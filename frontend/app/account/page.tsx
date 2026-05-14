"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function AccountPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="mm-loading">
        <div className="mm-spinner" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
      title: "Your Orders",
      desc: "Track, return, or buy things again",
      link: "/orders",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
      title: "Your Favorites",
      desc: "View and manage your saved products",
      link: "/favorites",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      ),
      title: "Shopping Cart",
      desc: "View, add or remove items and checkout",
      link: "/cart",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: "Login & Security",
      desc: "Edit login, name, and mobile number",
      link: "#",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z" />
          <circle cx="11" cy="10" r="3" />
        </svg>
      ),
      title: "Your Addresses",
      desc: "Edit, remove, or set default address",
      link: "#",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
      title: "Payment Options",
      desc: "Edit or add payment methods",
      link: "#",
    },
    ...(user.role === "vendor"
      ? [
          {
            icon: (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
            ),
            title: "Seller Central",
            desc: "Manage your products and sales",
            link: "/vendor/dashboard",
          },
        ]
      : []),
    ...(user.role === "admin"
      ? [
          {
            icon: (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            ),
            title: "Admin Panel",
            desc: "Manage vendors and platform",
            link: "/admin",
          },
        ]
      : []),
  ];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "20px" }}>Your Account</h1>

      {/* Account Info */}
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          border: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: "24px",
            flexShrink: 0,
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>{user.name}</h2>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>{user.email}</p>
          <span className={`mm-badge ${user.role === "admin" ? "mm-badge-error" : user.role === "vendor" ? "mm-badge-info" : "mm-badge-success"}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="mm-account-grid">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "20px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "#6D28D9";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            <span style={{ fontSize: "32px" }}>{item.icon}</span>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{item.title}</h3>
              <p style={{ fontSize: "13px", color: "#6B7280" }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Sign Out */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          className="mm-btn-secondary"
          style={{ width: "auto", padding: "10px 32px" }}
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
