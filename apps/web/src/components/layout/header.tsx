'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
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
  UploadCloud,
  ChevronDown,
  GraduationCap,
  Scale,
  Users,
  ShieldAlert,
  Building2,
  BarChart3,
  SlidersHorizontal,
  Lightbulb,
  Code2,
  Search,
  CheckCircle2,
  HelpCircle,
  Vote,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { GovTopBar } from '@/components/layout/gov-top-bar';
import { AshokaEmblem } from '@/components/layout/gov-emblem';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const [involvedMenuOpen, setInvolvedMenuOpen] = useState(false);
  const [schemesMenuOpen, setSchemesMenuOpen] = useState(false);
  const [statesMenuOpen, setStatesMenuOpen] = useState(false);
  const [researchMenuOpen, setResearchMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, logout } = useAuth();
  const prefersReduced = useReducedMotion();
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
      {/* 1. GIGW Top Accessibility & Language Bar */}
      <GovTopBar />

      {/* 2. Main Government Brand & Search Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
          {/* Brand Logo & National Emblem */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg shrink-0">
            <div className="text-amber-800 group-hover:text-amber-900 transition-colors shrink-0">
              <AshokaEmblem className="w-10 h-12 sm:w-12 sm:h-14" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1a3c6e] font-heading">
                  भू-मित्र <span className="text-[#ff9933]">BHOOMITRA</span>
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 leading-tight">
                राष्ट्रीय भूमि शासन एवं भू-स्थानिक प्रशासन पोर्टल
              </span>
              <span className="text-[10px] text-slate-500 leading-tight hidden sm:block">
                Ministry of Rural Development &amp; Land Resources, Govt. of India
              </span>
            </div>
          </Link>

          {/* Central Omnibar Search (MyGov Style) */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl w-full mx-auto order-3 lg:order-2 flex items-center shadow-inner rounded-xl border border-slate-300 bg-slate-50/70 focus-within:bg-white focus-within:border-[#1a3c6e] focus-within:ring-2 focus-within:ring-[#1a3c6e]/20 transition-all overflow-hidden"
          >
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-transparent border-r border-slate-300 px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer shrink-0 hidden sm:block"
            >
              <option value="all">All Categories</option>
              <option value="maps">Cadastral Maps</option>
              <option value="policies">Policies / Acts</option>
              <option value="research">Research Papers</option>
              <option value="datasets">GIS Datasets</option>
            </select>
            <div className="flex-1 flex items-center px-3 min-w-0">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parcels, RoR, states, surveys, policy..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#1a3c6e] hover:bg-[#0f2649] text-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              aria-label="Search Bhoomitra"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Right Header: 2FA Protected Badge & Authentication Controls */}
          <div className="flex items-center gap-2 order-2 lg:order-3 ml-auto lg:ml-0 shrink-0">
            {/* 2FA Active Security Tag */}
            <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>2FA Secured</span>
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1a3c6e] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#1a3c6e]" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                {Boolean(user.is_superuser || user.role?.toLowerCase() === 'admin') && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span className="max-w-[100px] truncate">{user.full_name || user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Category Sign In Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPortalMenuOpen(!portalMenuOpen)}
                    onBlur={() => setTimeout(() => setPortalMenuOpen(false), 200)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#1a3c6e] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#1a3c6e]" />
                    <span>Sign In</span>
                    <ChevronDown className={cn("w-3 h-3 transition-transform", portalMenuOpen && "rotate-180")} />
                  </button>

                  {portalMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Official Portals (2FA)
                      </div>
                      <Link
                        href="/login"
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-900 hover:bg-slate-100"
                      >
                        <LogIn className="w-4 h-4 text-[#1a3c6e]" />
                        <span>Universal Citizen Sign In</span>
                      </Link>
                      <Link
                        href="/login/government"
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-900 hover:bg-amber-50"
                      >
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <span>Government Agency</span>
                      </Link>
                      <Link
                        href="/login/researcher"
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                      >
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>Researcher GIS Lab</span>
                      </Link>
                      <Link
                        href="/login/policymaker"
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-900 hover:bg-blue-50"
                      >
                        <Scale className="w-4 h-4 text-blue-600" />
                        <span>Policy Directorate</span>
                      </Link>
                      <Link
                        href="/login/civil-society"
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-teal-900 hover:bg-teal-50"
                      >
                        <Users className="w-4 h-4 text-teal-600" />
                        <span>Civil Society Desk</span>
                      </Link>
                      <div className="border-t border-slate-100 pt-1">
                        <Link
                          href="/login/admin"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-800 hover:bg-purple-50"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          <span>Platform Administrator</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/register"
                  className="px-3 sm:px-4 py-1.5 text-xs font-bold text-white bg-[#ff9933] hover:bg-[#d97706] rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Navigation Ribbon (Deep Navy Blue #1a3c6e with Saffron Underline) */}
      <nav className="bg-[#1a3c6e] text-white border-b-2 border-[#ff9933] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center">
            {/* Home */}
            <Link
              href="/"
              className="px-3.5 py-3 hover:bg-[#0f2649] transition-colors border-r border-slate-700/50 flex items-center gap-1.5"
            >
              <span>Home</span>
            </Link>

            {/* Cadastral Maps & GIS */}
            <Link
              href="/maps"
              className="px-3.5 py-3 hover:bg-[#0f2649] transition-colors border-r border-slate-700/50 flex items-center gap-1.5 text-amber-300"
            >
              <MapPin className="w-3.5 h-3.5 text-[#ff9933]" />
              <span>Cadastral GIS &amp; Maps</span>
            </Link>

            {/* Get Involved Dropdown (MyGov Signature) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setInvolvedMenuOpen(!involvedMenuOpen)}
                onBlur={() => setTimeout(() => setInvolvedMenuOpen(false), 200)}
                className="px-3.5 py-3 hover:bg-[#0f2649] transition-colors border-r border-slate-700/50 flex items-center gap-1 cursor-pointer"
              >
                <span>Get Involved</span>
                <ChevronDown className={cn("w-3 h-3 text-amber-300 transition-transform", involvedMenuOpen && "rotate-180")} />
              </button>

              {involvedMenuOpen && (
                <div className="absolute left-0 top-full w-72 bg-white text-slate-800 rounded-b-xl border border-slate-200 shadow-2xl p-2 z-50 normal-case space-y-1">
                  <Link
                    href="/contribute"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Do / Tasks</div>
                      <div className="text-[11px] text-slate-500 font-normal">Verify boundaries &amp; geo-tag parcels</div>
                    </div>
                  </Link>
                  <Link
                    href="/policies"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Discuss &amp; Consult</div>
                      <div className="text-[11px] text-slate-500 font-normal">Public consultation on land laws</div>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Vote className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Poll / Survey</div>
                      <div className="text-[11px] text-slate-500 font-normal">Citizen satisfaction on digital RoR</div>
                    </div>
                  </Link>
                  <Link
                    href="/research"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Blogs &amp; Perspectives</div>
                      <div className="text-[11px] text-slate-500 font-normal">Articles by researchers and officers</div>
                    </div>
                  </Link>
                  <Link
                    href="/innovation"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#ff9933] mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Hackathons &amp; Grants</div>
                      <div className="text-[11px] text-slate-500 font-normal">Innovations in spatial mapping</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* National Schemes Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSchemesMenuOpen(!schemesMenuOpen)}
                onBlur={() => setTimeout(() => setSchemesMenuOpen(false), 200)}
                className="px-3.5 py-3 hover:bg-[#0f2649] transition-colors border-r border-slate-700/50 flex items-center gap-1 cursor-pointer"
              >
                <span>Schemes &amp; Initiatives</span>
                <ChevronDown className={cn("w-3 h-3 text-amber-300 transition-transform", schemesMenuOpen && "rotate-180")} />
              </button>

              {schemesMenuOpen && (
                <div className="absolute left-0 top-full w-80 bg-white text-slate-800 rounded-b-xl border border-slate-200 shadow-2xl p-2 z-50 normal-case space-y-1">
                  <Link
                    href="/maps?filter=svamitva"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">SVAMITVA Scheme</div>
                      <div className="text-[11px] text-slate-500 font-normal">Drone survey &amp; property cards for abadi land</div>
                    </div>
                  </Link>
                  <Link
                    href="/digitization"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Bhu-Aadhaar (ULPIN) &amp; OCR</div>
                      <div className="text-[11px] text-slate-500 font-normal">14-Digit unique land parcel identifier</div>
                    </div>
                  </Link>
                  <Link
                    href="/watershed"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Watershed SRISHTI-DRISHTI</div>
                      <div className="text-[11px] text-slate-500 font-normal">Satellite GIS drainage &amp; ridge planning</div>
                    </div>
                  </Link>
                  <Link
                    href="/acquisition"
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Scale className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Land Acquisition (LAMS)</div>
                      <div className="text-[11px] text-slate-500 font-normal">RFCTLARR Act 2013 delay analytics</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Research & Gazette Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setResearchMenuOpen(!researchMenuOpen)}
                onBlur={() => setTimeout(() => setResearchMenuOpen(false), 200)}
                className="px-3.5 py-3 hover:bg-[#0f2649] transition-colors border-r border-slate-700/50 flex items-center gap-1 cursor-pointer"
              >
                <span>Research &amp; Gazette</span>
                <ChevronDown className={cn("w-3 h-3 text-amber-300 transition-transform", researchMenuOpen && "rotate-180")} />
              </button>

              {researchMenuOpen && (
                <div className="absolute left-0 top-full w-64 bg-white text-slate-800 rounded-b-xl border border-slate-200 shadow-2xl p-2 z-50 normal-case space-y-1">
                  <Link href="/research" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold">
                    <BookOpen className="w-4 h-4 text-[#1a3c6e]" />
                    <span>Peer-Reviewed Papers</span>
                  </Link>
                  <Link href="/policies" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Acts &amp; Gazette Registry</span>
                  </Link>
                  <Link href="/datasets" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Open GIS Datasets</span>
                  </Link>
                  <Link href="/evidence" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>W3C PROV-O Audit Trails</span>
                  </Link>
                  <Link href="/developers" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span>OGC &amp; REST APIs</span>
                  </Link>
                </div>
              )}
            </div>

            {/* MyGov States Dropdown (36 States & UTs) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatesMenuOpen(!statesMenuOpen)}
                onBlur={() => setTimeout(() => setStatesMenuOpen(false), 250)}
                className="px-3.5 py-3 hover:bg-[#0f2649] transition-colors border-r border-slate-700/50 flex items-center gap-1 cursor-pointer text-amber-200"
              >
                <span>MyGov States</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", statesMenuOpen && "rotate-180")} />
              </button>

              {statesMenuOpen && (
                <div className="absolute left-0 top-full w-[540px] bg-white text-slate-800 rounded-b-xl border border-slate-200 shadow-2xl p-4 z-50 normal-case">
                  <div className="font-bold text-xs text-[#1a3c6e] mb-2 uppercase tracking-wide border-b pb-1">
                    Select State / Union Territory Cadastre
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-1 text-[11px]">
                    {INDIAN_STATES.map((st) => (
                      <Link
                        key={st}
                        href={`/maps?q=${encodeURIComponent(st)}`}
                        className="p-1.5 rounded hover:bg-slate-100 hover:text-[#1a3c6e] font-medium transition-colors truncate"
                      >
                        {st}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Workspaces */}
            <Link
              href="/workspace"
              className="px-3.5 py-3 hover:bg-[#0f2649] transition-colors border-r border-slate-700/50 flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Workspaces</span>
            </Link>
          </div>

          {/* AI Cadastral Assistant Highlight */}
          <Link
            href="/assistant"
            className="px-4 py-3 bg-[#ff9933] hover:bg-[#e68a00] text-slate-950 font-extrabold flex items-center gap-1.5 transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu (< 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="grid gap-1 text-sm font-semibold text-slate-800">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Home
            </Link>
            <Link href="/maps" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 text-[#1a3c6e] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff9933]" />
              <span>Cadastral GIS &amp; Maps</span>
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Governance Dashboard
            </Link>
            <Link href="/digitization" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Bhu-Aadhaar &amp; Dual-Pane OCR
            </Link>
            <Link href="/watershed" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Watershed SRISHTI-DRISHTI
            </Link>
            <Link href="/acquisition" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Land Acquisition (LAMS)
            </Link>
            <Link href="/policies" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Policies &amp; Acts
            </Link>
            <Link href="/research" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Research Papers
            </Link>
            <Link href="/datasets" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Open GIS Datasets
            </Link>
            <Link href="/workspace" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100">
              Official Workspaces
            </Link>
            <Link href="/assistant" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg bg-amber-50 text-amber-900 font-bold flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-600" />
              <span>AI Cadastral Assistant</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Category Portals</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/login/government" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-amber-50 text-amber-900 font-medium">
                Government
              </Link>
              <Link href="/login/researcher" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-emerald-50 text-emerald-900 font-medium">
                Researcher
              </Link>
              <Link href="/login/policymaker" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-blue-50 text-blue-900 font-medium">
                Policy Maker
              </Link>
              <Link href="/login/civil-society" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-teal-50 text-teal-900 font-medium">
                Civil Society
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
