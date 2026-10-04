"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import createAPI from "@/lib/api";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const API = createAPI();
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Fetch user's role to redirect to the correct dashboard
      const token = localStorage.getItem("token");
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const role = res.data?.role;
      if (role === "vendor") {
        router.push("/vendor/dashboard");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
        <h1>Sign In</h1>

        {error && <div className="mm-auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: "12px", color: "#6D28D9", fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginTop: "6px" }}
          />

          <button
            type="submit"
            className="mm-btn-primary"
            disabled={loading}
            id="login-btn"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mm-auth-or-divider">
          <hr />
          <span>OR</span>
        </div>

        <GoogleSignInButton
          label="Sign in with Google"
          onSuccess={(idToken, accessToken) => {
            googleLogin(idToken, accessToken)
              .then(() => router.push("/"))
              .catch((err: any) => {
                console.error("Google Login Backend Error:", err);
                const backendMsg = err.response?.data?.error || err.message;
                setError(backendMsg || "Google login failed. Please try again.");
              });
          }}
          onError={(msg) => setError(msg)}
        />

        <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "16px" }}>
          By continuing, you agree to Nexcart&apos;s Conditions of Use and Privacy Notice.
        </p>
      </div>

      <div className="mm-auth-divider">New to Nexcart?</div>

      <Link
        href="/register"
        className="mm-btn-secondary"
        style={{
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
          display: "block",
          borderRadius: "10px",
          position: "relative",
          zIndex: 1,
        }}
        id="create-account-link"
      >
        Create your Nexcart account
      </Link>

      <div className="mm-auth-footer" style={{ marginTop: "30px", marginBottom: "30px" }}>
        <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
          © {new Date().getFullYear()} Nexcart. All rights reserved.
        </p>
      </div>
    </div>
  );
}
