import { API_BASE_URL } from "./constants";
import { 
  getBackendStatus, 
  subscribeBackendStatus, 
  incrementActiveRequests, 
  decrementActiveRequests 
} from "./backendStatus";

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

  instance.interceptors.request.use(async (config: any) => {
    incrementActiveRequests();

    // If the server is not online yet (checking or sleeping), wait max 15s
    if (getBackendStatus() !== "online") {
      await new Promise<void>((resolve) => {
        let resolved = false;
        const unsubscribe = subscribeBackendStatus((status) => {
          if (status === "online" && !resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        });
        // Safety timeout after 15s
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve();
          }
        }, 15000);
      });
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error: any) => {
    return Promise.reject(error);
  });

  instance.interceptors.response.use((response: any) => {
    decrementActiveRequests();
    return response;
  }, (error: any) => {
    decrementActiveRequests();
    return Promise.reject(error);
  });

  return instance;
};

export default createAPI;

