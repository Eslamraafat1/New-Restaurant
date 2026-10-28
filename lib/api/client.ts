import { apiConfig } from "./config";
import { ApiError } from "./errors";

/** Thin fetch wrapper used only when demo mode is off. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), apiConfig.timeoutMs);
  try {
    const res = await fetch(`${apiConfig.baseUrl}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    if (!res.ok) {
      let details: unknown;
      try { details = await res.json(); } catch { /* no body */ }
      throw new ApiError(`Request failed (${res.status})`, res.status, "http", details);
    }
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof DOMException && e.name === "AbortError") throw new ApiError("Request timed out", 0, "timeout");
    throw new ApiError("Network error", 0, "network");
  } finally {
    clearTimeout(timer);
  }
}
