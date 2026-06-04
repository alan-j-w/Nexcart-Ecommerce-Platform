"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/fetch-utils";
import HeroBanner from "./HeroBanner";

export default function ClientHeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    
    async function loadBanners() {
      try {
        setLoading(true);
        setError(false);
        const data = await safeFetch(`${API_BASE_URL}/banners/active`, {}, 8000, 3, 1000);
        if (active) {
          setBanners(data || []);
        }
      } catch (err) {
        console.error("Failed to load banners client-side:", err);
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBanners();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div 
        className="mm-hero animate-pulse" 
        style={{ 
          width: "100%", 
          height: "450px", 
          background: "#e5e7eb", 
          borderRadius: "8px", 
          marginBottom: "40px" 
        }}
      />
    );
  }

  if (error || banners.length === 0) {
    // Graceful fallback: render a static fallback slide
    const fallbackBanners: Banner[] = [
      {
        _id: "fallback-banner",
        title: "Welcome to Nexcart",
        imageUrl: "", // Blank or default image
        link: "/search",
        isActive: true,
        order: 0,
      }
    ];
    return <HeroBanner banners={fallbackBanners} />;
  }

  return <HeroBanner banners={banners} />;
}
