'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enTranslations from '@/locales/en.json';
import hiTranslations from '@/locales/hi.json';

export type Locale = 'en' | 'hi';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, fallback?: string) => string;
}

const STORAGE_KEY = 'bhoomitra_locale';

const translations: Record<Locale, Record<string, any>> = {
  en: enTranslations,
  hi: hiTranslations,
};

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === 'en' || saved === 'hi') {
        setLocaleState(saved);
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        // Ignored
      }
    }
  }, [locale, isMounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = translations[locale] || translations.en;
      const val = getNestedValue(dict, key);
      if (val !== undefined) return val;

      // Fallback to English if missing in Hindi
      if (locale !== 'en') {
        const enVal = getNestedValue(translations.en, key);
        if (enVal !== undefined) return enVal;
      }

      return fallback !== undefined ? fallback : key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
