"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage({ 
        type: "success", 
        text: "Check your Dev Emails dashboard to see the reset link!" 
      });
    } catch (err: any) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Something went wrong. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mm-auth-page">
       <Link href="/" className="mm-auth-logo">
        Nex<span style={{ color: "#FBBF24" }}>cart</span>
      </Link>

      <div className="mm-auth-card">
        <h1>Forgot Password?</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
          Enter your email and we'll help you reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link href="/login" style={{ fontSize: "13px", color: "#6D28D9", fontWeight: 600 }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
