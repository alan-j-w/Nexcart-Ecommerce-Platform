"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DASHBOARD_PREFIXES = ["/admin", "/vendor"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthPage = AUTH_ROUTES.some(p => pathname === p || pathname.startsWith(p + "/"));

  if (isDashboard || isAuthPage) {
    // Dashboard and Auth routes render their own layout
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: "60vh" }}>{children}</main>
      <Footer />
    </>
  );
}
