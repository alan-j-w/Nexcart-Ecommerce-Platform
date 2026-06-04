"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Category } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { safeFetch } from "@/lib/fetch-utils";

export default function ClientCategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError(false);
        const data = await safeFetch(`${API_BASE_URL}/categories`, {}, 60000, 3, 1000);
        if (active) {
          setCategories(data || []);
        }
      } catch (err) {
        console.error("Failed to load categories client-side:", err);
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mm-categories-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: "300px", background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb" }}>
            <div className="animate-pulse" style={{ height: "20px", background: "#e5e7eb", width: "60%", marginBottom: "16px", borderRadius: "4px" }} />
            <div className="animate-pulse" style={{ height: "180px", background: "#e5e7eb", borderRadius: "8px" }} />
          </div>
        ))}
      </div>
    );
  }

  if (error || categories.length === 0) {
    return null; // Gracefully render nothing or a tiny placeholder if no categories
  }

  return (
    <div className="mm-categories-grid">
      {categories.map((cat: Category) => (
        <Link href={`/search?category=${cat.slug}`} key={cat._id} style={{ textDecoration: "none" }} prefetch={false}>
          <div className="mm-category-card">
            <h3>{cat.name}</h3>
            <div className="mm-category-card-image">
              <img src={cat.imageUrl} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ color: "#6D28D9", fontSize: "13px", fontWeight: 600 }}>
              Shop now →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
