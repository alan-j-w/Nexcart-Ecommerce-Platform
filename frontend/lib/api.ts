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

    // If the server is sleeping, block the request here until it wakes up
    if (getBackendStatus() === "sleeping") {
      await new Promise<void>((resolve) => {
        const unsubscribe = subscribeBackendStatus((status) => {
          if (status === "online") {
            unsubscribe();
            resolve();
          }
        });
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

