'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  FileText,
  MapPin,
  Scale,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const SCHEMES = [
  {
    title: 'DILRMP: Digital India Land Records',
    subtitle: 'National Computerization & Modernization',
    desc: 'Integration of cadastral maps, computerized records of rights (RoR), and automated registration offices.',
    badge: 'Central Sector Scheme',
    badgeColor: 'bg-blue-100 text-blue-800',
    href: '/policies',
    icon: Building2,
  },
  {
    title: 'SVAMITVA Scheme',
    subtitle: 'Drone Survey for Rural Inhabited Land',
    desc: 'Empowering village homeowners with statutory Property Cards (Sampatti Patra) mapped with survey grade drones.',
    badge: 'Ministry of Panchayati Raj',
    badgeColor: 'bg-amber-100 text-amber-900',
    href: '/maps?filter=svamitva',
    icon: MapPin,
  },
  {
    title: 'Bhu-Aadhaar (ULPIN)',
    subtitle: 'Unique Land Parcel Identification Number',
    desc: '14-digit geospatial alphanumeric code based on longitude & latitude coordinates for each survey parcel.',
    badge: 'National Standard',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    href: '/digitization',
    icon: FileText,
  },
  {
    title: 'Watershed SRISHTI-DRISHTI',
    subtitle: 'Satellite Remote Sensing & Drainage GIS',
    desc: 'Multispectral 30m satellite monitoring of micro-watershed water harvesting assets under WDC-PMKSY 2.0.',
    badge: 'ISRO & MoRD',
    badgeColor: 'bg-teal-100 text-teal-800',
    href: '/watershed',
    icon: Sparkles,
  },
  {
    title: 'LAMS: Land Acquisition Portal',
    subtitle: 'RFCTLARR Act 2013 Compliance',
    desc: 'Monitoring infrastructure project land acquisition phases, automated compensation calculation, and SIA tracking.',
    badge: 'Statutory Compliance',
    badgeColor: 'bg-purple-100 text-purple-800',
    href: '/acquisition',
    icon: Scale,
  },
  {
    title: 'Conclusive Land Titling Sandbox',
    subtitle: 'State Government Indemnity & Guarantee',
    desc: 'Transitioning legal framework from presumptive title deeds to state-guaranteed conclusive ownership with title insurance.',
    badge: 'Policy Reform',
    badgeColor: 'bg-rose-100 text-rose-800',
    href: '/evidence',
    icon: ShieldCheck,
  },
];

export function MyGovSchemesGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#ff9933] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
            <span>National Programs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Flagship Schemes &amp; Geospatial Initiatives
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Major central sector programmes modernizing land governance across India.
          </p>
        </div>

        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a3c6e] hover:text-[#0f2649] group shrink-0"
        >
          <span>View All Schemes &amp; Acts</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCHEMES.map((scheme, idx) => {
          const Icon = scheme.icon;
          return (
            <Link
              key={idx}
              href={scheme.href}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#1a3c6e]/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${scheme.badgeColor}`}>
                    {scheme.badge}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#1a3c6e] group-hover:bg-[#1a3c6e] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1a3c6e] transition-colors leading-snug">
                  {scheme.title}
                </h3>
                <div className="text-xs font-medium text-slate-500 mt-0.5 mb-2">
                  {scheme.subtitle}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {scheme.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#1a3c6e]">
                <span>Access Portal &rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
