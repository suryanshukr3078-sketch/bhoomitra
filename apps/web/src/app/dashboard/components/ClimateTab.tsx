'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, ChevronRight, Wind, Droplets, Sun, Sparkles } from 'lucide-react';
import { ClimateResilienceMetrics } from '../types';

export function ClimateTab({ data }: { data: ClimateResilienceMetrics }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Climate Resilience & Hazard Overlays</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Vulnerability index tracking, ecological protection corridors, and flood/drought risk assessment.
          </p>
        </div>
        <Link
          href="/maps"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
        >
          View Environmental Layers
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-blue-700">
            {data.coastal_vulnerability_index}
            <span className="text-xs text-slate-500 font-normal"> / 100</span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Coastal Vulnerability</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-amber-700">
            {data.flood_risk_overlay_hectares.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Flood Overlay (ha)</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-emerald-700">
            {data.agro_ecological_protection_pct}%
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Agro-Ecological Buffer</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-purple-700">
            {data.drought_resilience_score}
            <span className="text-xs text-slate-500 font-normal"> / 100</span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Drought Resilience</div>
        </div>
      </div>

      {/* Domain Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Soil Carbon Health</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900">{data.soil_carbon_retention_rating}</div>
          <p className="text-xs text-emerald-700">
            Optimal microbial retention across protected wetland zones and catchment basins.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">High-Risk Zones</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900">{data.high_risk_zones_count} Zones</div>
          <p className="text-xs text-amber-700">
            Monitored cadastral clusters subject to seasonal riverine flooding and coastal surge.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">Conservation Reserves</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-900">{data.conservation_reserves_count} Reserves</div>
          <p className="text-xs text-teal-700">
            Legally gazetted wildlife sanctuaries and forest tracts with automated encroachment alerts.
          </p>
        </div>
      </div>

      {/* Resilience Breakdown Bars */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-900">Ecosystem Stress Adaptation Indices</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Agro-Ecological Preservation Target</span>
              <span className="text-slate-500">{data.agro_ecological_protection_pct}% (Target: 80%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${data.agro_ecological_protection_pct}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Drought Vulnerability Mitigation</span>
              <span className="text-slate-500">{data.drought_resilience_score} / 100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${data.drought_resilience_score}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Coastal Inundation Protection</span>
              <span className="text-slate-500">{100 - data.coastal_vulnerability_index}% Defended</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${100 - data.coastal_vulnerability_index}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
