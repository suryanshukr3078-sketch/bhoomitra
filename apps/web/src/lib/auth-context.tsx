'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, clearAuthToken, getAuthToken } from '@/lib/api/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_superuser?: boolean;
  status?: string;
  created_at?: string;
  organization_id?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: UserProfile | null) => void;
  refreshUser: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  setUser: () => {},
  refreshUser: async () => null,
  logout: async () => {},
});

function parseJwtPayload(token: string): UserProfile | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr);
    if (!payload.sub && !payload.email) return null;
    return {
      id: String(payload.sub || 'authenticated-user'),
      email: String(payload.email || 'user@bhoomitra.gov.in'),
      full_name: String(payload.full_name || payload.email || 'Platform Contributor'),
      role: String(payload.role || 'Member'),
      is_active: true,
      is_superuser: Boolean(payload.is_superuser),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const token = getAuthToken();
    return token ? parseJwtPayload(token) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = getAuthToken();
    return token ? false : true;
  });
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        return null;
      }
      // Populate synchronous JWT identity first so client navigation never flickers
      const baseline = parseJwtPayload(token);
      if (baseline) {
        setUser((prev) => prev || baseline);
      }

      const userData = await apiRequest<UserProfile>('/auth/me', {
        method: 'GET',
      });
      setUser(userData);
      return userData;
    } catch (err: any) {
      if (err?.status === 401) {
        clearAuthToken();
        setUser(null);
      } else {
        console.warn('[AuthProvider] /auth/me temporary error, preserving active session:', err);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.warn('[AuthProvider] Backend logout failed:', err);
    } finally {
      clearAuthToken();
      setUser(null);
      router.push('/');
    }
  }, [router]);

  const isAdmin = Boolean(user?.is_superuser || user?.role?.toLowerCase() === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        setUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
