// lib/constants.ts
export const API_BASE_URL = 
  typeof window !== "undefined" 
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") 
    : "";

export const IS_SERVER = typeof window === "undefined";
