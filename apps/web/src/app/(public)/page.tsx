import React from 'react';
import { Sparkles, Layers, ShieldCheck, ArrowRight, BookOpen, MapPin } from 'lucide-react';
import { HeroTopographicBg } from '@/components/home/hero-topographic-bg';
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
    <div className="w-full max-w-full overflow-x-hidden space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section with Topographic SVG Map Pattern & Radial Mesh */}
      <section className="relative overflow-hidden text-white py-20 sm:py-28 lg:py-36 px-4 sm:px-6 lg:px-8 w-full border-b border-emerald-950/40">
        <HeroTopographicBg />

        <div className="relative max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 backdrop-blur-md shadow-inner max-w-full truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
            <span className="truncate">PostGIS 3.6 Enabled &amp; Provenance-Backed Cadastral Registry</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] break-words font-heading">
            Transparent Land Governance &amp;{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Cadastral Administration
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-slate-200/90 leading-relaxed font-normal">
            Verifiable cadastral boundaries, immutable title deed mutation logs, open research papers, and evidence-driven policy formulation for national land administration.
          </p>

          <HeroCTAButtons />
        </div>
      </section>

      {/* Stats Counter Bar - Floating Elevation Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20 w-full">
        <StatsCounterGrid stats={stats} />
      </section>

      {/* Pillars / Features Grid with Subtle Background Separation */}
      <section className="py-16 sm:py-20 section-alt w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 w-full">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full w-fit mx-auto border border-emerald-200/80">
              <Layers className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Core Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Integrated Land Administration Infrastructure
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              A comprehensive suite uniting spatial parcel records, legal title deeds, and peer-reviewed land governance research.
            </p>
          </div>

          <FeaturesInteractiveGrid />
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden border border-emerald-900/30">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl text-center lg:text-left min-w-0 z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified Spatial Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading leading-snug">
              Ready to verify land titles or publish policy evidence?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join surveyors, civil society, municipal registries, and academic researchers in building tamper-proof land tenure.
            </p>
          </div>
          <div className="z-10 w-full lg:w-auto">
            <BottomCTAButtons />
          </div>
        </div>
      </section>
    </div>
  );
}
