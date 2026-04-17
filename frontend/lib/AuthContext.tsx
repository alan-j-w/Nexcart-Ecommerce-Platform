"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import API from "@/lib/api";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (jwt: string) => {
    try {
      const res = await API.get("/auth/me", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUser(res.data);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await API.post("/auth/login", { email, password });
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem("token", jwt);
    setToken(jwt);
    // Fetch full user data
    await fetchUser(jwt);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: string) => {
    await API.post("/auth/register", { name, email, password, role });
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
