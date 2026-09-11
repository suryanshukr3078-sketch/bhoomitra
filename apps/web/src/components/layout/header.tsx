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
    { href: '/assistant', label: 'AI Assistant', icon: Bot },
    { href: '/about', label: 'About', icon: Landmark },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 text-emerald-800 font-bold text-lg sm:text-xl tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            aria-label="Land Governance Platform Home"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <Landmark className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="hidden min-[400px]:inline font-extrabold text-slate-900">
              Land<span className="text-emerald-700">Gov</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" aria-hidden="true" />
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Dashboard
            </a>
            <a
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Sign In
            </a>
            <a
              href="/register"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Register
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
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

      {/* Mobile Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2"
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
