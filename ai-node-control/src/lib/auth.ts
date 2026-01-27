// Authentication helper for AI Command Center

const TOKEN_KEY = "ai_command_center_token";

/**
 * Get stored API token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store API token in localStorage
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear stored token
 */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Authenticated fetch wrapper - adds X-API-Key header
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("X-API-Key", token);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Authenticated JSON fetch
 */
export async function authFetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authFetch(url, options);
  
  if (response.status === 401) {
    // Token invalid, clear it
    clearToken();
    throw new Error("Unauthorized - please enter valid API token");
  }
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  
  return response.json();
}
