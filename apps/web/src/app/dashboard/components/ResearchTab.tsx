'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight } from 'lucide-react';
import { ResearchMetrics } from '../types';

export function ResearchTab({ data }: { data: ResearchMetrics }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Academic & Policy Research Outputs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Peer-reviewed publications, open-access spatial datasets, and citation velocities.
          </p>
        </div>
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
        >
          View Research Library
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-slate-900">{data.total_papers}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total Research Papers</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-emerald-700">{data.peer_reviewed_count}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Peer-Reviewed</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{data.open_access_count}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Open Access Datasets</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-purple-700">{data.total_citations}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Academic Citations</div>
        </div>
      </div>

      {/* Top Themes */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Dominant Research Domains</h3>
        <div className="space-y-2.5">
          {data.top_themes.map((t) => (
            <div key={t.theme} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">{t.theme}</span>
                <span className="text-slate-500">{t.count} papers ({t.share_pct}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${t.share_pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Velocity Table */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-900">Annual Publication & Citation Trajectory</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-2.5">Calendar Year</th>
                <th scope="col" className="px-4 py-2.5">Papers Indexed</th>
                <th scope="col" className="px-4 py-2.5">Citations Accumulated</th>
                <th scope="col" className="px-4 py-2.5 text-right">Growth Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.publication_velocity_yearly.map((y, idx) => (
                <tr key={y.year} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold">{y.year}</td>
                  <td className="px-4 py-3">{y.publications} papers</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">{y.citations} citations</td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {idx === 0 ? 'Baseline' : `+${Math.round((y.citations / 64) * 100)}%`}
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
