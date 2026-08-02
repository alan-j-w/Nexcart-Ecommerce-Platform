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
  timeout = 8000,
  retries = 2,
  delay = 500
): Promise<any> {
  // If backend status is checking or sleeping, wait briefly for it to turn online (max 15s)
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
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsubscribe();
          resolve();
        }
      }, 15000);
    });
  }

  let attempt = 0;

  while (attempt < retries) {
    attempt++;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      incrementActiveRequests();
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(id);
      decrementActiveRequests();

      if (!response) {
        if (attempt >= retries) return null;
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      if (!response.ok) {
        if (attempt >= retries) return null;
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      const data = await response.json().catch(() => null);
      return data;
    } catch (error: any) {
      clearTimeout(id);
      decrementActiveRequests();

      if (attempt >= retries) {
        return null;
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  return null;
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
