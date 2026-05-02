/**
 * Production-grade fetch wrapper for Server Components.
 * Includes:
 * - Request timeouts (prevents hanging SSR)
 * - Intelligent caching/revalidation
 * - Error status checking
 */
export async function safeFetch(url: string, options: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timed out (Backend might be slow or down)");
    }
    throw error;
  }
}
