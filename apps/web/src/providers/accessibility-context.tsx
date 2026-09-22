'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ContrastMode = 'normal' | 'high' | 'dark';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';
export type LineSpacing = 'normal' | 'relaxed' | 'loose';

export interface AccessibilityPreferences {
  contrast: ContrastMode;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
}

interface AccessibilityContextType extends AccessibilityPreferences {
  setContrast: (contrast: ContrastMode) => void;
  setFontSize: (size: FontSize) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleContrast: () => void;
  cycleLineSpacing: () => void;
  resetAccessibility: () => void;
}

const STORAGE_KEY = 'bhoomitra_a11y_prefs';

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  contrast: 'normal',
  fontSize: 'normal',
  lineSpacing: 'normal',
};

const FONT_SIZES: FontSize[] = ['small', 'normal', 'large', 'xlarge'];
const LINE_SPACINGS: LineSpacing[] = ['normal', 'relaxed', 'loose'];

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [isMounted, setIsMounted] = useState(false);

  // Load initial preferences from localStorage once mounted
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({
          contrast: ['normal', 'high', 'dark'].includes(parsed.contrast) ? parsed.contrast : 'normal',
          fontSize: ['small', 'normal', 'large', 'xlarge'].includes(parsed.fontSize) ? parsed.fontSize : 'normal',
          lineSpacing: ['normal', 'relaxed', 'loose'].includes(parsed.lineSpacing) ? parsed.lineSpacing : 'normal',
        });
      }
    } catch {
      // LocalStorage might be restricted or corrupted
    }
  }, []);

  // Synchronize CSS attributes and custom properties on document.documentElement
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-contrast', preferences.contrast);
    root.setAttribute('data-font-size', preferences.fontSize);
    root.setAttribute('data-line-spacing', preferences.lineSpacing);

    // CSS Custom Properties mapping
    const fontScales: Record<FontSize, string> = {
      small: '0.88',
      normal: '1',
      large: '1.125',
      xlarge: '1.25',
    };

    const lineHeights: Record<LineSpacing, string> = {
      normal: '1.5',
      relaxed: '1.8',
      loose: '2.1',
    };

    const letterSpacings: Record<LineSpacing, string> = {
      normal: '0',
      relaxed: '0.025em',
      loose: '0.05em',
    };

    root.style.setProperty('--a11y-font-scale', fontScales[preferences.fontSize]);
    root.style.setProperty('--a11y-line-height', lineHeights[preferences.lineSpacing]);
    root.style.setProperty('--a11y-letter-spacing', letterSpacings[preferences.lineSpacing]);

    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch {
        // Storage might fail in incognito/restricted mode
      }
    }
  }, [preferences, isMounted]);

  const setContrast = useCallback((contrast: ContrastMode) => {
    setPreferences((prev) => ({ ...prev, contrast }));
  }, []);

  const setFontSize = useCallback((fontSize: FontSize) => {
    setPreferences((prev) => ({ ...prev, fontSize }));
  }, []);

  const setLineSpacing = useCallback((lineSpacing: LineSpacing) => {
    setPreferences((prev) => ({ ...prev, lineSpacing }));
  }, []);

  const increaseFontSize = useCallback(() => {
    setPreferences((prev) => {
      const idx = FONT_SIZES.indexOf(prev.fontSize);
      if (idx < FONT_SIZES.length - 1) {
        return { ...prev, fontSize: FONT_SIZES[idx + 1] };
      }
      return prev;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setPreferences((prev) => {
      const idx = FONT_SIZES.indexOf(prev.fontSize);
      if (idx > 0) {
        return { ...prev, fontSize: FONT_SIZES[idx - 1] };
      }
      return prev;
    });
  }, []);

  const toggleContrast = useCallback(() => {
    setPreferences((prev) => {
      const nextContrast: ContrastMode =
        prev.contrast === 'normal' ? 'high' : prev.contrast === 'high' ? 'dark' : 'normal';
      return { ...prev, contrast: nextContrast };
    });
  }, []);

  const cycleLineSpacing = useCallback(() => {
    setPreferences((prev) => {
      const idx = LINE_SPACINGS.indexOf(prev.lineSpacing);
      const nextSpacing = LINE_SPACINGS[(idx + 1) % LINE_SPACINGS.length];
      return { ...prev, lineSpacing: nextSpacing };
    });
  }, []);

  const resetAccessibility = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        ...preferences,
        setContrast,
        setFontSize,
        setLineSpacing,
        increaseFontSize,
        decreaseFontSize,
        toggleContrast,
        cycleLineSpacing,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
