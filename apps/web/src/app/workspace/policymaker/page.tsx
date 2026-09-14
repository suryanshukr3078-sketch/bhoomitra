'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Scale,
  FileCheck2,
  TrendingUp,
  Landmark,
  FileText,
  Plus,
  RefreshCw,
  Search,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  ExternalLink,
  Download,
  Filter,
  BarChart3,
  Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';

export default function PolicymakerWorkspacePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'bills' | 'scorecard' | 'regulations' | 'consultation'>('bills');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Draft Bill Creation Modal
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState('');
  const [newBillMinistry, setNewBillMinistry] = useState('Ministry of Rural Development');
  const [newBillTargetDate, setNewBillTargetDate] = useState('2026-12-31');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  const fetchWorkspace = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<any>('/workspace/policymaker');
      setData(res);
    } catch (err) {
      console.warn('Could not fetch policymaker workspace from API, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillTitle.trim()) return;

    setIsSubmittingBill(true);
    setTimeout(() => {
      setIsSubmittingBill(false);
      setShowDraftModal(false);
      toast({
        title: 'Draft Bill Registered',
        description: `"${newBillTitle}" entered into Inter-Ministerial Consultation docket.`,
        variant: 'success',
      });
      setNewBillTitle('');
      fetchWorkspace();
    }, 1000);
  };

  const draftBills = data?.draft_bills || [
    {
      bill_id: 'BILL-2026-DILRRP-02',
      title: 'Model Conclusive Land Titling & Dispute Fast-Track Act, 2026',
      stage: 'Inter-Ministerial Consultation',
      target_adoption_date: '2026-11-30',
      consultation_comments_count: 284,
      sentiment_positive_pct: 82.5,
    },
    {
      bill_id: 'BILL-2026-AGRI-LEASE',
      title: 'Agricultural Tenancy Security & Mutual Crop-Sharing Framework',
      stage: 'State Assembly Model Dissemination',
      target_adoption_date: '2027-01-15',
      consultation_comments_count: 412,
      sentiment_positive_pct: 76.8,
    },
  ];

  const stateScorecard = data?.state_reform_scorecard || [
    { state: 'Maharashtra', score: 92.4, rank: 1, ror_status: '100% Digitize', mutation_days: 3.4 },
    { state: 'Andhra Pradesh', score: 89.8, rank: 2, ror_status: '99.2% Digitize', mutation_days: 4.1 },
    { state: 'Karnataka', score: 88.5, rank: 3, ror_status: '98.5% Digitize', mutation_days: 5.0 },
    { state: 'Odisha', score: 84.1, rank: 4, ror_status: '96.0% Digitize', mutation_days: 6.8 },
    { state: 'Madhya Pradesh', score: 81.6, rank: 5, ror_status: '94.2% Digitize', mutation_days: 7.2 },
  ];

  const policies = data?.policies_catalog || [
    {
      id: 'pol-001',
      title: 'Digital India Land Records Modernization Programme (DILRRP) Operational Guidelines 2.0',
      publisher: 'Ministry of Rural Development & Department of Land Resources',
      status: 'enacted',
      created_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 'pol-002',
      title: 'SVAMITVA Scheme Drone Demarcation & Property Card Issuance Rules',
      publisher: 'Ministry of Panchayati Raj',
      status: 'enacted',
      created_at: '2025-11-20T00:00:00Z',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Official Header Banner */}
      <section className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border-b border-blue-900/60 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Scale className="w-3.5 h-3.5 text-blue-400" />
                  Legislative & Policy Clearance
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  {data?.official?.ministry || 'Ministry of Rural Development'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Policy Reform & Legislative Directorate
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
                National policy coordination portal for legislative drafting, statutory compliance benchmarking across state land departments, and public stakeholder consultation analytics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchWorkspace}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Gazettes
              </button>
              <button
                onClick={() => setShowDraftModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Draft Statutory Bill
              </button>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors"
              >
                Switch Workspace
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-blue-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Active Draft Bills
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.active_bills_drafting || 4}</span>
                <span className="text-xs text-blue-400 font-medium">In Drafting</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-blue-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" /> Enacted Policies
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.enacted_regulations || 42}</span>
                <span className="text-xs text-indigo-400 font-medium">Gazetted</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-blue-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> National Compliance
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.national_compliance_pct || 87.4}%</span>
                <span className="text-xs text-cyan-400 font-medium">Target 95%</span>
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-4 border border-blue-500/20">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Public Consultations
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{data?.summary?.public_consultations_active || 3}</span>
                <span className="text-xs text-emerald-400 font-medium">Active Dockets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-8 overflow-x-auto pb-2 sm:pb-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('bills')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'bills'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Statutory Bills & Acts
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                {draftBills.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'scorecard'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              State Reform Scorecard
            </button>
            <button
              onClick={() => setActiveTab('regulations')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'regulations'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              Gazetted Regulations
            </button>
            <button
              onClick={() => setActiveTab('consultation')}
              className={`inline-flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'consultation'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Public Stakeholder Feedback
            </button>
          </div>
        </div>

        {/* TAB 1: STATUTORY BILLS */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {draftBills.map((bill: any) => (
                <div
                  key={bill.bill_id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                        {bill.bill_id}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Stage: {bill.stage}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Target Enactment: <span className="font-semibold text-slate-700">{bill.target_adoption_date}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{bill.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Statutory framework establishing guaranteed land titling backed by state indemnification and fast-track digital mutation dispute tribunals.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Stakeholder Positive Sentiment</span>
                        <span className="text-emerald-700 font-bold">{bill.sentiment_positive_pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${bill.sentiment_positive_pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500">Public Comments Received</span>
                        <div className="text-lg font-black text-slate-900">{bill.consultation_comments_count} submissions</div>
                      </div>
                      <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        Docket Open
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STATE REFORM SCORECARD */}
        {activeTab === 'scorecard' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">National State Land Governance Benchmark Scorecard</h3>
                <p className="text-xs text-slate-500 mt-0.5">Composite index tracking digital RoR availability, cadastral map linkage, and mutation resolution speed.</p>
              </div>
              <Badge variant="outline">2026 Ranking</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3.5">National Rank</th>
                    <th className="px-6 py-3.5">State Jurisdiction</th>
                    <th className="px-6 py-3.5">Composite Score</th>
                    <th className="px-6 py-3.5">RoR Digital Coverage</th>
                    <th className="px-6 py-3.5">Avg Mutation Days</th>
                    <th className="px-6 py-3.5 text-right">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {stateScorecard.map((item: any) => (
                    <tr key={item.state} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            item.rank === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            item.rank === 2 ? 'bg-slate-200 text-slate-800' :
                            item.rank === 3 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            #{item.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.state}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{item.score} / 100</span>
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-emerald-700 font-semibold">{item.ror_status}</td>
                      <td className="px-6 py-4 text-slate-700 font-mono">{item.mutation_days} days</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant="success">Tier-1 Frontrunner</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GAZETTED REGULATIONS */}
        {activeTab === 'regulations' && (
          <div className="space-y-4">
            {policies.map((pol: any) => (
              <div
                key={pol.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs">Enacted Statute</Badge>
                    <span className="text-xs text-slate-500 font-medium">{pol.publisher}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{pol.title}</h4>
                  <p className="text-xs text-slate-500">Official Gazette Publication &bull; Enforced across all State Revenue Secretariats</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`/resources/${pol.id}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Gazette
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CONSULTATION FEEDBACK */}
        {activeTab === 'consultation' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Public Consultation Dockets</h3>
              <p className="text-sm text-slate-600 mt-1">
                Submissions from farmers associations, bar councils, real estate developers, and civil society observers.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">State Bar Council of Maharashtra & Goa</span>
                  <span className="text-slate-400">Received 2 days ago</span>
                </div>
                <p className="text-xs text-slate-600">
                  &ldquo;Recommends 30-day statutory limitation window for appeal against automated mutation ledger entries, with mandatory legal aid for marginal agriculturalists.&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-xs">Incorporated in Section 14(B)</Badge>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">National Federation of Farmers Collectives</span>
                  <span className="text-slate-400">Received 4 days ago</span>
                </div>
                <p className="text-xs text-slate-600">
                  &ldquo;Endorsement of digital tenancy agreements while urging biometric verification exemptions in remote tribal blocks with limited internet connectivity.&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className="text-xs">Under Drafting Committee Review</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Draft Bill Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-blue-800 font-bold">
                <Scale className="w-5 h-5 text-blue-600" />
                <span>Initiate Statutory Draft Bill</span>
              </div>
              <button
                onClick={() => setShowDraftModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Statutory Bill Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBillTitle}
                  onChange={(e) => setNewBillTitle(e.target.value)}
                  placeholder="e.g. Model Agricultural Tenancy Reform Act, 2026..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Sponsoring Ministry / Department <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBillMinistry}
                  onChange={(e) => setNewBillMinistry(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Gazette Adoption Date
                </label>
                <input
                  type="date"
                  value={newBillTargetDate}
                  onChange={(e) => setNewBillTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBill || !newBillTitle.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  {isSubmittingBill ? 'Registering...' : 'Register Bill in Gazette Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
