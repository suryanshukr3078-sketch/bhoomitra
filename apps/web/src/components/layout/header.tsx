'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
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
  LogOut,
  UploadCloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const prefersReduced = useReducedMotion();

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-4 xl:px-6 2xl:px-8 w-full">
        <div className="header-inner flex items-center justify-between gap-2 sm:gap-3 w-full min-h-[4rem] flex-nowrap min-w-0">
          {/* Section 1 (far left): Logo ("LandGov"), non-shrinking */}
          <Link href="/" passHref legacyBehavior>
            <motion.a
              whileHover={prefersReduced ? undefined : { scale: 1.02 }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="brand flex items-center gap-2 text-emerald-800 font-bold text-base sm:text-xl tracking-tight shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
              aria-label="Land Governance Platform Home"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-sm shrink-0">
                <Landmark className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-extrabold text-slate-900">
                Land<span className="text-emerald-700">Gov</span>
              </span>
            </motion.a>
          </Link>

          {/* Section 2 (left-center, next to logo): Primary navigation links in exact order */}
          <nav
            aria-label="Primary Navigation"
            className="main-navigation hidden min-[1150px]:flex items-center flex-1 justify-start gap-0.5 min-[1350px]:gap-1 2xl:gap-2 ml-1 min-[1250px]:ml-2 min-[1400px]:ml-3 min-w-0"
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} passHref legacyBehavior>
                <motion.a
                  whileHover={prefersReduced ? undefined : { scale: 1.04, y: -1 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="px-1.5 min-[1220px]:px-2 2xl:px-2.5 py-1.5 rounded-lg text-xs 2xl:text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {link.label}
                </motion.a>
              </Link>
            ))}
          </nav>

          {/* Responsive Hamburger Menu Trigger (< 1150px): Positioned cleanly between Section 1 and Section 3 */}
          <div className="mobile-menu-trigger flex min-[1150px]:hidden items-center shrink-0">
            <motion.button
              type="button"
              whileTap={prefersReduced ? undefined : { scale: 0.92 }}
              transition={{ duration: 0.1 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] w-11 h-11 p-2.5 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 shrink-0" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6 shrink-0" aria-hidden="true" />
              )}
            </motion.button>
          </div>

          {/* Section 3 (far right): Authentication actions */}
          <div className="flex items-center gap-1 min-[1220px]:gap-1.5 sm:gap-2 shrink-0">
            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" passHref legacyBehavior>
                  <motion.a
                    whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    title="Governance Dashboard"
                    className="flex items-center gap-1.5 px-1.5 min-[1220px]:px-2 2xl:px-3 py-1.5 text-xs 2xl:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </motion.a>
                </Link>
                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <User className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs 2xl:text-sm font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 whitespace-nowrap cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/dashboard" passHref legacyBehavior>
                  <motion.a
                    whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    title="Dashboard"
                    className="flex items-center gap-1.5 px-1.5 min-[1220px]:px-2 2xl:px-3 py-1.5 text-xs 2xl:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </motion.a>
                </Link>
                <Link href="/login" passHref legacyBehavior>
                  <motion.a
                    whileHover={prefersReduced ? undefined : { scale: 1.03 }}
                    whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1 px-1.5 min-[1220px]:px-2 2xl:px-3 py-1.5 text-xs 2xl:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 shrink-0 text-slate-500" aria-hidden="true" />
                    <span>Sign In</span>
                  </motion.a>
                </Link>
                <Link href="/register" passHref legacyBehavior>
                  <motion.a
                    whileHover={prefersReduced ? undefined : { scale: 1.03, boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)' }}
                    whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1 px-2 min-[1220px]:px-2.5 2xl:px-3.5 py-1.5 text-xs 2xl:text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap shrink-0"
                  >
                    <span>Register</span>
                  </motion.a>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Slide-down Menu Drawer (< 1150px) */}
      {mobileMenuOpen && (
        <div
          className="min-[1150px]:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <nav className="grid gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} passHref legacyBehavior>
                  <motion.a
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>{link.label}</span>
                  </motion.a>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 grid gap-2">
            <Link href="/dashboard" passHref legacyBehavior>
              <motion.a
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.1 }}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                Governance Dashboard
              </motion.a>
            </Link>
            {isAuthenticated && user ? (
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Signed in as: {user.full_name || user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="min-h-[44px] flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" passHref legacyBehavior>
                  <motion.a
                    whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Sign In
                  </motion.a>
                </Link>
                <Link href="/register" passHref legacyBehavior>
                  <motion.a
                    whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
                  >
                    Register
                  </motion.a>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
