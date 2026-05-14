import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { safeFetch, handleNextSafeFetch } from "@/lib/fetch-utils";

export const metadata = {
  title: "Search Results | Nexcart",
};

async function getProducts(query: string, category: string) {
  if (!API_BASE_URL) return { products: [], status: "error" };
  
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (category) params.append("category", category);

  const data: Product[] | null = await handleNextSafeFetch(safeFetch(`${API_BASE_URL}/products?${params.toString()}`, { 
    next: { revalidate: 10 } 
  }));

  if (!data) return { products: [], status: "error" };
  
  return { products: data, status: data.length > 0 ? "success" : "empty" };
}

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string, category?: string }> 
}) {
  const { q: query = "", category = "" } = await searchParams;
  const { products, status } = await getProducts(query, category);

  return (
    <div className="mm-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Results Header */}
      <div style={{ marginBottom: "16px" }}>
        {(query || category) ? (
          <>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              {products.length} results for
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#6D28D9", textTransform: "capitalize" }}>
              &quot;{query || category}&quot;
            </h1>
          </>
        ) : (
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>All Products</h1>
        )}
      </div>

      {status === "error" && (
        <p style={{ color: "#DC2626", fontSize: "14px", marginBottom: "16px" }}>
          ⚠️ We&apos;re having trouble reaching our catalog. Please try refreshing.
        </p>
      )}

      {/* Sort bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "10px 16px",
          background: "#fff",
          borderRadius: "4px",
          marginBottom: "16px",
          fontSize: "13px",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <span style={{ fontWeight: 700 }}>Sort by:</span>
        <span style={{ cursor: "pointer", color: "#6D28D9", fontWeight: 600 }}>Featured</span>
        <span style={{ cursor: "pointer", color: "#4B5563" }}>Price: Low to High</span>
        <span style={{ cursor: "pointer", color: "#4B5563" }}>Price: High to Low</span>
        <span style={{ cursor: "pointer", color: "#4B5563" }}>Newest Arrivals</span>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="mm-product-grid">
          {products.map((p: Product) => (
            <ProductCard key={p._id} product={p} showFavorite={true} />
          ))}
        </div>
      ) : status !== "error" && (
        <div className="mm-empty" style={{ background: "#fff", borderRadius: "8px" }}>
          <div className="mm-empty-icon">🔍</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700 }}>No results found</h3>
          <p style={{ fontSize: "14px", marginTop: "8px" }}>
            Try different keywords or browse our categories.
          </p>
        </div>
      )}
    </div>
  );
}
