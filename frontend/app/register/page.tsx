"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, role);
      if (role === "vendor") {
        setSuccess("Account created! Your vendor account is pending admin approval. Please check back later.");
      } else {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
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
        <h1>Create Account</h1>

        {error && <div className="mm-auth-error">{error}</div>}
        {success && (
          <div
            style={{
              background: "#D1FAE5",
              color: "#065F46",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "12px",
              border: "1px solid #A7F3D0",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Your name</label>
          <input
            type="text"
            id="name"
            placeholder="First and last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirm-password">Re-enter password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label htmlFor="role">I want to</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">🛒 Shop on Nexcart</option>
            <option value="vendor">🏪 Sell on Nexcart</option>
          </select>

          {role === "vendor" && (
            <p
              style={{
                fontSize: "12px",
                color: "#92400E",
                background: "#FEF3C7",
                padding: "8px 10px",
                borderRadius: "6px",
                marginTop: "10px",
              }}
            >
              ⚠️ Vendor accounts require admin approval before you can start selling.
            </p>
          )}

          <button
            type="submit"
            className="mm-btn-primary"
            disabled={loading}
            id="register-btn"
          >
            {loading ? "Creating account..." : "Create your Nexcart account"}
          </button>
        </form>

        <div style={{ margin: "20px 0", textAlign: "center", position: "relative" }}>
          <hr style={{ border: "0", borderTop: "1px solid #E5E7EB" }} />
          <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#fff", padding: "0 10px", fontSize: "12px", color: "#6B7280" }}>OR</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                googleLogin(credentialResponse.credential)
                  .then(() => router.push("/"))
                  .catch((err: any) => {
                    console.error("Google Signup Backend Error:", err);
                    setError("Google signup failed. Please try a standard browser.");
                  });
              }
            }}
            onError={() => {
              setError("Google signup failed. This browser might be restricted.");
            }}
            use_fedcm_for_prompt={true}
            ux_mode="popup"
            theme="filled_blue"
            shape="pill"
          />
        </div>

        <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "16px" }}>
          By creating an account, you agree to Nexcart&apos;s Conditions of Use and Privacy Notice.
        </p>

        <div className="mm-auth-divider">Already have an account?</div>

        <div className="mm-auth-footer">
          <Link href="/login">Sign in →</Link>
        </div>
      </div>

      <div style={{ height: "40px" }} />
    </div>
  );
}
