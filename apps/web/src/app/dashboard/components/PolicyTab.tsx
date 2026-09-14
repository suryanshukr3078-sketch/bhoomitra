'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, ChevronRight } from 'lucide-react';
import { PolicyMetrics } from '../types';

export function PolicyTab({ data }: { data: PolicyMetrics }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Policy Performance Indicators</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory enactment tracking, regulatory compliance metrics, and state-level adoption.
          </p>
        </div>
        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
        >
          View Policy Database
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
            Compliance Index
          </div>
          <div className="text-3xl font-extrabold text-emerald-900">
            {data.compliance_index_pct}%
          </div>
          <p className="text-xs text-emerald-700">Optimal conformance across 14 regulatory standards</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Instruments
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {data.total_policies}
          </div>
          <p className="text-xs text-slate-500">
            {data.enacted_count} enacted &bull; {data.under_review_count} in consultation
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Legislative Velocity
          </div>
          <div className="text-3xl font-extrabold text-blue-700">4.2 mos</div>
          <p className="text-xs text-slate-500">Average review cycle to gazette notification</p>
        </div>
      </div>

      {/* Key Reform Areas */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Land Reform Priority Benchmarks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.key_reform_areas.map((r) => (
            <div key={r.area} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">{r.area}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {r.status}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${r.progress_pct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Implementation Progress</span>
                <span className="font-semibold">{r.progress_pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jurisdiction Breakdown */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-900">State & Union Territory Enactment Distribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-2.5">Jurisdiction</th>
                <th scope="col" className="px-4 py-2.5">Total Measures</th>
                <th scope="col" className="px-4 py-2.5">Fully Enacted</th>
                <th scope="col" className="px-4 py-2.5 text-right">Adoption Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.jurisdiction_breakdown.map((j) => (
                <tr key={j.jurisdiction} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{j.jurisdiction}</td>
                  <td className="px-4 py-3">{j.count} policies</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">{j.enacted} active</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {Math.round((j.enacted / j.count) * 100)}%
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
