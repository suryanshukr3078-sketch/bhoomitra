'use client';

import React, { useState } from 'react';
import {
  Landmark,
  Menu,
  X,
  MapPin,
  FileText,
  BookOpen,
  Database,
  Bot,
  ShieldCheck,
  User,
  LogIn,
  UploadCloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Landmark },
    { href: '/maps', label: 'Cadastral Maps', icon: MapPin },
    { href: '/policies', label: 'Policies', icon: FileText },
    { href: '/research', label: 'Research', icon: BookOpen },
    { href: '/datasets', label: 'Datasets', icon: Database },
    { href: '/evidence', label: 'Provenance', icon: ShieldCheck },
    { href: '/contribute', label: 'Contribute', icon: UploadCloud },
    { href: '/assistant', label: 'AI Assistant', icon: Bot },
    { href: '/about', label: 'About', icon: Landmark },
  ];

  const primaryLinks = [
    { href: '/maps', label: 'Maps', icon: MapPin },
    { href: '/policies', label: 'Policies', icon: FileText },
    { href: '/research', label: 'Research', icon: BookOpen },
    { href: '/datasets', label: 'Datasets', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex h-16 items-center justify-between gap-2 min-w-0">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 text-emerald-800 font-bold text-lg sm:text-xl tracking-tight shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            aria-label="Land Governance Platform Home"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-sm shrink-0">
              <Landmark className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="hidden min-[400px]:inline font-extrabold text-slate-900">
              Land<span className="text-emerald-700">Gov</span>
            </span>
          </a>

          {/* Desktop Navigation Links - Full list on extra large screens (>= 1280px) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center gap-1 min-w-0 shrink"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" aria-hidden="true" />
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Compact Navigation Links - Core links on medium & large screens (768px - 1279px) */}
          <nav
            aria-label="Core Navigation"
            className="hidden md:flex xl:hidden items-center gap-1 min-w-0 shrink"
          >
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" aria-hidden="true" />
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Auth Buttons (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Dashboard
            </a>
            <a
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Sign In
            </a>
            <a
              href="/register"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
            >
              Register
            </a>
          </div>

          {/* Compact Auth Buttons for 640px - 1023px (e.g. tablet & 980px desktop-site mode) */}
          <div className="hidden sm:flex lg:hidden items-center gap-1.5 shrink-0">
            <a
              href="/login"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
            >
              Register
            </a>
          </div>

          {/* Mobile/Tablet Menu Toggle Button (visible up to xl so all links remain accessible) */}
          <div className="flex xl:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <nav className="grid gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <Icon className="w-5 h-5 text-slate-400" aria-hidden="true" />
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 grid gap-2">
            <a
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Governance Dashboard
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                Sign In
              </a>
              <a
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
