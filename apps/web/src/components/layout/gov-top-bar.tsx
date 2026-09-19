'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe2,
  Eye,
  Type,
  Share2,
  SunMedium,
  Moon,
  Contrast,
  Check,
} from 'lucide-react';

export function GovTopBar() {
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [contrast, setContrast] = useState<'normal' | 'high' | 'dark'>('normal');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [accessMenuOpen, setAccessMenuOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-contrast', contrast);
  }, [contrast]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  return (
    <div className="w-full bg-[#14233c] text-slate-200 border-b border-slate-700/60 text-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 flex items-center justify-between min-h-[34px] flex-wrap gap-y-1">
        {/* Left Side: National Flag & Government of India */}
        <div className="flex items-center gap-2 sm:gap-3 py-1">
          <a
            href="https://www.india.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-200 hover:text-white transition-colors group focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 rounded px-1"
            title="National Portal of India (External site opens in new window)"
          >
            {/* Tiranga Flag SVG */}
            <svg
              className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0 border border-slate-600/40"
              viewBox="0 0 900 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Flag of India"
            >
              <rect width="900" height="200" fill="#FF9933" />
              <rect y="200" width="900" height="200" fill="#FFFFFF" />
              <rect y="400" width="900" height="200" fill="#138808" />
              <circle cx="450" cy="300" r="80" stroke="#000080" strokeWidth="12" fill="none" />
              <circle cx="450" cy="300" r="16" fill="#000080" />
              {/* 24 spokes */}
              {[...Array(24)].map((_, i) => (
                <line
                  key={i}
                  x1="450"
                  y1="300"
                  x2={450 + 80 * Math.cos((i * 15 * Math.PI) / 180)}
                  y2={300 + 80 * Math.sin((i * 15 * Math.PI) / 180)}
                  stroke="#000080"
                  strokeWidth="3.5"
                />
              ))}
            </svg>
            <span className="font-semibold tracking-wide text-[11px] sm:text-xs">
              {lang === 'hi' ? 'भारत सरकार' : 'GOVERNMENT OF INDIA'}
            </span>
          </a>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 text-[11px] hidden md:inline">
            {lang === 'hi' ? 'ग्रामीण विकास एवं भूमि संसाधन मंत्रालय' : 'Ministry of Rural Development & Land Resources'}
          </span>
        </div>

        {/* Right Side: Accessibility, Skip link, Language & Social */}
        <div className="flex items-center gap-1 sm:gap-2.5 py-1 text-[11px]">
          {/* Skip to main content link */}
          <a
            href="#main-content"
            className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400 whitespace-nowrap"
          >
            {lang === 'hi' ? 'मुख्य विषय पर जाएं' : 'Skip to main content'}
          </a>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Font Resizing Controls A- / A / A+ */}
          <div className="flex items-center bg-slate-800/80 rounded px-1.5 py-0.5 border border-slate-700/60 gap-1">
            <button
              onClick={() => setFontSize('small')}
              className={`px-1 rounded text-[10px] font-bold ${
                fontSize === 'small' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="Decrease Font Size"
              aria-label="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-1 rounded text-[11px] font-bold ${
                fontSize === 'normal' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="Reset Font Size"
              aria-label="Reset Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-1 rounded text-[12px] font-bold ${
                fontSize === 'large' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
              title="Increase Font Size"
              aria-label="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Contrast Mode Dropdown / Toggle */}
          <div className="relative">
            <button
              onClick={() => setAccessMenuOpen(!accessMenuOpen)}
              onBlur={() => setTimeout(() => setAccessMenuOpen(false), 200)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Accessibility & Contrast"
              aria-label="Accessibility & Contrast options"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Accessibility</span>
            </button>

            {accessMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 text-slate-200">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  Contrast Modes
                </div>
                <button
                  onClick={() => setContrast('normal')}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-left text-xs hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <SunMedium className="w-3 h-3 text-slate-400" /> Standard
                  </span>
                  {contrast === 'normal' && <Check className="w-3 h-3 text-amber-400" />}
                </button>
                <button
                  onClick={() => setContrast('high')}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-left text-xs hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <Contrast className="w-3 h-3 text-amber-400" /> High Contrast
                  </span>
                  {contrast === 'high' && <Check className="w-3 h-3 text-amber-400" />}
                </button>
                <button
                  onClick={() => setContrast('dark')}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-left text-xs hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <Moon className="w-3 h-3 text-indigo-400" /> Dark Mode
                  </span>
                  {contrast === 'dark' && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              </div>
            )}
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-semibold transition-colors"
            title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            <Globe2 className="w-3 h-3" />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
