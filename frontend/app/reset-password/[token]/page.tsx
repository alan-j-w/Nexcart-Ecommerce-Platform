"use client";

import { useState } from "react";
import createAPI from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPassword() {
  const API = createAPI();
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match" });
    }

    setLoading(true);
    setMessage(null);

    try {
      await API.put(`/auth/reset-password/${token}`, { password });
      setMessage({ type: "success", text: "Password reset successful! Redirecting to login..." });
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Invalid or expired token. Please request a new one." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mm-auth-page min-h-screen overflow-visible">
       <Link href="/" className="mm-auth-logo">
        Nex<span style={{ color: "#FBBF24" }}>cart</span>
      </Link>

      <div className="mm-auth-card">
        <h1>Set New Password</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
          Please enter your new password below.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          {message && (
            <div style={{ 
              padding: "10px", 
              borderRadius: "6px", 
              fontSize: "12px", 
              marginBottom: "16px",
              background: message.type === "success" ? "#D1FAE5" : "#FEE2E2",
              color: message.type === "success" ? "#065F46" : "#991B1B",
              border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`
            }}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mm-btn-primary"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/forgot-password" style={{ fontSize: "13px", color: "#6D28D9", fontWeight: 600 }}>
            Link expired? Request a new one
          </Link>
        </div>
      </div>
    </div>
  );
}
