// lib/constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper to check if we are in the browser
export const IS_SERVER = typeof window === "undefined";
