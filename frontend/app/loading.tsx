import SkeletonCard from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "20px" }}>
      {/* Hero Skeleton */}
      <div 
        className="animate-pulse" 
        style={{ width: "100%", height: "450px", background: "#e5e7eb", borderRadius: "8px", marginBottom: "40px" }}
      />

      {/* Category Skeletons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "40px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: "300px", background: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb" }}>
            <div className="animate-pulse" style={{ height: "20px", background: "#e5e7eb", width: "60%", marginBottom: "16px" }} />
            <div className="animate-pulse" style={{ height: "180px", background: "#e5e7eb", borderRadius: "8px" }} />
          </div>
        ))}
      </div>

      {/* Product Skeletons */}
      <div style={{ display: "flex", gap: "16px", overflow: "hidden" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
