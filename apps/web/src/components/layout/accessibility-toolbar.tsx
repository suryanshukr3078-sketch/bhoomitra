'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Accessibility,
  X,
  Type,
  AlignLeft,
  Sun,
  Moon,
  Contrast,
  RotateCcw,
  Check,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  useAccessibility,
  ContrastMode,
  FontSize,
  LineSpacing,
} from '@/providers/accessibility-context';

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const {
    contrast,
    fontSize,
    lineSpacing,
    setContrast,
    setFontSize,
    setLineSpacing,
    increaseFontSize,
    decreaseFontSize,
    resetAccessibility,
  } = useAccessibility();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="fixed right-3 bottom-6 z-50 flex flex-col items-end select-none print:hidden">
      {/* Expanded Accessibility Settings Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="region"
          aria-label="Accessibility settings"
          id="accessibility-panel"
          className="mb-3 w-80 sm:w-88 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-500 shadow-2xl p-4 text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                <Accessibility className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  Accessibility Tools
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  GIGW 3.0 & WCAG 2.1 AA
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                toggleButtonRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              aria-label="Close accessibility tools panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-4 text-xs">
            {/* 1. Text Size Controls */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Text Size (फॉन्ट आकार)
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                  {fontSize === 'small' ? '88%' : fontSize === 'normal' ? '100%' : fontSize === 'large' ? '112.5%' : '125%'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                {(['small', 'normal', 'large', 'xlarge'] as FontSize[]).map((size) => {
                  const labels: Record<FontSize, string> = {
                    small: 'A-',
                    normal: 'A',
                    large: 'A+',
                    xlarge: 'A++',
                  };
                  const isSelected = fontSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={`py-1.5 text-center font-bold rounded-lg transition-all text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`Set text size to ${size}`}
                    >
                      {labels[size]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Contrast Modes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Visual Contrast (कंट्रास्ट)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'normal' as ContrastMode, label: 'Standard', icon: Sun },
                  { id: 'high' as ContrastMode, label: 'High Contrast', icon: Contrast },
                  { id: 'dark' as ContrastMode, label: 'Dark Mode', icon: Moon },
                ].map(({ id, label, icon: Icon }) => {
                  const isSelected = contrast === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setContrast(id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`Set contrast mode to ${label}`}
                    >
                      <Icon className="w-4 h-4 mb-1 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Line Spacing / Reading Height */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  Line Spacing (पंक्ति अंतर)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                {[
                  { id: 'normal' as LineSpacing, label: 'Normal' },
                  { id: 'relaxed' as LineSpacing, label: 'Relaxed' },
                  { id: 'loose' as LineSpacing, label: 'Loose' },
                ].map(({ id, label }) => {
                  const isSelected = lineSpacing === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLineSpacing(id)}
                      className={`py-1.5 text-center font-medium rounded-lg transition-all text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`Set line spacing to ${label}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panel Footer: Reset Controls */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={resetAccessibility}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-medium py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              aria-label="Reset all accessibility settings to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Saved automatically
            </span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        ref={toggleButtonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
        aria-label="Open accessibility toolbar (High Contrast, Text Size, Line Spacing)"
        className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xl border-2 border-white focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-offset-2 transition-all transform hover:scale-105 active:scale-95"
      >
        <Accessibility className="w-4 h-4 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Accessibility</span>
      </button>
    </div>
  );
}
