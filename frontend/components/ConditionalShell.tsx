"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const DASHBOARD_PREFIXES = ["/admin", "/vendor"];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = DASHBOARD_PREFIXES.some(p => pathname.startsWith(p));

  if (isDashboard) {
    // Dashboard routes render their own layout (no customer header/footer)
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
