import React from 'react';
import { Sparkles } from 'lucide-react';
import {
  HeroCTAButtons,
  StatsCounterGrid,
  FeaturesInteractiveGrid,
  BottomCTAButtons,
} from '@/components/home/landing-interactive';

export const metadata = {
  title: 'Home | Land Governance & Cadastral Administration',
  description:
    'Decentralized title verification, GIS boundary administration, and policy innovation platform for transparent land governance.',
};

export default function HomePage() {
  const stats = [
    { label: 'Registered Parcels', value: '142,500+' },
    { label: 'Verified Boundaries (GIS)', value: '98.7%' },
    { label: 'Policy Documents Indexed', value: '3,200+' },
    { label: 'Participating Jurisdictions', value: '48' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 w-full">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-700/80 border border-emerald-500/30 text-emerald-100 backdrop-blur-sm shadow-sm max-w-full truncate">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-hidden="true" />
            <span className="truncate">PostGIS 3.6 Enabled & Provenance-Backed Cadastral Registry</span>
          </div>

          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight break-words">
            Transparent Land Governance &{' '}
            <span className="text-emerald-400">Cadastral Administration</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-emerald-100/90 leading-relaxed">
            Verifiable cadastral boundaries, immutable title deed mutation logs, open research papers, and evidence-driven policy formulation for national land administration.
          </p>

          <HeroCTAButtons />
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-10 w-full">
        <StatsCounterGrid stats={stats} />
      </section>

      {/* Pillars / Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 w-full">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Integrated Land Administration Infrastructure
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A comprehensive suite uniting spatial parcel records, legal title deeds, and peer-reviewed land governance research.
          </p>
        </div>

        <FeaturesInteractiveGrid />
      </section>

      {/* Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 max-w-xl text-center lg:text-left min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to verify land titles or publish policy evidence?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Join surveyors, civil society, municipal registries, and academic researchers in building tamper-proof land tenure.
            </p>
          </div>
          <BottomCTAButtons />
        </div>
      </section>
    </div>
  );
}
