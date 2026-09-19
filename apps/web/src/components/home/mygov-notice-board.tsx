'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  FileText,
  Download,
  ArrowRight,
  Calendar,
  ExternalLink,
} from 'lucide-react';

const NOTICES = [
  {
    category: 'gazette',
    date: '18 Sep 2026',
    title: 'Advisory on Mandatory Seed Verification of Bhu-Aadhaar ULPIN with Bank Accounts for Agri-Credits',
    dept: 'Department of Land Resources (DoLR)',
    href: '/policies',
  },
  {
    category: 'gazette',
    date: '14 Sep 2026',
    title: 'Guidelines for Integration of Drone Flying Permissions with DigitalSky for Cadastral Surveyors',
    dept: 'Ministry of Civil Aviation & MoRD',
    href: '/policies',
  },
  {
    category: 'circulars',
    date: '11 Sep 2026',
    title: 'Standard Operating Procedure (SOP) for Dual-Pane Multilingual Deed Digitization & OCR Verification',
    dept: 'National Informatics Centre (NIC)',
    href: '/digitization',
  },
  {
    category: 'circulars',
    date: '08 Sep 2026',
    title: 'Benchmarking Geospatial Accuracy Standards for Orthorectified Village Map Rectification',
    dept: 'Survey of India (SoI)',
    href: '/research',
  },
  {
    category: 'tenders',
    date: '04 Sep 2026',
    title: 'RFP for Supply of High-Precision GNSS Rovers and CORS Base Station Network Expansion in Eastern Region',
    dept: 'Central Cadastral Procurement Cell',
    href: '/policies',
  },
  {
    category: 'tenders',
    date: '28 Aug 2026',
    title: 'Empanelment of Open-Source Geospatial AI Analytics Vendors for Micro-Watershed Ridge Verification',
    dept: 'Watershed Development Component',
    href: '/watershed',
  },
];

export function MyGovNoticeBoard() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'gazette' | 'circulars' | 'tenders'>('all');

  const filtered = activeCategory === 'all'
    ? NOTICES
    : NOTICES.filter((n) => n.category === activeCategory);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Notice Board &amp; Official Notifications
              </h2>
              <p className="text-xs text-slate-500">
                Latest Government Gazette releases, operational circulars, and tenders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'gazette', 'circulars', 'tenders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  activeCategory === tab
                    ? 'bg-[#1a3c6e] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'all' ? 'All Notices' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notices list */}
        <div className="divide-y divide-slate-100">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {item.date}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-[11px] font-bold text-[#1a3c6e]">
                    {item.dept}
                  </span>
                </div>
                <Link
                  href={item.href}
                  className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#1a3c6e] transition-colors line-clamp-2"
                >
                  {item.title}
                </Link>
              </div>

              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-[#1a3c6e] bg-slate-100 group-hover:bg-[#1a3c6e] group-hover:text-white transition-colors shrink-0 self-start sm:self-center"
              >
                <span>Read</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
