'use client';

import React, { useState, useEffect } from 'react';
import {
  Accessibility,
  UserPlus,
  ChevronDown,
  Globe2,
  Eye,
  Check,
  SunMedium,
  Moon,
  Contrast,
} from 'lucide-react';

export function GovTopBar() {
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [contrast, setContrast] = useState<'normal' | 'high' | 'dark'>('normal');
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [accessMenuOpen, setAccessMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-contrast', contrast);
  }, [contrast]);

  return (
    <div
      className="w-full text-white text-xs select-none relative z-50"
      style={{
        background: 'linear-gradient(90deg, #109368 0%, #b83670 45%, #df4d38 100%)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-[36px] flex-wrap gap-y-1">
        {/* Left Side: Indian Flag + GOVERNMENT OF INDIA */}
        <div className="flex items-center gap-2 py-1">
          <a
            href="https://www.india.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white hover:opacity-95 transition-opacity font-semibold tracking-wide text-xs"
            title="National Portal of India"
          >
            {/* Tiranga Flag SVG */}
            <svg
              className="w-5 h-3.5 rounded-[2px] shadow-sm shrink-0 border border-white/40"
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
            <span className="tracking-wider text-[11px] sm:text-xs uppercase font-bold">
              {lang === 'hi' ? 'भारत सरकार' : 'GOVERNMENT OF INDIA'}
            </span>
          </a>
        </div>

        {/* Right Side: Skip link, Language pill, Accessibility icon, User/Follow */}
        <div className="flex items-center gap-2 sm:gap-3 py-1 text-[11px]">
          {/* Skip to main content */}
          <a
            href="#main-content"
            className="text-white/90 hover:text-white transition-colors text-xs hidden sm:inline"
          >
            Skip to main content
          </a>

          {/* Language Pill (अ|A English ⌵) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              onBlur={() => setTimeout(() => setLangMenuOpen(false), 200)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/60 hover:bg-white/10 text-white font-medium text-xs transition-colors"
              aria-label="Select Language"
            >
              <span className="font-semibold">{lang === 'hi' ? 'अ हिन्दी' : 'A English'}</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 rounded-lg bg-white shadow-xl py-1 z-50 text-slate-800 text-xs border border-slate-200">
                <button
                  onClick={() => {
                    setLang('en');
                    setLangMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-left hover:bg-slate-100"
                >
                  <span>English</span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  onClick={() => {
                    setLang('hi');
                    setLangMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-left hover:bg-slate-100 font-medium"
                >
                  <span>हिन्दी</span>
                  {lang === 'hi' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Accessibility Icon Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccessMenuOpen(!accessMenuOpen)}
              onBlur={() => setTimeout(() => setAccessMenuOpen(false), 200)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              title="Accessibility Tools"
              aria-label="Accessibility Tools"
            >
              <Accessibility className="w-4 h-4" />
            </button>

            {accessMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-slate-200 shadow-2xl p-3 z-50 text-slate-800 text-xs space-y-2">
                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b pb-1">
                  Text Size
                </div>
                <div className="flex items-center justify-between bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setFontSize('small')}
                    className={`px-2 py-0.5 rounded font-bold ${
                      fontSize === 'small' ? 'bg-[#df4d38] text-white' : 'text-slate-700'
                    }`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-2 py-0.5 rounded font-bold ${
                      fontSize === 'normal' ? 'bg-[#df4d38] text-white' : 'text-slate-700'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-2 py-0.5 rounded font-bold ${
                      fontSize === 'large' ? 'bg-[#df4d38] text-white' : 'text-slate-700'
                    }`}
                  >
                    A+
                  </button>
                </div>

                <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b pt-1 pb-1">
                  Contrast
                </div>
                <div className="grid gap-1">
                  <button
                    onClick={() => setContrast('normal')}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 text-left"
                  >
                    <span>Standard</span>
                    {contrast === 'normal' && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => setContrast('high')}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 text-left"
                  >
                    <span>High Contrast</span>
                    {contrast === 'high' && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => setContrast('dark')}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 text-left"
                  >
                    <span>Dark Contrast</span>
                    {contrast === 'dark' && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User / Social follow icon */}
          <a
            href="https://twitter.com/mygovindia"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            title="Connect & Follow"
            aria-label="Connect & Follow"
          >
            <UserPlus className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
