"use client";

export default function SkeletonCard() {
  return (
    <div className="mm-skeleton-card">
      <div className="mm-skeleton-image animate-pulse"></div>
      <div className="mm-skeleton-line short animate-pulse"></div>
      <div className="mm-skeleton-line long animate-pulse"></div>
      <div className="mm-skeleton-line medium animate-pulse"></div>
    </div>
  );
}
