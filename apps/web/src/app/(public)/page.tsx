import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  ShieldCheck,
  Scale,
  FileCheck2,
  Database,
  ArrowRight,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

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

  const features = [
    {
      icon: MapPin,
      title: 'GIS Cadastral Mapping',
      description:
        'Precise polygon boundaries with EPSG:4326 PostGIS verification preventing boundary overlap and illegal land encroachment.',
      href: '/maps',
      cta: 'Open Cadastral Map',
    },
    {
      icon: ShieldCheck,
      title: 'Tamper-Evident Provenance',
      description:
        'Every title mutation, surveyor validation, and deed transfer is recorded in an immutable append-only provenance graph.',
      href: '/research',
      cta: 'Audit Provenance Trail',
    },
    {
      icon: Scale,
      title: 'Tenure Rights Protection',
      description:
        'Full lifecycle governance protecting Freehold, Leasehold, Customary, Communal, and Forest Rights land records.',
      href: '/policies',
      cta: 'View Land Policies',
    },
    {
      icon: Database,
      title: 'Open Spatial Data Catalog',
      description:
        'Downloadable GeoJSON, Shapefiles, and Cloud-Optimized GeoTIFFs (COGs) with standardized metadata schema.',
      href: '/datasets',
      cta: 'Browse Datasets',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 w-full">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-700/80 border border-emerald-500/30 text-emerald-100 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
            PostGIS 3.6 Enabled & Provenance-Backed Cadastral Registry
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Transparent Land Governance &{' '}
            <span className="text-emerald-400">Cadastral Administration</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-emerald-100/90 leading-relaxed">
            Verifiable cadastral boundaries, immutable title deed mutation logs, open research papers, and evidence-driven policy formulation for national land administration.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              href="/maps"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MapPin className="w-4 h-4" aria-hidden="true" />
              Explore Cadastral Map
            </Link>
            <Link
              href="/policies"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <FileCheck2 className="w-4 h-4" aria-hidden="true" />
              Policy Documents
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-10 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-2 sm:p-4">
              <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors shadow-sm">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    {feature.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
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
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors text-center"
            >
              Create Account
            </Link>
            <Link
              href="/assistant"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium rounded-xl transition-colors text-center"
            >
              Ask AI Assistant
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
