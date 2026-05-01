import { API_BASE_URL } from "./constants";

const createAPI = () => {
  if (typeof window === "undefined") {
    // Return a dummy object for server-side to prevent crashes
    return {
      get: () => Promise.resolve({ data: [] }),
      post: () => Promise.resolve({ data: {} }),
      put: () => Promise.resolve({ data: {} }),
      delete: () => Promise.resolve({ data: {} }),
      interceptors: { request: { use: () => {} }, response: { use: () => {} } }
    };
  }

  // Only load axios in the browser
  const axios = require("axios");
  
  const instance = axios.create({
    baseURL: API_BASE_URL,
  });

  instance.interceptors.request.use((config: any) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export default createAPI;
