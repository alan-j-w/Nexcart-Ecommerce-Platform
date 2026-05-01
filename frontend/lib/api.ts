import axios from "axios";
import { API_BASE_URL } from "./constants";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to requests if available (for authenticated routes)
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;
