import axios from "axios";

// Create API ONLY when called (not at import time)
const createAPI = () => {
  const baseURL =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
      : "";

  const instance = axios.create({
    baseURL,
  });

  // Attach token safely
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return instance;
};

// Export the function instead of the instance
export default createAPI;
