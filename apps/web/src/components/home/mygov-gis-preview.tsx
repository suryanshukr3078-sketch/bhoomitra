'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Search,
  ArrowRight,
  Layers,
  Compass,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

const POPULAR_SEARCHES = [
  'Patna, Bihar',
  'Varanasi, Uttar Pradesh',
  'Jaipur, Rajasthan',
  'Ranchi, Jharkhand',
  'Kochi, Kerala',
  'PIN 800001',
];

export function MyGovGisPreview() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/maps?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-3xl bg-gradient-to-br from-[#0a1931] via-[#142d54] to-[#0f2649] text-white p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden border border-slate-700">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Search & Action */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff9933]/20 border border-[#ff9933]/40 text-xs font-bold text-[#ff9933]">
              <Compass className="w-3.5 h-3.5" />
              <span>PAN-INDIA CADASTRAL GIS EXPLORER</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading leading-tight">
              Search Land Parcels, Boundaries &amp; Survey Numbers Across India
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Explore georeferenced cadastral boundaries for all 36 States &amp; Union Territories with real-time PostGIS topological integrity and Bhu-Aadhaar ULPIN lookup.
            </p>

            {/* Quick Search Omnibar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-lg max-w-lg">
              <div className="flex-1 flex items-center px-3 min-w-0 text-slate-800">
                <MapPin className="w-4 h-4 text-[#ff9933] mr-2 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Tehsil, Village, PIN Code, or City..."
                  className="w-full text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-5 py-2.5 bg-[#1a3c6e] hover:bg-[#0f2649] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Search Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px]">Popular Lookups:</span>
              {POPULAR_SEARCHES.map((place) => (
                <Link
                  key={place}
                  href={`/maps?q=${encodeURIComponent(place)}`}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-medium transition-colors border border-white/10"
                >
                  {place}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Spatial Capability Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
              <Layers className="w-5 h-5 text-[#ff9933]" />
              <div className="font-bold text-xs text-white">High-Res Drone Orthomosaic</div>
              <div className="text-[11px] text-slate-300">5cm/px drone orthophotos for abadi land demarcations.</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div className="font-bold text-xs text-white">PostGIS Topological Check</div>
              <div className="text-[11px] text-slate-300">Zero-overlap and zero-gap parcel boundary enforcement.</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
              <Navigation className="w-5 h-5 text-sky-400" />
              <div className="font-bold text-xs text-white">14-Digit Bhu-Aadhaar</div>
              <div className="text-[11px] text-slate-300">ULPIN standard derived from latitude/longitude vertices.</div>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
              <Compass className="w-5 h-5 text-purple-400" />
              <div className="font-bold text-xs text-white">W3C Audit Trails</div>
              <div className="text-[11px] text-slate-300">Append-only provenance ledger for title deed mutations.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
