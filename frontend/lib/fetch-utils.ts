import { 
  getBackendStatus, 
  subscribeBackendStatus, 
  incrementActiveRequests, 
  decrementActiveRequests 
} from "./backendStatus";

/**
 * Production-grade fetch wrapper for Server & Client Components.
 * Includes:
 * - Request timeouts (prevents hanging SSR)
 * - Exponential retry logic (for cold start resilience)
 * - Intelligent caching/revalidation
 * - Error status checking & logging
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  timeout = 60000,
  retries = 3,
  delay = 1000
): Promise<any> {
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

  let attempt = 0;
  
  while (attempt < retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      incrementActiveRequests();
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(id);
      decrementActiveRequests();

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(id);
      decrementActiveRequests();
      attempt++;
      
      const isTimeout = error.name === "AbortError" || error.message?.includes("timeout") || error.message?.includes("aborted");
      const errorMessage = isTimeout ? "Request timed out" : error.message || error;
      
      console.warn(
        `[Fetch Warning] Attempt ${attempt} failed for ${url}. Error: ${errorMessage}. ${
          attempt < retries ? `Retrying in ${delay * Math.pow(2, attempt - 1)}ms...` : "No more retries left."
        }`
      );

      if (attempt >= retries) {
        if (isTimeout) {
          throw new Error("Request timed out (Backend might be slow or down)");
        }
        throw error;
      }

      // Wait for exponential backoff before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
}


/**
 * Next.js-safe catch handler.
 * Prevents swallowing internal Next.js signals like DYNAMIC_SERVER_USAGE
 * while still allowing graceful fallback for real network errors.
 */
export async function handleNextSafeFetch<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error: any) {
    // Re-throw Next.js internal signals (build-time & dynamic rendering)
    // Next.js attaches a 'digest' property to its internal errors/signals.
    if (error?.digest) {
      throw error;
    }
    
    console.error("[Fetch Error]:", error.message || error);
    return null;
  }
}
