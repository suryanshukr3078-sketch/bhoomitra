'use client';

import React from 'react';
import {
  Layers,
  MapPin,
  CheckCircle2,
  Building2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const STATS = [
  {
    icon: Layers,
    value: '14.2+ Cr',
    labelEn: 'Parcels Digitized',
    labelHi: 'डिजिटलीकृत भूखंड',
    color: 'text-[#1a3c6e] bg-blue-50 border-blue-200',
  },
  {
    icon: MapPin,
    value: '6.4+ Lakh',
    labelEn: 'Villages Surveyed',
    labelHi: 'सर्वेक्षित ग्राम',
    color: 'text-[#ff9933] bg-amber-50 border-amber-200',
  },
  {
    icon: ShieldCheck,
    value: '1.8+ Cr',
    labelEn: 'Bhu-Aadhaar Issued',
    labelHi: 'भू-आधार (ULPIN) निर्गत',
    color: 'text-[#138808] bg-emerald-50 border-emerald-200',
  },
  {
    icon: Building2,
    value: '680+',
    labelEn: 'Districts Live',
    labelHi: 'सक्रिय जनपद',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  {
    icon: CheckCircle2,
    value: '99.4%',
    labelEn: 'Mutation Redressal',
    labelHi: 'नामांतरण समाधान दर',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
  },
];

export function MyGovStatsTicker() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-30">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-2.5 shadow-sm ${s.color}`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-heading tracking-tight">
                {s.value}
              </div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">
                {s.labelEn}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {s.labelHi}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
