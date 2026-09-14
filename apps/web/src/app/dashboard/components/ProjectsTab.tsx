'use client';

import React from 'react';
import Link from 'next/link';
import { Rocket, CheckCircle2, ChevronRight, Zap, Target, Award, Clock } from 'lucide-react';
import { ProjectOutcomeMetrics } from '../types';

export function ProjectsTab({ data }: { data: ProjectOutcomeMetrics }) {
  const mutationReductionPct = Math.round(
    ((data.baseline_mutation_days - data.digital_mutation_avg_days) / data.baseline_mutation_days) * 100
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Project Implementation Outcomes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Flagship scheme performance, cadastral drone mapping velocity, and title distribution impact.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-xl border border-blue-200">
          <Zap className="w-3.5 h-3.5" />
          {data.total_active_projects} Active National Initiatives
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-emerald-700">
            {data.drone_survey_completion_pct}%
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Drone Survey Complete</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-slate-900">
            {data.drone_surveyed_villages.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Surveyed Villages</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-blue-700">
            {data.property_cards_distributed.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Property Cards Issued</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-purple-700">
            {data.digital_mutation_avg_days} Days
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Mutation Turnaround</div>
        </div>
      </div>

      {/* Turnaround Acceleration Highlight */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            Land Record Mutation Efficiency Surge
          </div>
          <p className="text-xs text-emerald-900">
            Average digital record of rights (RoR) mutation reduced from <span className="font-bold">{data.baseline_mutation_days} days</span> to just{' '}
            <span className="font-bold text-emerald-800">{data.digital_mutation_avg_days} days</span>.
          </p>
        </div>
        <div className="shrink-0 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-sm">
          {mutationReductionPct}% Faster Processing
        </div>
      </div>

      {/* Drone Survey Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-semibold text-slate-700">National Cadastral Drone Mapping (SVAMITVA Target)</span>
          <span className="text-slate-500">
            {data.drone_surveyed_villages.toLocaleString()} of {data.target_villages.toLocaleString()} Villages
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${data.drone_survey_completion_pct}%` }}
          />
        </div>
      </div>

      {/* Flagship Schemes Table */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-900">Key Governance & Survey Schemes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.key_schemes.map((s) => (
            <div key={s.scheme_name} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-slate-900">{s.scheme_name}</div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {s.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">{s.focus}</p>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Milestone Conformance</span>
                  <span className="font-bold text-slate-800">{s.progress_pct}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${s.progress_pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
