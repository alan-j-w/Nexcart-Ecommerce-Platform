"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import createAPI from "@/lib/api";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  googleLogin: (credential: string) => Promise<void>;
  isAuthenticated: boolean;
  toggleFavorite: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const API = createAPI();
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

  const googleLogin = useCallback(async (credential: string) => {
    const res = await API.post("/auth/google-login", { idToken: credential });
    const { token: jwt, user: userData } = res.data;
    localStorage.setItem("token", jwt);
    setToken(jwt);
    setUser(userData);
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

  const toggleFavorite = async (productId: string) => {
    if (!token || !user) return;
    try {
      const res = await API.post(`/wishlist/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Optimistically update UI
      setUser(prev => {
        if (!prev) return null;
        const favorites = prev.favorites || [];
        const exists = favorites.includes(productId);
        return {
          ...prev,
          favorites: exists 
            ? favorites.filter(id => id !== productId)
            : [...favorites, productId]
        };
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        googleLogin,
        isAuthenticated: !!token && !!user,
        toggleFavorite,
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
