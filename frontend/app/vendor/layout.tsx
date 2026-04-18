"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";

const NAV = [
  {
    label: "Dashboard",
    href: "/vendor/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/vendor/products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/vendor/orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    label: "Earnings",
    href: "/vendor/earnings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "vendor")) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, user]);

  if (loading || !isAuthenticated || user?.role !== "vendor") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F8FAFC" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #E2E8F0", borderTopColor: "#6D28D9", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F1F5F9", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "230px" : "60px",
        background: "#fff",
        borderRight: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column",
        transition: "width 0.2s ease",
        flexShrink: 0, overflow: "hidden",
        position: "sticky", top: 0, height: "100vh",
        boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
      }}>
        {/* Logo */}
        <div style={{
          padding: "0 12px", borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", gap: "10px",
          height: "64px", flexShrink: 0,
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
            background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l1-6h16l1 6" />
              <path d="M3 9a2 2 0 002 2 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 002-2" />
              <path d="M5 11v9a1 1 0 001 1h12a1 1 0 001-1v-9" />
              <path d="M10 21v-5a2 2 0 014 0v5" />
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 800, fontSize: "15px", color: "#1E293B", letterSpacing: "-0.3px" }}>
                Nex<span style={{ color: "#FBBF24" }}>cart</span>
              </div>
              <div style={{ fontSize: "10px", color: "#94A3B8", letterSpacing: "1.5px", fontWeight: 600 }}>SELLER CENTRAL</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 10px", borderRadius: "8px", border: "none",
                  background: active ? "#EDE9FE" : "transparent",
                  color: active ? "#6D28D9" : "#64748B",
                  cursor: "pointer", width: "100%", textAlign: "left",
                  fontSize: "13px", fontWeight: active ? 700 : 500,
                  transition: "all 0.15s", whiteSpace: "nowrap",
                  borderLeft: active ? "3px solid #6D28D9" : "3px solid transparent",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; (e.currentTarget as HTMLButtonElement).style.color = "#1E293B"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; } }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Store info */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid #E2E8F0" }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: "#F8FAFC", borderRadius: "8px", marginBottom: "8px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "14px",
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: "11px", color: "#94A3B8" }}>Seller Account</div>
              </div>
            </div>
          )}
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px 10px", borderRadius: "8px", border: "none",
              background: "transparent", color: "#64748B",
              cursor: "pointer", width: "100%", fontSize: "13px",
              transition: "background 0.15s", marginBottom: "4px",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; (e.currentTarget as HTMLButtonElement).style.color = "#1E293B"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; }}
            title={!sidebarOpen ? "View Store" : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {sidebarOpen && <span>View Store</span>}
          </button>
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px 10px", borderRadius: "8px", border: "none",
              background: "transparent", color: "#EF4444",
              cursor: "pointer", width: "100%", fontSize: "13px",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: "64px", background: "#fff", borderBottom: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", padding: "0 24px", gap: "16px",
          position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", padding: "6px", borderRadius: "6px" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#F1F5F9"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", margin: 0 }}>
              {NAV.find(n => isActive(n.href))?.label ?? "Seller Central"}
            </h1>
          </div>
          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px", minWidth: 0 }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      `}</style>
    </div>
  );
}
