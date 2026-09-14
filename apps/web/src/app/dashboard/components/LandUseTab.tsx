'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, TrendingUp, Trees, Building2, Droplets } from 'lucide-react';
import { LandUseMetrics } from '../types';

export function LandUseTab({ data }: { data: LandUseMetrics }) {
  const categories = [
    { label: 'Agricultural & Cropland', pct: data.agricultural_pct, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { label: 'Forest & Conservation Reserves', pct: data.forest_conservation_pct, color: 'bg-teal-500', text: 'text-teal-700' },
    { label: 'Urban & Residential Built-Up', pct: data.urban_builtup_pct, color: 'bg-amber-500', text: 'text-amber-700' },
    { label: 'Commercial & Industrial Zones', pct: data.commercial_industrial_pct, color: 'bg-purple-500', text: 'text-purple-700' },
    { label: 'Water Bodies & Wetlands', pct: data.water_bodies_pct, color: 'bg-blue-500', text: 'text-blue-700' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Land Use & Spatial Classification Trends</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastral land cover partitioning, conversion trajectories, and environmental buffers.
          </p>
        </div>
        <Link
          href="/maps"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
        >
          View Cadastral Map
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-slate-900">{data.total_area_hectares.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total Hectares Monitored</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-emerald-700">{data.agricultural_pct}%</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Agricultural Share</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-teal-700">{data.forest_conservation_pct}%</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Conservation Forest</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-amber-700">{data.urban_builtup_pct}%</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Urban Built-Up</div>
        </div>
      </div>

      {/* Classification Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Current Land Cover Classification</h3>
        {/* Multi-segment stacked bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {categories.map((c) => (
            <div
              key={c.label}
              className={`${c.color} h-full transition-all`}
              style={{ width: `${c.pct}%` }}
              title={`${c.label}: ${c.pct}%`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {categories.map((c) => (
            <div key={c.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${c.color}`} />
                <span className="text-xs font-semibold text-slate-700">{c.label}</span>
              </div>
              <span className={`text-xs font-bold ${c.text}`}>{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Year Conversion Trends */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-900">5-Year Land Conversion Trajectories</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-2.5">Reporting Period</th>
                <th scope="col" className="px-4 py-2.5">Agri to Urban Conversion (ha)</th>
                <th scope="col" className="px-4 py-2.5">Conservation Gain (ha)</th>
                <th scope="col" className="px-4 py-2.5 text-right">Net Ecological Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.conversion_trends_5yr.map((t) => (
                <tr key={t.period} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{t.period}</td>
                  <td className="px-4 py-3 text-amber-700 font-medium">-{t.agricultural_to_urban_ha.toLocaleString()} ha</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">+{t.conservation_gain_ha.toLocaleString()} ha</td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Positive Buffer
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
