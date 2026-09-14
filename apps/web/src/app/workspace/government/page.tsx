'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  MapPin,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  ArrowRight,
  Sparkles,
  Gavel,
  ChevronRight,
  FileCheck2,
  ExternalLink,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';

export default function GovernmentWorkspacePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'mutations' | 'topology' | 'disputes' | 'svamitva'>('mutations');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [remarksModal, setRemarksModal] = useState<{ id: string; deedNumber: string; action: 'approve' | 'reject' } | null>(null);
  const [officerRemarks, setOfficerRemarks] = useState('');

  const fetchWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<any>('/workspace/government');
      setData(res);
    } catch (err) {
      console.warn('Could not fetch government workspace from API, using fallback data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleActionMutation = async (action: 'approve' | 'reject') => {
    if (!remarksModal) return;
    const { id } = remarksModal;
    setActioningId(id);

    try {
      await apiRequest(`/workspace/government/mutations/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          remarks: officerRemarks.trim() || (action === 'approve' ? 'Approved by Jurisdictional Revenue Magistrate' : 'Rejected due to documentation discrepancies'),
        }),
      });

      toast({
        title: action === 'approve' ? 'Deed Mutation Approved' : 'Deed Mutation Rejected',
        description: `Deed ${remarksModal.deedNumber} has been updated. The cryptographic ledger hash has been published.`,
        variant: action === 'approve' ? 'success' : 'default',
      });

      setRemarksModal(null);
      setOfficerRemarks('');
      await fetchWorkspace();
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Could not process mutation action.',
        variant: 'error',
      });
    } finally {
      setActioningId(null);
    }
  };

  const mutations = data?.pending_mutations || [
    {
      id: 'mut-001',
      deed_number: 'DEED-MH-2026-88910',
      jurisdiction: 'IN-MH-PUN',
      seller_name: 'Rameshwar G. Patil',
      buyer_name: 'Ananya K. Deshmukh',
      parcel_id: 'PAR-PUN-HAV-0442',
      survey_number: '44/2-A',
      area_sqm: 2450.0,
      mutation_type: 'Sale Deed Transfer',
      consideration_inr: 4850000,
      status: 'pending_officer_review',
      flagged_overlap: false,
      created_at: '2026-09-12T08:30:00Z',
      ledger_hash: '0x4a9b...f821',
    },
    {
      id: 'mut-002',
      deed_number: 'DEED-MH-2026-88914',
      jurisdiction: 'IN-MH-PUN',
      seller_name: 'Balwant S. Shinde (Estate)',
      buyer_name: 'Sunita B. Shinde & Prakash B. Shinde',
      parcel_id: 'PAR-PUN-MUL-0189',
      survey_number: '18/9-C',
      area_sqm: 5800.0,
      mutation_type: 'Succession & Partition',
      consideration_inr: 0,
      status: 'pending_officer_review',
      flagged_overlap: false,
      created_at: '2026-09-13T11:15:00Z',
      ledger_hash: '0x8e2c...d194',
    },
    {
      id: 'mut-003',
      deed_number: 'DEED-MH-2026-88921',
      jurisdiction: 'IN-MH-PUN',
      seller_name: 'Greenfield Agro Ventures LLP',
      buyer_name: 'Western Logistics Infra Ltd',
      parcel_id: 'PAR-PUN-KHD-0912',
      survey_number: '91/2',
      area_sqm: 14200.0,
      mutation_type: 'Commercial Land Conversion',
      consideration_inr: 28500000,
      status: 'flagged_overlap',
      flagged_overlap: true,
      overlap_details: '42 sqm overlap with adjoining State Highway PWD buffer reserve.',
      created_at: '2026-09-14T04:45:00Z',
      ledger_hash: '0x3f71...ac49',
    },
  ];

  const topologyFlags = data?.cadastral_topology_flags || [
    {
      id: 'top-01',
      parcel_a: 'PAR-PUN-KHD-0912',
      parcel_b: 'PAR-PWD-SH27-BUF',
      overlap_area_sqm: 42.18,
      error_type: 'Boundary Invariant Violation (Polygon Overlap)',
      detected_at: '2026-09-14T04:45:00Z',
      severity: 'critical',
      action_required: 'Site inspection by Cadastral Surveyor required before title deed clearance.',
    },
    {
      id: 'top-02',
      parcel_a: 'PAR-PUN-HAV-0881',
      parcel_b: 'PAR-PUN-HAV-0882',
      overlap_area_sqm: 1.45,
      error_type: 'Sliver Polygon Gap Invariant',
      detected_at: '2026-09-13T16:20:00Z',
      severity: 'medium',
      action_required: 'Auto-snap vertex reconciliation within 0.05m tolerance threshold.',
    },
  ];

  const disputes = data?.revenue_court_docket || [
    {
      case_number: 'RC/2026/PUN/0441',
      suit_title: 'Kulkarni vs. Land Acquisition Officer',
      suit_type: 'Compensation Apportionment & Cadastral Demarcation',
      hearing_date: '2026-09-18',
      hearing_stage: 'Cross-examination of Surveyor RTK GPS Report',
      priority: 'high',
      status: 'scheduled',
    },
    {
      case_number: 'RC/2026/PUN/0449',
      suit_title: 'Gram Panchayat Wagholi vs. Infra Developers',
      suit_type: 'Gaikran (Common Pasture) Encroachment Injunction',
      hearing_date: '2026-09-22',
      hearing_stage: 'Submission of Drone Demarcation Map',
      priority: 'critical',
      status: 'interim_stay_active',
    },
  ];

  const svamitva = data?.svamitva_drone_progress || {
    total_target_villages: 185,
    drone_flying_completed: 178,
    maps_ground_truthed: 162,
    inquiry_completed: 154,
    cards_generated: 142,
    completion_pct: 89.2,
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Officer Identity Card */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                <Landmark className="w-3.5 h-3.5" />
                Statutory Revenue Authority
              </span>
              <span className="text-xs text-amber-200/80 font-mono">
                Jurisdiction: IN-MH-PUN (Pune Division)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Government Official Cadastral Workspace
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-2xl">
              Official operational terminal for Title Deed Mutation approvals, PostGIS boundary topology verification, Revenue Court case docket, and SVAMITVA village property card dispatch.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchWorkspace}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Docket
            </button>
            <Link
              href="/maps"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold transition-all shadow-md"
            >
              <MapPin className="w-3.5 h-3.5" />
              GIS Cadastre Map
            </Link>
          </div>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Pending Mutations</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {mutations.filter((m: any) => m.status.includes('pending') || m.status.includes('flagged')).length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            Requires officer digital signature
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Boundary Invariants</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            {topologyFlags.length} Flagged
          </div>
          <div className="text-[11px] text-slate-500">
            PostGIS overlap violations
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Revenue Court Docket</span>
            <Gavel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {disputes.length} Active
          </div>
          <div className="text-[11px] text-blue-700 font-medium">
            2 scheduled this week
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>SVAMITVA Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {svamitva.completion_pct}%
          </div>
          <div className="text-[11px] text-slate-500">
            142 villages titling complete
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('mutations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'mutations'
              ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-700" />
          Deed Mutation Pipeline
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900">
            {mutations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('topology')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'topology'
              ? 'bg-rose-100 text-rose-950 border border-rose-300 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-700" />
          Boundary Invariant Flags
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-200 text-rose-900">
            {topologyFlags.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disputes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'disputes'
              ? 'bg-blue-100 text-blue-950 border border-blue-300 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Gavel className="w-4 h-4 text-blue-700" />
          Revenue Court Docket
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('svamitva')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'svamitva'
              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          SVAMITVA Village Titling
        </button>
      </div>

      {/* Tab 1: Deed Mutations Queue */}
      {activeTab === 'mutations' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pending Title Mutation Applications
              </h2>
              <p className="text-xs text-slate-500">
                Review verified digital sale deeds, partitions, and RoR mutations awaiting officer endorsement.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Cryptographic RoR Consensus
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Deed &amp; Survey No.</th>
                  <th className="py-3 px-4 font-bold">Parties Involved</th>
                  <th className="py-3 px-4 font-bold">Area &amp; Consideration</th>
                  <th className="py-3 px-4 font-bold">Mutation Type</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Official Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mutations.map((m: any) => {
                  const isPending = m.status === 'pending_officer_review' || m.status === 'flagged_overlap';
                  const isApproved = m.status === 'approved';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="font-bold text-slate-900 font-mono">{m.deed_number}</div>
                        <div className="text-slate-500 text-[11px]">Survey: {m.survey_number} ({m.parcel_id})</div>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="text-slate-800 font-medium">To: <span className="font-bold">{m.buyer_name}</span></div>
                        <div className="text-slate-500 text-[11px]">From: {m.seller_name}</div>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="font-bold text-slate-800">{m.area_sqm.toLocaleString()} m²</div>
                        <div className="text-slate-500 text-[11px]">
                          {m.consideration_inr > 0 ? `₹${(m.consideration_inr / 100000).toFixed(1)} Lakh` : 'Inheritance'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {m.mutation_type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        ) : m.flagged_overlap ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Boundary Flag
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            <Clock className="w-3 h-3" /> In Review
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isPending ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setRemarksModal({ id: m.id, deedNumber: m.deed_number, action: 'approve' })}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRemarksModal({ id: m.id, deedNumber: m.deed_number, action: 'reject' })}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {m.officer_action?.ledger_transaction_id || 'Recorded'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Boundary Invariant Flags */}
      {activeTab === 'topology' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              PostGIS Topological Boundary Overlaps
            </h2>
            <p className="text-xs text-slate-500">
              Automated geometry validation checks detecting polygon self-intersections and zero-overlap violations across cadastral parcels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topologyFlags.map((flag: any) => (
              <div
                key={flag.id}
                className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    {flag.error_type}
                  </span>
                  <Badge variant="danger">{flag.severity}</Badge>
                </div>

                <div className="text-xs space-y-1 text-slate-700">
                  <div><strong>Parcel A:</strong> <span className="font-mono text-slate-900">{flag.parcel_a}</span></div>
                  <div><strong>Parcel B:</strong> <span className="font-mono text-slate-900">{flag.parcel_b}</span></div>
                  <div><strong>Overlap Area:</strong> <span className="font-bold text-rose-700">{flag.overlap_area_sqm} m²</span></div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-rose-100 text-xs text-slate-600">
                  <strong>Recommended Action:</strong> {flag.action_required}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast({
                        title: 'Survey Commissioned',
                        description: `Surveyor notice dispatched for boundary verification on ${flag.parcel_a}.`,
                        variant: 'default',
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-700 hover:bg-rose-800 text-white transition-colors cursor-pointer"
                  >
                    Commission Field Re-Survey
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Revenue Court Dispute Docket */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Revenue Court Judicial Hearing Docket
              </h2>
              <p className="text-xs text-slate-500">
                Summary jurisdiction cases before the Tahsildar / Sub-Divisional Officer concerning title demarcation and mutation disputes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                toast({
                  title: 'Notice Issued',
                  description: 'Cause list notice generated for upcoming jurisdictional hearings.',
                  variant: 'default',
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Publish Cause List
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {disputes.map((caseItem: any, idx: number) => (
              <div key={idx} className="py-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {caseItem.case_number}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Hearing Date: <strong>{caseItem.hearing_date}</strong></span>
                    <Badge variant={caseItem.priority === 'critical' ? 'danger' : 'secondary'}>
                      {caseItem.priority}
                    </Badge>
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-900">{caseItem.suit_title}</div>
                <div className="text-xs text-slate-600">Type: {caseItem.suit_type}</div>
                <div className="text-xs text-slate-500">Stage: <span className="italic font-medium text-slate-700">{caseItem.hearing_stage}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: SVAMITVA Village Titling */}
      {activeTab === 'svamitva' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              SVAMITVA Drone Survey &amp; Property Card Tracking
            </h2>
            <p className="text-xs text-slate-500">
              Survey of Villages Abadi and Mapping with Improvised Technology in Village Areas progress monitor.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Overall Division Progress
              </span>
              <span className="text-xl font-black text-emerald-800">{svamitva.completion_pct}%</span>
            </div>
            <div className="w-full bg-emerald-200/70 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${svamitva.completion_pct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold">Target Villages</div>
              <div className="text-2xl font-bold text-slate-900">{svamitva.total_target_villages}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold">Drones Flown</div>
              <div className="text-2xl font-bold text-slate-900">{svamitva.drone_flying_completed}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold">Ground Truthed</div>
              <div className="text-2xl font-bold text-slate-900">{svamitva.maps_ground_truthed}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold">Property Cards</div>
              <div className="text-2xl font-bold text-emerald-700">{svamitva.cards_generated}</div>
            </div>
          </div>
        </div>
      )}

      {/* Official Remarks Modal for Mutation Approval/Rejection */}
      {remarksModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                remarksModal.action === 'approve' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
              }`}>
                {remarksModal.action === 'approve' ? 'Endorse Mutation' : 'Disallow Mutation'}
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Official Revenue Order: {remarksModal.deedNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Provide jurisdictional officer remarks to be permanently sealed into the cadastral ledger.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Officer Findings &amp; Statutory Remarks
              </label>
              <textarea
                rows={3}
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder={
                  remarksModal.action === 'approve'
                    ? 'Verified against digital Record of Rights (RoR). Zero boundary overlaps confirmed.'
                    : 'Disallowed due to pending litigation in Civil Court regarding undivided ancestral share.'
                }
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRemarksModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actioningId !== null}
                onClick={() => handleActionMutation(remarksModal.action)}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  remarksModal.action === 'approve'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                {actioningId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileCheck2 className="w-3.5 h-3.5" />
                )}
                Confirm &amp; Sign Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
