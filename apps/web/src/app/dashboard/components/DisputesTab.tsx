'use client';

import React from 'react';
import Link from 'next/link';
import { Gavel, AlertCircle, ShieldAlert, CheckCircle2, Clock, Lock, ChevronRight } from 'lucide-react';
import { DisputeMetrics, RolePermissions } from '../types';

export function DisputesTab({
  data,
  permissions,
}: {
  data: DisputeMetrics;
  permissions: RolePermissions;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Land Dispute Statistics & Resolution</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Litigation volume tracking, court turnarounds, alternative dispute redressal, and hotspot surveillance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.sensitive_details_masked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-lg border border-slate-200">
              <Lock className="w-3 h-3 text-slate-400" />
              Public Tier (Masked)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Official Clearance
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-slate-900">{data.total_disputes.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total Disputes Filed</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-emerald-700">{data.resolved_disputes.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Resolved Cases</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-amber-700">{data.pending_disputes.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Active Litigation</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
          <div className="text-2xl font-extrabold text-blue-700">{data.resolution_rate_pct}%</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Resolution Rate</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl font-extrabold text-purple-700">{data.average_resolution_days}d</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Avg. Turnaround</div>
        </div>
      </div>

      {/* Dispute Categories & Resolution Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Dispute Categories */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Dispute Classification Breakdown</h3>
          <div className="space-y-2.5">
            {data.dispute_categories.map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{c.category}</span>
                  <span className="text-slate-500">{c.count.toLocaleString()} cases ({c.share_pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${c.share_pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Mechanisms */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Redressal Forums & Settlement Channels</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-3 py-2">Forum / Mechanism</th>
                  <th scope="col" className="px-3 py-2 text-right">Settled Cases</th>
                  <th scope="col" className="px-3 py-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.resolution_mechanism.map((m) => (
                  <tr key={m.mechanism} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 font-medium">{m.mechanism}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">
                      {m.cases_resolved.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{m.share_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role-Gated Hotspot Surveillance Section */}
      <div className="pt-2">
        {data.sensitive_details_masked ? (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-900">
                Tehsil-Level Hotspot Intelligence Masked (Access Restricted)
              </div>
              <p className="text-amber-700 leading-relaxed">
                Granular dispute records, tehsil caseload aggregates, and sensitive litigation identifiers are protected under jurisdictional privacy protocols.
                Authorized government officials and verified administrators can authenticate to access real-time critical intervention hotlists.
              </p>
              {!permissions.is_authenticated && (
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 font-semibold text-amber-900 underline hover:text-amber-950"
                  >
                    Authenticate with Official Credentials &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Active Tehsil Hotspot Surveillance (Official Clearance Tier)
                </h3>
                <p className="text-xs text-slate-500">
                  Priority administrative circles requiring expedited revenue tribunal intervention.
                </p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                Role: {permissions.role}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-4 py-2.5">Hotspot ID</th>
                    <th scope="col" className="px-4 py-2.5">District</th>
                    <th scope="col" className="px-4 py-2.5">Tehsil</th>
                    <th scope="col" className="px-4 py-2.5">Active Cases</th>
                    <th scope="col" className="px-4 py-2.5 text-right">Intervention Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.hotspots?.map((h) => (
                    <tr key={h.hotspot_id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{h.hotspot_id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{h.district}</td>
                      <td className="px-4 py-3">{h.tehsil}</td>
                      <td className="px-4 py-3 font-bold text-amber-700">{h.active_cases} pending</td>
                      <td className="px-4 py-3 text-right">
                        {h.critical_flag ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Critical Priority
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Monitoring
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
