// lib/constants.ts
let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// 1. Strip accidental "NEXT_PUBLIC_API_URL=" if copy-pasted into Vercel's value field
rawApiUrl = rawApiUrl.replace(/^NEXT_PUBLIC_API_URL=/, "");

// 2. Strip surrounding quotes if any
rawApiUrl = rawApiUrl.replace(/^["']|["']$/g, "");

// 3. Strip trailing slashes
rawApiUrl = rawApiUrl.replace(/\/+$/, "");

// 4. Ensure the URL ends with /api (so requests go to /api/products, not /products)
if (!rawApiUrl.endsWith("/api")) {
  rawApiUrl = `${rawApiUrl}/api`;
}

export const API_BASE_URL = rawApiUrl;

export const IS_SERVER = typeof window === "undefined";
