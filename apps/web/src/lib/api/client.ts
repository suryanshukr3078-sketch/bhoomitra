import { env } from '@/lib/environment';
import { resolveApiUrl } from '@/lib/api-url';

export const API_URL = env.apiUrl;

if (typeof window !== 'undefined') {
  console.debug(`[API Client] Initialized with API_URL: ${API_URL}`);
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const local = localStorage.getItem('access_token');
    if (local && local.trim()) return local.trim();
  } catch {}
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('access_token', token);
    } catch {}
    if (typeof document !== 'undefined') {
      document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax; Secure`;
    }
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('access_token');
    } catch {}
    if (typeof document !== 'undefined') {
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
    }
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const clientMemoryCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 45 * 1000; // 45s fresh in-memory TTL

export function invalidateApiCache(pathPrefix?: string): void {
  if (!pathPrefix) {
    clientMemoryCache.clear();
    return;
  }
  Array.from(clientMemoryCache.keys()).forEach((key) => {
    if (key.includes(pathPrefix)) {
      clientMemoryCache.delete(key);
    }
  });
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let url = resolveApiUrl(path);

  // If executing in SSR/Node.js environment, relative URLs must be converted to absolute
  if (typeof window === 'undefined' && url.startsWith('/')) {
    const origin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://land-governance-platform-virid.vercel.app';
    url = `${origin}${url}`;
  }

  const method = (options.method || 'GET').toUpperCase();
  const token = getAuthToken();

  // Invalidate cache on write operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    invalidateApiCache();
  }

  // Check client-side in-memory cache for GET requests
  const isGet = method === 'GET';
  const shouldSkipCache =
    options.cache === 'no-store' ||
    (options.headers as Record<string, string>)?.[ 'Cache-Control']?.includes('no-cache');

  const cacheKey = `${url}:${token || 'anon'}`;
  if (typeof window !== 'undefined' && isGet && !shouldSkipCache) {
    const cached = clientMemoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      } else if (errorJson.message) {
        errorDetail = errorJson.message;
      }
    } catch {
      // Non-JSON error body
    }
    throw new Error(errorDetail);
  }

  const data = (await res.json()) as T;

  // Save to client-side in-memory cache
  if (typeof window !== 'undefined' && isGet && !shouldSkipCache) {
    clientMemoryCache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}

/**
 * Defensive data-fetching helper that wraps fetch in a try/catch block.
 * Never throws — returns defaultValue if the API call fails or is unreachable.
 */
export async function apiGet<T>(path: string, defaultValue: T): Promise<T> {
  try {
    return await apiRequest<T>(path, { method: 'GET' });
  } catch (err) {
    console.warn(`[apiGet] Request to "${path}" failed, returning safe fallback:`, err);
    return defaultValue;
  }
}
