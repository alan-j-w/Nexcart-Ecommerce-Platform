"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";

const NAV = [
  {
    label: "Overview",
    href: "/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Vendors",
    href: "/admin/vendors",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 17H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-4" />
        <polyline points="16 3 21 3 21 10" /><line x1="14" y1="5" x2="21" y2="3" />
        <path d="M8.5 14.5A3.5 3.5 0 0 1 5 11V5h14v6a3.5 3.5 0 0 1-3.5 3.5h-7z" />
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Banners",
    href: "/admin/banners",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    label: "Dev Emails",
    href: "/admin/dev-emails",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, user]);

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0F172A" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #334155", borderTopColor: "#6D28D9", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0F172A", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "240px" : "64px",
        background: "#1E293B",
        borderRight: "1px solid #334155",
        display: "flex", flexDirection: "column",
        transition: "width 0.2s ease",
        flexShrink: 0, overflow: "hidden",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{
          padding: "20px 16px", borderBottom: "1px solid #334155",
          display: "flex", alignItems: "center", gap: "10px", minHeight: "64px",
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
            background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 800, fontSize: "16px", color: "#F8FAFC", letterSpacing: "-0.3px" }}>
                Nex<span style={{ color: "#FBBF24" }}>cart</span>
              </div>
              <div style={{ fontSize: "10px", color: "#64748B", letterSpacing: "1.5px", fontWeight: 600 }}>ADMIN PANEL</div>
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
                  padding: "10px 12px", borderRadius: "8px", border: "none",
                  background: active ? "linear-gradient(135deg, #6D28D9, #7C3AED)" : "transparent",
                  color: active ? "#fff" : "#94A3B8",
                  cursor: "pointer", width: "100%", textAlign: "left",
                  fontSize: "13px", fontWeight: active ? 700 : 500,
                  transition: "all 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#334155"; (e.currentTarget as HTMLButtonElement).style.color = "#F8FAFC"; }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8"; } }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid #334155" }}>
          {sidebarOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", marginBottom: "4px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: "13px",
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#F8FAFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: "11px", color: "#64748B" }}>Administrator</div>
              </div>
            </div>
          )}
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", borderRadius: "8px", border: "none",
              background: "transparent", color: "#EF4444",
              cursor: "pointer", width: "100%", fontSize: "13px", fontWeight: 600,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#450A0A"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
            title={!sidebarOpen ? "Sign Out" : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: "64px", background: "#1E293B", borderBottom: "1px solid #334155",
          display: "flex", alignItems: "center", padding: "0 24px", gap: "16px",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", padding: "6px" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
              {NAV.find(n => isActive(n.href))?.label ?? "Admin"}
            </h1>
          </div>
          <div style={{ fontSize: "12px", color: "#64748B" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px", overflowY: "auto", background: "#0F172A" }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1E293B; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
      `}</style>
    </div>
  );
}
