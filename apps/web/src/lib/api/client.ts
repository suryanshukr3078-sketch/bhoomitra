import { env } from '@/lib/environment';

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setAuthToken(token: string): void {
  if (typeof document !== 'undefined') {
    document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax; Secure`;
  }
}

export function clearAuthToken(): void {
  if (typeof document !== 'undefined') {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = env.apiUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${baseUrl}${cleanPath}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
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

  return res.json() as Promise<T>;
}
