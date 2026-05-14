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
      icon: "📦",
      title: "Your Orders",
      desc: "Track, return, or buy things again",
      link: "/orders",
    },
    {
      icon: "❤️",
      title: "Your Favorites",
      desc: "View and manage your saved products",
      link: "/favorites",
    },
    {
      icon: "🛒",
      title: "Shopping Cart",
      desc: "View, add or remove items and checkout",
      link: "/cart",
    },
    {
      icon: "🔒",
      title: "Login & Security",
      desc: "Edit login, name, and mobile number",
      link: "#",
    },
    {
      icon: "📍",
      title: "Your Addresses",
      desc: "Edit, remove, or set default address",
      link: "#",
    },
    {
      icon: "💳",
      title: "Payment Options",
      desc: "Edit or add payment methods",
      link: "#",
    },
    ...(user.role === "vendor"
      ? [
          {
            icon: "🏪",
            title: "Seller Central",
            desc: "Manage your products and sales",
            link: "/vendor/dashboard",
          },
        ]
      : []),
    ...(user.role === "admin"
      ? [
          {
            icon: "⚡",
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
