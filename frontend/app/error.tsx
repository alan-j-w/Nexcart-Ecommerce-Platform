"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="mm-empty" style={{ padding: "60px 20px" }}>
      <div className="mm-empty-icon">⚠️</div>
      <h3>Something went wrong!</h3>
      <p style={{ color: "#6B7280", marginBottom: "20px" }}>
        {error.message || "An unexpected error occurred while loading the page."}
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <button onClick={() => reset()} className="mm-btn-secondary" style={{ width: "auto", padding: "10px 24px" }}>
          Try again
        </button>
        <Link href="/" className="mm-btn-primary" style={{ width: "auto", padding: "10px 24px" }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
