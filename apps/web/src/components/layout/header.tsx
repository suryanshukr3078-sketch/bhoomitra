'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
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
  ChevronDown,
  Building2,
  BarChart3,
  Search,
  Scale,
  Sparkles,
  Layers,
  GraduationCap,
  Users,
  ShieldAlert,
  Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/providers/i18n-context';
import { GovTopBar } from '@/components/layout/gov-top-bar';
import { BhoomitraMyGovLogo } from '@/components/layout/gov-emblem';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, logout } = useAuth();
  const { locale, toggleLocale, t } = useTranslation();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchCategory === 'maps') {
      router.push(`/maps?q=${encodeURIComponent(searchQuery)}`);
    } else if (searchCategory === 'research') {
      router.push(`/research?q=${encodeURIComponent(searchQuery)}`);
    } else if (searchCategory === 'policies') {
      router.push(`/policies?q=${encodeURIComponent(searchQuery)}`);
    } else if (searchCategory === 'datasets') {
      router.push(`/datasets?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/maps?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white">
      {/* 1. Official GIGW Top Bar */}
      <GovTopBar />

      {/* 2. Clean, Airy Main Header (Exact MyGov.in Layout) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="focus:outline-none shrink-0" aria-label="Bhoomitra Home">
            <BhoomitraMyGovLogo />
          </Link>

          {/* Clean Central Search Form (Unified Input + Dropdown + Orange Button) */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl mx-2 sm:mx-6 flex items-center rounded-md border border-slate-300 bg-white hover:border-slate-400 focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-400 transition-all overflow-hidden"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'hi' ? 'भू-मित्र में खोजें...' : 'Search in Bhoomitra'}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0 bg-transparent"
              aria-label={locale === 'hi' ? 'खोज इनपुट' : 'Search query'}
            />
            <div className="h-5 w-px bg-slate-300 hidden sm:block" />
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-transparent px-2.5 py-2 text-xs text-slate-600 focus:outline-none cursor-pointer hidden sm:block shrink-0"
              aria-label={locale === 'hi' ? 'खोज श्रेणी' : 'Search category'}
            >
              <option value="all">{locale === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
              <option value="maps">{t('nav.maps', 'Cadastral Maps')}</option>
              <option value="policies">{t('nav.policies', 'Policies / Acts')}</option>
              <option value="research">{t('nav.research', 'Research Papers')}</option>
              <option value="datasets">{t('nav.datasets', 'GIS Datasets')}</option>
            </select>
            <button
              type="submit"
              className="bg-[#d96534] hover:bg-[#c85627] text-white px-5 sm:px-6 py-2 text-xs sm:text-sm font-semibold transition-colors shrink-0"
            >
              {t('common.search', 'Search')}
            </button>
          </form>

          {/* Right Controls: Language Switcher + Hamburger Menu + User Profile Circle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Direct Language Switcher Toggle */}
            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-300 hover:border-emerald-600 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              aria-label={`Switch to ${locale === 'en' ? 'Hindi' : 'English'}`}
              title={`Switch language to ${locale === 'en' ? 'हिन्दी' : 'English'}`}
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>{locale === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Hamburger Menu Trigger (Three Clean Lines) */}
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Main Menu"
            >
              {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Profile Avatar Trigger (MyGov Orange Circle Silhouette) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                onBlur={() => setTimeout(() => setProfileMenuOpen(false), 250)}
                className="w-9 h-9 rounded-full bg-[#f37021] hover:bg-[#e05e10] flex items-center justify-center text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
                aria-label="User Account and Portals"
                title={isAuthenticated && user ? user.email : 'Sign In'}
              >
                <User className="w-5 h-5 fill-current" />
              </button>

              {/* Profile / 2FA Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-2xl p-2 z-50 text-xs">
                  {isAuthenticated && user ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="font-bold text-slate-900 truncate">{user.full_name || 'Official User'}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>2FA Authenticated</span>
                        </div>
                      </div>
                      <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium">
                        <BarChart3 className="w-4 h-4 text-[#00838f]" />
                        <span>Governance Dashboard</span>
                      </Link>
                      {Boolean(user.is_superuser || user.role?.toLowerCase() === 'admin') && (
                        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 text-purple-800 font-semibold">
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-700 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Sign In to MyGov Bhoomitra
                      </div>
                      <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-[#d96534] font-bold hover:bg-orange-100">
                        <LogIn className="w-4 h-4" />
                        <span>Universal Sign In Hub</span>
                      </Link>
                      <Link href="/register" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium">
                        <span>New User Registration</span>
                      </Link>
                      <div className="border-t border-slate-100 my-1" />
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                        Role Portals (2FA)
                      </div>
                      <Link href="/login/government" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Government Agency</span>
                      </Link>
                      <Link href="/login/researcher" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Researcher GIS Lab</span>
                      </Link>
                      <Link href="/login/policymaker" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">
                        <Scale className="w-3.5 h-3.5 text-blue-600" />
                        <span>Policy Directorate</span>
                      </Link>
                      <Link href="/login/civil-society" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700">
                        <Users className="w-3.5 h-3.5 text-teal-600" />
                        <span>Civil Society</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MyGov Clean Off-Canvas Mega Drawer (When Hamburger is clicked) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BhoomitraMyGovLogo />
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
                aria-label="Close Navigation"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="p-5 space-y-6 flex-1 text-xs">
              {/* Primary Pages */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {locale === 'hi' ? 'प्रमुख सेवाएं' : 'Main Services'}
                </div>
                <div className="grid gap-1 font-semibold text-slate-800 text-sm">
                  <Link href="/" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                    {t('nav.home', 'Home')}
                  </Link>
                  <Link href="/maps" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-amber-50 text-[#d96534] flex items-center gap-2 font-bold">
                    <MapPin className="w-4 h-4 text-[#f37021]" />
                    <span>{t('nav.maps', 'Cadastral GIS & Maps')}</span>
                  </Link>
                  <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>{t('nav.dashboard', 'Governance Dashboard')}</span>
                  </Link>
                  <Link href="/assistant" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg bg-orange-50 text-[#d96534] font-bold flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#f37021]" />
                    <span>{locale === 'hi' ? 'एआई भू-अभिलेख सहायक' : 'AI Cadastral Assistant'}</span>
                  </Link>
                </div>
              </div>

              {/* National Schemes */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {locale === 'hi' ? 'राष्ट्रीय योजनाएं एवं कार्यक्रम' : 'Schemes & Programs'}
                </div>
                <div className="grid gap-1 text-xs font-medium text-slate-700">
                  <Link href="/maps?filter=svamitva" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                    {locale === 'hi' ? 'स्वामित्व योजना (ड्रोन सर्वेक्षण)' : 'SVAMITVA Scheme (Drone Survey)'}
                  </Link>
                  <Link href="/digitization" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                    {t('nav.digitization', 'Bhu-Aadhaar (ULPIN) & Dual-Pane OCR')}
                  </Link>
                  <Link href="/watershed" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                    {t('nav.watershed', 'Watershed SRISHTI-DRISHTI GIS')}
                  </Link>
                  <Link href="/acquisition" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                    {t('nav.acquisition', 'Land Acquisition (LAMS RFCTLARR)')}
                  </Link>
                  <Link href="/policies" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                    {t('nav.policies', 'Acts & Gazette Policies')}
                  </Link>
                  <Link href="/research" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                    {t('nav.research', 'Research Papers')}
                  </Link>
                  <Link href="/datasets" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
                    {t('nav.datasets', 'Open GIS Datasets')}
                  </Link>
                  <Link href="/contribute" onClick={() => setDrawerOpen(false)} className="px-3 py-2 rounded-lg hover:bg-emerald-50 text-emerald-800 font-semibold flex items-center justify-between">
                    <span>{t('nav.contribute', 'Contribute Spatial Data')}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </Link>
                </div>
              </div>

              {/* State Portals Grid */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  MyGov States &amp; UTs (36 Cadastres)
                </div>
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                  {INDIAN_STATES.map((st) => (
                    <Link
                      key={st}
                      href={`/maps?q=${encodeURIComponent(st)}`}
                      onClick={() => setDrawerOpen(false)}
                      className="p-1.5 rounded hover:bg-slate-100 text-[11px] text-slate-700 truncate"
                    >
                      {st}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Workspaces */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/workspace"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full py-2.5 px-3 rounded-lg bg-[#1a3c6e] text-white font-bold text-center text-xs"
                >
                  Enter Official Workspaces
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
